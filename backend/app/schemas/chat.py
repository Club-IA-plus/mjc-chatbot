from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """One turn in the conversation."""

    role: Literal["user", "assistant", "system"]
    content: str = Field(..., min_length=1, max_length=32000)


class ChatRequest(BaseModel):
    """Payload sent from the chat UI."""

    messages: list[ChatMessage] = Field(..., min_length=1)


class ChatResponse(BaseModel):
    """Assistant reply for the current turn."""

    reply: str
