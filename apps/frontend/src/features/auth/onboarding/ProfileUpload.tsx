import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadList,
} from "@/components/ui/file-upload";
import { useState } from "react";
import { CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProfileUploadProps {
  className?: string;
  onChange?: (file: File | undefined) => void;
}

const ProfileUpload = ({ className, onChange }: ProfileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  console.log("files", files);

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <FileUpload
        value={files}
        maxSize={5 * 1024 * 1024}
        onValueChange={(newFiles) => {
          const latest = newFiles.slice(-1);
          setFiles(latest);
          onChange?.(latest[0]);
        }}
        accept=".jpg,.jpeg,.png"
        onFileReject={(file, message) => {
          console.error(file.name, "is too large");
          toast.error(message);
        }}
      >
        <FileUploadDropzone className="h-30 w-30 rounded-full hover:border-primary cursor-pointer group transition-all duration-300">
          {files.length === 0 && (
            <div className="text-gray-400 flex flex-col gap-1 items-center group-hover:text-primary transition-all duration-300">
              <CloudUpload size={25} />
              <p>Upload</p>
            </div>
          )}
          <FileUploadList className="">
            {files.map((file) => (
              <FileUploadItem
                value={file}
                className="border-none size-full w-30 h-30 rounded-full"
              >
                <FileUploadItemPreview className="rounded-full w-10 h-10 size-full" />
              </FileUploadItem>
            ))}
          </FileUploadList>
        </FileUploadDropzone>
      </FileUpload>
    </div>
  );
};

export default ProfileUpload;
