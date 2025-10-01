import Task from '../models/Task.js'
export const getAllTask = async (request, response) => {
    const { filter = "today" } = request.query;
    const now = new Date();
    let startDatefilter = null;
    let endDatefilter = null;
    
    switch (filter) {
        case "today": {
           
            startDatefilter = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            endDatefilter = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            break;
        }
        case "week": {
           
            const dayOfWeek = now.getDay();
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Nếu Chủ nhật thì lùi 6 ngày
            startDatefilter = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff, 0, 0, 0);
            // Chủ nhật cuối tuần
            endDatefilter = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff + 6, 23, 59, 59);
            break;
        }
        case "month": {
            
            startDatefilter = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
            // Ngày cuối tháng (tháng tiếp theo ngày 0 = ngày cuối tháng hiện tại)
            endDatefilter = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            break;
        }
        case "all":
        default: {
            startDatefilter = null;
            endDatefilter = null;
            break;
        }
    }
    
   
    let query = {};
    
    if (startDatefilter && endDatefilter) {
        query = {
            $or: [
                {
                    // startDate nằm trong khoảng filter
                    startDate: { $gte: startDatefilter, $lte: endDatefilter }
                },
                {
                    // endDate nằm trong khoảng filter
                    endDate: { $gte: startDatefilter, $lte: endDatefilter }
                },
                {
                    // Task bắt đầu trước và kết thúc sau khoảng filter (bao phủ toàn bộ)
                    startDate: { $lte: startDatefilter },
                    endDate: { $gte: endDatefilter }
                }
            ]
        };
    }
    // Nếu filter = "all" thì query = {} (lấy tất cả)

    try {
        const result = await Task.aggregate([
            {
                $match: query
            },
            {
                $facet: {
                    tasks: [{ $sort: { startDate: 1 } }],
                    activeCount: [{ $match: { status: "active" } }, { $count: "count" }],
                    completeCount: [{ $match: { status: "complete" } }, { $count: "count" }],
                },
            },
        ]);
        
        const task = result[0].tasks;
        const activeCount = result[0].activeCount[0]?.count || 0;
        const completeCount = result[0].completeCount[0]?.count || 0;

        response.status(200).json({ task, activeCount, completeCount });
    } catch (error) {
        console.error("Lỗi khi gọi get all task:", error);
        response.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const createTask = async (request, response) => {
    try {
        const { title, startDate, endDate, cateGory } = request.body;
        const task = new Task({ title, startDate, endDate, cateGory });
        const newTask = await task.save();
        response.status(201).json(newTask)
    } catch (error) {
        console.error("Loi khi goi createTask", error)
        response.status(500).json({ message: "Loi he thong" });
    }

};

export const updateTask = async (request, response) => {
    try {
        const { title, status, completedAt, cateGory, startDate, endDate } = request.body;
        const updateData = {};
        
        // Chỉ cập nhật các field được gửi lên
        if (title !== undefined) updateData.title = title;
        if (status !== undefined) updateData.status = status;
        if (completedAt !== undefined) updateData.completedAt = completedAt;
        if (cateGory !== undefined) updateData.cateGory = cateGory;
        if (startDate !== undefined) updateData.startDate = startDate;
        if (endDate !== undefined) updateData.endDate = endDate;
        
        const updatedTask = await Task.findByIdAndUpdate(
            request.params.id,
            updateData,
            {
                new: true
            }
        );
        if (!updatedTask) {
            return response.status(404).json({ message: "Nhiem vu khong ton tai" })
        }
        response.status(200).json(updatedTask);
    } catch (error) {
        console.error("loi sau khi goi update", error);
        response.status(500).json({ message: "Loi he thong" });
    }
};


export const deleteTask = async (request, response) => {
    try {
        const deleteTask = await Task.findByIdAndDelete(request.params.id);
        if (!deleteTask) {
            return response.status(404).json({ message: "Nhiem vu khong ton tai" });
        }
        response.status(200).json("deleteTask")
    } catch (error) {
        console.error("Khong the goi delete", error);
        response.status(500).json({
            message: "loi he thong"
        });
    }

}

import dotenv from "dotenv";
dotenv.config();

export const callGeminiAPI = async (req, res) => {
    try {
        const { prompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ message: "Missing GEMINI_API_KEY" });
        }


        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `${prompt}`,
                            },
                        ],
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("Gemini API error details:", errData);
            return res.status(response.status).json(errData);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ message: "Gemini API error" });
    }
};
