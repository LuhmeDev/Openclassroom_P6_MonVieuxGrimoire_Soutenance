// Ce fichier contient la logique d'inscription et de connexion des utilisateurs.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/signup
// Crée un nouveau compte utilisateur, avec un mot de passe haché
// (jamais enregistré en clair dans la base de données).
exports.signup = (req, res) => {
  const motDePasseEnClair = req.body.password;
  const nombreDeToursDeHachage = 10;

  // bcrypt.hash chiffre le mot de passe de façon irréversible : même en
  // lisant la base de données, personne ne peut retrouver le mot de passe
  // d'origine. Plus le nombre de tours est élevé, plus le hachage est sûr,
  // mais plus il prend de temps à calculer.
  bcrypt.hash(motDePasseEnClair, nombreDeToursDeHachage)
    .then((motDePasseHache) => {
      const nouvelUtilisateur = new User({
        email: req.body.email,
        password: motDePasseHache,
      });

      nouvelUtilisateur.save()
        .then(() => {
          res.status(201).json({ message: 'Utilisateur créé' });
        })
        .catch((erreur) => {
          res.status(400).json({ error: erreur });
        });
    })
    .catch((erreur) => {
      res.status(500).json({ error: erreur });
    });
};

// POST /api/auth/login
// Vérifie l'email et le mot de passe envoyés, puis renvoie un token si tout est correct.
exports.login = (req, res) => {
  const emailRecu = req.body.email;
  const motDePasseRecu = req.body.password;

  User.findOne({ email: emailRecu })
    .then((utilisateurTrouve) => {
      // Aucun compte n'existe avec cet email.
      if (!utilisateurTrouve) {
        res.status(401).json({ message: 'identifiant/mot de passe incorrecte' });
        return;
      }

      // bcrypt.compare recalcule le hachage du mot de passe reçu et le
      // compare à celui stocké en base. On ne peut jamais "déchiffrer"
      // le mot de passe stocké, seulement vérifier une correspondance.
      bcrypt.compare(motDePasseRecu, utilisateurTrouve.password)
        .then((lesMotsDePasseCorrespondent) => {
          if (!lesMotsDePasseCorrespondent) {
            res.status(401).json({ message: 'identifiant/mot de passe incorrecte' });
            return;
          }

          // Le token est une carte d'identité numérique et temporaire.
          // Il contient l'identifiant de l'utilisateur et est signé avec
          // la clé secrète JWT_SECRET : personne ne peut le fabriquer ou
          // le modifier sans connaître cette clé.
          const contenuDuToken = { userId: utilisateurTrouve._id };
          const cleSecrete = process.env.JWT_SECRET;
          const dureeDeValidite = { expiresIn: '24h' };
          const token = jwt.sign(contenuDuToken, cleSecrete, dureeDeValidite);

          res.status(200).json({
            userId: utilisateurTrouve._id,
            token,
          });
        })
        .catch((erreur) => {
          res.status(500).json({ error: erreur });
        });
    })
    .catch((erreur) => {
      res.status(500).json({ error: erreur });
    });
};
