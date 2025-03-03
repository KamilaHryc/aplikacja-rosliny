require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Importowanie tras
app.use("/api/auth", require("./routes/auth"));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Połączono z MongoDB"))
.catch(err => console.error("❌ Błąd połączenia z MongoDB:", err));

app.listen(PORT, () => console.log(`🔥 Serwer działa na porcie ${PORT}`));
