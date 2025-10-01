import mongoose from 'mongoose'

export const connectDB = async () => {
    try{
        await mongoose.connect(
            process.env.MONGODB_CONNECTIONSTRING
        );
        console.log("Access database success");
    } catch(error){
        console.error("Failed to access database");
        process.exit(1);    
    }
}