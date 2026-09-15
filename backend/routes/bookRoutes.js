// Ce fichier associe chaque URL à la fonction du contrôleur qui doit s'exécuter.
// Le préfixe /api/books est ajouté une fois pour toutes dans app.js.

const express = require('express');
const controleurDesLivres = require('../controllers/bookController');
const verifierLeToken = require('../middleware/authMiddleware');
const recupererLimage = require('../middleware/multerMiddleware');
const compresserLimage = require('../middleware/sharpMiddleware');

const router = express.Router();

// --- Routes publiques : consultation, pas besoin d'être connecté ---

router.get('/bestrating', controleurDesLivres.getBestRatedBooks);
router.get('/', controleurDesLivres.getAllBooks);
router.get('/:id', controleurDesLivres.getOneBook);

// --- Routes protégées : il faut être connecté pour les utiliser ---

router.post('/', verifierLeToken, recupererLimage, compresserLimage, controleurDesLivres.createBook);
router.put('/:id', verifierLeToken, recupererLimage, compresserLimage, controleurDesLivres.modifyBook);
router.delete('/:id', verifierLeToken, controleurDesLivres.deleteBook);

// Noter un livre n'implique pas d'image : pas besoin de recupererLimage ni compresserLimage.
router.post('/:id/rating', verifierLeToken, controleurDesLivres.rateBook);

module.exports = router;
