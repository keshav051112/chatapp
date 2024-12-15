import mongoose from 'mongoose'

export const connectDB = async()=>{
    try{
        await mongoose.connect('mongodb://localhost:27017/chatapps')
        console.log('MongoDB Connected')
    }catch(err){
        console.error(err)
    }
}