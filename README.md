# Portefeuille Électronique Sécurisé

Cette application est une implémentation sécurisée d'un portefeuille électronique, conçue pour démontrer les bonnes pratiques de sécurité dans le développement d'applications web React/Node.js.

## Caractéristiques de sécurité

Cette application implémente les mesures de sécurité suivantes :

1. **Protection contre les injections SQL**
   - Utilisation de requêtes paramétrées 
   - ORM/Query builder pour construire des requêtes sécurisées

2. **Authentification sécurisée**
   - Hachage des mots de passe avec bcrypt
   - Tokens JWT avec expiration
   - Option d'authentification à deux facteurs

3. **Validation des entrées**
   - Validation côté serveur avec express-validator
   - Validation côté client pour l'expérience utilisateur

4. **Protection contre les attaques courantes**
   - En-têtes de sécurité avec Helmet.js
   - Protection CSRF
   - Limitation de débit (rate limiting)
   - Gestion sécurisée des sessions

5. **Sécurité du pipeline CI/CD**
   - Analyse de code statique (SAST)
   - Audit des dépendances
   - Gestion sécurisée des secrets
   - Tests automatisés

## Technologies utilisées

- **Frontend**: 
  - React 18
  - React Router 6
  - Axios
  - React Hook Form
  - Material-UI

- **Backend**:
  - Node.js 18+
  - Express 4
  - MySQL avec mysql2
  - JWT (jsonwebtoken)
  - bcrypt
  - Helmet.js
  - express-rate-limit
  - express-validator

## Structure du projet

```
secure-wallet/
├── frontend/           # Application React
│   ├── public/         # Fichiers statiques
│   ├── src/            # Code source React
│   │   ├── components/ # Composants React
│   │   ├── contexts/   # Contextes React (Auth, etc.)
│   │   ├── hooks/      # Hooks personnalisés
│   │   ├── pages/      # Pages de l'application
│   │   ├── services/   # Services API
│   │   └── utils/      # Utilitaires
│   └── package.json    # Dépendances frontend
├── backend/            # API Node.js
│   ├── config/         # Configuration
│   ├── middleware/     # Middleware Express
│   ├── models/         # Modèles de données
│   ├── routes/         # Routes API
│   ├── services/       # Logique métier
│   ├── utils/          # Utilitaires
│   ├── app.js          # Point d'entrée de l'application
│   └── package.json    # Dépendances backend
└── .github/            # Configuration GitHub Actions
    └── workflows/      # Workflows CI/CD
```

## Installation et configuration

### Prérequis
- Node.js (v18+)
- npm ou yarn
- MySQL (v8+)

### Base de données
```bash
# Créer la base de données
mysql -u root -p
```

```sql
CREATE DATABASE secure_wallet;
CREATE USER 'secure_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON secure_wallet.* TO 'secure_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Backend
```bash
cd backend
npm install

# Créer un fichier .env sécurisé
echo "PORT=5000
DB_HOST=localhost
DB_USER=secure_user
DB_PASSWORD=votre_mot_de_passe_securise
DB_NAME=secure_wallet
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRATION=1h
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100" > .env

# Démarrer le serveur en mode développement
npm run dev
```

### Frontend
```bash
cd frontend
npm install

# Créer un fichier .env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Démarrer l'application
npm start
```

## Tests

### Exécuter les tests unitaires
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Exécuter les tests de sécurité
```bash
# Audit des dépendances
cd backend
npm audit

cd frontend
npm audit

# Analyse statique (si vous avez ESLint configuré avec des règles de sécurité)
cd backend
npm run lint

cd frontend
npm run lint
```

## Bonnes pratiques de sécurité implémentées

### Gestion des mots de passe
- Hachage avec bcrypt et sel aléatoire
- Validation de la force du mot de passe
- Pas de stockage en clair

### Gestion des sessions
- Tokens JWT avec durée de vie limitée
- Rotation des tokens
- Invalidation des sessions

### Protection des données
- Chiffrement des données sensibles
- Minimisation des données exposées dans les API
- Nettoyage des données sensibles dans les logs

### Sécurité des API
- Validation stricte des entrées
- Limitation de débit pour prévenir les attaques par force brute
- En-têtes de sécurité appropriés

## Comparaison avec l'application vulnérable

Cette application peut être utilisée comme référence pour comprendre comment implémenter correctement les mesures de sécurité, en contraste avec l'application "vulnerable-wallet" qui démontre les mauvaises pratiques à éviter.

## Licence

MIT