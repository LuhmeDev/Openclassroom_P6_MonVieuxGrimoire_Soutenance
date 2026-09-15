// Ce fichier associe chaque URL d'authentification à la fonction du
// contrôleur qui doit s'exécuter. Le préfixe /api/auth est ajouté une
// fois pour toutes dans app.js.

const express = require('express');
const controleurDesUtilisateurs = require('../controllers/userController');

const router = express.Router();

router.post('/signup', controleurDesUtilisateurs.signup);
router.post('/login', controleurDesUtilisateurs.login);

module.exports = router;
