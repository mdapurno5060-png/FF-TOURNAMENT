const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
app.use(cors());
app.use(express.json());
// DATABASE
mongoose.connect("mongodb+srv://fftournamentadmin:fftournament2026@fftournament.kobz3uo.mongodb.net/?appName=FFTOURNAMENT")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));
// USER MODEL
const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String,
  coins: { type: Number, default: 0 }
});
// HOME
app.get("/", (req,res)=>{
  res.send("🔥 FF TOURNAMENT SERVER RUNNING");
});
// SIGNUP
app.post("/signup", async (req,res)=>{
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hash });
  await user.save();
  res.json({ success:true, message:"Signup Success" });
});
// LOGIN
app.post("/login", async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.json({ success:false, message:"User not found" });
  const match = await bcrypt.compare(password, user.password);
  if(!match) return res.json({ success:false, message:"Wrong password" });
  const token = jwt.sign({ id:user._id }, "SECRET_KEY");
  res.json({
    success:true,
    token,
    user:{ name:user.name, email:user.email }
  });
});
// START SERVER
app.listen(5000, ()=>{
  console.log("Server running on 5000");
});
