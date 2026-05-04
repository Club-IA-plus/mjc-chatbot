CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS document_chunks (
    id BIGSERIAL PRIMARY KEY,
    source_path TEXT NOT NULL,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1024) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (source_path, chunk_index)
);
