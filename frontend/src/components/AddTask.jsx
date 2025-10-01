import React, { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import api from "@/lib/axious";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export const AddTask = ({ handleNewTask }) => {
    const [taskTitle, setTaskTitle] = useState("");
    const [startDay, setStartDay] = useState(new Date().toISOString().split("T")[0]);
    const [endDay, setEndDay] = useState("");
    const [category, setCategory] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const addTask = async () => {
        if (taskTitle.trim() && startDay && endDay && category) {
            try {
                // Tạo datetime với thời gian
                const startDateTime = new Date(`${startDay}T${startTime}:00`);
                const endDateTime = new Date(`${endDay}T${endTime}:00`);
                
                if (startDateTime > endDateTime) {
                    toast.error("Thời gian kết thúc phải sau thời gian bắt đầu.");
                    return;
                }
                else if (startDateTime < new Date()) {
                    toast.error("Thời gian bắt đầu không được trước thời điểm hiện tại.");
                    return;
                }
                else {
                    await api.post("/tasks", {
                        title: taskTitle.trim(),
                        startDate: startDateTime.toISOString(),
                        endDate: endDateTime.toISOString(),
                        cateGory: category
                    });
                    toast.success(`Nhiệm vụ "${taskTitle.trim()}" đã được thêm.`);
                    handleNewTask();
                    
                    // Reset form
                    setTaskTitle("");
                    setStartDay(new Date().toISOString().split("T")[0]);
                    setEndDay("");
                    setCategory("");
                    setStartTime("09:00");
                    setEndTime("17:00");
                }
            } catch (error) {
                console.error("Lỗi xảy ra khi thêm nhiệm vụ: ", error);
                toast.error("Lỗi xảy ra khi thêm nhiệm vụ.");
            }
        } else {
            toast.error("Tiêu đề nhiệm vụ, ngày bắt đầu, kết thúc và mục loại không được để trống.");
        }
    }

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            addTask();
        }
    }
    return (
        <Card className="p-3 border-a bg-gradient-card shadow-custom-lg mb-4">
            <div className="flex flex-col gap-3">
                {/* Row 1: Title and Category */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                        type="text"
                        placeholder="Input your work, ex: study"
                        className="h-12 text-base bg-lime-100 sm:flex-2 border-border/90 focus:border-primary/80 focus:ring-primary-80"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <Select value={category} onValueChange={setCategory} className="sm:flex-1">
                        <SelectTrigger className="h-12 text-sm rounded-xl border border-amber-400 bg-amber-50 focus:ring-2 focus:ring-amber-500">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-amber-400 bg-white shadow-lg">
                            <SelectItem
                                value="work"
                                className="text-blue-600 hover:bg-blue-100 cursor-pointer"
                            >
                                Work
                            </SelectItem>
                            <SelectItem
                                value="personal"
                                className="text-green-600 hover:bg-green-100 cursor-pointer"
                            >
                                Personal
                            </SelectItem>
                            <SelectItem
                                value="study"
                                className="text-purple-600 hover:bg-purple-100 cursor-pointer"
                            >
                                Study
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Row 2: Start Date and Time */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex gap-2 sm:flex-1">
                        <Input
                            id="startDate"
                            type="date"
                            className="h-12 text-base bg-amber-100 flex-1 border-border/90 focus:border-primary/80 focus:ring-primary-80"
                            value={startDay}
                            onChange={(e) => setStartDay(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <div className="flex items-center gap-1 bg-amber-100 px-3 rounded-lg border border-border/90">
                        
                            <Input
                                type="time"
                                className="h-12 text-base bg-transparent border-none focus:ring-0 p-0 w-25"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* End Date and Time */}
                    <div className="flex gap-2 sm:flex-1">
                        <Input
                            id="endDate"
                            type="date"
                            className="h-12 text-base bg-amber-100 flex-1 border-border/90 focus:border-primary/80 focus:ring-primary-80"
                            value={endDay}
                            onChange={(e) => setEndDay(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <div className="flex items-center gap-1 bg-amber-100 px-3 rounded-lg border border-border/90">
                            
                            <Input
                                type="time"
                                className="h-12 text-base bg-transparent border-none focus:ring-0 p-0 w-25"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <Button
                        variant="ghost"
                        size="xl"
                        className="px-5 h-12"
                        onClick={addTask}
                        disabled={!taskTitle.trim() || !endDay || !startDay || !category}
                    >
                        <Plus className="size-5"></Plus>
                        Thêm
                    </Button>
                </div>
            </div>
        </Card>
    )
};

export default AddTask;