import React, { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: string, filename: string) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = 'image/*,.pdf',
  maxSize = 10 * 1024 * 1024,
  label = 'Upload File'
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    setError('');

    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      setFilename(file.name);
      onFileSelect(base64String, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const clearFile = () => {
    setPreview(null);
    setFilename('');
    setError('');
  };

  const getFileIcon = () => {
    if (!filename) return <Upload className="w-8 h-8 text-gray-400" />;
    if (filename.endsWith('.pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    return <ImageIcon className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              {getFileIcon()}
              <p className="mt-2 text-sm text-gray-600">
                Drag & drop your file here, or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Supports: {accept} (Max {maxSize / 1024 / 1024}MB)
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="relative border-2 border-gray-300 rounded-lg p-4">
          <button
            onClick={clearFile}
            className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {getFileIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{filename}</p>
              <p className="text-xs text-gray-500">File ready for upload</p>
            </div>
          </div>

          {preview && !filename.endsWith('.pdf') && (
            <div className="mt-4">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-lg mx-auto"
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
