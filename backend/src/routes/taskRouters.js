import express from 'express';
import {getAllTask, deleteTask, createTask, updateTask, callGeminiAPI} from '../controllers/taskControllers.js'
const router = express.Router();

router.get("/", getAllTask);


router.post("/", createTask);
router.post('/gemini', callGeminiAPI);

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);

export default router;


