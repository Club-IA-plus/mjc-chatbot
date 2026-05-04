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

## Features

- **LLM:** responses are generated via the **Mistral** API (API key required); the model acts on retrieved context and system instructions, not on unconstrained web knowledge.
- **Placement:** designed to be embedded on the **MJC website** (e.g. public-facing widget or page) for visitors.
- **Grounded answers:** the assistant replies **only** from **content you provide** plus a **fixed instruction / policy layer**—no free-form answers about the organisation outside that corpus.
- **Knowledge formats:** sources are ideally **Markdown** for clean chunking and maintenance; ingestion may also support **PDF** and other document types as the pipeline evolves.
- **Admin & analytics:** a **classic relational database** backs **administrator accounts**, **sign-in** to a protected area, and access to **usage statistics** for the chatbot.
