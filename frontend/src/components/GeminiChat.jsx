import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Sparkles, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import api from "@/lib/axious";
import { toast } from "sonner";

const GeminiChat = ({ handleTaskChange }) => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pendingTask, setPendingTask] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Function để parse task từ AI response
    const parseTaskFromAI = (text) => {
        // Tìm pattern để extract task info
        const titleMatch = text.match(/Tiêu đề[:\s]+(.+?)(?:\n|$)/i);
        const categoryMatch = text.match(/Danh mục[:\s]+(work|personal|study)/i);
        const startDateMatch = text.match(/Ngày bắt đầu[:\s]+(\d{4}-\d{2}-\d{2})/i);
        const endDateMatch = text.match(/Ngày kết thúc[:\s]+(\d{4}-\d{2}-\d{2})/i);
        const startTimeMatch = text.match(/Thời gian bắt đầu[:\s]+(\d{2}:\d{2})/i);
        const endTimeMatch = text.match(/Thời gian kết thúc[:\s]+(\d{2}:\d{2})/i);
        
        if (titleMatch) {
            const startDate = startDateMatch ? startDateMatch[1] : new Date().toISOString().split('T')[0];
            const endDate = endDateMatch ? endDateMatch[1] : startDate;
            const startTime = startTimeMatch ? startTimeMatch[1] : '09:00';
            const endTime = endTimeMatch ? endTimeMatch[1] : '17:00';
            
            // Tạo datetime với thời gian
            const startDateTime = new Date(`${startDate}T${startTime}:00`);
            const endDateTime = new Date(`${endDate}T${endTime}:00`);
            
            return {
                title: titleMatch[1].trim(),
                category: categoryMatch ? categoryMatch[1] : 'personal',
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString()
            };
        }
        return null;
    };

    // Function để tạo task confirmation dialog
    const createTaskConfirmation = (taskData) => {
        setPendingTask(taskData);
        setShowConfirmation(true);
    };

    // Function để xác nhận tạo task
    const confirmCreateTask = async () => {
        if (!pendingTask) return;
        
        try {
            await api.post("/tasks", pendingTask);
            toast.success(`Đã tạo nhiệm vụ "${pendingTask.title}" thành công!`);
            handleTaskChange();
            setShowConfirmation(false);
            setPendingTask(null);
            
            // Thêm message xác nhận
            setMessages((prev) => [...prev, { 
                role: "gemini", 
                text: `✅ Đã tạo nhiệm vụ "${pendingTask.title}" thành công!\n\n📅 Ngày bắt đầu: ${new Date(pendingTask.startDate).toLocaleDateString()} lúc ${new Date(pendingTask.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}\n📅 Ngày kết thúc: ${new Date(pendingTask.endDate).toLocaleDateString()} lúc ${new Date(pendingTask.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}\n🏷️ Danh mục: ${pendingTask.category}\n\nBạn có cần tôi giúp gì thêm không?` 
            }]);
        } catch (error) {
            console.error("Error creating task:", error);
            toast.error("Lỗi khi tạo nhiệm vụ");
        }
    };

    // Function để hủy tạo task
    const cancelCreateTask = () => {
        setShowConfirmation(false);
        setPendingTask(null);
        setMessages((prev) => [...prev, { 
            role: "gemini", 
            text: "Đã hủy tạo nhiệm vụ. Bạn có cần tôi giúp gì khác không?" 
        }]);
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        setMessages((prev) => [...prev, { role: "user", text: input }]);
        setInput("");
        setLoading(true);
        
        try {
            // Tạo prompt chuyên nghiệp cho AI trợ lý lên lịch
            const systemPrompt = `Bạn là một trợ lý AI chuyên nghiệp về lên lịch và quản lý thời gian. Nhiệm vụ của bạn là:

1. Phân tích yêu cầu của người dùng về việc tạo lịch trình
2. Đề xuất các nhiệm vụ cụ thể với thông tin chi tiết bao gồm cả thời gian
3. Khi người dùng yêu cầu tạo task, hãy trả về theo format sau:
   Tiêu đề: [Tên nhiệm vụ]
   Danh mục: [work/personal/study]
   Ngày bắt đầu: [YYYY-MM-DD]
   Thời gian bắt đầu: [HH:MM] (từ 00:00 đến 23:59)
   Ngày kết thúc: [YYYY-MM-DD]
   Thời gian kết thúc: [HH:MM] (từ 00:00 đến 23:59)

4. Nếu chỉ có 1 ngày, hãy đặt ngày bắt đầu = ngày kết thúc
5. Thời gian kết thúc phải sau thời gian bắt đầu
6. Nếu không phải yêu cầu tạo task, hãy trả lời như một trợ lý lên lịch chuyên nghiệp
7. Luôn hỏi xác nhận trước khi tạo task mới

Yêu cầu của người dùng: ${input}`;

            const res = await api.post("/tasks/gemini", { prompt: systemPrompt });
            const geminiText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi";
            
            // Kiểm tra xem AI có đề xuất tạo task không
            const taskData = parseTaskFromAI(geminiText);
            if (taskData) {
                setMessages((prev) => [...prev, { role: "gemini", text: geminiText }]);
                createTaskConfirmation(taskData);
            } else {
                setMessages((prev) => [...prev, { role: "gemini", text: geminiText }]);
            }
        } catch (err) {
            console.error("Gemini API error:", err);
            setMessages((prev) => [
                ...prev,
                { role: "gemini", text: "Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau." },
            ]);
        }
        setLoading(false);
    };

    return (
        <div>
            {/* Floating chat button với hiệu ứng gradient */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-8 right-15 z-50 group"
                aria-label="Open chat"
            >
                <div className="relative">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                    {/* Button */}
                    <div className="relative bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 group-hover:scale-110">
                        <MessageCircle size={28} className="drop-shadow-lg" />
                    </div>
                </div>
            </button>

            {/* Chat window với backdrop blur */}
            {open && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setOpen(false)}
                    ></div>

                    {/* Chat container */}
                    <div className="fixed bottom-32 right-8 z-50 w-[430px] h-[500px] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-violet-200/50 bg-white/95 backdrop-blur-xl">
                        {/* Header với gradient */}
                        <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                                    <Sparkles size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">AI Scheduler</h3>
                                    <p className="text-violet-100 text-xs">Trợ lý lên lịch chuyên nghiệp</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                                aria-label="Close chat"
                            >
                                <X size={29} />
                            </button>
                            {/* Decorative gradient orb */}
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                        </div>

                        {/* Messages area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-violet-50/30 to-white">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                    <div className="bg-gradient-to-br from-violet-100 to-purple-100 p-6 rounded-3xl mb-4 shadow-lg">
                                        <Sparkles size={48} className="text-violet-600 mx-auto" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800 mb-2">Xin chào! 👋</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Tôi là AI Scheduler - trợ lý lên lịch chuyên nghiệp của bạn!<br/>
                                        Tôi có thể giúp bạn:<br/>
                                        📅 Tạo và sắp xếp lịch trình<br/>
                                        ⏰ Quản lý thời gian hiệu quả<br/>
                                        🎯 Đề xuất nhiệm vụ phù hợp<br/>
                                        💡 Tư vấn về quản lý công việc
                                    </p>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                                >
                                    <div className={`max-w-[85%] ${msg.role === "user" ? "order-2" : "order-1"}`}>
                                        <div
                                            className={`px-4 py-3 rounded-2xl shadow-sm ${msg.role === "user"
                                                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-md"
                                                    : "bg-white text-gray-800 rounded-bl-md border border-violet-100"
                                                }`}
                                        >
                                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                                                {msg.text}
                                            </p>
                                        </div>
                                        <div className={`text-xs mt-1 px-2 ${msg.role === "user" ? "text-right text-gray-500" : "text-left text-gray-400"}`}>
                                            {msg.role === "user" ? "Bạn" : "Gemini AI"}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start animate-fadeIn">
                                    <div className="bg-white border border-violet-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                            </div>
                                            <span className="text-sm text-violet-600">Đang suy nghĩ...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Confirmation Dialog */}
                        {showConfirmation && pendingTask && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                                <div className="bg-white rounded-2xl p-6 mx-4 max-w-md w-full shadow-2xl border border-violet-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-violet-100 p-2 rounded-xl">
                                            <Calendar className="text-violet-600" size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">Xác nhận tạo nhiệm vụ</h3>
                                    </div>
                                    
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700">📝 Tiêu đề:</span>
                                            <span className="text-gray-900">{pendingTask.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700">🏷️ Danh mục:</span>
                                            <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
                                                {pendingTask.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700">📅 Bắt đầu:</span>
                                            <span className="text-gray-900">
                                                {new Date(pendingTask.startDate).toLocaleDateString()} lúc {new Date(pendingTask.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700">📅 Kết thúc:</span>
                                            <span className="text-gray-900">
                                                {new Date(pendingTask.endDate).toLocaleDateString()} lúc {new Date(pendingTask.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <button
                                            onClick={cancelCreateTask}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                                        >
                                            <XCircle size={20} />
                                            Hủy
                                        </button>
                                        <button
                                            onClick={confirmCreateTask}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all"
                                        >
                                            <CheckCircle size={20} />
                                            Tạo nhiệm vụ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Input area */}
                        <div className="p-4 bg-white border-t border-violet-100">
                            <div className="flex gap-2 bg-gray-50 rounded-2xl p-2 border border-violet-200/50 focus-within:border-violet-400 focus-within:shadow-lg focus-within:shadow-violet-200/50 transition-all duration-200">
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent px-3 py-2 text-[15px] focus:outline-none text-gray-800 placeholder-gray-400"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                    placeholder="Nhập tin nhắn của bạn..."
                                    disabled={loading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-lg disabled:shadow-none"
                                    aria-label="Send message"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default GeminiChat;