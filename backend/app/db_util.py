import os
from collections.abc import Generator

import psycopg
from pgvector.psycopg import register_vector

from app.settings import get_database_url, get_embedding_dimensions


def get_connection() -> psycopg.Connection:
    """Open a new PostgreSQL connection with pgvector types registered."""
    conn = psycopg.connect(get_database_url(), autocommit=False)
    register_vector(conn)
    return conn


def connection_ctx() -> Generator[psycopg.Connection, None, None]:
    """Yield a connection for callers that manage transactions manually."""
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


def ensure_document_chunks_table(conn: psycopg.Connection) -> None:
    """Create document_chunks if missing (for DB volumes created before this table existed)."""
    dim = get_embedding_dimensions()
    sql = f"""
    CREATE TABLE IF NOT EXISTS document_chunks (
        id BIGSERIAL PRIMARY KEY,
        source_path TEXT NOT NULL,
        chunk_index INT NOT NULL,
        content TEXT NOT NULL,
        embedding vector({dim}) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE (source_path, chunk_index)
    );
    """
    conn.execute(sql)


def ensure_schema_at_startup() -> None:
    """Apply idempotent DDL before serving traffic."""
    with get_connection() as conn:
        ensure_document_chunks_table(conn)
        conn.commit()


def get_data_dir() -> str:
    """Directory scanned for *.md during ingestion."""
    return os.getenv("DATA_DIR", "/data").strip() or "/data"
