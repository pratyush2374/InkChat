"use client";

import { FileUp, MessageSquare, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeroSection() {
    const router = useRouter();
    return (
        <div className="bg-black text-white w-[90%] mx-auto py-10 px-4 md:py-20">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
                {/* Left content - Text and CTA */}
                <div className="flex-1 space-y-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                        <span className="text-blue-500">Ink</span>Chat
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-300 max-w-xl">
                        Chat with your PDFs using natural language. Upload once,
                        ask anything.
                    </p>

                    {/* Steps */}
                    <div className="flex flex-col space-y-4 py-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                                <FileUp size={20} />
                            </div>
                            <p className="text-lg">Upload your PDF document</p>
                        </div>

                        <div className="flex items-center">
                            <div className="w-0.5 h-6 bg-blue-500 ml-4"></div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                                <MessageSquare size={20} />
                            </div>
                            <p className="text-lg">
                                Chat with it in natural language
                            </p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg flex items-center space-x-2 transition-all transform hover:scale-105"
                        onClick={() => router.push("/upload")}
                    >
                        <span>Upload PDF</span>
                        <ArrowRight size={18} />
                    </button>
                </div>

                {/* Right content - Image */}
                <div className="flex-1 relative w-full max-w-lg mx-auto lg:mx-0">
                    <div className="relative w-full aspect-square">
                        <Image
                            src="/inkchat.svg"
                            alt="InkChat PDF chat illustration"
                            layout="fill"
                            objectFit="contain"
                            priority
                            className="drop-shadow-2xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
