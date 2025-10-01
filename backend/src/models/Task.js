import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    status:{
        type: String,
        enum: ["active", "complete"],
        default: "active"
    },
    completedAt: {
        type: Date,
        default: null
    },
    startDate:{
        type: Date,
        default: Date.now,
    },
    endDate:{
        type: Date,
        default: null,
    },
    cateGory:{ 
        type:"string",
        enum: ["work", "personal", "study"],
        default: null
    }
    
},
{
    timestamps: true,
}
);

const Task =  mongoose.model("Task", taskSchema)  

export default Task;