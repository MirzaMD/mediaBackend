import { Router } from "express";
import passport from "passport";
import "../../Strategies/local.mjs";
import "../../Strategies/discord.mjs";
import "../../Strategies/github.mjs";
import users from "../../models/users.mjs";
import Content from "../../models/content.mjs";
const localLogin = Router();


localLogin.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // info.message is coming from Strategy — either "user not found" or "Invalid password."
      return res.status(401).json({ message: info.message });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({ message: "login successful." });
    });
  })(req, res, next);
});


localLogin.get("/api/login/discord",passport.authenticate("discord"));

localLogin.get("/auth/discord/callback",passport.authenticate("discord",{
    successRedirect:"https://real-media.vercel.app/users",
    failureRedirect:""
}))

localLogin.get("/api/login/github",passport.authenticate("github"));

localLogin.get("/auth/github/callback",passport.authenticate("github",{
    successRedirect:"https://real-media.vercel.app/users",
    failureRedirect:""
}))

localLogin.post("/api/logout",(req, res, next)=>{
    req.logOut((err)=>{
        if(err) return next(err);
        req.session.destroy((err)=>{
            if(err) return res.sendStatus(400);
            res.clearCookie("connect.sid", { path: "https://real-media.vercel.app/login" } ); // change the path later
            return res.sendStatus(200);
        })
    })
})

localLogin.get("/api/currentUser",(req, res)=>{
    return req.user?res.status(200).json(req.user):res.status(400).json({message:"no user logged in."});
})

localLogin.delete("/api/deactivate",async (req,res)=>{
    if(req.user){
     try{
        const id = req.user._id;
        const cont = await Content.find({uploaderId:req.user._id});
        await Content.findByIdAndDelete(cont)
        await users.findByIdAndDelete(id);
        return res.sendStatus(200);
     }
     catch(err){
        return res.status(400).json(err);
     }
    }
    else{
        return res.status(401).json({message:"Account not found."})
    }
})
export default localLogin;