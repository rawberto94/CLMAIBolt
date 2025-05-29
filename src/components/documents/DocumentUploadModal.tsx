import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentUploadModalProps {
  onClose: () => void;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploadStep, setUploadStep] = useState<'select' | 'processing' | 'classify'>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    
    setUploadStep('processing');
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadStep('classify');
        }, 500);
      }
    }, 150);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const renderFileList = () => {
    return files.map((file, index) => (
      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md mb-2">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-primary-500 mr-2" />
          <div>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <button 
          className="text-gray-400 hover:text-gray-500"
          onClick={() => removeFile(index)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {uploadStep === 'select' && 'Upload Documents'}
                {uploadStep === 'processing' && 'Processing Documents'}
                {uploadStep === 'classify' && 'Document Classification'}
              </h3>
              
              <div className="mt-4">
                {uploadStep === 'select' && (
                  <>
                    <div 
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                        dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                          >
                            <span>Upload files</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              multiple
                              onChange={handleFileSelect}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX up to 10MB
                        </p>
                      </div>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected files:</h4>
                        <div className="max-h-40 overflow-y-auto">
                          {renderFileList()}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {uploadStep === 'processing' && (
                  <div className="mt-4">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Uploading and processing documents...</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{uploadProgress}% complete</p>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">
                        We are analyzing your documents for key legal information.
                      </p>
                    </div>
                  </div>
                )}

                {uploadStep === 'classify' && (
                  <div className="mt-4">
                    <div className="space-y-4">
                      {files.map((file, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <FileText className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Processed
                            </span>
                          </div>

                          <div className="mt-4">
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Document Type</label>
                                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                  <option>Contract</option>
                                  <option>NDA</option>
                                  <option>Legal Opinion</option>
                                  <option>Report</option>
                                  <option>Policy</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Tags</label>
                                <input
                                  type="text"
                                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  placeholder="Enter tags separated by commas"
                                />
                              </div>
                              
                              {index === 0 && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                  <div className="flex">
                                    <div className="flex-shrink-0">
                                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-sm text-yellow-700">
                                        Potentially missing signature on page 4.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            {uploadStep === 'select' && (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleUpload}
                disabled={files.length === 0}
              >
                Upload & Process
              </button>
            )}

            {uploadStep === 'classify' && (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Complete Upload
              </button>
            )}

            {uploadStep !== 'processing' && (
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;