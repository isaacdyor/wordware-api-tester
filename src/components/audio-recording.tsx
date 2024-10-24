import { Button } from "@/components/ui/button";
import { Loader2, Mic, Square } from "lucide-react";
import { useRef, useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { PutBlobResult } from "@vercel/blob";

interface AudioRecordingProps {
  field: ControllerRenderProps;
}

export function AudioRecording({ field }: AudioRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(250); // Start recording and emit dataavailable event every 250ms
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
      setIsRecording(false);

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      // Handle the recorded audio
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        console.log("Recording saved:", file);

        // Upload the file using Vercel Blob
        try {
          setIsUploading(true);
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "content-type": file.type || "application/octet-stream",
            },
            body: file,
          });

          if (response.ok) {
            const { url } = (await response.json()) as PutBlobResult;
            field.onChange({
              url,
              fileName: file.name,
            });
            console.log("Audio uploaded successfully!");
          } else {
            const error = await response.text();
            console.error("Error uploading audio:", error);
          }
        } catch (error) {
          console.error("Error uploading audio:", error);
        } finally {
          setIsUploading(false);
        }
      };
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex w-full flex-col items-center justify-center gap-2 px-4">
        <div className="flex w-full items-center gap-4">
          <div className="h-[1px] flex-1 border-t border-dashed" />
          <p className="text-xs text-muted-foreground">or</p>
          <div className="h-[1px] flex-1 border-t border-dashed" />
        </div>
        <div className="flex w-full justify-center pb-12 pt-8">
          <Button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className="relative z-10"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : isRecording ? (
              <>
                <Square className="mr-2 h-4 w-4" />
                Stop recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start recording
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
