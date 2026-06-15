# Guides complémentaires — Event Tracker

---

## 1. Guide d'installation détaillé

### Avec Docker (recommandé)

**Prérequis :** Docker Desktop installé ([https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop))

```bash
# 1. Se placer dans le dossier du projet
cd event-tracker

# 2. Lancer tous les services (première fois : 3-5 min)
docker compose up --build

# 3. Vérifier que tout tourne
docker compose ps
# → 3 services avec status "running"

# Accès :
# Frontend  → http://localhost:3000
# API       → http://localhost:8000
# Swagger   → http://localhost:8000/docs
```

### Sans Docker

**Prérequis :** Python 3.11+, Node.js 20+, PostgreSQL

```bash
# --- Base de données ---
psql -U postgres -c "CREATE DATABASE eventdb;"

# --- Backend ---
cd backend
python -m venv venv
source venv/bin/activate          # Windows : venv\Scripts\activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eventdb
uvicorn app.main:app --reload --port 8000

# --- Frontend (autre terminal) ---
cd frontend
npm install
npm start
```

### Exécution des tests

```bash
# Avec Docker
docker compose run --rm backend pytest tests/ -v

# Sans Docker (depuis backend/, venv activé)
pytest tests/ -v
```

Résultat attendu : **7 passed**

---

## 2. Guide Git complet

### Initialisation locale

```bash
cd event-tracker
git init
git add .
git commit -m "init: structure initiale du projet event-tracker"
```

### Commits atomiques recommandés

```bash
# Commit 1 — base de données et modèle
git add backend/app/models.py backend/app/database.py backend/app/schemas.py db/init.sql
git commit -m "feat(backend): modèle Event et configuration base de données"

# Commit 2 — endpoints events
git add backend/app/routers/events.py backend/app/routers/__init__.py
git commit -m "feat(backend): endpoints POST /events et GET /events avec filtres"

# Commit 3 — endpoint summary
git add backend/app/routers/users.py
git commit -m "feat(backend): endpoint GET /users/{user_id}/summary"

# Commit 4 — point d'entrée FastAPI
git add backend/app/main.py backend/requirements.txt
git commit -m "chore(backend): configuration FastAPI, CORS et routeurs"

# Commit 5 — frontend
git add frontend/
git commit -m "feat(frontend): interface React — formulaire, liste et résumé utilisateur"

# Commit 6 — Docker
git add docker-compose.yml backend/Dockerfile frontend/Dockerfile .env.example
git commit -m "chore: configuration Docker Compose pour db, backend et frontend"

# Commit 7 — tests
git add backend/tests/
git commit -m "test: tests unitaires des endpoints events et summary"

# Commit 8 — documentation
git add README.md .gitignore GUIDES.md
git commit -m "docs: README complet et guides d'utilisation"
```

### Création du dépôt GitHub et push

```bash
# 1. Créer un repo vide sur https://github.com/new
#    Nom : event-tracker
#    Laisser README et .gitignore vides (on a les nôtres)

# 2. Connecter le remote
git remote add origin https://github.com/<TON_USERNAME>/event-tracker.git

# 3. Pousser
git branch -M main
git push -u origin main

# Pour les pushs suivants
git push
```

### Vérifier l'historique

```bash
git log --oneline
```

---

## 3. Guide d'explication du projet

### Rôle de chaque dossier

| Dossier | Rôle |
|---|---|
| `backend/app/` | Code source de l'API FastAPI |
| `backend/app/routers/` | Un fichier par groupe de routes (events, users) |
| `backend/tests/` | Tests unitaires avec pytest + TestClient |
| `frontend/src/` | Code React |
| `frontend/src/api/` | Fonctions fetch vers l'API (séparation logique HTTP) |
| `frontend/src/components/` | Composants React réutilisables |
| `db/` | Script SQL d'init de la base (exécuté au premier démarrage PostgreSQL) |

### Rôle des fichiers principaux

| Fichier | Rôle |
|---|---|
| `backend/app/main.py` | Point d'entrée FastAPI, CORS, enregistrement des routeurs, création des tables |
| `backend/app/database.py` | Configuration SQLAlchemy (engine, session, base déclarative) |
| `backend/app/models.py` | Définition de la table `events` avec SQLAlchemy ORM |
| `backend/app/schemas.py` | Schémas Pydantic pour la validation d'entrée et la sérialisation de sortie |
| `backend/app/routers/events.py` | Logique des routes `/events` |
| `backend/app/routers/users.py` | Logique de la route `/users/{user_id}/summary` |
| `frontend/src/api/events.js` | Toutes les fonctions fetch vers l'API (centralisation des appels HTTP) |
| `frontend/src/App.jsx` | Composant racine, gestion du refresh entre composants |
| `docker-compose.yml` | Orchestration des 3 services avec dépendances et healthcheck |

### Explication des choix techniques

**FastAPI** : choisi pour sa simplicité d'écriture, sa validation automatique via Pydantic, et sa documentation Swagger générée sans effort. Pour un test de 2-3 heures, c'est le framework Python le plus productif.

**SQLAlchemy** : ORM standard Python. `create_all()` crée les tables au démarrage sans outil de migration externe. Pour un projet plus long, j'aurais utilisé Alembic.

**Pydantic** : intégré à FastAPI, gère la validation des entrées (type enum pour `EventType`) et la sérialisation des sorties.

**PostgreSQL** : données persistées dans un volume Docker nommé, elles survivent aux redémarrages des conteneurs.

**React (CRA)** : une seule page, pas de routing nécessaire. Create React App évite toute configuration webpack.

**Pas de Redux / pas de React Query** : le state est simple (un `useState` pour déclencher le refresh de la liste après création). Inutile de complexifier.

**Healthcheck Docker** : le backend attend que PostgreSQL soit prêt avant de démarrer (`depends_on: condition: service_healthy`), évitant les erreurs de connexion au démarrage.

### Explication des endpoints

#### `POST /events`
Crée un événement. Le `type` est validé par un enum (`login`, `transaction`, `report`) — si la valeur ne correspond pas, FastAPI renvoie automatiquement un 422. L'`id` est un UUID généré côté serveur.

#### `GET /events`
Liste tous les événements. Les filtres `user_id` et `type` sont optionnels et composables. La pagination `skip`/`limit` est disponible (défaut : 50 résultats, ordre antéchronologique).

#### `GET /users/{user_id}/summary`
Agrège les données d'un utilisateur : total, répartition par type, premier et dernier événement. Renvoie 404 si aucun événement n'existe pour cet utilisateur.

---

## 4. Préparation à l'entretien

### 20 questions probables et réponses

---

**Q1 : Pourquoi FastAPI plutôt que Flask ou Django ?**

FastAPI est plus adapté pour une API REST pure : validation automatique des données via Pydantic, documentation Swagger intégrée, support natif des types Python, et performances supérieures (ASGI). Flask demanderait plus de configuration manuelle, Django est surdimensionné pour ce périmètre.

---

**Q2 : C'est quoi SQLAlchemy et pourquoi un ORM ?**

SQLAlchemy est un ORM (Object-Relational Mapper) : il fait le lien entre les objets Python et les tables SQL. On définit le modèle `Event` une fois en Python et il crée/interroge la table automatiquement. Ça évite d'écrire du SQL brut pour les opérations courantes, et ça rend le code plus lisible et portable.

---

**Q3 : Comment fonctionne `get_db()` et l'injection de dépendance ?**

`get_db()` est un générateur Python. FastAPI l'appelle pour chaque requête, crée une session SQLAlchemy, l'injecte dans la fonction de route via `Depends(get_db)`, puis la ferme proprement dans le bloc `finally`, même en cas d'erreur. C'est le pattern standard FastAPI pour la gestion des sessions DB.

---

**Q4 : Que se passe-t-il si on envoie un `type` invalide dans `POST /events` ?**

FastAPI + Pydantic valident automatiquement l'entrée. Le champ `type` est défini comme un `Enum`, donc si la valeur ne correspond pas à `login`, `transaction` ou `report`, FastAPI renvoie un 422 Unprocessable Entity avec un message d'erreur clair, sans que je n'aie écrit de code de validation manuellement.

---

**Q5 : Pourquoi stocker les dates en UTC ?**

Pour éviter les problèmes de fuseau horaire. Si le serveur ou la base change de timezone, les dates restent cohérentes. À l'affichage, le frontend convertit en heure locale via `toLocaleString("fr-FR")`.

---

**Q6 : Comment les données survivent-elles à un redémarrage des conteneurs ?**

PostgreSQL stocke ses données dans un volume Docker nommé (`postgres_data`). `docker compose down` s'arrête mais conserve le volume. Seul `docker compose down -v` supprime les données.

---

**Q7 : À quoi sert le `healthcheck` dans le docker-compose ?**

Il teste régulièrement si PostgreSQL est prêt à accepter des connexions (`pg_isready`). Le backend démarre seulement quand le healthcheck est passant (`condition: service_healthy`), évitant les erreurs "connection refused" au démarrage.

---

**Q8 : Comment les tests fonctionnent sans PostgreSQL ?**

Les tests utilisent SQLite en mémoire à la place de PostgreSQL, via un override de la dépendance `get_db`. SQLite est suffisant pour tester la logique métier et le comportement des endpoints. En production, PostgreSQL est utilisé.

---

**Q9 : Qu'est-ce que CORS et pourquoi tu l'as configuré ?**

CORS (Cross-Origin Resource Sharing) est une politique de sécurité du navigateur qui bloque les requêtes vers un domaine différent. Le frontend sur `:3000` appelle l'API sur `:8000` — ce sont deux origines différentes. Sans le middleware CORS dans FastAPI, le navigateur bloquerait toutes les requêtes. J'ai autorisé toutes les origines pour le développement ; en production on restreindrait à l'URL du frontend.

---

**Q10 : Pourquoi séparer `schemas.py` et `models.py` ?**

`models.py` définit la structure en base de données (SQLAlchemy). `schemas.py` définit ce qui entre et sort de l'API (Pydantic). Ils sont souvent similaires mais pas identiques : le schéma d'entrée n'a pas d'`id` (généré serveur), le schéma de sortie n'expose pas forcément tous les champs internes. Séparer les deux évite de mélanger responsabilités ORM et validation HTTP.

---

**Q11 : Comment tu rendrais ce projet prêt pour la production ?**

- Alembic pour les migrations de base de données
- Variables d'environnement réelles (pas de secrets en dur)
- Authentification (JWT ou API key)
- Nginx comme reverse proxy devant le frontend et l'API
- Build React optimisé (`npm run build`) au lieu du serveur de développement
- HTTPS
- Logs structurés

---

**Q12 : Pourquoi un UUID comme clé primaire plutôt qu'un entier auto-incrémenté ?**

Les UUIDs évitent l'exposition d'informations (un ID entier révèle le nombre total d'enregistrements). Ils sont aussi plus sûrs à distribuer si la base est shardée. L'inconvénient : légèrement moins performants en indexation. Pour ce projet, les deux fonctionneraient.

---

**Q13 : Que fait `Base.metadata.create_all(bind=engine)` ?**

Cette instruction crée toutes les tables définies via SQLAlchemy si elles n'existent pas encore. C'est une approche simple pour un projet de ce type. Elle est idempotente : si les tables existent déjà, elle ne fait rien.

---

**Q14 : Pourquoi `payload` est nullable et en JSON ?**

Le sujet précise que c'est un "champ libre, optionnel". JSON permet de stocker n'importe quelle structure (objet, tableau, valeur) sans contrainte de schéma — utile pour des métadonnées qui varient selon le type d'événement (IP pour un login, montant pour une transaction…).

---

**Q15 : Comment le frontend déclenche-t-il le rechargement de la liste après création ?**

`App.jsx` passe un compteur `refresh` à `EventList` via les props. Quand `EventForm` crée un événement avec succès, il appelle `onCreated()` qui incrémente ce compteur. Le `useEffect` dans `EventList` dépend de ce compteur : chaque fois qu'il change, la liste se recharge.

---

**Q16 : Pourquoi `fetchEvents` est dans un fichier `api/events.js` séparé ?**

Centraliser les appels HTTP en dehors des composants facilite la maintenance : si l'URL de l'API change, on modifie un seul fichier. Ça rend aussi les composants plus lisibles (logique d'affichage séparée de la logique réseau) et faciliterait l'ajout de tests.

---

**Q17 : Que retourne l'API si `GET /users/{user_id}/summary` est appelé pour un utilisateur sans événements ?**

Elle retourne un **404 Not Found** avec le message `"No events found for this user"`. J'ai fait ce choix car un résumé vide n'a pas de sens : il n'y a rien à résumer. Une alternative serait de retourner un 200 avec des valeurs nulles, mais le 404 est plus explicite.

---

**Q18 : Comment tu ajouterais de la pagination sur la liste d'événements ?**

Côté API, les paramètres `skip` et `limit` sont déjà en place. Côté frontend, il suffirait d'ajouter deux boutons "page précédente / suivante" qui modifient `skip` dans les filtres. Pour un projet plus complet, on pourrait retourner le total dans les headers de réponse (`X-Total-Count`) pour calculer le nombre de pages.

---

**Q19 : Quel est l'avantage du `lifespan` dans `main.py` par rapport à un appel direct ?**

Le `lifespan` (context manager asynchrone) est la façon recommandée dans les versions récentes de FastAPI pour exécuter du code au démarrage et à l'arrêt. L'ancienne méthode `@app.on_event("startup")` est dépréciée. Ça permet aussi de mieux contrôler l'ordre d'initialisation et facilite les tests (on peut surcharger le lifespan).

---

**Q20 : Si tu avais eu plus de temps, qu'aurais-tu ajouté ?**

- Alembic pour les migrations versionées
- Authentification basique (API key en header)
- Pagination côté frontend avec numéro de page
- Tests frontend avec React Testing Library
- Un endpoint `DELETE /events/{id}`
- Build Docker du frontend en multi-stage (nginx + build statique) pour éviter le serveur de dev en "production"
- Variables d'environnement injectées au runtime pour le frontend

---

### Pièges à éviter en entretien

**Piège 1 — "Tu n'as pas utilisé Alembic"**
→ Répondre : "Pour ce périmètre, `create_all()` suffit. Sur un projet réel avec plusieurs développeurs ou des déploiements successifs, j'utiliserais Alembic pour versionner les migrations."

**Piège 2 — "Ton CORS autorise toutes les origines, c'est dangereux"**
→ Répondre : "En développement oui. En production, je restreindre à l'URL exacte du frontend. J'aurais mis ça en variable d'environnement."

**Piège 3 — "Tes tests ne testent pas le frontend"**
→ Répondre : "Les tests couvrent la logique métier côté API. Des tests React Testing Library auraient été la prochaine étape avec plus de temps."

**Piège 4 — "Pourquoi CRA ? Il est déprécié"**
→ Répondre : "Pour 2-3 heures de test, CRA reste la solution la plus simple sans configuration. Sur un vrai projet, j'utiliserais Vite."

**Piège 5 — "Le frontend en mode `npm start` en Docker, c'est pas pour la prod"**
→ Répondre : "Exact. En production, je ferais un build statique avec `npm run build` et je le servirais via nginx dans un conteneur multi-stage."
