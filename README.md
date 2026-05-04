# mjc-chatbot

mjc-chatbot is a chatbot project for MJC Fecamp

## Prerequisites

- **Docker** — container runtime
- **Make** — task automation (`Makefile` targets)
- **Docker Compose** — multi-container orchestration
- **Ansible** — deployment automation

## Launch 

### Local development (Docker)

1. Copy `.env.example` to `.env` and adjust if needed.
2. `make dev-build` — build images
3. `make dev-run` — start PostgreSQL, API, and frontend (`http://localhost:3000`, API `http://localhost:8000`, docs `http://localhost:8000/docs`)
4. `make dev-kill` 

The smoke check calls same-origin `GET /api/backend/health`; Next.js rewrites that to the FastAPI service (`BACKEND_INTERNAL_URL`, default `http://backend:8000` at image build). So the browser never needs a public URL for port 8000. To reset the database volume: `docker compose down -v` then `make dev-run` again. For `next dev` on the host only, set `BACKEND_INTERNAL_URL=http://127.0.0.1:8000` in `frontend/.env.local`.


## Technology

| Layer | Stack |
|--------|--------|
| **Frontend** | Next.js |
| **Backend** | FastAPI (conversation flow + RAG logic) |
| **Database** | PostgreSQL + pgvector (courses, embeddings, session state) |
| **LLM API** | Claude, OpenAI or Mistral |
| **Security** | Cloudflare (bot protection + rate limiting) |

**Flow:** user → frontend → backend → vector search → LLM → response

## Features

- **LLM:** responses are generated via the **Mistral** API (API key required); the model acts on retrieved context and system instructions, not on unconstrained web knowledge.
- **Placement:** designed to be embedded on the **MJC website** (e.g. public-facing widget or page) for visitors.
- **Grounded answers:** the assistant replies **only** from **content you provide** plus a **fixed instruction / policy layer**—no free-form answers about the organisation outside that corpus.
- **Knowledge formats:** sources are ideally **Markdown** for clean chunking and maintenance; ingestion may also support **PDF** and other document types as the pipeline evolves.
- **Admin & analytics:** a **classic relational database** backs **administrator accounts**, **sign-in** to a protected area, and access to **usage statistics** for the chatbot.
