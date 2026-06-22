const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= DATABASE ================= */
mongoose.connect("mongodb+srv://fftournamentadmin:fftournament2026@fftournament.kobz3uo.mongodb.net/?appName=FFTOURNAMENT")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Error:", err));

/* ================= USER ================= */
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    coins: { type: Number, default: 0 },
    role: { type: String, default: "user" }
});

const User = mongoose.model("User", UserSchema);

/* ================= TOURNAMENT ================= */
const TournamentSchema = new mongoose.Schema({
    title: String,
    entryFee: Number,
    prize: Number,
    date: String,
    createdAt: { type: Date, default: Date.now }
});

const Tournament = mongoose.model("Tournament", TournamentSchema);

/* ================= HOME ================= */
app.get("/", (req, res) => {
    res.send("FF TOURNAMENT API RUNNING");
});

/* ================= SIGNUP ================= */
app.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const exist = await User.findOne({ email });
        if (exist) return res.json({ message: "User already exists" });

        const user = new User({ username, email, password });
        await user.save();

        res.json({ message: "Signup successful" });

    } catch (err) {
        res.status(500).json({ message: "Signup error" });
    }
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, password });
        if (!user) return res.json({ message: "Invalid credentials" });

        res.json({ message: "Login successful", user });

    } catch (err) {
        res.status(500).json({ message: "Login error" });
    }
});

/* ================= ADMIN ADD COINS ================= */
app.post("/admin/add-coins", async (req, res) => {
    try {
        const { email, coins } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.json({ message: "User not found" });

        user.coins += coins;
        await user.save();

        res.json({ message: "Coins added", user });

    } catch (err) {
        res.status(500).json({ message: "Coin error" });
    }
});

/* ================= CREATE TOURNAMENT (ADMIN) ================= */
app.post("/admin/create-tournament", async (req, res) => {
    try {
        const { title, entryFee, prize, date } = req.body;

        const t = new Tournament({
            title,
            entryFee,
            prize,
            date
        });

        await t.save();

        res.json({ message: "Tournament created", t });

    } catch (err) {
        res.status(500).json({ message: "Tournament error" });
    }
});

/* ================= GET TOURNAMENTS ================= */
app.get("/tournaments", async (req, res) => {
    const data = await Tournament.find();
    res.json(data);
});

/* ================= GET USERS (ADMIN TEST) ================= */
app.get("/users", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running on", PORT);
});
