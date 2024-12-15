import jwt from 'jsonwebtoken'

export const generateTokens = (userId,res)=>{
   
    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn: '7d'
    })
    
    res.cookie("jwt",token,{
       maxAge:7*24*60*60*1000 ,//ms 
       httpOnly:true, //prevent xss attacks cross-site scripting attcaks
       sameSite:"strict", //CSRF attacks cross-site request forgrey attacks
       secure:process.env.NODE_ENV !== "development" //only works on https
    })
   return token;
}