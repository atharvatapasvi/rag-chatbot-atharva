import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRightOnRectangleIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import FileUpload from '../components/FileUpload';
import ChatInterface from '../components/ChatInterface';
import ErrorBoundary from '../components/ErrorBoundary';

const ChatPage = () => {
  const [documents, setDocuments] = useState([]);
  const [showUpload, setShowUpload] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState('');
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
    try {
      console.log('Processing new documents:', newDocuments.length);
      
      // Validate documents before adding them
      const validDocuments = newDocuments.filter(doc => 
        doc && doc.chunks && Array.isArray(doc.chunks) && doc.chunks.length > 0
      );
      
      if (validDocuments.length === 0) {
        setError('No valid documents to process');
        return;
      }
      
      setDocuments(prev => {
        const updated = [...prev, ...validDocuments];
        console.log('Total documents now:', updated.length);
        return updated;
      });
      
      if (showUpload && validDocuments.length > 0) {
        setShowUpload(false);
      }
      
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error processing documents:', err);
      setError('Failed to process documents');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  RAG Chatbot -project by Atharva and Sumaiyya
                </h1>
              </div>
              <div className="hidden sm:block">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  Welcome, {user?.email?.split('@')[0]}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Mobile sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                {sidebarOpen ? (
                  <XMarkIcon className="h-5 w-5" />
                ) : (
                  <Bars3Icon className="h-5 w-5" />
                )}
              </button>

              {/* Desktop upload toggle */}
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="hidden lg:flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span>{showUpload ? 'Hide Upload' : 'Upload Documents'}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-400 p-4 mx-4 mt-2 rounded-r-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => setError('')}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline transition-colors duration-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Sidebar */}
        {(showUpload || sidebarOpen) && (
          <div className={`${sidebarOpen ? 'w-80' : 'w-0'} lg:w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 transition-all duration-300 ease-in-out overflow-hidden`}>
            <div className="h-full overflow-y-auto p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
                    <DocumentTextIcon className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Document Library
                  </h2>
                </div>
                <p className="text-sm text-gray-600">
                  Upload and manage your documents for AI-powered conversations
                </p>
              </div>
              
              <ErrorBoundary>
                <FileUpload onDocumentsProcessed={handleDocumentsProcessed} />
              </ErrorBoundary>
              
              {documents.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Active Documents ({documents.length})
                  </h3>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.name}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">
                                {doc.chunks.length} chunks
                              </span>
                              <span className="text-xs text-gray-500">
                                {(doc.text.length / 1000).toFixed(1)}k chars
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm">
          {documents.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <DocumentTextIcon className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No Documents Yet
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Upload your first document to start having intelligent conversations with your content using AI. Supports PDF, Word, and text files.
                </p>
                {!showUpload && (
                  <button
                    onClick={() => {
                      setShowUpload(true);
                      setSidebarOpen(true);
                    }}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Upload Your First Document
                  </button>
                )}
                
                {/* Feature highlights */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Multiple Formats</p>
                      <p className="text-xs text-gray-600">Word, Text files supported</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Smart Conversations</p>
                      <p className="text-xs text-gray-600">AI-powered document analysis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ErrorBoundary>
              <ChatInterface documents={documents} />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;