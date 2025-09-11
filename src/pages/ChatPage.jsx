import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import FileUpload from '../components/FileUpload';
import ChatInterface from '../components/ChatInterface';

const ChatPage = () => {
  const [documents, setDocuments] = useState([]);
  const [showUpload, setShowUpload] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDocumentsProcessed = (newDocuments) => {
    setDocuments(prev => [...prev, ...newDocuments]);
    if (showUpload && newDocuments.length > 0) {
      setShowUpload(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">RAG Chatbot</h1>
              <span className="text-sm text-gray-500">
                Welcome, {user?.email}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span>{showUpload ? 'Hide Upload' : 'Upload Documents'}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar for file upload */}
        {showUpload && (
          <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Upload Documents
              </h2>
              <p className="text-sm text-gray-600">
                Upload PDF or Word documents to chat with their content
              </p>
            </div>
            
            <FileUpload onDocumentsProcessed={handleDocumentsProcessed} />
            
            {documents.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Available Documents ({documents.length})
                </h3>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="text-xs text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      {doc.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {documents.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No documents uploaded yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload some PDF or Word documents to start chatting about their content
                </p>
                {!showUpload && (
                  <button
                    onClick={() => setShowUpload(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Upload Documents
                  </button>
                )}
              </div>
            </div>
          ) : (
            <ChatInterface documents={documents} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;