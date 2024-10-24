import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import { ControllerRenderProps } from "react-hook-form";
import { AudioRecording } from "./audio-recording";

interface FileUploadProps {
  type: string;
  field: ControllerRenderProps;
}

export function FileUpload({ type, field }: FileUploadProps) {
  const getEndpoint = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "image":
        return "imageUploader";
      case "audio":
        return "audioUploader";
      case "file":
        return "pdfUploader";
      default:
        throw new Error(
          "Invalid input type. Supported types are: image, audio, pdf",
        );
    }
  };

  const handleRemove = () => {
    field.onChange(null);
  };

  try {
    const endpoint = getEndpoint(type);
    return field.value ? (
      <div className="flex w-fit items-center gap-2 rounded-md border px-4 py-2 text-sm">
        {field.value.fileName}
        <X
          className="h-4 w-4 hover:cursor-pointer hover:text-muted-foreground"
          onClick={handleRemove}
        />
      </div>
    ) : (
      <div className="rounded-md border border-dashed">
        <UploadDropzone
          endpoint={endpoint}
          onClientUploadComplete={(res) => {
            if (res && res[0]) {
              const uploadedFile = res[0];
              field.onChange({
                url: uploadedFile.url,
                fileName: uploadedFile.name,
              });
            }
          }}
          onUploadError={(error: Error) => {
            console.error(error);
          }}
          config={{ mode: "auto" }}
          className="ut-button:h-9 ut-button:w-fit ut-button:bg-primary ut-button:px-4 ut-button:text-sm ut-button:text-primary-foreground ut-allowed-content:text-muted-foreground ut-label:text-foreground ut-upload-icon:text-muted-foreground ut-button:ut-readying:bg-muted ut-ready:cursor-pointer"
        />
        {type === "audio" && <AudioRecording />}
      </div>
    );
  } catch (error) {
    return <div className="text-destructive">{(error as Error).message}</div>;
  }
}
