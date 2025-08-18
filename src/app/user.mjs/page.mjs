import { Router } from "express";
import { matchedData, body, validationResult } from "express-validator";
import users from "../../models/users.mjs";
import { encoding } from "../../encrypting/hashing.mjs";
import { v2 } from "cloudinary";
import { MailSender } from "../../mailer/sendMail.mjs";
import dotenv from "dotenv";

dotenv.config();

const userObj = Router();

v2.config({
    cloud_name:process.env.CLOUDINARY_FOLDER_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
})

userObj.post("/api/signup",[
    body("username").notEmpty().withMessage("username cannot be empty"),
    body("password").isStrongPassword(),
    body("email").isEmail(),
    body("profile").isString().custom((val)=>val.trim()!=="").withMessage("enter a profile picture")
],async (req, res)=>{
    const results = validationResult(req);
    if(!results.isEmpty())
        return res.status(400).json(results.array().map((err)=>err.msg));
     const data = matchedData(req);
     data.password = encoding(data.password);
     try{
        const uploaded = await v2.uploader.upload(data.profile);
        const newUser = new users({
            username:data.username,
            password:data.password,
            email:data.email,
            profile:uploaded.secure_url,
            authType:"local"
        })
        await MailSender(data.email,data.username);
        await newUser.save();
        return res.status(201).json({message:"user added."})
     }
     catch(err){
         return res.status(400).json(err);
     }
})

userObj.get("/api/allUsers",async (_, res)=>{
    try{
        const USERS = await users.find({});
        return res.status(200).json(USERS);
    }
    catch(err){
        return res.status(400).json(err);
    }
})

userObj.patch("/api/user/:id",[
    body("username").optional().notEmpty().withMessage("username cannot be empty"),
    body("email").optional().isEmail(),
    body("profile").optional().isString().custom((val)=>val.trim()!=="").withMessage("enter a profile picture"),
], async (req, res )=>{
  const { id } = req.params
  const results = validationResult(req);
  if(!results.isEmpty())
    return res.status(400).json(results.array().map((err)=>err.msg))
  console.log(req.body)
  const data = matchedData(req);
  console.log(data)
  try{
    const user = await users.findById(id);
    if(!user) return res.status(404).json({message:"user not found"});

    if(data.profile){
        const uploaded = await v2.uploader.upload(data.profile);
        user.set({
            username:data.username,
            email:data.email,
            profile:uploaded.secure_url
        })
        const saved = await user.save();
        return res.status(200).json(saved);
    }
    else{
        user.set({
            username:data.username,
            email:data.email
        })
        const saved = await user.save();
        return res.status(200).json(saved);
    }
  }
  catch(err){
    return res.status(400).json(err);
  }
})
userObj.get("/api/user/:id", async(req, res)=>{
    const { id } = req.params
    try{
        const user = await users.findById(id);
        if(!user) return res.status(404).json({message:"user not found"})
         return res.status(200).json(user)   
    }
    catch(err){
        return res.status(400).json(err)
    }
})
export default userObj;