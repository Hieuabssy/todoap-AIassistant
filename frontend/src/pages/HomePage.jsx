import React, { use, useEffect, useState } from 'react';
import AddTask from '@/components/AddTask';
import DateTimeFilter from '@/components/DateTimeFilter';
import TaskListPag from '@/components/TaskListPag';
import Header from '@/components/Header';
import StartAndFilters from '@/components/StartAndFilters';
import TaskList from '@/components/TaskList';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import api from '@/lib/axious';
import { visibleLimit } from '@/lib/data';
import GeminiChat from '@/components/GeminiChat';

const HomePage = () => {
    const [taskBuffer, setTaskBuffer] = useState([]);
    const [activeCount, setActiveCount] = useState(0);
    const [completeCount, setCompleteCount] = useState(0);
    const [filter, setFilter] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [dateQuerry, setDateQuerry] = useState("all");
    const [Page, setPage] = useState(1);
    useEffect(() => {
        fetchTask();
    }, [dateQuerry]);

    useEffect(() => {
        setPage(1);
    }, [filter, dateQuerry]);
    const fetchTask = async () => {
        try {
            const res = await api.get(`/tasks?filter=${dateQuerry}`);
          
            setTaskBuffer(res.data.task);
            setActiveCount(res.data.activeCount);
            setCompleteCount(res.data.completeCount);

        } catch (error) {
            console.error("Lỗi xảy ra khi truy xuất task: ", error);
            toast.error("Lỗi xảy ra khi truy xuất task.")
        }
    }


    const filteredTasks = taskBuffer.filter((task) => {
        switch (filter) {
            case "active":
                return task.status === "active";
            case "completed":
                return task.status === "complete";
            default:
                return true;
        }
    })
    const filteredByCategoryTasks = filteredTasks.filter((task) => {
        switch (filterCategory) {
            case "work":   
                return task.cateGory === "work"; 
            case "personal":
                return task.cateGory === "personal";
            case "study":
                return task.cateGory === "study";
            default:
                return true; 
        }
    })
    const visibleTasks = filteredTasks.slice((Page - 1) * visibleLimit, Page * visibleLimit);

    const totalPage = Math.ceil(filteredTasks.length / visibleLimit);
    const handleNextPage = () => {
        if (Page < totalPage) {
            setPage((prev) => prev + 1);
        }
    }
    const handlePrevPage = () => {
        if (Page > 1) {
            setPage((prev) => prev - 1);
        }
    }
    const handlePageChange = (pageNumber) => {
        setPage(pageNumber);
    }

    const handleTaskChange = () => {
        console.log("handleTaskChange called, fetching tasks...");
        fetchTask();
    }
    if (visibleTasks.length === 0 && Page > 1) {
        handlePrevPage();
    }

    return (
        <div className="min-h-screen w-full bg-white relative">
            {/* Dual Gradient Overlay (Top) Background */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `
                linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
                radial-gradient(circle 500px at 0% 20%, rgba(139,92,246,0.3), transparent),
                radial-gradient(circle 500px at 100% 0%, rgba(59,130,246,0.3), transparent)
            `,
                    backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
                }}
            />
            {/* Your Content/Components */}
            <div className="container pt-8 relative z-10">
                <div className="w-full sm:w-[700px] lg:w-[820px] p-6  space-y-6 mx-auto">
                    {/*Đầu trang*/}
                    <Header />
                    {/* Tạo nhiệm Vụ*/}
                    <AddTask
                        handleNewTask={handleTaskChange}
                    />
                    {/*Thống kê và bộ lọc */}
                    <StartAndFilters
                        activeTaskCount={activeCount}
                        completedTaskCount={completeCount}
                        filter={filter}
                        setFilter={setFilter}
                    />
                    {/*Danh sách các nhiệm vụ */}
                    <TaskList
                        filteredTasks={visibleTasks}
                        filter={filter}
                        handleTaskChange={handleTaskChange}
                    />
                    {/* Phân trang và lọc theo Date */}
                    
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row  ">
                        <TaskListPag
                            handleNextPage={handleNextPage}
                            handlePrevPage={handlePrevPage}
                            handlePageChange={handlePageChange}
                            Page={Page}
                            totalPage={totalPage}
                        />


                        <DateTimeFilter
                            dateQuerry={dateQuerry}
                            setDateQuerry={setDateQuerry}

                        />
                    </div>
                    {/*Chân trang */}
                    <Footer
                        activeTaskCount={activeCount}
                        completedTaskCount={completeCount}
                    />
                </div>
            </div>
            <GeminiChat handleTaskChange={handleTaskChange}/>
        </div>

    )
}


export default HomePage;