import { Schema, model } from "mongoose";
const schema = new Schema({
    senderId:{type:String, required:true},
    receiverId:{type:String, required: true},
    text:{type:String},
    roomName:{type:String, required: true}
},
{ timestamps: true, collection:"chats"}
)
const Chat = model("Chat",schema);
export default Chat;