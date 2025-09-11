import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  UserIcon, 
  ChatBubbleLeftIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { generateResponse } from '../services/gemini';

const ChatInterface = ({ documents }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. I've analyzed your documents and I'm ready to answer questions about them. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findRelevantContext = (query) => {
    console.log('Finding relevant context for query:', query);
    
    if (!documents || documents.length === 0) {
      console.log('No documents available');
      return '';
    }

    // Simple keyword-based relevance scoring with performance optimizations
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    console.log('Query words:', queryWords);
    
    if (queryWords.length === 0) {
      console.log('No valid query words');
      return '';
    }
    
    let bestChunks = [];
    let processedChunks = 0;
    const maxChunksToProcess = 1000; // Limit processing for performance

    documents.forEach(doc => {
      console.log(`Processing document: ${doc.name} with ${doc.chunks.length} chunks`);
      
      doc.chunks.forEach((chunk, index) => {
        if (processedChunks >= maxChunksToProcess) {
          return; // Stop processing if we've hit the limit
        }
        
        let score = 0;
        const chunkLower = chunk.toLowerCase();
        
        queryWords.forEach(word => {
          // Use indexOf instead of regex for better performance
          let pos = 0;
          let count = 0;
          while ((pos = chunkLower.indexOf(word, pos)) !== -1) {
            count++;
            pos += word.length;
            if (count > 10) break; // Limit count per word to prevent excessive processing
          }
          score += count;
        });

        if (score > 0) {
          bestChunks.push({ chunk, score, docName: doc.name });
        }
        
        processedChunks++;
      });
    });

    console.log(`Processed ${processedChunks} chunks, found ${bestChunks.length} relevant chunks`);

    // Sort by relevance and take top 3 chunks
    bestChunks.sort((a, b) => b.score - a.score);
    const topChunks = bestChunks.slice(0, 3);
    
    console.log('Top chunks scores:', topChunks.map(c => c.score));

    return topChunks.map(item => `From ${item.docName}: ${item.chunk}`).join('\n\n');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = findRelevantContext(inputMessage);
      const response = await generateResponse(inputMessage, context);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error while processing your message. Please make sure your API keys are configured correctly.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white/50 to-gray-50/50">
      {/* Enhanced Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-3xl rounded-br-lg'
                  : 'bg-white text-gray-800 rounded-3xl rounded-bl-lg shadow-sm border border-gray-100'
              } px-6 py-4`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' 
                    ? 'bg-white/20' 
                    : 'bg-gradient-to-br from-indigo-100 to-purple-100'
                }`}>
                  {message.sender === 'bot' ? (
                    <SparklesIcon className="h-4 w-4 text-indigo-600" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 max-w-xs lg:max-w-2xl px-6 py-4 rounded-3xl rounded-bl-lg shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <SparklesIcon className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area */}
      <div className="border-t border-gray-200/50 bg-white/80 backdrop-blur-sm p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your documents..."
                className="w-full resize-none border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm text-gray-900 placeholder-gray-500 transition-all duration-200"
                rows="1"
                disabled={isLoading}
                style={{ minHeight: '56px', maxHeight: '120px' }}
              />
              {inputMessage && (
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  Press Enter to send
                </div>
              )}
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* Quick suggestions */}
          {messages.length === 1 && documents.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "What is this document about?",
                  "Summarize the key points",
                  "What are the main topics discussed?"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(suggestion)}
                    className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;