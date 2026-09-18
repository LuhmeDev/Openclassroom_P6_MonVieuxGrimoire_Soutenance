// Modèle représentant un utilisateur dans la base de données MongoDB.

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const validate = require('mongoose-validator');

// mongoose-validator permet d'écrire des règles de validation lisibles,
// vérifiées automatiquement par Mongoose avant chaque enregistrement.
// Si une règle n'est pas respectée, la sauvegarde échoue et le message
// ci-dessous est renvoyé au client.
const reglesDeLEmail = [
  validate({
    validator: 'isEmail',
    message: 'Adresse email invalide',
  }),
];

const schemaDunUtilisateur = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // sert d'identifiant de connexion
    lowercase: true, // "Jean@Mail.com" et "jean@mail.com" sont le même compte
    trim: true, // supprime les espaces avant/après saisis par erreur
    validate: reglesDeLEmail,
  },
  password: { type: String, required: true }, // mot de passe haché, jamais stocké en clair
});

schemaDunUtilisateur.plugin(uniqueValidator, {
  message: 'Cette adresse email est déjà utilisée',
});

module.exports = mongoose.model('User', schemaDunUtilisateur);
