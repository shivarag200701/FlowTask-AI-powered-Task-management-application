import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadList,
} from "@/Components/ui/file-upload";
import { useState } from "react";
import { CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";

// type UploadOptions = {
//   onProgress: (file: File, progress: number) => void;
//   onSuccess: (file: File) => void;
//   onError: (file: File, error: Error) => void;
// };

interface ProfileUploadProps {
  className?: string;
  onChange?: (file: File | undefined) => void;
  value?: File | string;
}

const ProfileUpload = ({ className, onChange, value }: ProfileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);

  // const handleFileUpload = async (
  //   files: File[],
  //   { onProgress, onSuccess, onError }: UploadOptions,
  // ) => {
  //   for (const file of files) {
  //     try {
  //       onProgress(file);
  //       console.log("here");
  //       onSuccess(file);
  //     } catch (err) {
  //       onError(file, err instanceof Error ? err : new Error(String(err)));
  //       console.log(err);
  //     }
  //   }
  // };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <FileUpload
        value={files}
        maxSize={4 * 1024 * 1024}
        onValueChange={(newFiles) => {
          const latest = newFiles.slice(-1);
          setFiles(latest);
          onChange?.(latest[0]);
        }}
        accept=".png,.jpeg"
      >
        <FileUploadDropzone className="h-30 w-30 rounded-full hover:border-accent cursor-pointer">
          {files.length === 0 && (
            <div className="text-gray-400 flex flex-col gap-1 items-center">
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
