# Chatbot Diagrams (Mermaid)

Ces schémas servent à vulgariser le fonctionnement actuel du projet.

## 1) Vue globale (architecture)

```mermaid
flowchart LR
    U[Utilisateur] --> F[Frontend Next.js]
    F --> B[Backend FastAPI]
    B --> DB[(PostgreSQL + pgvector)]
    B --> M[Mistral API]
    DB --> B
    M --> B
    B --> F
    F --> U
```

## 2) Cycle d’ingestion des données (`make dev-data`)

```mermaid
flowchart TD
    A[Fichiers .md dans /data] --> B[Script d'ingestion]
    B --> C[Découpage en chunks]
    C --> D[Embeddings Mistral]
    D --> E[(Table document_chunks)]
    E --> F[PostgreSQL + pgvector]
```

## 3) Cycle de réponse (RAG simplifié)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant FE as Frontend
    participant BE as Backend
    participant DB as pgvector
    participant LLM as Mistral

    U->>FE: Pose une question
    FE->>BE: POST /api/v1/chat
    BE->>LLM: Embedding de la question
    BE->>DB: Recherche des chunks proches
    DB-->>BE: Contextes pertinents
    BE->>LLM: Prompt + contextes + historique
    LLM-->>BE: Réponse
    BE-->>FE: JSON { reply }
    FE-->>U: Affiche la réponse
```

## 4) Stratégie des branches Git (contribution)

```mermaid
flowchart LR
    M[main\nProduction] --- D[develop\nIntégration]
    D --> F1[feature/ajout-chat-ui]
    D --> F2[feature/rag-ingestion]
    D --> F3[feature/admin-stats]
    F1 --> D
    F2 --> D
    F3 --> D
```

## 5) Logique métier “réponse encadrée”

```mermaid
flowchart TD
    Q[Question utilisateur] --> R{Infos trouvées dans les documents ?}
    R -->|Oui| A[Répondre avec les contextes internes]
    R -->|Non| B[Dire clairement que l'info manque]
    B --> C[Orienter vers la MJC de Fécamp]
```
