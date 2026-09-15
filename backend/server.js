// Ce fichier lance le serveur.
// Le port 4000 est imposé par le front-end (voir src/utils/constants.js).

const app = require('./app');

const port = 4000;

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
