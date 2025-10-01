import React, { useState, useEffect } from "react";
import { Card } from "./card";
import { Button } from "./button";
import { Bell, Calendar, CheckCircle2, Circle, X, Ribbon } from "lucide-react";
import { Input } from "./input";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { TimePicker } from '@/components/ui/TimePicker';
import { cn } from "@/lib/utils"
import api from "@/lib/axious";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';


export const TaskCard = ({ task, index, handleTaskChange }) => {
    const [date, setDate] = useState(new Date(task.startDate));
    const [endDate, setEndDate] = useState(task.endDate ? new Date(task.endDate) : null);
    const [startTime, setStartTime] = useState(new Date(task.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    const [endTime, setEndTime] = useState(task.endDate ? new Date(task.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) : "");
   
    const [isEditting, setIsEditting] = useState(false);
    const [taskTitle, setTaskTitle] = useState(task.title || "");
    const [taskCategory, setTaskCategory] = useState(task.cateGory || "");

    // Cập nhật state khi task prop thay đổi
    useEffect(() => {
        setDate(new Date(task.startDate));
        setEndDate(task.endDate ? new Date(task.endDate) : null);
        setStartTime(new Date(task.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }));
        setEndTime(task.endDate ? new Date(task.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) : "");
    }, [task.startDate, task.endDate]);

    // Function để cập nhật thời gian
    const updateTime = async (taskId, timeType, newTime) => {
        try {
            const currentDate = timeType === 'start' ? date : endDate;
            const [hours, minutes] = newTime.split(':');
            const newDateTime = new Date(currentDate);
            newDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            // Validation: Kiểm tra thời gian bắt đầu phải nhỏ hơn thời gian kết thúc
            if (timeType === 'start' && endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]), 0, 0);
                if (newDateTime >= endDateTime) {
                    toast.error("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");
                    return;
                }
            } else if (timeType === 'end' && date) {
                const startDateTime = new Date(date);
                startDateTime.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]), 0, 0);
                if (newDateTime <= startDateTime) {
                    toast.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu");
                    return;
                }
            }
            
            await api.put(`/tasks/${taskId}`, {
                [timeType === 'start' ? 'startDate' : 'endDate']: newDateTime.toISOString()
            });
            
            toast.success(`Đã cập nhật thời gian ${timeType === 'start' ? 'bắt đầu' : 'kết thúc'}`);
            handleTaskChange();
        } catch (error) {
            console.error("Error updating time:", error);
            toast.error("Lỗi khi cập nhật thời gian");
        }
    };

    const deleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            toast.success(`Nhiệm vụ "${task.title}" đã được xóa.`);
            handleTaskChange();
        } catch (error) {
            console.error("Lỗi xảy ra khi xóa nhiệm vụ: ", error);
            toast.error("Lỗi xảy ra khi xóa nhiệm vụ.");
        }

    }
    const editTask = async (id) => {
        try {
            setIsEditting(false);
            await api.put(`/tasks/${id}`, {
                title: taskTitle,
                cateGory: taskCategory
            }
            );
            toast.success(`Nhiệm vụ "${task.title}" đã được cập nhật thành "${taskTitle}".`);
            handleTaskChange();
        } catch (error) {
            console.error("Lỗi xảy ra khi cập nhật nhiệm vụ: ", error);
            toast.error("Lỗi xảy ra khi cập nhật nhiệm vụ.");
        }
    }
    const onKeyPress = (event) => {
        if (event.key === "Enter") {
            editTask(task._id);
            setIsEditting(false);
        }
    }

    const toggleTaskStatus = async (id) => {
        try {
            if (task.status === "active") {
                await api.put(`/tasks/${id}`, {
                    status: "complete",
                    completedAt: new Date().toISOString()
                });
                toast.success(`Nhiệm vụ "${task.title}" đã được đánh dấu là hoàn thành.`);
            }
            else {
                await api.put(`/tasks/${id}`, {
                    status: "active",
                    completedAt: null
                });
                toast.success(`Nhiệm vụ "${task.title}" đã được chuyển sang đang làm.`);
            }
            handleTaskChange();
        } catch (error) {
            console.error("Lỗi xảy ra khi cập nhật nhiệm vụ: ", error);
            toast.error("Lỗi xảy ra khi cập nhật nhiệm vụ.");
        }
    }
    return (
        <Card className={cn(
            "p-4 bg-gradient-card border-0 shadow-custom-md hover:shadow-custom-lg transition-all duration-200 animate-fade-in group",
            task.status === 'completed' && 'opacity-75'

        )}
            style={{ AnimationDelay: `${index * 50}ms` }}
        >
            <div className="flex items-center gap-4">
                {/* nut tron */}
                <Button
                    variant='ghost'
                    size='icon'
                    className={cn(
                        'flex-shrink-0 size-8 rounded-full transition-all duration-200',
                        task.status === 'complete' ? 'text-success hover:text-success/80 '
                            : 'text-muted-foreground hover:text-primary'
                    )}
                    onClick={() => toggleTaskStatus(task._id)}
                >
                    {task.status === 'complete' ? (
                        <CheckCircle2 className='size-5' />
                    ) : (
                        <Circle className='size-5' />
                    )
                    }
                </Button>
                {/* chinh sua title cua task */}
                <div className="flex-1 min-w-0">
                    {isEditting ? (
                        <div className="flex gap-2 items-center w-full">
                            {/* Ô nhập tiêu đề */}
                            <Input
                                placeholder="Cần làm gì?"
                                className="flex-1 h-12 text-base border-border/50 focus:border-primary/50 focus:ring-primary/20"
                                type="text"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                onKeyPress={onKeyPress}
                                onBlur={() => {
                                    //setIsEditting(false)
                                    //setTaskTitle(task.title || "")
                                }}
                            />

                            {/* Ô chọn Category */}
                            <Select
                                value={taskCategory}
                                onValueChange={(value) => setTaskCategory(value)}
                                onKeyPress={onKeyPress}
                            >
                                <SelectTrigger className="w-[120px] h-12 text-sm rounded-md border border-border/50 bg-white focus:ring-2 focus:ring-primary/50">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="work">Work</SelectItem>
                                    <SelectItem value="personal">Personal</SelectItem>
                                    <SelectItem value="study">Study</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <span className={cn(
                                'text-base transition-all duration-200',
                                task.status === 'complete'
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                            )}>
                                {task.title}
                            </span>
                            <span
                                className={cn(
                                    "ml-4 px-1 py-2 text font-semibold size-11 rounded-full ",
                                    task.cateGory === "work" && "bg-blue-100 text-blue-700",
                                    task.cateGory === "personal" && "bg-green-100 text-green-700",
                                    task.cateGory === "study" && "bg-violet-100 text-violet-700"
                                )}
                                style={{ minWidth: 70, textAlign: "center" }}
                            >
                                {task.cateGory ? task.cateGory : ""}
                            </span>
                        </div>
                    )}
                    {/* ngay tao va ngay hoan thanh */}
                    <div className="flex items-center gap-2 mt-1">
                        {/* Start Date Calendar */}
                        {task.startDate && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Calendar className="size-3 text-muted-foreground cursor-pointer" />
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={date}
                                            onSelect={(newDate) => {
                                                if (newDate) {
                                                const localDate = new Date(newDate);
                                                localDate.setHours(12, 0, 0, 0);
                                                setDate(localDate);
                                                
                                                
                                                if (
                                                    endDate &&
                                                    localDate.toDateString() === endDate.toDateString()
                                                ) {
                                                    const nextDay = new Date(localDate);
                                                    nextDay.setDate(localDate.getDate() + 1);
                                                    nextDay.setHours(12, 0, 0, 0);
                                                    setEndDate(nextDay);
                                                    api.put(`/tasks/${task._id}`, {
                                                        startDate: localDate.toISOString(),
                                                        endDate: nextDay.toISOString()
                                                    }).then(() => {
                                                        toast.success(`Nhiệm vụ "${task.title}" đã được cập nhật ngày bắt đầu và kết thúc mới`);
                                                        handleTaskChange();
                                                    }).catch(() => {
                                                        toast.error("Lỗi xảy ra khi cập nhật nhiệm vụ.");
                                                    });
                                                }
                                                else if (endDate && endDate.toDateString() === new Date(task.startDate).toDateString()) {
                                                    
                                                    const nextDay = new Date(localDate);
                                                    nextDay.setDate(localDate.getDate() + 1);
                                                    nextDay.setHours(12, 0, 0, 0);
                                                    setEndDate(nextDay);
                                                    api.put(`/tasks/${task._id}`, {
                                                        startDate: localDate.toISOString(),
                                                        endDate: nextDay.toISOString()
                                                    }).then(() => {
                                                        toast.success(`Nhiệm vụ "${task.title}" đã được cập nhật ngày bắt đầu và kết thúc mới`);
                                                        handleTaskChange();
                                                    }).catch(() => {
                                                        toast.error("Lỗi xảy ra khi cập nhật nhiệm vụ.");
                                                    });
                                                }
                                                // Nếu endDate khác startDate, không cho phép chọn startDate lớn hơn endDate
                                                else if (endDate && localDate > endDate) {
                                                    toast.error("Ngày bắt đầu không được sau ngày kết thúc.");
                                                    return;
                                                }
                                                else if (localDate > endDate && endDate === task.startDate) {
                                                    const nextDay = new Date(localDate);
                                                    nextDay.setDate(localDate.getDate() + 1);
                                                    nextDay.setHours(12, 0, 0, 0);
                                                    api.put(`/tasks/${task._id}`, {
                                                        startDate: localDate.toISOString(),
                                                        endDate: nextDay.toISOString()
                                                    }).then(() => {
                                                        toast.success(`Nhiệm vụ "${task.title}" đã được cập nhật ngày bắt đầu và kết thúc mới`);
                                                        handleTaskChange();
                                                    }).catch(() => {
                                                        toast.error("Lỗi xảy ra khi cập nhật nhiệm vụ.");
                                                    });
                                                }
                                                else if(localDate < new Date().setHours(0,0,0,0)) {
                                                    toast.error("Ngày bắt đầu không được trước ngày hiện tại.");
                                                    return;
                                                }
                                                else {
                                                    api.put(`/tasks/${task._id}`, {
                                                        startDate: localDate.toISOString()
                                                    }).then(() => {
                                                        toast.success(`Nhiệm vụ "${task.title}" đã được cập nhật ngày bắt đầu mới`);
                                                        handleTaskChange();
                                                    }).catch(() => {
                                                        toast.error("Lỗi xảy ra khi cập nhật nhiệm vụ.");
                                                    });
                                                }
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium">
                                {task.startDate === task.endDate ? 'Ngày:' : 'Bắt đầu:'}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">
                                {new Date(task.startDate).toLocaleDateString()}
                            </span>
                            <div className="text-xs text-muted-foreground font-medium">
                                <TimePicker
                                    value={startTime}
                                    onChange={(val) => {
                                        setStartTime(val);
                                        updateTime(task._id, 'start', val);
                                    }}
                                />
                            </div>
                            {task.startDate !== task.endDate && (
                                <>
                                    <span className="text-xs text-muted-foreground">-</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Calendar className="size-3 text-muted-foreground cursor-pointer" />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={endDate}
                                                onSelect={(newDate) => {
                                                    if (newDate) {
                                                        const localDate = new Date(newDate);
                                                        localDate.setHours(12, 0, 0, 0);
                                                        if (date && localDate < date) {
                                                            toast.error("Ngày kết thúc phải sau ngày bắt đầu.");
                                                            return;
                                                        }
                                                        setEndDate(localDate);
                                                        api.put(`/tasks/${task._id}`, {
                                                            endDate: localDate.toISOString()
                                                        }).then(() => {
                                                            toast.success(`Nhiệm vụ "${task.title}" đã được cập nhật ngày kết thúc mới`);
                                                            handleTaskChange();
                                                        }).catch(() => {
                                                            toast.error("Lỗi xảy ra khi cập nhật nhiệm vụ.");
                                                        });
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <span className="text-xs text-muted-foreground font-medium">Kết thúc:</span>
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {new Date(task.endDate).toLocaleDateString()}
                                    </span>
                                    <div className="text-xs text-muted-foreground font-medium">
                                        <TimePicker
                                            value={endTime}
                                            onChange={(val) => {
                                                setEndTime(val);
                                                updateTime(task._id, 'end', val);
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        {/* End Date Calendar moved to icon before label */}
                        {task.completedAt && (
                            <>
                                <span className='text-xs text-muted-foreground'> - </span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Ribbon className='size-3 text-muted-foreground cursor-pointer' />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={endDate}
                                            onSelect={(newDate) => {
                                                if (newDate) {
                                                    const localDate = new Date(newDate);
                                                    localDate.setHours(12, 0, 0, 0);
                                                    if (date && localDate < date) {
                                                        toast.error("Ngày kết thúc phải sau ngày bắt đầu.");
                                                        return;
                                                    }
                                                    setEndDate(localDate);
                                                    api.put(`/tasks/${task._id}`, {
                                                        endDate: localDate.toISOString()
                                                    }).then(() => {
                                                        toast.success(`Nhiệm vụ "${task.title}" đã được cập nhật ngày kết thúc mới`);
                                                        handleTaskChange();
                                                    }).catch(() => {
                                                        toast.error("Lỗi xảy ra khi cập nhật nhiệm vụ.");
                                                    });
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <span className="text-xs text-muted-foreground">
                                    Finish: {new Date(task.completedAt).toLocaleString()}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                {/* nut chinh va nut xoa */}
                <div className='hidden gap-2 group-hover:flex animate-slide-up'>
                    {/* nut edit */}
                    <Button
                        variant='ghost'
                        size='icon'
                        className='flex-shrink-0 transition-colors size-8 text-muted-foreground hover:text-info'
                        onClick={() => {
                            setIsEditting(!isEditting);
                            setTaskTitle(task.title || " ");
                        }}
                    >
                        <Bell className='size-4' />
                    </Button>
                    {/* nut delete */}
                    <Button
                        variant='ghost'
                        size='icon'
                        className='flex-shrink-0 transition-colors size-8 text-muted-foreground hover:text-destructive'
                        onClick={() => deleteTask(task._id)}
                    >
                        <X className='size-4' />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default TaskCard;