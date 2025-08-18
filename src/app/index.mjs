import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import userObj from "./user.mjs/page.mjs";
import passport from "passport";
import "../Strategies/local.mjs";
import"../Strategies/discord.mjs";
import "../Strategies/github.mjs";
import localLogin from "./logins/locallogin.mjs";
import contObj from "./Content/page.mjs";
import { Server } from "socket.io";
import http from "http";
import Chat from "../models/message.mjs";
import dotenv from "dotenv";
dotenv.config();
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("connected to database"))
.catch((err)=>console.error(err));
const app = express();
app.use(express.json({limit:"100mb"}));
app.use(express.urlencoded({extended:true, limit:"100mb"}));
app.use(session({
    secret:"Some_secret",
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:24*60*60*1000,
        sameSite:"lax", // only while building
        secure:false, // only while building
        httpOnly:true // only while building
    },
    store:MongoStore.create({
        client:mongoose.connection.getClient(),
    })
}))
app.set("trust proxy", true);
app.use(cors({
    origin:["https://real-media.vercel.app","http://localhost:3000","http://localhost:3001","http://localhost:3002"],
    methods:["GET","POST","PATCH","DELETE","PUT","OPTIONS"],
    credentials:true
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(userObj);
app.use(localLogin);
app.use(contObj);
const httpServer = http.createServer(app)
const io = new Server(httpServer,{
    cors:{
    origin:["https://real-media.vercel.app","http://localhost:3000","http://localhost:3001","http://localhost:3002"],
    methods:["GET","POST","PATCH","DELETE","PUT","OPTIONS"],
    credentials:true
    }
})
io.on("connection",(socket)=>{
   console.log(`Connected to ${socket.id}`)
   
   socket.on("join-room",(room)=>{
    socket.join(room)
   })

   socket.on("message-sent",async ({sender, receiver, msg, room})=>{
       try{
         const newMessage = await Chat.create({
  senderId: sender,
  receiverId: receiver,
  text: msg,
  roomName: room
});

io.to(room).emit("receive-message", {
  sender,
  receiver,
  msg,
  room,
  createdAt: newMessage.createdAt,
});
       }
       catch(err){
        console.log(err);
       }
   })
   socket.on("disconnect",()=>{
    console.log(`${socket.id} was disconnected`)
   })
})
app.get("/api/chats/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const messages = await Chat.find({ roomName: id }).sort({ createdAt: 1 });
    if (!messages) return res.status(404).json({ message: "document not found" });
    return res.status(200).json(messages);
  } catch (err) {
    return res.status(400).json(err);
  }
});
app.get("/api/notifications/:id", async (req, res )=>{
  const { id } = req.params
  try{
    const msgs = await Chat.find({receiverId:id});
    if(!msgs) return res.status(404).json({message:"no chats found."})
    return res.status(200).json(msgs);  
  }catch(err){
    return res.status(400).json(err);
  }
})
httpServer.listen(3005,()=>{
    console.log(`server active on "https://real-media.vercel.app"`);
})