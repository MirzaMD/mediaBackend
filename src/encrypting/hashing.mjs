import bcrypt from "bcrypt";

export const encoding = (password)=>{
    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(password,salt);
    return hashed;
}

export const decoding = (plain,hashed)=>{
    const decoded = bcrypt.compareSync(plain,hashed);
    return decoded;
}