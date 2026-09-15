const mongoose = require('mongoose');

const schemaDunLivre = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      _id: false, // on n'a pas besoin d'un identifiant propre à chaque note
      userId: { type: String, required: true }, // qui a donné cette note
      grade: { type: Number, required: true }, // la note donnée, de 1 à 5
    },
  ],

  averageRating: { type: Number, default: 0 }, // moyenne des notes, recalculée à chaque nouvelle note
});

module.exports = mongoose.model('Book', schemaDunLivre);
