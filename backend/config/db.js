import mongoose from "mongoose";

const connectDB= async()=>{
    try{
        mongoose.connection.on('connected',()=>console.log('database COnnected'))
        await mongoose.connect(`${process.env.MONGODB_URL}/thankhamanigpt`)

    }catch(error){
        console.log(error.message);
        
    }
}

export default connectDB