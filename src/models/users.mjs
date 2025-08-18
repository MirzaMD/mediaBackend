import { Schema, model } from "mongoose";
const schema = new Schema({
    username:{type:String, required:true, unique:true},
    discordId:{type:String, sparse:true},
    githubId:{type:String, sparse:true },
    password:{type:String, sparse:true},
    email:{ type:String, sparse:true},
    profile:{type:String, sparse:true},
    authType:{type:String, required:true}
},
{timestamps:true, collection:"users"})
const users = model("users",schema);
export default users;