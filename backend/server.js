const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = express();
app.use(cors());
app.use(express.json());
// ================= MONGODB CONNECTION =================
mongoose.connect("mongodb+srv://fftournamentadmin:fftournament2026@fftournament.kobz3uo.mongodb.net/?appName=FFTOURNAMENT")
.then(()=>{
    console.log("MongoDB Connected");
})
.catch((err)=>{
    console.log("MongoDB Error:", err);
});
// ================= USER MODEL =================
const User = mongoose.model("User", {
    name:String,
    email:String,
    password:String,
    coins:{
        type:Number,
        default:0
    }
});
// ================= WALLET TRANSACTION MODEL (ADD ONLY) =================

const Transaction = mongoose.model("Transaction", {
    userEmail: String,
    type: String,        // deposit / withdraw
    coins: Number,
    status: {
        type: String,
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// ================= TOURNAMENT MODEL =================
const Tournament = mongoose.model("Tournament",{
    name:String,
    entry:Number,
    createdAt:{
        type:Date,
        default:Date.now
    }
});
// ================= HOME =================
app.get("/",(req,res)=>{
    res.send("FF TOURNAMENT SERVER RUNNING");
});
// ================= SIGNUP =================
app.post("/signup", async(req,res)=>{
    try{
        const existingUser = await User.findOne({
            email:req.body.email
        });
        if(existingUser){
            return res.json({
                success:false,
                message:"Email already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(
            req.body.password,
            10
        );
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            password:hashedPassword
        });
        await user.save();
        res.json({
            success:true,
            message:"Signup Success"
        });
    }catch(error){
        res.json({
            success:false,
            message:"Signup Error"
        });
    }
});
// ================= LOGIN =================
app.post("/login", async(req,res)=>{
    try{
        const user = await User.findOne({
            email:req.body.email
        });
        if(!user){
            return res.json({
                success:false,
                message:"User not found"
            });
        }
        const match = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if(!match){
            return res.json({
                success:false,
                message:"Wrong password"
            });
        }
        res.json({
            success:true,
            user:{
                name:user.name,
                email:user.email,
                coins:user.coins
            }
        });
    }catch(error){
        res.json({
            success:false,
            message:"Login Error"
        });
    }
});
// ================= TOURNAMENT CREATE =================
app.post("/tournament/create",async(req,res)=>{
    const tournament = new Tournament({
        name:req.body.name,
        entry:req.body.entry
    });
    await tournament.save();
    res.json({
        success:true,
        message:"Tournament Created"
    });
});
// ================= TOURNAMENT LIST =================
app.get("/tournaments",async(req,res)=>{
    const data = await Tournament.find()
    .sort({createdAt:-1});
    res.json(data);
});
// ================= WALLET SYSTEM API (ADD ONLY) =================


// CHECK BALANCE
app.get("/wallet/:email", async(req,res)=>{

    const user = await User.findOne({
        email:req.params.email
    });

    if(!user){
        return res.json({
            success:false,
            message:"User not found"
        });
    }

    res.json({
        success:true,
        coins:user.coins
    });

});


// DEPOSIT COIN REQUEST

app.post("/wallet/deposit", async(req,res)=>{

    const transaction = new Transaction({
        userEmail:req.body.email,
        type:"deposit",
        coins:req.body.coins
    });

    await transaction.save();


    res.json({
        success:true,
        message:"Deposit request sent"
    });

});


// WITHDRAW COIN REQUEST

app.post("/wallet/withdraw", async(req,res)=>{

    const transaction = new Transaction({
        userEmail:req.body.email,
        type:"withdraw",
        coins:req.body.coins
    });

    await transaction.save();


    res.json({
        success:true,
        message:"Withdraw request sent"
    });

});
// ================= SERVER =================
app.listen(5000,()=>{
    console.log("SERVER RUNNING ON 5000");
});
