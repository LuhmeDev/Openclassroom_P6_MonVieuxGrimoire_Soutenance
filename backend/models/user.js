// Modèle représentant un utilisateur dans la base de données MongoDB.

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const schemaDunUtilisateur = mongoose.Schema({
  email: { type: String, required: true, unique: true }, // sert d'identifiant de connexion
  password: { type: String, required: true }, // mot de passe haché, jamais stocké en clair
});

schemaDunUtilisateur.plugin(uniqueValidator);

module.exports = mongoose.model('User', schemaDunUtilisateur);
