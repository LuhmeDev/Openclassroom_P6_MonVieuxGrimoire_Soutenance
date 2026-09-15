// Ce fichier configure l'application Express.
// Il ne lance pas le serveur : c'est le rôle de server.js.

require('dotenv').config(); // charge les variables du fichier .env

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// --- Connexion à la base de données MongoDB (adresse définie dans .env) ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch((error) => console.log('Connexion à MongoDB échouée :', error.message));

// --- Middlewares généraux ---

// Autorise le front-end (http://localhost:3000) à appeler cette API.
// Sans cette ligne, le navigateur bloque les requêtes (erreur CORS).
app.use(cors());

// Permet de lire le JSON envoyé dans le corps des requêtes (req.body).
app.use(express.json());

// Rend le dossier images/ accessible depuis le navigateur.
// Une image enregistrée sous images/couverture_123.webp
// sera lisible sur http://localhost:4000/images/couverture_123.webp
app.use('/images', express.static(path.join(__dirname, 'images')));

// --- Routes ---

// Route de test, juste pour vérifier que le serveur répond.
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API Mon Vieux Grimoire : le serveur fonctionne.' });
});

// Toutes les routes du fichier routes/bookRoutes.js commencent par /api/books
app.use('/api/books', bookRoutes);

// Toutes les routes du fichier routes/userRoutes.js commencent par /api/auth
app.use('/api/auth', userRoutes);

// --- Gestion des erreurs ---

// Ce middleware attrape les erreurs levées avant les contrôleurs,
// principalement celles de Multer : mauvais format de fichier,
// ou fichier dépassant 5 Mo. Sans lui, Express renverrait
// une page HTML d'erreur au lieu d'un JSON lisible par le front.
app.use((error, req, res, next) => {
  res.status(400).json({ message: error.message });
});

module.exports = app;