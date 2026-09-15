// Ce middleware compresse l'image reçue par Multer et l'enregistre
// dans le dossier images/. Il s'exécute juste après multerMiddleware.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const cheminDuDossierImages = path.join(__dirname, '..', 'images');

// On crée le dossier images/ s'il n'existe pas encore, sinon Sharp
// ne saurait pas où écrire le fichier compressé.
if (!fs.existsSync(cheminDuDossierImages)) {
  fs.mkdirSync(cheminDuDossierImages);
}

module.exports = (req, res, next) => {
  // Pas de fichier envoyé : on passe directement à la suite sans rien faire.
  // Ce cas arrive lors de la modification d'un livre sans nouvelle image.
  if (!req.file) {
    next();
    return;
  }

  // On construit un nom de fichier unique pour ne jamais écraser une image existante.
  const nomOriginalSansExtension = path.parse(req.file.originalname).name;
  const nomSansEspaces = nomOriginalSansExtension.replaceAll(' ', '_');
  const horodatage = Date.now(); // garantit l'unicité même avec deux fichiers du même nom
  const nomDuFichierFinal = `${nomSansEspaces}_${horodatage}.webp`;
  const cheminDeDestination = path.join(cheminDuDossierImages, nomDuFichierFinal);

  const largeurEnPixels = 463;
  const hauteurEnPixels = 595; // dimensions d'affichage sur la fiche livre du front

  sharp(req.file.buffer)
    .resize(largeurEnPixels, hauteurEnPixels, { fit: 'cover' })
    .webp({ quality: 80 }) // le format webp est bien plus léger que le jpeg
    .toFile(cheminDeDestination)
    .then(() => {
      // On range le nom du fichier dans req.file pour que le contrôleur
      // puisse ensuite construire l'URL complète de l'image.
      req.file.filename = nomDuFichierFinal;
      next();
    })
    .catch((erreur) => {
      res.status(500).json({ error: erreur });
    });
};