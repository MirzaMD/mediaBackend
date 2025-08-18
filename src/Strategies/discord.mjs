import passport from "passport";
import { Strategy } from "passport-discord";
import users from "../models/users.mjs";
import dotenv from "dotenv";
dotenv.config();
passport.serializeUser((user,done)=>{
    done(null,user._id)
})

passport.deserializeUser(async (id,done)=>{
    try{
      const user = await users.findById(id);
      if(!user) done(null, false, { message :" user not found."})
        done(null,user);
    }
    catch(err){
        done(err,null);
    }
})

export default passport.use(new Strategy({
    clientID:process.env.DISCORD_ID,
    clientSecret:process.env.DISCORD_SECRET,
    scope:["identify","guilds"],
    callbackURL:"http://localhost:3005/auth/discord/callback",
}, async (accessToken, refreshToken, profile, done)=>{
    try{
        let user = await users.findOne({discordId:profile.id});
        if(!user){
            user= await users.create({
                discordId:profile.id,
                username:profile.username,
                profile:"https://res.cloudinary.com/dxfjsytkf/image/upload/v1742261228/samples/coffee.jpg",
                authType:"discord"
            });
            const saved = await user.save();
            return done(null,saved);
        }
        return done(null,user);
    }
     catch(err){
          return done(err,null);  
        } 
}))