import React from "react";
import TaskEmptyState from "./TaskEmptyState";
import TaskCard from "./ui/TaskCard";

export const TaskList = ({filteredTasks, filter, handleTaskChange}) => {
    const filterTask = filteredTasks;
    if(! filterTask || filterTask.length === 0){
        return <TaskEmptyState filter={filter}/>
    }
    return(
        <div className="space-y-3">
            {filterTask.map((task, index) => (
                <TaskCard
                    key={task._id ?? index}
                    task={task}
                    index={index}
                    handleTaskChange={handleTaskChange}
                />
            ))}
        </div>
    )
    
}

export default TaskList;