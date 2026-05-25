import logging
import uuid

from fastapi import APIRouter, BackgroundTasks, HTTPException

try:
    from mistralai.client.errors import MistralError
except ImportError:
    class MistralError(Exception):  # type: ignore[no-redef]
        status_code: int = 0

logger = logging.getLogger(__name__)

from app.db_util import get_connection
from app.knowledge_sources import load_knowledge_markdown_files
from app.models import ChatResult
from app.rag_service import answer_chat_turn
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.knowledge_sources import KnowledgeSourcesResponse
from app.schemas.system_prompt import SystemPromptResponse
from app.settings import get_mistral_chat_model, get_model_cost_map
from app.system_prompt import load_default_system_prompt

router = APIRouter()


def _http_error_for_chat(exc: Exception) -> HTTPException:
    """Map backend/Mistral failures to an HTTP status and a safe client message."""
    if isinstance(exc, MistralError):
        if exc.status_code == 429:
            return HTTPException(
                status_code=503,
                detail=(
                    "Mistral capacity exceeded for this model. "
                    "Retry later or set MISTRAL_CHAT_MODEL (e.g. open-mistral-nemo)."
                ),
            )
        if exc.status_code in (401, 403):
            return HTTPException(
                status_code=503,
                detail="Mistral API authentication failed. Check MISTRAL_API_KEY.",
            )
        return HTTPException(
            status_code=502,
            detail=f"Mistral API error (HTTP {exc.status_code}).",
        )
    if isinstance(exc, RuntimeError):
        return HTTPException(status_code=502, detail=str(exc))
    return HTTPException(status_code=502, detail="An internal error occurred.")


def _insert_chat_log(result: ChatResult, body: ChatRequest) -> None:
    """Insert one row into chat_logs. Called from a BackgroundTask — never raises."""
    try:
        model = get_mistral_chat_model()
        cost_per_1k = get_model_cost_map().get(model, 0.0)
        total_tokens = result.prompt_tokens + result.completion_tokens
        cost_eur = round(total_tokens / 1000 * cost_per_1k, 6)
        session_id = body.session_id or str(uuid.uuid4())
        with get_connection() as conn:
            conn.execute(
                """
                INSERT INTO chat_logs
                    (session_id, prompt_tokens, completion_tokens,
                     latency_ms, model, cost_eur, origin, retrieved_sources)
                VALUES (%s::uuid, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    session_id,
                    result.prompt_tokens,
                    result.completion_tokens,
                    result.latency_ms,
                    model,
                    cost_eur,
                    body.origin,
                    result.retrieved_sources,
                ),
            )
            conn.commit()
    except Exception:
        pass  # logging must never break the chat response


@router.get("/system-prompt", response_model=SystemPromptResponse)
def get_system_prompt() -> SystemPromptResponse:
    """Return the file-based default system prompt for the chat UI."""
    try:
        return SystemPromptResponse(default=load_default_system_prompt())
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/knowledge-sources", response_model=KnowledgeSourcesResponse)
def get_knowledge_sources() -> KnowledgeSourcesResponse:
    """Return Markdown files from DATA_DIR (read-only, for the home page viewer)."""
    try:
        rows = load_knowledge_markdown_files()
        return KnowledgeSourcesResponse(files=rows)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/chat", response_model=ChatResponse)
def post_chat(body: ChatRequest, background_tasks: BackgroundTasks) -> ChatResponse:
    """Run one chat turn: RAG retrieval + Mistral completion."""
    last = body.messages[-1]
    if last.role != "user":
        raise HTTPException(
            status_code=422,
            detail="The last message must have role 'user'.",
        )
    if not last.content.strip():
        raise HTTPException(status_code=422, detail="User message is empty.")
    try:
        result = answer_chat_turn(body)
    except ValueError as exc:
        if "MISTRAL_API_KEY" in str(exc):
            raise HTTPException(status_code=503, detail="Service not configured.") from exc
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("chat turn failed")
        raise _http_error_for_chat(exc) from exc
    background_tasks.add_task(_insert_chat_log, result, body)
    return ChatResponse(reply=result.content)
