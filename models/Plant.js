const mongoose = require('mongoose');

const PlantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String }, // URL do zdjęcia rośliny
  wateringFrequency: { type: String, required: true }, // np. "Raz na tydzień"
  sunlight: { type: String, required: true } // np. "W cieniu"
}, { timestamps: true });

module.exports = mongoose.model('Plant', PlantSchema);
