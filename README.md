# RAG Chatbot

A Retrieval Augmented Generation (RAG) chatbot built with React, Firebase, and Google's Gemini AI. Upload PDF or Word documents and chat with their content using advanced AI capabilities.

## Features

- **User Authentication**: Secure sign-up and login with Firebase Auth
- **Document Upload**: Support for PDF and Word (.docx) files
- **Document Processing**: Automatic text extraction and chunking for optimal RAG performance
- **AI-Powered Chat**: Intelligent responses using Google's Gemini AI model
- **RAG Implementation**: Context-aware responses based on uploaded documents
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Real-time Chat**: Interactive chat interface with typing indicators

## Tech Stack

- **Frontend**: React 19, JavaScript, Tailwind CSS
- **Authentication & Storage**: Firebase (Auth, Firestore, Storage)
- **AI/ML**: Google Gemini API
- **Document Processing**: PDF.js, Mammoth.js
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Deployment**: Vercel-ready

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd rag-chatbot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your API keys:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Enable Storage
5. Get your Firebase configuration and update the `.env` file

### 5. Gemini API Setup
1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the API key to your `.env` file

### 6. Run the Application

#### Development
```bash
npm run dev
```

#### Build for Production
```bash
npm run build
```

#### Preview Production Build
```bash
npm run preview
```

## Deployment to Vercel

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

The `vercel.json` configuration is already included for proper SPA routing.

## Usage

1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Upload Documents**: Click "Upload Documents" and drag & drop PDF or Word files
3. **Start Chatting**: Ask questions about your uploaded documents
4. **RAG in Action**: The AI will provide context-aware answers based on document content

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ChatInterface.jsx
│   ├── FileUpload.jsx
│   └── ProtectedRoute.jsx
├── contexts/          # React contexts
│   └── AuthContext.jsx
├── pages/             # Page components
│   ├── LandingPage.jsx
│   └── ChatPage.jsx
├── services/          # API and utility services
│   ├── gemini.js
│   └── documentProcessor.js
├── App.jsx           # Main app component
├── firebase.js       # Firebase configuration
└── main.jsx         # App entry point
```

## Features in Detail

### Document Processing
- **PDF Support**: Extracts text from PDF files using PDF.js
- **Word Support**: Processes .docx files using Mammoth.js
- **Text Chunking**: Splits documents into optimal chunks for RAG
- **File Management**: Upload multiple documents with preview

### RAG Implementation
- **Context Retrieval**: Finds relevant document chunks based on user queries
- **Relevance Scoring**: Simple keyword-based scoring for chunk selection
- **Context Integration**: Combines relevant chunks with user questions
- **Fallback Responses**: Handles queries when no relevant context is found

### Authentication
- **Firebase Auth**: Secure user authentication
- **Protected Routes**: Route protection for authenticated users
- **Session Management**: Persistent login state

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
