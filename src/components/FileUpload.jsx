import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  DocumentIcon, 
  XMarkIcon, 
  CloudArrowUpIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { processDocument, chunkText } from '../services/documentProcessor';

const FileUpload = ({ onDocumentsProcessed }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    console.log('Files dropped:', acceptedFiles);
    setError('');
    setProcessing(true);

    try {
      const processedDocs = [];
      
      for (const file of acceptedFiles) {
        console.log('Processing file:', file.name, 'Type:', file.type);
        
        try {
          // Add longer timeout for PDF processing
          const timeoutDuration = file.type === 'application/pdf' ? 60000 : 30000; // 60s for PDFs, 30s for others
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Processing timeout - file may be too large or complex')), timeoutDuration)
          );
          
          const processPromise = processDocument(file);
          const text = await Promise.race([processPromise, timeoutPromise]);
          
          console.log('Extracted text length:', text.length);
          
          if (!text || text.trim().length === 0) {
            throw new Error('No text could be extracted from the file');
          }
          
          const chunks = chunkText(text);
          console.log('Created chunks:', chunks.length);
          
          processedDocs.push({
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            text,
            chunks
          });
          
          console.log('Successfully processed:', file.name);
          
        } catch (fileError) {
          console.error('Error processing file:', file.name, fileError);
          setError(`Failed to process ${file.name}: ${fileError.message}`);
          continue;
        }
      }

      if (processedDocs.length > 0) {
        console.log('All files processed successfully:', processedDocs.length);
        setUploadedFiles(prev => [...prev, ...processedDocs]);
        onDocumentsProcessed(processedDocs);
      } else {
        setError('No files could be processed successfully.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  }, [onDocumentsProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB limit
    onDropRejected: (rejectedFiles) => {
      const reasons = rejectedFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.map(e => e.message).join(', ')}`
      ).join('\n');
      setError(`Some files were rejected:\n${reasons}`);
    }
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`group border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-indigo-400 bg-indigo-50/50 scale-105' 
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragActive 
              ? 'bg-indigo-100 text-indigo-600' 
              : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
          }`}>
            {isDragActive ? (
              <CloudArrowUpIcon className="h-8 w-8" />
            ) : (
              <DocumentIcon className="h-8 w-8" />
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-base font-medium text-gray-900">
              {isDragActive
                ? 'Drop your files here'
                : 'Upload your documents'}
            </p>
            <p className="text-sm text-gray-600">
              {isDragActive
                ? 'Release to upload'
                : 'Drag & drop files here, or click to browse'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="px-2 py-1 bg-red-50 text-red-700 rounded-md font-medium">
              PDF (.pdf)
            </span>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
              Word (.docx, .doc)
            </span>
            <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md font-medium">
              Text (.txt)
            </span>
          </div>
          
          <p className="text-xs text-gray-500">
            Maximum file size: 50MB per file
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl">
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <div>
              <p className="text-sm font-medium">Processing your documents...</p>
              <p className="text-xs text-blue-600 mt-1">
                PDF files may take longer to process depending on size and complexity
              </p>
            </div>
          </div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
            Processed Documents ({uploadedFiles.length})
          </h3>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DocumentIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.chunks.length} chunks</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;