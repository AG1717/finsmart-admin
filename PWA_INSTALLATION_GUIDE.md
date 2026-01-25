# 📱 Guide d'Installation - FinSmart Admin PWA

## Table des matières
1. [Qu'est-ce qu'une PWA ?](#quest-ce-quune-pwa-)
2. [Prérequis](#prérequis)
3. [Génération des icônes](#génération-des-icônes)
4. [Installation sur différents appareils](#installation-sur-différents-appareils)
5. [Dépannage](#dépannage)

---

## Qu'est-ce qu'une PWA ? 🚀

Une **Progressive Web App (PWA)** est une application web qui se comporte comme une application native. FinSmart Admin PWA offre :

✅ **Installation sur l'écran d'accueil** - Accès en un clic comme une vraie app
✅ **Fonctionne offline** - Cache intelligent pour consulter les données hors ligne
✅ **Notifications push** - Recevez des alertes importantes
✅ **Expérience native** - Pas de barre d'adresse, plein écran
✅ **Mises à jour automatiques** - Toujours la dernière version
✅ **Léger et rapide** - Pas besoin de télécharger depuis les stores

---

## Prérequis ✔️

### Pour le développement
- Serveur HTTPS (requis pour PWA)
- Navigateur moderne (Chrome, Edge, Safari, Firefox)
- Backend FinSmart fonctionnel

### URLs acceptées
- `https://` - Toute URL HTTPS
- `http://localhost` - Pour le développement local
- `http://127.0.0.1` - Pour le développement local

**⚠️ Important :** Les PWA ne fonctionnent PAS sur `http://` en production (sauf localhost).

---

## Génération des icônes 🎨

Le fichier `icons/icon.svg` est fourni comme base. Vous devez générer les icônes PNG de différentes tailles.

### Option 1 : Utiliser un outil en ligne (Recommandé)

**1. PWA Icon Generator**
- Allez sur : https://www.pwabuilder.com/imageGenerator
- Uploadez `icons/icon.svg`
- Téléchargez le pack d'icônes
- Extrayez les fichiers dans le dossier `icons/`

**2. RealFaviconGenerator**
- Allez sur : https://realfavicongenerator.net/
- Uploadez `icons/icon.svg`
- Configurez pour "Android Chrome" et "iOS"
- Téléchargez et extrayez dans `icons/`

### Option 2 : Utiliser ImageMagick (CLI)

Si vous avez ImageMagick installé :

```bash
# Installer ImageMagick (si pas déjà fait)
# Windows: choco install imagemagick
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Générer toutes les tailles
cd finsmart-admin/icons

convert icon.svg -resize 16x16 icon-16x16.png
convert icon.svg -resize 32x32 icon-32x32.png
convert icon.svg -resize 72x72 icon-72x72.png
convert icon.svg -resize 96x96 icon-96x96.png
convert icon.svg -resize 128x128 icon-128x128.png
convert icon.svg -resize 144x144 icon-144x144.png
convert icon.svg -resize 152x152 icon-152x152.png
convert icon.svg -resize 192x192 icon-192x192.png
convert icon.svg -resize 384x384 icon-384x384.png
convert icon.svg -resize 512x512 icon-512x512.png
```

### Option 3 : Utiliser Node.js sharp

```bash
npm install sharp

# Créer un script generate-icons.js
node generate-icons.js
```

**generate-icons.js :**
```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp('icons/icon.svg')
    .resize(size, size)
    .png()
    .toFile(`icons/icon-${size}x${size}.png`)
    .then(() => console.log(`✅ Icône ${size}x${size} générée`))
    .catch(err => console.error(`❌ Erreur ${size}x${size}:`, err));
});
```

### Tailles d'icônes requises

| Taille | Usage |
|--------|-------|
| 16x16 | Favicon (navigateur) |
| 32x32 | Favicon (navigateur) |
| 72x72 | iOS, Badge |
| 96x96 | Android |
| 128x128 | Android, Chrome |
| 144x144 | Windows |
| 152x152 | iOS iPad |
| 192x192 | Android (standard) |
| 384x384 | Android (haute résolution) |
| 512x512 | Splash screen, Store |

---

## Installation sur différents appareils 📲

### Android (Chrome / Edge)

**Méthode 1 : Via le navigateur**
1. Ouvrez l'app dans Chrome : `https://votre-domaine.com`
2. Attendez quelques secondes, une bannière apparaîtra
3. Cliquez sur **"Installer"**
4. L'app sera ajoutée à votre écran d'accueil

**Méthode 2 : Menu du navigateur**
1. Ouvrez l'app dans Chrome
2. Appuyez sur le menu ⋮ (3 points verticaux)
3. Sélectionnez **"Ajouter à l'écran d'accueil"** ou **"Installer l'application"**
4. Confirmez l'installation

**Icône de lancement :**
- Cherchez "FinSmart Admin" dans vos applications
- Ou trouvez l'icône sur l'écran d'accueil

---

### iOS / iPadOS (Safari)

**⚠️ Note :** iOS ne supporte pas toutes les fonctionnalités PWA (pas de service worker complet, pas de notifications push natives).

**Installation :**
1. Ouvrez l'app dans Safari : `https://votre-domaine.com`
2. Appuyez sur le bouton **Partager** 📤 (en bas au centre)
3. Faites défiler et appuyez sur **"Sur l'écran d'accueil"**
4. Nommez l'app : "FinSmart Admin"
5. Appuyez sur **"Ajouter"**

**Limitations iOS :**
- Pas de notifications push natives
- Cache limité (environ 50 MB)
- Service Worker limité
- Pas de mise à jour automatique en arrière-plan

---

### Windows 10/11 (Chrome / Edge)

**Installation :**
1. Ouvrez l'app dans Chrome ou Edge
2. Cliquez sur l'icône ➕ dans la barre d'adresse (à droite)
3. Cliquez sur **"Installer"**
4. L'app sera ajoutée au menu Démarrer et à la barre des tâches

**Désinstallation :**
- Menu Démarrer → Clic droit sur "FinSmart Admin" → Désinstaller

---

### macOS (Chrome / Edge)

**Installation :**
1. Ouvrez l'app dans Chrome ou Edge
2. Cliquez sur l'icône ➕ dans la barre d'adresse
3. Sélectionnez **"Installer FinSmart Admin"**
4. L'app sera dans le dossier Applications

**Lancement :**
- Spotlight (⌘ + Espace) → Tapez "FinSmart Admin"
- Ou trouvez dans Applications

---

### Linux (Chrome / Chromium)

**Installation :**
1. Ouvrez l'app dans Chrome/Chromium
2. Menu ⋮ → **"Installer FinSmart Admin"**
3. L'app sera dans le lanceur d'applications

---

## Déploiement sur un serveur HTTPS 🌐

### Option 1 : Netlify (Gratuit, Recommandé)

```bash
# 1. Installer Netlify CLI
npm install -g netlify-cli

# 2. Se connecter
netlify login

# 3. Déployer
cd finsmart-admin
netlify deploy --prod
```

Configuration `netlify.toml` (optionnel) :
```toml
[[headers]]
  for = "/service-worker.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

### Option 2 : GitHub Pages (Gratuit)

```bash
# 1. Créer un repo GitHub
git init
git add .
git commit -m "FinSmart Admin PWA"
git remote add origin https://github.com/votre-user/finsmart-admin.git
git push -u origin main

# 2. Activer GitHub Pages
# Settings → Pages → Source: main branch
```

**⚠️ Important :** Modifiez le `start_url` dans `manifest.json` :
```json
"start_url": "/finsmart-admin/index.html"
```

### Option 3 : Vercel (Gratuit)

```bash
npm install -g vercel
cd finsmart-admin
vercel
```

### Option 4 : Serveur Apache/Nginx

**Apache (.htaccess) :**
```apache
<IfModule mod_headers.c>
    Header set Service-Worker-Allowed "/"
    Header set Cache-Control "public, max-age=0" "expr=%{REQUEST_URI} =~ /service-worker\.js/"
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} !=on
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

**Nginx :**
```nginx
server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        root /var/www/finsmart-admin;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /service-worker.js {
        add_header Cache-Control "public, max-age=0";
        add_header Service-Worker-Allowed "/";
    }

    location /manifest.json {
        add_header Cache-Control "public, max-age=3600";
    }
}
```

---

## Configuration du backend 🔧

**IMPORTANT :** Votre backend doit permettre les requêtes CORS depuis votre domaine PWA.

Dans le backend FinSmart (`finsmart-backend/src/middleware/cors.js`) :

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://votre-domaine.com',
  'https://www.votre-domaine.com'
];
```

---

## Tester la PWA en local 🧪

### Option 1 : Utiliser un serveur HTTPS local

**Avec Python 3 :**
```bash
cd finsmart-admin

# Générer un certificat SSL auto-signé
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Lancer le serveur HTTPS
python -m http.server 8000
```

**Avec http-server (Node.js) :**
```bash
npm install -g http-server
cd finsmart-admin

# Serveur HTTPS
http-server -S -C cert.pem -K key.pem -p 8443
```

**Avec serve (Node.js, plus simple) :**
```bash
npm install -g serve
cd finsmart-admin
serve -s . -p 8000
```

### Option 2 : Tunneling avec ngrok

```bash
# Installer ngrok : https://ngrok.com/download

# Lancer un serveur local
cd finsmart-admin
python -m http.server 8000

# Dans un autre terminal, créer un tunnel HTTPS
ngrok http 8000
```

Ngrok vous donnera une URL HTTPS temporaire comme :
`https://abc123.ngrok.io`

---

## Vérifier l'installation PWA ✅

### Chrome DevTools

1. Ouvrez `https://votre-domaine.com`
2. Appuyez sur **F12** (DevTools)
3. Allez dans l'onglet **"Application"**
4. Vérifiez :
   - ✅ **Manifest** : Toutes les propriétés sont correctes
   - ✅ **Service Workers** : "activated and running"
   - ✅ **Cache Storage** : Les fichiers sont en cache

### Lighthouse Audit

1. F12 → Onglet **"Lighthouse"**
2. Cochez **"Progressive Web App"**
3. Cliquez sur **"Generate report"**
4. Score cible : **90+/100**

### PWA Checker Online

- https://www.pwabuilder.com/
- Entrez votre URL
- Vérifiez les recommandations

---

## Fonctionnalités PWA disponibles 🎯

### ✅ Installable
- Ajout à l'écran d'accueil
- Icône personnalisée
- Nom personnalisé

### ✅ Offline
- Cache des fichiers statiques (HTML, CSS, JS)
- Cache des requêtes API GET
- Page de fallback si hors ligne

### ✅ Mode Standalone
- Pas de barre d'URL
- Plein écran
- Expérience native

### ✅ Responsive
- Optimisé pour mobile
- Optimisé pour tablette
- Optimisé pour desktop

### ✅ Mises à jour automatiques
- Détection de nouvelle version
- Prompt de mise à jour
- Rafraîchissement automatique

### ⚠️ Notifications Push (Optionnel)
- Configuré mais pas activé par défaut
- Nécessite un serveur de notifications
- Fonctionne sur Android/Windows (pas iOS)

---

## Dépannage 🔧

### L'app ne s'installe pas

**Problème :** Pas de bannière d'installation

**Solutions :**
1. Vérifiez que vous êtes en HTTPS (pas HTTP)
2. Vérifiez que `manifest.json` est accessible : `https://votre-domaine.com/manifest.json`
3. Vérifiez que le service worker s'enregistre (F12 → Application → Service Workers)
4. Vérifiez que les icônes existent dans `/icons/`
5. Videz le cache (Ctrl+Shift+Delete)

---

### Le service worker ne s'active pas

**Problème :** Service worker en erreur

**Solutions :**
1. Vérifiez les erreurs dans la console (F12 → Console)
2. Vérifiez que le chemin est correct : `/service-worker.js`
3. Assurez-vous que tous les fichiers dans `STATIC_ASSETS` existent
4. Désactivez/réactivez le service worker (Application → Service Workers → Unregister)

---

### Les données ne se mettent pas à jour

**Problème :** Anciennes données en cache

**Solutions :**
1. Forcez le rafraîchissement : Ctrl+F5
2. Videz le cache : F12 → Application → Storage → Clear site data
3. Désinstallez et réinstallez l'app

**Dans le code :** Envoyer un message pour vider le cache
```javascript
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.postMessage({
    type: 'CLEAR_CACHE'
  });
}
```

---

### L'app fonctionne en ligne mais pas hors ligne

**Problème :** Requêtes API échouent hors ligne

**Explication :** Les requêtes POST/PUT/DELETE ne sont PAS cachées pour des raisons de sécurité. Seules les requêtes GET sont en cache.

**Solution :** Utiliser IndexedDB pour stocker les données localement et synchroniser quand la connexion revient.

---

### iOS : L'app ne reste pas installée

**Problème :** iOS supprime les PWA après un certain temps

**Solution :** C'est un comportement iOS. Demandez aux utilisateurs iOS d'utiliser régulièrement l'app ou d'ajouter un favori Safari.

---

## Mise à jour de la PWA 🔄

### Déployer une nouvelle version

1. Modifiez vos fichiers (HTML, CSS, JS)
2. **IMPORTANT :** Changez le `CACHE_NAME` dans `service-worker.js` :
   ```javascript
   const CACHE_NAME = 'finsmart-admin-v2'; // Incrémenter la version
   ```
3. Déployez sur votre serveur

### Côté utilisateur

- L'utilisateur sera automatiquement notifié de la mise à jour
- Une alerte demandera s'il veut actualiser
- Après confirmation, la nouvelle version se chargera

---

## Désinstallation 🗑️

### Android
1. Paramètres → Applications → FinSmart Admin → Désinstaller
2. Ou : Appui long sur l'icône → Informations → Désinstaller

### iOS
1. Appui long sur l'icône → "Supprimer l'app"

### Windows
1. Menu Démarrer → Clic droit → Désinstaller

### macOS
1. Applications → Glisser vers la corbeille

### Depuis le navigateur
1. chrome://apps/ → Clic droit → "Supprimer de Chrome"

---

## Ressources utiles 📚

- **Documentation PWA :** https://web.dev/progressive-web-apps/
- **PWA Builder :** https://www.pwabuilder.com/
- **Service Worker Cookbook :** https://serviceworke.rs/
- **Can I Use PWA :** https://caniuse.com/?search=service%20worker
- **Workbox (Google) :** https://developers.google.com/web/tools/workbox

---

## Support et contact 💬

Pour toute question :
- Documentation backend : `finsmart-backend/README.md`
- Guide admin : `ADMIN_FEATURES.md`
- Issues : Créez une issue sur GitHub

---

**Développé avec ❤️ pour FinSmart**
Version PWA 1.0 - 2026
