import { env } from "@/env/client-env";
import type React from "react";
import { useState } from "react";
import useFileUpload, { type UploadResult } from "../../lib/hooks/file-upload/use-file-upload";

// Example component showing how to use the useFileUpload hook
export default function FileUploadExample() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);

  // Initialize the hook with your S3-compatible storage configuration
  const {
    uploadFile,
    uploadFiles,
    handleFileInputChange,
    isUploading,
    progress,
    error,
    resetError,
  } = useFileUpload({
    endpoint: env.NEXT_PUBLIC_R2_ENDPOINT || "",
    accessKeyId: env.NEXT_PUBLIC_R2_ACCESS_KEY_ID || "",
    secretAccessKey: env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY || "",
    bucket: env.NEXT_PUBLIC_R2_BUCKET_NAME || "",
    publicUrl: env.NEXT_PUBLIC_R2_PUBLIC_URL,
  });

  // Handle single file upload
  const handleSingleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        keyPrefix: "uploads/",
        public: true,
      });

      setUploadedFiles((prev) => [...prev, result]);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  // Handle multiple file upload
  const handleMultipleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const results = await uploadFiles(Array.from(files), {
        maxSize: 10 * 1024 * 1024, // 10MB
        keyPrefix: "uploads/",
        acceptedFileTypes: ["image/*", ".pdf", ".gpx", ".kml"],
        public: true,
      });

      setUploadedFiles((prev) => [...prev, ...results]);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  // Handle file upload with automatic handling via the convenience method
  const handleAutoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const result = await handleFileInputChange(event, {
      maxSize: 10 * 1024 * 1024, // 10MB
      keyPrefix: "uploads/",
      public: true,
    });

    if (result) {
      if (Array.isArray(result)) {
        setUploadedFiles((prev) => [...prev, ...result]);
      } else {
        setUploadedFiles((prev) => [...prev, result]);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 font-bold text-2xl">File Upload Example</h1>

      {/* Error display */}
      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p className="font-bold">Upload Error</p>
          <p>{error.message}</p>
          <button onClick={resetError} className="mt-2 rounded bg-red-500 px-3 py-1 text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Progress display */}
      {isUploading && progress && (
        <div className="mb-4">
          <p>Uploading: {progress.percentage}%</p>
          <div className="h-2.5 w-full rounded-full bg-gray-200">
            <div
              className="h-2.5 rounded-full bg-blue-600"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-gray-500 text-sm">
            {Math.round(progress.loaded / 1024)} KB of {Math.round(progress.total / 1024)} KB
          </p>
        </div>
      )}

      {/* Upload forms */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <h2 className="mb-2 font-bold">Single File Upload</h2>
          <input
            type="file"
            onChange={handleSingleFileUpload}
            disabled={isUploading}
            className="block w-full text-gray-500 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 file:text-sm hover:file:bg-blue-100"
          />
        </div>

        <div className="rounded border p-4">
          <h2 className="mb-2 font-bold">Multiple File Upload</h2>
          <input
            type="file"
            multiple
            onChange={handleMultipleFileUpload}
            disabled={isUploading}
            className="block w-full text-gray-500 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 file:text-sm hover:file:bg-blue-100"
          />
        </div>

        <div className="rounded border p-4">
          <h2 className="mb-2 font-bold">Auto-Handled Upload</h2>
          <input
            type="file"
            multiple
            onChange={handleAutoUpload}
            disabled={isUploading}
            className="block w-full text-gray-500 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 file:text-sm hover:file:bg-blue-100"
          />
        </div>
      </div>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div>
          <h2 className="mb-2 font-bold text-xl">Uploaded Files</h2>
          <div className="overflow-hidden rounded border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {uploadedFiles.map((file, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        {file.file.type.startsWith("image/") ? (
                          <img
                            src={file.url}
                            alt={file.file.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                            <span className="text-xs">{file.file.name.split(".").pop()}</span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 text-sm">{file.file.name}</div>
                          <div className="text-gray-500 text-sm">
                            {(file.file.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="max-w-xs truncate text-gray-900 text-sm">{file.url}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-sm">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mr-4 text-blue-600 hover:text-blue-900"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
