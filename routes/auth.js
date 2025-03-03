const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

// 🔹 Rejestracja użytkownika
router.post("/register", [
    body("name").notEmpty().withMessage("Imię jest wymagane"),
    body("email").isEmail().withMessage("Podaj poprawny email"),
    body("password").isLength({ min: 6 }).withMessage("Hasło musi mieć min. 6 znaków")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { name, email, password } = req.body;

        // Sprawdzenie, czy email już istnieje
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "Użytkownik już istnieje" });

        // Szyfrowanie hasła
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tworzenie nowego użytkownika
        user = new User({ name, email, password: hashedPassword });
        await user.save();

        // Generowanie tokena JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, user: { id: user._id, name, email } });

    } catch (err) {
        res.status(500).json({ msg: "Błąd serwera" });
    }
});

// 🔹 Logowanie użytkownika
router.post("/login", [
    body("email").isEmail().withMessage("Podaj poprawny email"),
    body("password").exists().withMessage("Podaj hasło")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email, password } = req.body;

        // Sprawdzenie, czy użytkownik istnieje
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Niepoprawne dane logowania" });

        // Sprawdzenie hasła
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Niepoprawne dane logowania" });

        // Generowanie tokena JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });

    } catch (err) {
        res.status(500).json({ msg: "Błąd serwera" });
    }
});

// 🔹 Pobieranie danych zalogowanego użytkownika
router.get("/me", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.status(401).json({ msg: "Brak tokena, autoryzacja odmówiona" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        res.json(user);
    } catch (err) {
        res.status(401).json({ msg: "Nieprawidłowy token" });
    }
});

module.exports = router;
