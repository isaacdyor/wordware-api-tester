"use client";

import { useState, useCallback, useMemo, ChangeEvent } from "react";
import { Loader2, X } from "lucide-react";
import { ControllerRenderProps } from "react-hook-form";
import { PutBlobResult } from "@vercel/blob";
import { AudioRecording } from "./audio-recording";

interface FileUploadProps {
  type: string;
  field: ControllerRenderProps;
}

export function FileUpload({ type, field }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const acceptedTypes = {
    image: "image/*",
    audio: "audio/*",
    file: ".pdf",
  };

  const maxSize = 50 * 1024 * 1024; // 50MB

  const handleFile = (file: File | null) => {
    if (file) {
      if (file.size > maxSize) {
        console.error("File size too big (max 50MB)");
      } else {
        setFile(file);
        field.onChange({
          file,
          fileName: file.name,
        });
      }
    }
  };

  const onChangeFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files && event.currentTarget.files[0];
      handleFile(file);
    },
    [handleFile],
  );

  const handleRemove = () => {
    field.onChange(null);
    setFile(null);
  };

  const saveDisabled = useMemo(() => {
    return !file || saving;
  }, [file, saving]);

  const handleUpload = async () => {
    if (!file) return;

    setSaving(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "content-type": file.type || "application/octet-stream" },
        body: file,
      });

      if (response.ok) {
        const { url } = (await response.json()) as PutBlobResult;
        field.onChange({
          url,
          fileName: file.name,
        });
        console.log("File uploaded successfully!");
      } else {
        const error = await response.text();
        console.error(error);
      }
    } catch (error) {
      console.error("An error occurred while uploading the file.", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {field.value ? (
        <div className="flex w-fit items-center gap-2 rounded-md border px-4 py-2 text-sm">
          {field.value.fileName}
          <X
            className="h-4 w-4 hover:cursor-pointer hover:text-muted-foreground"
            onClick={handleRemove}
          />
        </div>
      ) : (
        <div className="rounded-md border border-dashed">
          <label
            htmlFor="file-upload"
            className="group relative flex h-72 cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50"
          >
            <div
              className="absolute z-[5] h-full w-full rounded-md"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
                const file = e.dataTransfer.files && e.dataTransfer.files[0];
                handleFile(file);
              }}
            />
            <div
              className={`${
                dragActive ? "border-2 border-black" : ""
              } absolute z-[3] flex h-full w-full flex-col items-center justify-center rounded-md px-10 transition-all ${
                file
                  ? "bg-white/80 opacity-0 hover:opacity-100 hover:backdrop-blur-md"
                  : "bg-white opacity-100 hover:bg-gray-50"
              }`}
            >
              <svg
                className={`${
                  dragActive ? "scale-110" : "scale-100"
                } h-7 w-7 text-gray-500 transition-all duration-75 group-hover:scale-110 group-active:scale-95`}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                <path d="M12 12v9"></path>
                <path d="m16 16-4-4-4 4"></path>
              </svg>
              <p className="mt-2 text-center text-sm text-gray-500">
                Drag and drop or click to upload.
              </p>
              <p className="mt-2 text-center text-sm text-gray-500">
                Max file size: 50MB
              </p>
              <span className="sr-only">File upload</span>
            </div>
            {file && type === "audio" && (
              <audio
                src={URL.createObjectURL(file)}
                controls
                className="absolute bottom-4 left-4 right-4 h-12 rounded-md"
              />
            )}
            {file && type === "image" && (
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="absolute inset-0 h-full w-full rounded-md object-cover"
              />
            )}
            {file && type === "file" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg font-semibold">{file.name}</p>
              </div>
            )}
          </label>
          <input
            id="file-upload"
            name="file"
            type="file"
            accept={acceptedTypes[type as keyof typeof acceptedTypes]}
            className="sr-only"
            onChange={onChangeFile}
          />
          {type === "audio" && <AudioRecording field={field} />}
        </div>
      )}

      {file && !field.value?.url && (
        <button
          disabled={saveDisabled}
          className={`${
            saveDisabled
              ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
              : "border-black bg-black text-white hover:bg-white hover:text-black"
          } flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none`}
          onClick={handleUpload}
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <p className="text-sm">Confirm upload</p>
          )}
        </button>
      )}
    </div>
  );
}
