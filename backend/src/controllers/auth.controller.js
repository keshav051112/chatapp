
import cloudinary from "../lib/cloudinary.js";
import { generateTokens } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs'

export const  signup = async(req,res)=>{
    const {fullName,email,password}=req.body;
    try {
    if(!fullName || !email || !password){
        return res.status(400).json({message:"Please fill in all fields"})
    }


        if(password.length<6){
            return res.status(401).json({msg:"Password must be at least 6 characters long" });
        }
        const user = await User.findOne({email})
        if(user) return res.status(402).json({message:"Email already exists"})
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new User({
            fullName,
            email,
            password:hashedPassword
        })

        if(newUser){
              //generate jwt token
            generateTokens(newUser._id,res)
            await newUser.save();
            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic

            })
        }else{
            res.status(403).json({message:"Invalid user data"})
        }
    } catch (error) {
        console.log("Error in signup controller",error.message);
        res.status(500).json({message:"Internal server error"})
    }
}

export const login = async(req,res)=>{
    const {email,password}=req.body;
    try {
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message:"Email does not exist"})
        
         const ispasswordCorrect =  await bcrypt.compare(password,user.password)
         if(!ispasswordCorrect){
            return res.status(400).json({message:"Incorrect password"})
         }
         generateTokens(user._id,res)
         res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            message: "Login successful",
        });
        

        
    } catch (error) {
        console.log("Error in login controller",error.message)
        res.status(500).json({message:"internal server error"})
        
    }
}

export const logout = (req,res)=>{
    try{
      res.cookie("jwt","",{maxAge:0});
      res.status(200).json({message:"logged out successfully"})
    }catch(error){
      console.log("error in logout controller",error.message);
      res.status(500).json({message:"Internal server error"})
    }
}

export const updateProfile = async(req,res)=>{
    try {
       const {profilePic} = req.body;
       const userId = req.user._id

       if(!profilePic){
        return res.status(400).json({message:"Please provide a profile picture"})
       }

    const uploadResponse = await cloudinary.uploader.upload(profilePic)
    const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})

    res.status(200).json(updatedUser)
    } catch (error) {
        console.log("error in update profile",error)
        res.status(500).json({message:"Internal server error"})
    }
}

export const checkAuth =async(req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message)
        res.status(500).json({message:"Internal server error"})
    }
}