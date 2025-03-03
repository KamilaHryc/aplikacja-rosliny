const express = require('express');
const Plant = require('../models/Plant');

const router = express.Router();

// Pobierz listę roślin
router.get('/', async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dodaj nową roślinę
router.post('/', async (req, res) => {
  try { if (!req.body.name) {
    return res.status(400).json({ error: "Nazwa rośliny jest wymagana" });}
    
    const { name, image, wateringFrequency, sunlight } = req.body;
    const newPlant = new Plant({ name, image, wateringFrequency, sunlight });
    await newPlant.save();
    res.status(201).json(newPlant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
