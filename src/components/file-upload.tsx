import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import { useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { ClientUploadedFileData } from "uploadthing/types";

interface FileUploadProps {
  type: string;
  field: ControllerRenderProps;
}

export function FileUpload({ type, field }: FileUploadProps) {
  const [file, setFile] = useState<ClientUploadedFileData<null> | null>(null);

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

  try {
    const endpoint = getEndpoint(type);
    return file ? (
      <div className="flex w-fit items-center gap-2 rounded-md border px-4 py-2 text-sm">
        {file.name}
        <X
          className="h-4 w-4 hover:cursor-pointer hover:text-muted-foreground"
          onClick={() => setFile(null)}
        />
      </div>
    ) : (
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          if (res && res[0]) {
            const uploadedFile = res[0];
            field.onChange(uploadedFile.url);
            setFile(uploadedFile);
          }
        }}
        onUploadError={(error: Error) => {
          console.error(error);
        }}
        config={{ mode: "auto" }}
        className="ut-button:bg-primary ut-button:text-primary-foreground ut-allowed-content:text-muted-foreground ut-label:text-foreground ut-upload-icon:text-muted-foreground ut-button:ut-readying:bg-muted ut-ready:cursor-pointer ut-ready:border-border"
      />
    );
  } catch (error) {
    return <div className="text-destructive">{(error as Error).message}</div>;
  }
}
