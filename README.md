# Event-Tracker

Mini API de suivi d'événements utilisateurs — test technique Piver.

Une plateforme qui reçoit des événements liés à des utilisateurs (connexion, transaction, signalement), les stocke en base PostgreSQL, et expose une interface React pour les visualiser et les créer.

---

## Architecture

```
Navigateur (React :3000)
        │
        ▼
API FastAPI (:8000)  ←→  PostgreSQL (:5432)
```

- **Frontend** : React (une page), appelle l'API via `fetch`
- **Backend** : FastAPI (Python), expose 3 endpoints REST
- **Base de données** : PostgreSQL, données persistées dans un volume Docker

---

## Arborescence

```
event-tracker/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # Entrée FastAPI, CORS, routeurs
│   │   ├── database.py      # Connexion SQLAlchemy
│   │   ├── models.py        # Table events
│   │   ├── schemas.py       # Validation Pydantic
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── events.py    # POST /events, GET /events
│   │       └── users.py     # GET /users/{user_id}/summary
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_events.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── events.js    # Appels HTTP vers l'API
│   │   ├── components/
│   │   │   ├── EventForm.jsx
│   │   │   ├── EventList.jsx
│   │   │   └── UserSummary.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── db/
│   └── init.sql             # Script SQL d'initialisation (optionnel, SQLAlchemy crée les tables)
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Prérequis

Tu as besoin de **Docker** et **Docker Compose**. C'est tout.

### Installer Docker

**Windows / Mac** : télécharge Docker Desktop sur [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) et installe-le.

**Linux (Ubuntu/Debian)** :

```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

Vérifie que Docker fonctionne :

```bash
docker --version
docker compose version
```

### Installer Git (si pas déjà fait)

**Windows** : [https://git-scm.com/download/win](https://git-scm.com/download/win)

**Linux** :

```bash
sudo apt install -y git
```

---

## Lancement avec Docker (recommandé)

### 1. Cloner ou copier le projet

Si tu as récupéré le projet via Git :

```bash
git clone https://github.com/<ton-utilisateur>/event-tracker.git
cd event-tracker
```

Si tu as reçu une archive `.zip`, décompresse-la et ouvre un terminal dans le dossier `event-tracker`.

### 2. Lancer tous les services

```bash
docker compose up --build
```

Cette commande :
- télécharge les images nécessaires (Python, Node, PostgreSQL)
- construit le backend et le frontend
- démarre la base de données, l'API et l'interface

La première fois, ça peut prendre 2 à 5 minutes selon ta connexion.

### 3. Vérifier que tout fonctionne

Ouvre un second terminal et tape :

```bash
docker compose ps
```

Tu dois voir 3 services avec le statut `running` :
- `event-tracker-db-1`
- `event-tracker-backend-1`
- `event-tracker-frontend-1`

### 4. Accéder à l'application

| Service | URL |
|---|---|
| **Frontend (interface)** | [http://localhost:3000](http://localhost:3000) |
| **API** | [http://localhost:8000](http://localhost:8000) |
| **Documentation Swagger** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **Documentation ReDoc** | [http://localhost:8000/redoc](http://localhost:8000/redoc) |

### 5. Arrêter les services

```bash
docker compose down
```

Pour également supprimer les données de la base :

```bash
docker compose down -v
```

---

## Lancement sans Docker

Tu as besoin de **Python 3.11+**, **Node.js 20+** et **PostgreSQL** installés localement.

### Base de données PostgreSQL

Démarre PostgreSQL et crée la base :

```bash
psql -U postgres
CREATE DATABASE eventdb;
\q
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate
pip install -r requirements.txt

export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eventdb
# Windows PowerShell : $env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eventdb"

uvicorn app.main:app --reload --port 8000
```

L'API est accessible sur [http://localhost:8000](http://localhost:8000).

### Frontend

Dans un autre terminal :

```bash
cd frontend
npm install
npm start
```

Le frontend est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Exécuter les tests

Les tests utilisent SQLite (en mémoire), donc **aucune base PostgreSQL n'est nécessaire** pour les faire tourner.

### Avec Docker

```bash
docker compose run --rm backend pytest tests/ -v
```

### Sans Docker

```bash
cd backend
source venv/bin/activate
pip install pytest httpx
pytest tests/ -v
```

Résultat attendu :

```
tests/test_events.py::test_create_event PASSED
tests/test_events.py::test_create_event_invalid_type PASSED
tests/test_events.py::test_list_events PASSED
tests/test_events.py::test_list_events_filter_by_user PASSED
tests/test_events.py::test_list_events_filter_by_type PASSED
tests/test_events.py::test_user_summary PASSED
tests/test_events.py::test_user_summary_not_found PASSED
```

---

## Commandes Docker utiles

```bash
# Voir les logs en temps réel
docker compose logs -f

# Logs d'un seul service
docker compose logs -f backend

# Redémarrer un service
docker compose restart backend

# Accéder au shell du backend
docker compose exec backend bash

# Accéder à PostgreSQL
docker compose exec db psql -U postgres -d eventdb

# Reconstruire sans cache
docker compose build --no-cache
```

---

## Mise en ligne sur GitHub

### 1. Créer un compte GitHub

Va sur [https://github.com](https://github.com) et crée un compte si tu n'en as pas.

### 2. Initialiser Git dans le projet

```bash
cd event-tracker
git init
git add .
git commit -m "init: structure du projet event-tracker"
```

### 3. Créer le dépôt GitHub

- Va sur [https://github.com/new](https://github.com/new)
- Nom du dépôt : `event-tracker`
- Laisse les options par défaut
- Clique sur **Create repository**

### 4. Connecter et pousser

```bash
git remote add origin https://github.com/<ton-utilisateur>/event-tracker.git
git branch -M main
git push -u origin main
```

### Commits au fil du développement (bonne pratique)

```bash
git add backend/app/models.py backend/app/schemas.py
git commit -m "feat(backend): ajout du modèle Event et des schémas Pydantic"

git add backend/app/routers/
git commit -m "feat(backend): endpoints POST /events et GET /events"

git add backend/app/routers/users.py
git commit -m "feat(backend): endpoint GET /users/{user_id}/summary"

git add frontend/src/
git commit -m "feat(frontend): interface React avec formulaire et liste d'événements"

git add docker-compose.yml backend/Dockerfile frontend/Dockerfile
git commit -m "chore: configuration Docker et docker-compose"

git add backend/tests/
git commit -m "test: tests unitaires des endpoints"

git push
```

---

## Dépannage

### Le frontend ne se connecte pas à l'API

Vérifie que le backend est bien démarré :

```bash
curl http://localhost:8000/
```

Si ça répond `{"message": "Event Tracker API"}`, le backend fonctionne.

Le problème peut venir de CORS. Vérifie que `REACT_APP_API_URL` dans `frontend/.env` pointe bien vers `http://localhost:8000`.

### Erreur `port already in use`

Un autre programme utilise le port 3000 ou 8000. Arrête-le ou change les ports dans `docker-compose.yml`.

### La base ne démarre pas

```bash
docker compose down -v
docker compose up --build
```

Cela recrée les volumes proprement.

### Erreur `ModuleNotFoundError` dans le backend

```bash
docker compose build --no-cache backend
```

### Le frontend charge mais affiche une page blanche

Ouvre la console du navigateur (F12 → Console). Si tu vois une erreur de connexion à l'API, vérifie que le backend tourne.

---

## Choix techniques

| Technologie | Raison |
|---|---|
| **FastAPI** | Simple, rapide à écrire, documentation Swagger auto-générée |
| **SQLAlchemy** | ORM standard Python, gère les migrations légères via `create_all` |
| **Pydantic** | Validation des entrées intégrée à FastAPI |
| **PostgreSQL** | Base relationnelle robuste, données persistées entre redémarrages |
| **React (CRA)** | Simple, pas de configuration nécessaire pour ce périmètre |
| **Docker Compose** | Un seul fichier pour orchestrer les 3 services |

### Ce qui manque / ce que j'aurais fait avec plus de temps

- Pagination côté frontend
- Authentification basique (token API)
- Variable `REACT_APP_API_URL` injectée correctement en build Docker (nécessite un nginx ou une réécriture au runtime)
- Alembic pour les migrations de base
- Tests frontend (React Testing Library)
- Un endpoint `DELETE /events/{id}` pour la gestion

### Usage de l'IA

J'ai utilisé Claude (Anthropic) pour accélérer l'écriture du boilerplate FastAPI/SQLAlchemy et la configuration Docker Compose. La structure, les choix techniques et la logique métier ont été décidés et relus par mes soins.

---

## Endpoints

### `POST /events`

Crée un nouvel événement.

**Body JSON :**
```json
{
  "user_id": "user_42",
  "type": "login",
  "payload": { "ip": "192.168.1.1" }
}
```

**Réponse 201 :**
```json
{
  "id": "uuid",
  "user_id": "user_42",
  "type": "login",
  "created_at": "2026-06-01T10:00:00",
  "payload": { "ip": "192.168.1.1" }
}
```

Types acceptés : `login`, `transaction`, `report`

---

### `GET /events`

Liste les événements. Filtres optionnels : `user_id`, `type`. Pagination : `skip`, `limit`.

```
GET /events?user_id=user_42&type=login&skip=0&limit=50
```

---

### `GET /users/{user_id}/summary`

Résumé d'activité d'un utilisateur.

**Réponse 200 :**
```json
{
  "user_id": "user_42",
  "total_events": 10,
  "by_type": {
    "login": 6,
    "transaction": 3,
    "report": 1
  },
  "first_event": "2026-05-01T08:00:00",
  "last_event": "2026-06-01T10:00:00"
}
```

Retourne **404** si aucun événement n'est trouvé pour cet utilisateur.
