import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Circle } from "lucide-react";
const TaskEmptyState = ({ filter }) => {
    return (
        <CardContent
            className="p-8 text-center border-0 bg-gradient-card shadow-custom-md"
        >
            <div className="space-y-3">
                <Circle className="mx-auto size-12 text-muted-foreground " />
                <div>
                    <h3 className="font-medium text-foreground">
                        {
                            filter === "active"
                                ? "Không có nhiệm vụ nào đanh làm"
                                : filter === "completed"
                                    ? "chưa có nhiệm vụ nào hoàn thành"
                                    : "chưa có nhiệm vụ"
                        }
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {
                            filter === "all" ? "thêm nhiệm vụ đầu tiên để bắt đầu!" :
                                `chuyeenr sang "tất cả" để nhìn thấy những nhiệm vụ ${filter === 'active' ? "đẫ hoàn thành" : "đang làm"}`
                        }
                    </p>
                </div>
            </div>
        </CardContent>
    )
};

export default TaskEmptyState;