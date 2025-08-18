import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter= nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.MY_MAIL,
        pass:process.env.MY_MAIL_PASSWORD
    }
});

export const MailSender=async (recepient, name)=>{
    const details={
        from:process.env.MY_MAIL,
        to:recepient,
        subject:"Greetings from media",
        text:`Hello ${name}, thank you for signing up.`
    }
    try{
        await transporter.sendMail(details);
    }
    catch(err){
        console.log(err);
    }
}