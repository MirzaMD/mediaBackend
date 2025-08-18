import { Schema, model } from "mongoose";
const schema = new Schema({
    uploaderId:{type:String, required:true},
    uploaderName:{type:String, required:true},
    uploaderProfile:{type:String, sparse:true},
    pic:{type:String, required:true},
    blog:{type:String}
},{ timestamps:true, collection:"content"});
const Content = model("content",schema);
export default Content;