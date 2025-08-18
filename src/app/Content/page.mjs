import { Router } from "express";
import Content from "../../models/content.mjs";
import { body, matchedData, validationResult } from "express-validator";
import { v2 } from "cloudinary";
const contObj = Router();

v2.config({
    cloud_name:process.env.CLOUDINARY_FOLDER_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
})

contObj.post("/api/content/upload",[
    body("uploaderId").notEmpty().withMessage("uploaderId cannot be empty"),
    body("uploaderName").optional().notEmpty().withMessage("uploader name cannot be empty"),
    body("uploaderProfile").optional(),
    body("pic").isString().notEmpty().withMessage("pic cannot be empty."),
    body("blog").optional()
], async (req, res)=>{
   const results = validationResult(req);

   if(!results.isEmpty())
    return res.status(400).json(results.array().map(err=>err.msg))
  
   const data = matchedData(req);
   try{
    const uploaded = await v2.uploader.upload(data.pic);
    const newUser = new Content({
        uploaderName:data.uploaderName,
        uploaderId:data.uploaderId,
        uploaderProfile:data.uploaderProfile,
        pic:uploaded.secure_url,
        blog:data.blog || ""
    })
    const saved = await newUser.save();
    return res.status(201).json(saved)
   }
   catch(err){
    return res.status(400).json(err);
   }
})

contObj.delete("/api/content/delete/:id", async (req, res)=>{
    const { id } = req.params;
    try{
        const item = await Content.findById(id);
        if(!item)
            return res.status(404).json({message:"Content not found."})
        const deleted = await Content.findByIdAndDelete(id);
        return res.status(200).json(deleted);
    }
    catch(err){
        return res.status(400).json(err);
    }
})

contObj.get("/api/content", async (_,res)=>{
    try{
        const contents = await Content.find({});
        return res.status(200).json(contents);
    }
    catch(err){
        return res.status(400).json(err);
    }
})

contObj.patch("/api/content/edit/:id",[
    body("blog").isString()
], async (req, res)=>{
  const { id  } = req.params;
  const results = validationResult(req);
  if(!results.isEmpty())
    return res.status(400).json(results.array().map((err)=>err.msg))
  const data = matchedData(req);
  try{
    const item = await Content.findById(id);
    if(!item)
        return res.sendStatus(404);
    item.set(data);
    const saved = await item.save();
    return res.status(200).json(saved);
  }
  catch(err){
    return res.status(400).json(err);
  }
})

contObj.get("/api/content/currentUser/:id", async ( req, res )=>{
    const { id } = req.params;
    try{
        const userItems = await Content.find({uploaderId:id});
        return res.status(200).json(userItems);
    }
    catch(err){
        return res.status(500).json(err);
    }
})

contObj.get("/api/content/:id",async (req,res)=>{
    const { id } = req.params;
    try{
        const details = await Content.findById(id);
        if(!details) return res.status(404).json({message:"details not found"})
        return res.status(200).json(details)    
    }
    catch(err){
        return res.status(400).json(err)
    }
})
export default contObj;