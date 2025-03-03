const cron = require("node-cron");
const Plant = require("./models/Plant");
const User = require("./models/User");
const { sendWateringReminder } = require("./utils/emailSender");
const mongoose = require("mongoose");
require("dotenv").config();

// Połącz się z bazą MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log(" Połączono z MongoDB"))
.catch(err => console.error("Błąd połączenia z MongoDB:", err));

// 🔹 Harmonogram – sprawdzanie co 24h (o 08:00)
cron.schedule("0 8 * * *", async () => {
    console.log("🔍 Sprawdzam rośliny do podlania...");

    const today = new Date();
    const plants = await Plant.find();

    for (const plant of plants) {
        const lastWatered = new Date(plant.lastWatered);
        const nextWateringDate = new Date(lastWatered);
        nextWateringDate.setDate(lastWatered.getDate() + plant.wateringFrequency);

        if (nextWateringDate <= today) {
            const user = await User.findById(plant.userId);
            if (user) {
                await sendWateringReminder(user.email, plant.name, nextWateringDate.toISOString().split("T")[0]);
                plant.lastWatered = today; 
                await plant.save();
            }
        }
    }
    console.log(" Powiadomienia o podlewaniu wysłane!");
});
