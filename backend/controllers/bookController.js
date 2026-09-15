// Ce fichier contient toute la logique des routes qui concernent les livres.
// Chaque fonction ci-dessous correspond à une route précise,
// déclarée dans routes/bookRoutes.js.

const fs = require('fs');
const path = require('path');
const Book = require('../models/Book');

// GET /api/books
// Renvoie la liste de tous les livres enregistrés en base de données.
exports.getAllBooks = (req, res) => {
  Book.find()
    .then((tousLesLivres) => {
      res.status(200).json(tousLesLivres);
    })
    .catch((erreur) => {
      res.status(400).json({ error: erreur });
    });
};

// GET /api/books/bestrating
// Renvoie uniquement les 3 livres qui ont la meilleure note moyenne.
// Utilisé par la page d'accueil du front pour la section "les mieux notés".
exports.getBestRatedBooks = (req, res) => {
  Book.find()
    .sort({ averageRating: -1 }) // -1 = tri du plus grand au plus petit
    .limit(3) // on ne garde que les 3 premiers résultats du tri
    .then((lesTroisMeilleursLivres) => {
      res.status(200).json(lesTroisMeilleursLivres);
    })
    .catch((erreur) => {
      res.status(400).json({ error: erreur });
    });
};

// GET /api/books/:id
// Renvoie un seul livre : celui dont l'identifiant est écrit dans l'URL.
exports.getOneBook = (req, res) => {
  const idDuLivreDemande = req.params.id;

  Book.findOne({ _id: idDuLivreDemande })
    .then((livreTrouve) => {
      if (!livreTrouve) {
        res.status(404).json({ message: 'Livre non trouvé' });
        return;
      }
      res.status(200).json(livreTrouve);
    })
    .catch((erreur) => {
      res.status(400).json({ error: erreur });
    });
};

// POST /api/books
// Crée un nouveau livre. Une image de couverture est obligatoire.
exports.createBook = (req, res) => {
  // Si multer/sharp n'ont reçu aucun fichier, on arrête tout de suite.
  if (!req.file) {
    res.status(400).json({ message: 'Une image est requise' });
    return;
  }

  // Le front envoie un formulaire (FormData) car il y a un fichier à joindre.
  // Dans ce cas, les champs texte (titre, auteur, année...) arrivent sous
  // la forme d'une seule chaîne de caractères, dans req.body.book.
  // JSON.parse retransforme cette chaîne en objet JavaScript utilisable.
  const chaineDeCaracteresRecue = req.body.book;
  const objetLivreEnvoyeParLeFront = JSON.parse(chaineDeCaracteresRecue);
  const adresseDuServeur = `${req.protocol}://${req.get('host')}`;
  const urlDeLimage = `${adresseDuServeur}/images/${req.file.filename}`;
  const nouveauLivre = new Book({
    title: objetLivreEnvoyeParLeFront.title,
    author: objetLivreEnvoyeParLeFront.author,
    year: objetLivreEnvoyeParLeFront.year,
    genre: objetLivreEnvoyeParLeFront.genre,
    userId: req.auth.userId,
    imageUrl: urlDeLimage,
    ratings: [],
    averageRating: 0,
  });

  nouveauLivre.save()
    .then(() => {
      res.status(201).json({ message: 'Livre enregistré' });
    })
    .catch((erreur) => {
      // L'enregistrement en base a échoué : l'image que Sharp vient
      // d'écrire sur le disque ne sert plus à rien. On la supprime pour
      // ne pas accumuler des fichiers orphelins dans le dossier images/.
      const nomDuFichierImage = urlDeLimage.split('/images/')[1];
      const cheminDuFichierImage = path.join(__dirname, '..', 'images', nomDuFichierImage);
      fs.unlink(cheminDuFichierImage, () => {});

      res.status(400).json({ error: erreur });
    });
};

// PUT /api/books/:id
// Modifie un livre existant. Envoyer une nouvelle image est facultatif.
exports.modifyBook = (req, res) => {
  const idDuLivreAModifier = req.params.id;

  // Deux cas possibles selon que le front envoie une nouvelle image ou non :
  // - avec une nouvelle image : req.file existe, et les données texte sont
  //   dans req.body.book, sous forme de chaîne de caractères (comme dans
  //   createBook ci-dessus) ;
  // - sans nouvelle image : req.file n'existe pas, et les données texte
  //   sont directement dans req.body, déjà sous forme d'objet.
  let donneesRecues;
  if (req.file) {
    donneesRecues = JSON.parse(req.body.book);
  } else {
    donneesRecues = req.body;
  }

  const champsAMettreAJour = {
    title: donneesRecues.title,
    author: donneesRecues.author,
    year: donneesRecues.year,
    genre: donneesRecues.genre,
  };

  // Si une nouvelle image a été envoyée, on met aussi à jour son adresse.
  if (req.file) {
    const adresseDuServeur = `${req.protocol}://${req.get('host')}`;
    champsAMettreAJour.imageUrl = `${adresseDuServeur}/images/${req.file.filename}`;
  }

  Book.findOne({ _id: idDuLivreAModifier })
    .then((livreExistant) => {
      if (!livreExistant) {
        res.status(404).json({ message: 'Livre non trouvé' });
        return;
      }

      // Seul le propriétaire du livre (celui qui l'a créé) a le droit de
      // le modifier. On compare l'identifiant stocké en base avec celui
      // du token, jamais avec un identifiant qui viendrait de la requête.
      if (livreExistant.userId !== req.auth.userId) {
        res.status(403).json({ message: 'Requête non autorisée' });
        return;
      }

      Book.updateOne({ _id: idDuLivreAModifier }, champsAMettreAJour)
        .then(() => {
          // La modification en base a réussi. Si une nouvelle image a été
          // envoyée, l'ancienne image ne sert plus à rien : on la supprime
          // du disque pour ne pas accumuler des fichiers inutiles.
          if (req.file) {
            const nomDeLancienneImage = livreExistant.imageUrl.split('/images/')[1];
            const cheminDeLancienneImage = path.join(__dirname, '..', 'images', nomDeLancienneImage);
            fs.unlink(cheminDeLancienneImage, () => {});
          }
          res.status(200).json({ message: 'Livre modifié' });
        })
        .catch((erreur) => {
          res.status(400).json({ error: erreur });
        });
    })
    .catch((erreur) => {
      res.status(400).json({ error: erreur });
    });
};

// POST /api/books/:id/rating
// Ajoute la note donnée par un utilisateur à un livre, puis recalcule la moyenne.
exports.rateBook = (req, res) => {
  const idDuLivreANoter = req.params.id;
  const noteEnvoyee = req.body.rating;

  // Le front propose des étoiles allant de 1 à 5 : on vérifie que la
  // note reçue respecte bien cette règle avant d'aller plus loin.
  const laNoteEstValide = Number.isInteger(noteEnvoyee) && noteEnvoyee >= 1 && noteEnvoyee <= 5;
  if (!laNoteEstValide) {
    res.status(400).json({ message: 'La note doit être un entier compris entre 1 et 5' });
    return;
  }

  Book.findOne({ _id: idDuLivreANoter })
    .then((livre) => {
      if (!livre) {
        res.status(404).json({ message: 'Livre non trouvé' });
        return;
      }

      // On vérifie que cet utilisateur n'a pas déjà noté ce livre, en
      // parcourant un par un les notes déjà enregistrées. On compare avec
      // req.auth.userId (extrait du token), jamais avec un userId qui
      // viendrait du corps de la requête : sinon il suffirait de changer
      // cette valeur pour noter plusieurs fois le même livre.
      const notesDejaEnregistrees = livre.ratings;
      let utilisateurADejaNoteCeLivre = false;
      for (let i = 0; i < notesDejaEnregistrees.length; i += 1) {
        const uneNoteExistante = notesDejaEnregistrees[i];
        if (uneNoteExistante.userId === req.auth.userId) {
          utilisateurADejaNoteCeLivre = true;
        }
      }

      if (utilisateurADejaNoteCeLivre) {
        res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
        return;
      }

      // On ajoute la nouvelle note à la liste des notes du livre.
      livre.ratings.push({ userId: req.auth.userId, grade: noteEnvoyee });

      // On recalcule la moyenne à partir de zéro, en additionnant toutes
      // les notes une par une.
      let sommeDeToutesLesNotes = 0;
      for (let i = 0; i < livre.ratings.length; i += 1) {
        sommeDeToutesLesNotes += livre.ratings[i].grade;
      }
      const nombreDeNotes = livre.ratings.length;
      const moyenneExacte = sommeDeToutesLesNotes / nombreDeNotes;

      // On arrondit la moyenne à une seule décimale.
      // Exemple : 3.6666... x 10 = 36.666..., arrondi = 37, /10 = 3.7
      livre.averageRating = Math.round(moyenneExacte * 10) / 10;

      livre.save()
        .then((livreMisAJour) => {
          // Le front a besoin du livre complet en réponse pour rafraîchir
          // l'affichage (nouvelle moyenne, nouvelle liste de notes).
          res.status(200).json(livreMisAJour);
        })
        .catch((erreur) => {
          res.status(400).json({ error: erreur });
        });
    })
    .catch((erreur) => {
      res.status(400).json({ error: erreur });
    });
};

// DELETE /api/books/:id
// Supprime un livre de la base de données, ainsi que son image sur le disque.
exports.deleteBook = (req, res) => {
  const idDuLivreASupprimer = req.params.id;

  Book.findOne({ _id: idDuLivreASupprimer })
    .then((livre) => {
      if (!livre) {
        res.status(404).json({ message: 'Livre non trouvé' });
        return;
      }

      // Seul le propriétaire du livre a le droit de le supprimer.
      if (livre.userId !== req.auth.userId) {
        res.status(403).json({ message: 'Requête non autorisée' });
        return;
      }

      Book.deleteOne({ _id: idDuLivreASupprimer })
        .then(() => {
          const nomDuFichierImage = livre.imageUrl.split('/images/')[1];
          const cheminDuFichierImage = path.join(__dirname, '..', 'images', nomDuFichierImage);
          fs.unlink(cheminDuFichierImage, () => {});

          res.status(200).json({ message: 'Livre supprimé' });
        })
        .catch((erreur) => {
          res.status(400).json({ error: erreur });
        });
    })
    .catch((erreur) => {
      res.status(400).json({ error: erreur });
    });
};