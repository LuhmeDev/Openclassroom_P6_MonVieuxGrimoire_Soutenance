// Ce middleware protège les routes réservées aux utilisateurs connectés.
// On l'ajoute devant une route pour exiger un token valide avant d'exécuter le contrôleur.

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Le front envoie l'en-tête HTTP : "Authorization: Bearer leTokenIci"
    // On récupère cette valeur, on la coupe au niveau de l'espace,
    // et on garde uniquement la deuxième partie : le token lui-même.
    const enteteAutorisation = req.headers.authorization;
    const morceauxDeLentete = enteteAutorisation.split(' ');
    const token = morceauxDeLentete[1];

    // jwt.verify vérifie que le token a bien été signé avec notre clé
    // secrète et qu'il n'a pas expiré. Si le token est faux, modifié ou
    // expiré, une erreur est levée et on tombe directement dans le catch.
    const cleSecrete = process.env.JWT_SECRET;
    const contenuDuTokenDecode = jwt.verify(token, cleSecrete);

    // On récupère l'identifiant de l'utilisateur contenu dans le token,
    // et on le range dans req.auth pour que les contrôleurs suivants
    // puissent le lire avec req.auth.userId.
    // C'est cet identifiant qui fait foi, jamais celui du corps de la requête.
    const idDeLutilisateurConnecte = contenuDuTokenDecode.userId;
    req.auth = { userId: idDeLutilisateurConnecte };

    // next() passe la main à la suite : le middleware suivant, ou le contrôleur.
    next();
  } catch (erreur) {
    res.status(401).json({ error: erreur });
  }
};
