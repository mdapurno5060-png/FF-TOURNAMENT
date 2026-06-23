const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "FF_SECRET_2026_KEY";

/* ================= DB ================= */
mongoose.connect(
"mongodb+srv://fftournamentadmin:fftournament2026@fftournament.kobz3uo.mongodb.net/fftournament?retryWrites=true&w=majority"
).then(()=>{
console.log("DB Connected");
console.log("DATABASE: fftournament");
});

/* ================= USER ================= */
const UserSchema = new mongoose.Schema({
username: String,
email: {type:String, unique:true},
password: String,
coins: {type:Number, default:0},
role: {type:String, default:"player"}
});

const User = mongoose.model("User",UserSchema);

/* ================= TOURNAMENT ================= */
const TournamentSchema = new mongoose.Schema({
title:String,
entryFee:Number,
prize:Number,
date:String
});

const Tournament = mongoose.model("Tournament",TournamentSchema);

/* ================= AUTH ================= */
function auth(req,res,next){
const token = req.headers.authorization;

if(!token){
return res.json({message:"No token"});
}

try{
const data = jwt.verify(token,SECRET);
req.user = data;
next();
}catch{
return res.json({message:"Invalid token"});
}
}

/* ================= ADMIN ================= */
function adminOnly(req,res,next){
if(req.user.role !== "admin"){
return res.json({message:"Forbidden"});
}
next();
}

/* ================= SIGNUP ================= */
app.post("/signup", async (req,res)=>{
try{

const {username,email,password} = req.body;

const exist = await User.findOne({email});
if(exist){
return res.json({message:"User already exists"});
}

const hash = await bcrypt.hash(password,10);

const user = new User({
username,
email,
password:hash
});

await user.save();

res.json({message:"Signup successful"});

}catch(err){
res.json({message:"Server error"});
}

});

/* ================= LOGIN ================= */
function login() {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  fetch("https://ff-tournament-vpee.onrender.com/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {

    if (!data.token) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "dashboard.html";
  })
  .catch(() => {
    alert("Server error");
  });

}
/* ================= TOURNAMENTS ================= */
app.get("/tournaments", auth, async (req,res)=>{
const data = await Tournament.find();
res.json(data);
});

/* ================= USERS ================= */
app.get("/users", async (req,res)=>{
const users = await User.find();
res.json(users);
});

/* ================= COINS UPDATE ================= */
app.post("/update-coins", auth, async (req,res)=>{
let {email,coins} = req.body;

coins = Number(coins);
if(isNaN(coins)){
return res.json({message:"Deposit coins"});
}

const user = await User.findOne({email});
if(!user){
return res.json({message:"User not found"});
}

user.coins += coins;
if(user.coins < 0) user.coins = 0;

await user.save();

res.json({
message:"Coins updated",
coins:user.coins
});
});

/* ================= ADMIN ADD COINS ================= */
app.post("/admin/add-coins", auth, adminOnly, async (req,res)=>{
let {email,coins} = req.body;

coins = Number(coins);

const user = await User.findOne({email});
if(!user){
return res.json({message:"User not found"});
}

user.coins += coins;
await user.save();

res.json({message:"Coins added"});
});

/* ================= ADMIN CREATE TOURNAMENT ================= */
app.post("/admin/create-tournament", auth, adminOnly, async (req,res)=>{
const t = new Tournament({
title:req.body.title,
entryFee:Number(req.body.entryFee),
prize:Number(req.body.prize),
date:req.body.date
});

await t.save();

res.json({message:"Tournament created"});
});

/* ================= SERVER ================= */
app.listen(5000, ()=>{
console.log("Server running on 5000");
});
