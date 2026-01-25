# FinSmart Admin Dashboard - Guide des fonctionnalités

## Vue d'ensemble

Le dashboard administrateur permet de gérer complètement l'application FinSmart:
- 📊 Visualiser les analytics et métriques
- 👥 Gérer les utilisateurs (modifier, promouvoir, supprimer)
- 🎯 Gérer les objectifs (modifier, supprimer)

## Accès

### Connexion
Seuls les utilisateurs avec le rôle `admin` peuvent accéder au dashboard.

**URL**: Ouvrez `index.html` dans votre navigateur ou déployez sur Netlify

### Créer le premier admin

1. Créez d'abord un compte utilisateur normal via l'app mobile
2. Promouvez-le en admin avec le script backend:

```bash
cd C:\Users\aboub\finsmart\finsmart-backend
node scripts/makeAdmin.js votre@email.com
```

Vous verrez:
```
✓ Connected to MongoDB

✓ Success!

User Details:
  Email: votre@email.com
  Username: votre_username
  Role: admin (promoted from 'user')
  Joined: 1/17/2026
```

## Onglets du Dashboard

### 📊 Analytics (Onglet par défaut)

**Métriques Overview:**
- Total Users
- New Users (période sélectionnée)
- Total Goals
- Completed Goals

**Success Metrics:**
- Goals Creation Rate (% d'utilisateurs créant un objectif dans les 7 premiers jours)
- Retention Rate (taux de rétention à 7 jours)
- Goal Success Rate (% d'objectifs complétés)
- Weekly Active Users

**Graphiques:**
- Daily Active Users (7 derniers jours)
- Events Breakdown (par type)
- Goals by Category (survival, necessity, lifestyle)
- Goals by Timeframe (court/long terme)

**Sélecteur de période:**
- 7 jours
- 30 jours
- 90 jours

### 👥 Users Management

**Fonctionnalités:**
- **Liste des utilisateurs** avec pagination (10 par page)
- **Recherche** par nom, email, username
- **Filtrage** par rôle (User/Admin)
- **Statistiques** pour chaque utilisateur:
  - Nombre d'objectifs (total, complétés)
  - Montant total épargné
  - Date d'inscription

**Actions disponibles:**

#### Éditer un utilisateur
Cliquez sur "Edit" pour modifier:
- Username
- Email
- **Role** (user ↔ admin)

⚠️ **Important**: Changer le rôle d'un utilisateur en "admin" lui donne accès complet au dashboard admin.

#### Supprimer un utilisateur
Cliquez sur "Delete" pour supprimer:
- ⚠️ **Attention**: Supprime aussi TOUS les objectifs de l'utilisateur
- ⚠️ **Irréversible**: Cette action ne peut pas être annulée
- Confirmation requise

### 🎯 Goals Management

**Fonctionnalités:**
- **Liste des objectifs** avec pagination (10 par page)
- **Filtrage** par:
  - Catégorie (Survival, Necessity, Lifestyle)
  - Timeframe (Short-term, Long-term)
  - Status (Active, Completed, Paused)

**Informations affichées:**
- Nom de l'objectif
- Utilisateur propriétaire
- Catégorie
- Timeframe
- Progression (%)
- Montants (actuel / cible)
- Status

**Actions disponibles:**

#### Éditer un objectif
Cliquez sur "Edit" pour modifier:
- Nom de l'objectif
- Montant actuel
- Montant cible
- Status (active, completed, paused)

💡 La progression est recalculée automatiquement.

#### Supprimer un objectif
Cliquez sur "Delete" pour supprimer:
- ⚠️ **Irréversible**: Cette action ne peut pas être annulée
- Confirmation requise

## API Endpoints utilisés

### Analytics
- `GET /api/v1/analytics/metrics?period={7days|30days|90days}`

### Users Management
- `GET /api/v1/admin/users?page={page}&limit={limit}&search={search}&role={role}`
- `GET /api/v1/admin/users/:userId`
- `PUT /api/v1/admin/users/:userId` - Modifier un utilisateur
- `DELETE /api/v1/admin/users/:userId` - Supprimer un utilisateur

### Goals Management
- `GET /api/v1/admin/goals?page={page}&limit={limit}&category={category}&timeframe={timeframe}&status={status}`
- `PUT /api/v1/admin/goals/:goalId` - Modifier un objectif
- `DELETE /api/v1/admin/goals/:goalId` - Supprimer un objectif

## Sécurité

### Protection des routes
- ✅ Toutes les routes admin nécessitent:
  1. **Authentification** (token JWT valide)
  2. **Autorisation** (rôle = 'admin')

- ❌ Si un utilisateur normal essaie d'accéder:
  ```json
  {
    "success": false,
    "error": {
      "message": "Admin access required. This action is restricted to administrators only."
    }
  }
  ```

### Middleware de sécurité
```javascript
// Dans le backend
router.use(protect);      // Vérifier authentification
router.use(requireAdmin); // Vérifier rôle admin
```

### Protection frontend
- Le dashboard vérifie le token à chaque requête
- Si token expiré → redirection vers login
- Si accès refusé (403) → affiche "Access denied. Admin privileges required."

## Cas d'usage

### Scénario 1: Promouvoir un utilisateur en admin
1. User s'inscrit via l'app mobile
2. Admin exécute: `node scripts/makeAdmin.js user@email.com`
3. User peut maintenant se connecter au dashboard admin

### Scénario 2: Gérer un utilisateur problématique
1. Onglet "Users"
2. Rechercher l'utilisateur
3. Cliquer "Edit" → Modifier son email ou username
4. Ou "Delete" → Supprimer complètement

### Scénario 3: Corriger un objectif
1. Onglet "Goals"
2. Filtrer par utilisateur ou catégorie
3. Cliquer "Edit" sur l'objectif
4. Modifier montant actuel/cible
5. Sauvegarder → Progression recalculée automatiquement

### Scénario 4: Analyser l'engagement
1. Onglet "Analytics"
2. Sélectionner période (7/30/90 jours)
3. Vérifier:
   - Daily Active Users (tendance)
   - Retention Rate (engagement)
   - Goal Success Rate (efficacité)

## Déploiement pour accès distant

### Option 1: Netlify (Frontend uniquement)
```bash
cd C:\Users\aboub\finsmart\finsmart-admin
netlify deploy --prod
```

### Option 2: ngrok (Backend)
```bash
# Terminal 1: Backend
cd C:\Users\aboub\finsmart\finsmart-backend
npm run dev

# Terminal 2: ngrok
ngrok http 3000
```

Ensuite, mettre à jour `app.js`:
```javascript
const API_URL = 'https://votre-url-ngrok.ngrok.io/api/v1';
```

## Limites et améliorations futures

### Limites actuelles
- Pas de création d'utilisateurs depuis le dashboard
- Pas d'export des données (CSV, PDF)
- Pas de notifications en temps réel
- Pas de logs d'activité admin

### Améliorations prévues
- [ ] Activity logs (qui a fait quoi, quand)
- [ ] Bulk actions (supprimer plusieurs utilisateurs)
- [ ] Export données (CSV, JSON)
- [ ] Statistiques avancées (graphiques interactifs)
- [ ] Notifications push aux utilisateurs
- [ ] Gestion des catégories
- [ ] Système de permissions granulaires (super-admin, moderator, etc.)

## Support

Pour toute question ou problème:
1. Vérifier les logs backend: `npm run dev` dans `finsmart-backend`
2. Vérifier la console navigateur (F12)
3. Vérifier que l'utilisateur a bien le rôle `admin` dans MongoDB

## Commandes utiles

```bash
# Promouvoir un utilisateur en admin
node scripts/makeAdmin.js email@example.com

# Vérifier les admins actuels (MongoDB Shell)
db.users.find({ role: 'admin' })

# Compter les utilisateurs par rôle
db.users.aggregate([
  { $group: { _id: '$role', count: { $sum: 1 } } }
])
```
