import passport from "passport";
import { decoding } from "../encrypting/hashing.mjs";
import users from "../models/users.mjs";
import { Strategy } from "passport-local";

passport.serializeUser((user,done)=>{
    done(null, user._id);
})

passport.deserializeUser(async (id,done)=>{
    try{
        const user = await users.findById(id);
        if(!user) done(null,false,{message:"user not found."})
         done(null,user);   
    }catch(err){
        done(err,null);
    }
})

export default passport.use(new Strategy(
    {
        usernameField:"username",
        passwordField:"password"
    }, async (username,password,done) =>{
        try{
            const user = await users.findOne({username:username});
            if(!user) return done(null, false, {message:"user not found"})
            if(!decoding(password, user.password))
                return done(null, false, {message:"Invalid password."})
            return done(null, user);
        }
        catch(err){
            done(err,null);
        }
    }))