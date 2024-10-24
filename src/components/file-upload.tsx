import { UploadDropzone } from "@/lib/uploadthing";
import { ControllerRenderProps } from "react-hook-form";

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
      case "pdf":
        return "pdfUploader";
      default:
        throw new Error(
          "Invalid input type. Supported types are: image, audio, pdf",
        );
    }
  };

  try {
    const endpoint = getEndpoint(type);
    return (
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          // Update the form field with the uploaded file URL
          if (res && res[0]) {
            field.onChange(res[0].url);
          }
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          console.error(error);
          alert(`Upload ERROR! ${error.message}`);
        }}
        config={{ mode: "auto" }}
        className="ut-button:bg-primary ut-button:text-primary-foreground ut-allowed-content:text-muted-foreground ut-label:text-foreground ut-upload-icon:text-muted-foreground ut-ready:border-border"
      />
    );
  } catch (error) {
    return <div className="text-destructive">{(error as Error).message}</div>;
  }
}
