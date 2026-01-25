/**
 * Script pour générer automatiquement toutes les icônes PWA
 *
 * Installation:
 * npm install sharp
 *
 * Usage:
 * node generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tailles d'icônes requises pour la PWA
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Chemins
const inputFile = path.join(__dirname, 'icons', 'icon.svg');
const outputDir = path.join(__dirname, 'icons');

// Vérifier que le fichier source existe
if (!fs.existsSync(inputFile)) {
  console.error('❌ Erreur: Le fichier icons/icon.svg n\'existe pas');
  console.log('📝 Créez d\'abord un fichier icon.svg dans le dossier icons/');
  process.exit(1);
}

// Créer le dossier icons s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('📁 Dossier icons/ créé');
}

console.log('🎨 Génération des icônes PWA...\n');
console.log(`📥 Source: ${inputFile}\n`);

// Fonction pour générer une icône
async function generateIcon(size) {
  const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);

  try {
    await sharp(inputFile)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Fond transparent
      })
      .png({
        compressionLevel: 9,
        quality: 100
      })
      .toFile(outputFile);

    // Obtenir la taille du fichier
    const stats = fs.statSync(outputFile);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log(`✅ ${size}x${size}px - ${fileSizeKB} KB`);
  } catch (error) {
    console.error(`❌ Erreur pour ${size}x${size}:`, error.message);
  }
}

// Générer toutes les icônes
async function generateAll() {
  const startTime = Date.now();

  for (const size of sizes) {
    await generateIcon(size);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\n✨ Génération terminée en ${duration}s`);
  console.log(`📁 Icônes générées dans: ${outputDir}`);

  // Lister tous les fichiers générés
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
  console.log(`\n📊 Total: ${files.length} fichiers PNG générés`);

  // Vérifier qu'on a toutes les tailles requises
  const missingSizes = sizes.filter(size => !files.includes(`icon-${size}x${size}.png`));

  if (missingSizes.length > 0) {
    console.warn(`\n⚠️ Tailles manquantes: ${missingSizes.join(', ')}`);
  } else {
    console.log('\n✅ Toutes les icônes requises ont été générées avec succès!');
  }

  // Calculer la taille totale
  let totalSize = 0;
  files.forEach(file => {
    const stats = fs.statSync(path.join(outputDir, file));
    totalSize += stats.size;
  });
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`📦 Taille totale: ${totalSizeMB} MB`);

  console.log('\n🎯 Prochaines étapes:');
  console.log('1. Vérifiez les icônes générées dans le dossier icons/');
  console.log('2. Testez l\'installation de la PWA');
  console.log('3. Déployez sur un serveur HTTPS');
  console.log('\n📖 Guide complet: PWA_INSTALLATION_GUIDE.md');
}

// Exécuter
generateAll().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
