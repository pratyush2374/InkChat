"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { FileUp, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useRouter } from "next/navigation";

type FormValues = {
    pdfFile: FileList;
};

export default function UploadPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<
        "idle" | "success" | "error"
    >("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [fileName, setFileName] = useState("");
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        clearErrors,
    } = useForm<FormValues>();

    useEffect(() => {
        const fn = localStorage.getItem("fn");
        if (fn) {
            router.push("/chat");
        }
    });
    
    const onSubmit = async (data: FormValues) => {
        const file = data.pdfFile[0];
        console.log(file);

        // Validate if file is PDF
        if (file.type !== "application/pdf") {
            setErrorMessage("Please upload a PDF file");
            setUploadStatus("error");
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setErrorMessage("File size should be less than 10MB");
            setUploadStatus("error");
            return;
        }

        setIsUploading(true);
        setUploadStatus("idle");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await axios.post(
                process.env.NEXT_PUBLIC_BACKEND_URL! + "/api/upload-pdf",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            localStorage.setItem("fn", res.data.file_name);
            setUploadStatus("success");
            router.push("/chat");
            reset();
        } catch (error) {
            console.error("Error uploading file:", error);
            const axiosError = error as AxiosError;
            console.log(axiosError.status);
            if (axiosError.status == 429) {
                setErrorMessage("Too many requests. Please try again later.");
                setUploadStatus("error");
            } else {
                setErrorMessage("Failed to upload file. Please try again.");
                setUploadStatus("error");
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-black min-h-screen text-white py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                    Upload your PDF to{" "}
                    <span className="text-blue-500">InkChat</span>
                </h1>

                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Left side - Image */}
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <div className="relative w-full max-w-md aspect-square">
                            <Image
                                src="/upload.svg"
                                alt="Upload illustration"
                                layout="fill"
                                objectFit="contain"
                                priority
                                className="drop-shadow-xl"
                            />
                        </div>
                    </div>

                    {/* Right side - Upload form */}
                    <div className="w-full lg:w-1/2 max-w-md mx-auto">
                        <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800">
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <label className="block text-lg font-medium">
                                        Upload PDF Document
                                    </label>

                                    <div
                                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                            errors.pdfFile
                                                ? "border-red-500 bg-red-500/10"
                                                : "border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10"
                                        }`}
                                    >
                                        <input
                                            type="file"
                                            id="pdfFile"
                                            className="hidden"
                                            {...register("pdfFile", {
                                                required:
                                                    "PDF file is required",
                                                onChange(event) {
                                                    if (
                                                        event.target.files &&
                                                        event.target.files[0]
                                                    ) {
                                                        setErrorMessage("");
                                                        clearErrors();
                                                        setFileName(
                                                            event.target
                                                                .files[0].name
                                                        );
                                                    }
                                                },
                                            })}
                                            accept="application/pdf"
                                        />

                                        <label
                                            htmlFor="pdfFile"
                                            className="cursor-pointer block"
                                        >
                                            <FileUp className="mx-auto h-12 w-12 text-blue-500 mb-3" />
                                            <p className="text-lg font-medium">
                                                {fileName
                                                    ? fileName
                                                    : "Choose a file"}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-4">
                                                Max file size: 10MB
                                            </p>
                                        </label>
                                    </div>

                                    {errors.pdfFile && (
                                        <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                            <AlertCircle size={14} />
                                            <span>
                                                {errors.pdfFile.message?.toString()}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Status messages */}
                                {uploadStatus === "error" && (
                                    <div className="bg-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2">
                                        <AlertCircle size={18} />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                {uploadStatus === "success" && (
                                    <div className="bg-green-500/20 text-green-400 p-3 rounded-lg flex items-center gap-2">
                                        <CheckCircle size={18} />
                                        <span>Success, Redirecting...</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2
                  ${
                      isUploading
                          ? "bg-blue-600 cursor-not-allowed"
                          : "hover:bg-blue-600"
                  }`}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader
                                                className="animate-spin"
                                                size={18}
                                            />
                                            <span>
                                                Uploading... This might take a
                                                minute
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <FileUp size={18} />
                                            <span>Upload PDF</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="mt-6 text-center text-gray-400 text-sm">
                            <p>Supported format: PDF only (max 10MB)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
