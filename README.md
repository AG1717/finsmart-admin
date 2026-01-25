# FinSmart Admin Dashboard

Application web d'administration pour visualiser les métriques et statistiques de l'application FinSmart.

## Fonctionnalités

### 📊 Analytics
- Vue d'ensemble des utilisateurs et objectifs
- Métriques de succès (taux de rétention, taux de création d'objectifs, etc.)
- Graphiques d'utilisateurs actifs quotidiens
- Répartition des événements
- Distribution des objectifs par catégorie et timeframe
- Sélection de période (7/30/90 jours)

### 👥 Gestion des Utilisateurs
- Liste complète des utilisateurs avec pagination
- Recherche par nom, email, username
- Filtrage par rôle (User/Admin)
- Statistiques par utilisateur (objectifs, montant épargné)
- **Éditer** username, email, rôle
- **Promouvoir** en admin
- **Supprimer** utilisateur (+ tous ses objectifs)

### 🎯 Gestion des Objectifs
- Liste complète des objectifs avec pagination
- Filtrage par catégorie, timeframe, status
- Voir les détails (utilisateur, progression, montants)
- **Modifier** nom, montants, status
- **Supprimer** objectif

## Installation

Aucune installation nécessaire ! C'est une application web statique.

## Utilisation

### 1. Démarrer le backend

Assurez-vous que le backend FinSmart est démarré:

```bash
cd C:\Users\aboub\finsmart\finsmart-backend
npm run dev
```

### 2. Ouvrir l'application admin

Ouvrez simplement le fichier `index.html` dans votre navigateur:

```
C:\Users\aboub\finsmart\finsmart-admin\index.html
```

Ou utilisez un serveur local (recommandé):

```bash
# Avec Python
cd C:\Users\aboub\finsmart\finsmart-admin
python -m http.server 8080

# Avec Node.js (http-server)
npx http-server -p 8080

# Avec PHP
php -S localhost:8080
```

Puis ouvrez: http://localhost:8080

### 3. Créer le premier admin

Avant de pouvoir vous connecter, vous devez promouvoir un utilisateur en admin:

```bash
# 1. Créez d'abord un compte via l'app mobile
# 2. Ensuite, promouvez-le en admin:
cd C:\Users\aboub\finsmart\finsmart-backend
node scripts/makeAdmin.js votre@email.com
```

### 4. Se connecter

Utilisez les identifiants de votre compte admin:

- **Email**: Votre email d'admin
- **Password**: Votre mot de passe

**Sécurité**: ✅ Seuls les utilisateurs avec le rôle `admin` peuvent accéder au dashboard. Les utilisateurs normaux recevront une erreur 403 (Access Denied).

## Structure des fichiers

```
finsmart-admin/
├── index.html      # Page principale
├── styles.css      # Styles CSS
├── app.js          # Logique JavaScript
└── README.md       # Ce fichier
```

## Configuration

Pour changer l'URL de l'API, modifiez la constante dans `app.js`:

```javascript
const API_URL = 'http://localhost:3000/api/v1';
```

## Métriques disponibles

### Overview
- Total Users
- New Users (période sélectionnée)
- Total Goals
- Completed Goals

### Success Metrics
- Goals Creation Rate (% d'utilisateurs créant un objectif dans les 7 premiers jours)
- Retention Rate (taux de rétention à 7 jours)
- Goal Success Rate (% d'objectifs complétés)
- Weekly Active Users

### Graphiques
- Daily Active Users (7 derniers jours)

### Distributions
- Events Breakdown (par type d'événement)
- Goals by Category (survival, necessity, lifestyle)
- Goals by Timeframe (court terme, long terme)

## Sécurité

⚠️ **Important**:
- Cette application stocke le token d'authentification dans localStorage
- Assurez-vous de sécuriser l'accès à cette application
- En production, utilisez HTTPS
- Considérez l'ajout d'un système de rôles pour restreindre l'accès aux vrais admins

## Améliorations futures

- [ ] Système de rôles (admin vs user)
- [ ] Export des données (CSV, PDF)
- [ ] Filtres avancés par date
- [ ] Graphiques supplémentaires (Chart.js)
- [ ] Mode sombre
- [ ] Notifications en temps réel
- [ ] Gestion des utilisateurs
