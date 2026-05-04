# Fonctionnement du projet (vue vulgarisée en FR pour présentation ClubIA le 05/05/2026)

Ce document explique **comment les pièces s’enchaînent** aujourd’hui : d’où viennent les données, comment elles deviennent des « vecteurs », comment une question obtient une réponse, et où entrent l’interface et l’API.

---

## 1. À quoi ça sert ?

Un visiteur ouvre la **page web** du chatbot, tape une question, et reçoit une **réponse en français**. Le système est conçu pour s’appuyer sur **des textes que vous fournissez** (activités, calendrier, etc., en Markdown dans le dossier `data/`), et sur des **consignes** écrites dans le code (prompt système) pour rester prudent lorsque l’info n’est pas dans les documents.

---

## 2. Les acteurs (les briques logicielles)

| Élément | Rôle en une phrase |
|--------|---------------------|
| **Navigateur** | Affiche l’interface et envoie les messages. |
| **Frontend (Next.js)** | Sert la page, et **relaye** certaines URLs vers le backend (voir §6). |
| **Backend (FastAPI)** | Reçoit les messages, interroge la base, appelle **Mistral**. |
| **PostgreSQL + pgvector** | Stocke les morceaux de texte et leurs **représentations numériques** pour les retrouver par similarité. |
| **Mistral (API cloud)** | Transforme du texte en **vecteurs** (embeddings) et rédige la **réponse** (chat). |

---

## 3. D’où viennent les données ?

1. Vous placez des fichiers **`.md`** dans le dossier **`data/`** du projet (ex. calendrier, activités).
2. En production / Docker, ce dossier est **monté** dans le conteneur backend sous **`/data`** (lecture seule côté conteneur).
3. Ces fichiers sont la **source de vérité** pour le contenu « institutionnel » que le chatbot doit pouvoir citer.

---

## 4. Indexation : `make dev-data` — du fichier à la base

Quand vous exécutez **`make dev-data`**, un conteneur backend lance le script **`python -m app.ingest`**. Le déroulement typique :

1. **Lecture** de tous les `*.md` sous le répertoire configuré (`DATA_DIR`, en Docker souvent `/data` donc vos fichiers de `data/`).
2. **Découpage (chunking)** : chaque fichier est coupé en **fenêtres de texte** qui se chevauchent un peu (taille et chevauchement définis dans `backend/app/rag_service.py`, constantes `CHUNK_SIZE` / `CHUNK_OVERLAP`). L’idée est d’avoir des blocs ni trop petits ni énormes, pour que la recherche reste pertinente.
3. **Vectorisation (embeddings)** : pour chaque bloc, le backend appelle l’**API Mistral** (`mistral-embed`) et reçoit une **liste de nombres** (souvent 1024 valeurs) — le **vecteur** du bloc. Ce vecteur résume « dans quel sens » va le texte, pour pouvoir le comparer à une question.
4. **Stockage** : chaque bloc est enregistré en base dans la table **`document_chunks`** : chemin du fichier, index du bloc, texte du bloc, et colonne **`embedding`** de type `vector(...)` grâce à l’extension **pgvector** dans PostgreSQL.


Sans cette étape (ou sans clé API Mistral), la table peut être vide : le chatbot n’a alors **pas de passages** à injecter dans le contexte (le code affiche alors un message d’attente côté prompt).

---

## 5. C’est quoi la « vectorisation » ? (image mentale)

- Le texte reste du texte pour l’humain.
- Pour la machine, on calcule un **point dans un grand espace à beaucoup de dimensions** (ex. 1024). Deux textes **proches en sens** ont souvent des points **proches** dans cet espace.
- **pgvector** permet de stocker ces points et de les **trier par proximité** avec la question (en pratique : distance cosinus entre le vecteur de la question et ceux des blocs — opérateur `<=>` dans le SQL du projet).

Donc : **vectoriser** = appeler Mistral pour obtenir ce point (vecteur) à partir d’un texte.

---

## 6. L’interface : que fait le navigateur ?

1. L’utilisateur voit la page d’accueil Next.js (`frontend/app/page.tsx`, composant `frontend/components/Chat.tsx`).
2. Quand il envoie un message, le navigateur appelle **`POST /api/backend/api/v1/chat`** sur **le même site** que la page (même origine : ex. port 3000).  
   → Avantage : pas besoin d’exposer une URL publique du port 8000 dans le JavaScript ; pas de clé Mistral dans le navigateur.
3. **Next.js** est configuré pour **réécrire** les URLs `/api/backend/...` vers le service Docker **`http://backend:8000/...`** (`frontend/next.config.mjs`, variable `BACKEND_INTERNAL_URL` au build). C’est le serveur Next qui fait le pont, pas le navigateur vers Mistral.


---

## 7. Une question → une réponse : le flux « chat »

Quand le backend reçoit **`POST /api/v1/chat`** (avec l’historique `messages`, le dernier devant être un message `user`) :

1. **Vérifications** : présence de la clé `MISTRAL_API_KEY`, dernier message bien utilisateur, texte non vide (`backend/app/routers/chat.py`).
2. **Embedding de la question** : même principe qu’à l’indexation — on obtient un **vecteur** pour la dernière question utilisateur.
3. **Recherche (RAG)** : requête SQL sur `document_chunks` pour récupérer les **K** blocs les plus proches (paramètre `RAG_TOP_K`, défaut 5). Leur texte est assemblé en un **bloc « Contextes internes »** (limité en taille pour ne pas exploser la fenêtre du modèle).
4. **Construction du prompt pour Mistral** : un message **`system`** contient les **consignes** (constante `SYSTEM_PROMPT` dans `backend/app/rag_service.py`) + les extraits ; puis l’historique **user / assistant** est recopié.
5. **Appel chat Mistral** : le modèle configuré (`MISTRAL_CHAT_MODEL`, défaut `mistral-small-latest`) produit le texte de réponse (`backend/app/mistral_service.py`).
6. La réponse est renvoyée au frontend sous forme JSON **`{ "reply": "..." }`**, qui l’affiche dans une bulle « Assistant ».

