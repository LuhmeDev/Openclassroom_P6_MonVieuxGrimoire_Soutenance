// Ce middleware récupère le fichier image envoyé par le front.
// Il ne l'enregistre pas encore sur le disque : c'est le rôle de sharpMiddleware.js.

const multer = require('multer');

// memoryStorage garde le fichier en mémoire vive, dans req.file.buffer,
// au lieu de l'écrire directement sur le disque. On ne veut pas garder
// l'image d'origine : c'est la version compressée par Sharp que l'on
// enregistrera juste après.
const stockageEnMemoire = multer.memoryStorage();

// Liste des formats d'image que l'on accepte.
const formatsDimageAutorises = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];

// Cette fonction est appelée automatiquement par Multer pour chaque
// fichier reçu. Elle décide si on l'accepte ou si on le refuse.
function verifierLeFormatDuFichier(req, file, callback) {
  const leFormatEstAutorise = formatsDimageAutorises.includes(file.mimetype);

  if (leFormatEstAutorise) {
    callback(null, true); // on accepte le fichier
  } else {
    callback(new Error('Format de fichier non supporté : jpg, png ou webp uniquement'));
  }
}

const tailleMaximaleEnOctets = 5 * 1024 * 1024; // 5 Mo

// .single('image') signifie : on attend un seul fichier, envoyé dans
// le champ nommé "image" du formulaire (voir le front, page addBook).
module.exports = multer({
  storage: stockageEnMemoire,
  fileFilter: verifierLeFormatDuFichier,
  limits: { fileSize: tailleMaximaleEnOctets },
}).single('image');
