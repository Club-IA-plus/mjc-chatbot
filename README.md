# mjc-chatbot

mjc-chatbot is a chatbot project for MJC Fecamp

## Prerequisites

- **Docker** — container runtime
- **Make** — task automation (`Makefile` targets)
- **Docker Compose** — multi-container orchestration
- **Ansible** — deployment automation

## Technology

| Layer | Stack |
|--------|--------|
| **Frontend** | Next.js |
| **Backend** | FastAPI (conversation flow + RAG logic) |
| **Database** | PostgreSQL + pgvector (courses, embeddings, session state) |
| **LLM API** | Claude, OpenAI or Mistral |
| **Security** | Cloudflare (bot protection + rate limiting) |

**Flow:** user → frontend → backend → vector search → LLM → response
