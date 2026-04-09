import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

export default function UploadStep({ onFileSelect }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Report a Pothole</h2>
      <p className="text-gray-500 mb-8 max-w-lg text-center">
        Upload an image of the pothole. Our AI will verify it instantly before we collect the location details.
      </p>

      <div 
        {...getRootProps()} 
        className={`w-full max-w-2xl p-12 border-4 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-green-500 bg-green-50 scale-105' 
            : 'border-gray-300 hover:border-brown hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className={`w-20 h-20 mb-6 transition-colors duration-300 ${isDragActive ? 'text-green-500' : 'text-gray-400'}`} />
        
        {isDragActive ? (
          <p className="text-2xl font-semibold text-green-600">Drop the image here...</p>
        ) : (
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Drag & drop an image here
            </p>
            <p className="text-gray-500">
              or click to browse your files
            </p>
            <p className="text-xs text-gray-400 mt-4 font-medium uppercase tracking-wider">
              Supports JPG, PNG, WEBP up to 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
