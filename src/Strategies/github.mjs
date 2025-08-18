import passport from "passport";
import { Strategy as GitStrategy } from "passport-github";
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

export default passport.use(new GitStrategy({
    clientID: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: "https://mediabackend-yj45.onrender.com/auth/github/callback"
}, 
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await users.findOne({ githubId: profile.id });

        if (!user) {
            user = await users.create({
                githubId: profile.id,
                username: profile.username,
                profile:"https://res.cloudinary.com/dxfjsytkf/image/upload/v1742261228/samples/coffee.jpg",
                authType:"github"
            });
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));
