import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

export default function UploadStep({ onFileSelect }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1
  });

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 bg-white">
      <h2 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Report a Pothole</h2>
      <p className="text-gray-500 mb-8 max-w-lg text-center font-medium">
        Upload a clear image of the road anomaly. Our AI will verify it instantly before we collect location details.
      </p>

      <div
        {...getRootProps()}
        className={`w-full max-w-2xl p-16 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 scale-95 ${
          isDragActive
            ? 'border-green bg-green-50 scale-100 shadow-xl'
            : 'border-gray-200 hover:border-green/50 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className={`w-20 h-20 mb-6 transition-colors duration-300 ${isDragActive ? 'text-green-500' : 'text-gray-400'}`} />

        {isDragActive ? (
          <p className="text-2xl font-black text-green tracking-tight uppercase">Drop the image here...</p>
        ) : (
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 mb-2 uppercase">Drag &amp; drop an image here</p>
            <p className="text-gray-500 font-medium">or click to browse your files</p>
            <p className="text-[10px] text-gray-400 mt-6 font-black uppercase tracking-[0.3em]">
              Supports JPG, PNG, WEBP up to 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

