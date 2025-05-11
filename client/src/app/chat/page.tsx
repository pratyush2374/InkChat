"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, Loader, Bot, User, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Message {
    content: string;
    sender: "user" | "bot";
    timestamp: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [currentFile, setCurrentFile] = useState<string>(); // Default file
    const messageEndRef = useRef<HTMLDivElement | null>(null);

    const {
        formState: { errors, isSubmitting },
        register,
        handleSubmit,
        reset,
    } = useForm<{ question: string }>();

    const router = useRouter();
    useEffect(() => {
        const fn = localStorage.getItem("fn");
        if (!fn) {
            router.push("/");
        }
        setCurrentFile(fn!);
    }, [router]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (errors.question) {
            toast.error(errors.question.message);
        }
    }, [errors]);

    const onSubmit = async (data: { question: string }) => {
        try {
            setIsLoading(true);
            if (!data.question) return;
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    content: data.question,
                    sender: "user",
                    timestamp: new Date().toISOString(),
                },
            ]);
            reset();

            const res = await axios.post(
                process.env.NEXT_PUBLIC_BACKEND_URL! + "/api/query",
                { question: data.question, file_name: currentFile }
            );

            const relevantPages =
                res.data.relevant_pages.length > 0
                    ? "\n\n\n" +
                      "**Relevant pages: " +
                      res.data.relevant_pages.join(", ") +
                      "**"
                    : "";

            setMessages((prevMessages) => [
                ...prevMessages,

                {
                    content: res.data.answer + relevantPages,

                    sender: "bot",

                    timestamp: new Date().toISOString(),
                },
            ]);
        } catch (err) {
            console.error(err);
            const error = err as AxiosError;
            if (error.status === 429) {
                toast.error("Rate limit exceeded. Please try again later");
            }
        } finally {
            setIsLoading(false);
        }
    };
    const handleFileUpload = async () => {
        localStorage.removeItem("fn");
        axios
            .delete(
                process.env.NEXT_PUBLIC_BACKEND_URL! +
                    "/api/delete/" +
                    currentFile
            )
            .catch((err) => {
                console.error("Background delete failed:", err);
            });

        router.push("/upload");
    };

    return (
        <div className="bg-black min-h-screen text-white">
            <div className="max-w-7xl mx-auto h-screen flex flex-col">
                <header className="py-4 px-6 border-b border-gray-800 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <span className="text-blue-500">Ink</span>Chat
                    </h1>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                            Current PDF: {currentFile}
                        </span>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                                    <Plus size={16} />
                                    <span>Upload New PDF</span>
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-950 text-white border-none">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will delete the current PDF
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-gray-800 border-none">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleFileUpload}
                                        className="bg-red-500 hover:bg-red-600"
                                    >
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </header>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left side - Image */}
                    <div className="hidden md:flex md:w-1/3 lg:w-2/5 p-8 items-center justify-center">
                        <div className="relative w-full max-w-md aspect-square">
                            <Image
                                src="/chat.svg"
                                alt="Chat illustration"
                                width={500}
                                height={500}
                                priority
                                className="drop-shadow-xl"
                            />
                        </div>
                    </div>

                    {/* Right side - Chat interface */}
                    <div className="flex-1 flex flex-col bg-gray-900 md:rounded-l-3xl overflow-hidden">
                        {/* Chat messages */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400">
                                        <Bot
                                            size={48}
                                            className="text-blue-500 mb-4"
                                        />
                                        <h3 className="text-xl font-medium mb-2">
                                            Start chatting with your PDF
                                        </h3>
                                        <p>
                                            Ask questions about the content in
                                            natural language
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${
                                                msg.sender === "user"
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >
                                            <div
                                                className={`flex max-w-[80%] items-start space-x-2 ${
                                                    msg.sender === "user"
                                                        ? "flex-row-reverse space-x-reverse"
                                                        : "flex-row"
                                                }`}
                                            >
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        msg.sender === "user"
                                                            ? "bg-blue-500"
                                                            : "bg-gray-700"
                                                    }`}
                                                >
                                                    {msg.sender === "user" ? (
                                                        <User size={16} />
                                                    ) : (
                                                        <Bot size={16} />
                                                    )}
                                                </div>

                                                <div
                                                    className={`rounded-2xl py-2 px-4 ${
                                                        msg.sender === "user"
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-gray-800 text-white"
                                                    }`}
                                                >
                                                    <ReactMarkdown
                                                        remarkPlugins={[
                                                            remarkGfm,
                                                        ]}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Loading indicator */}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="flex max-w-[80%] items-start space-x-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-700">
                                                <Bot size={16} />
                                            </div>

                                            <div className="rounded-2xl py-3 px-4 bg-gray-800 text-white flex items-center">
                                                <Loader
                                                    size={16}
                                                    className="animate-spin mr-2"
                                                />
                                                <span>Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messageEndRef} />
                            </div>
                        </div>

                        {/* Message input */}
                        <div className="p-4 border-t border-gray-800">
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="flex items-center space-x-2"
                            >
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        {...register("question", {
                                            required: true,
                                            minLength: {
                                                value: 1,
                                                message:
                                                    "Please enter a question",
                                            },
                                        })}
                                        placeholder="Ask about your PDF..."
                                        className="w-full py-3 px-4 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`bg-blue-500 p-3 rounded-xl flex items-center justify-center ${
                                        isSubmitting
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-blue-600"
                                    }`}
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
