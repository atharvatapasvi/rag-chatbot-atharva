import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';

// Configure PDF.js worker - using exact version match
if (typeof window !== 'undefined') {
  // Use locally bundled worker to avoid CORS issues
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
}

export const extractTextFromPDF = async (file) => {
  try {
    console.log('Starting PDF text extraction for:', file.name);
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('PDF processing timeout')), 30000)
    );
    
    const extractionPromise = (async () => {
      const arrayBuffer = await file.arrayBuffer();
      console.log('Got PDF array buffer, size:', arrayBuffer.byteLength);
      
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0 // Reduce console output
      });
      
      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 50); // Limit pages to prevent memory issues
      
      for (let i = 1; i <= maxPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter(item => item.str && item.str.trim())
            .map(item => item.str)
            .join(' ');
          
          if (pageText.trim()) {
            fullText += pageText + '\n\n';
          }
          
          // Cleanup page resources
          page.cleanup();
          
          console.log(`Processed page ${i}/${maxPages}`);
        } catch (pageError) {
          console.warn(`Error processing page ${i}:`, pageError);
          continue; // Skip problematic pages
        }
      }
      
      // Cleanup PDF resources
      pdf.destroy();
      
      return fullText;
    })();
    
    const text = await Promise.race([extractionPromise, timeoutPromise]);
    
    console.log('PDF extraction completed, text length:', text.length);
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from this PDF. It may be image-based, encrypted, or corrupted.');
    }
    
    return text.trim();
    
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    if (error.message.includes('timeout')) {
      throw new Error('PDF processing timed out. The file may be too large or complex.');
    } else if (error.message.includes('Invalid PDF')) {
      throw new Error('Invalid PDF file. Please ensure the file is not corrupted.');
    } else if (error.message.includes('password')) {
      throw new Error('Password-protected PDFs are not supported.');
    } else if (error.message.includes('network')) {
      throw new Error('Network error while processing PDF. Please check your connection.');
    } else {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }
};

export const extractTextFromWord = async (file) => {
  try {
    console.log('Starting Word document extraction for:', file.name);
    const arrayBuffer = await file.arrayBuffer();
    console.log('Got array buffer, size:', arrayBuffer.byteLength);
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    console.log('Word extraction completed, text length:', result.value.length);
    
    if (result.value.trim().length === 0) {
      throw new Error('No text could be extracted from this Word document.');
    }
    
    return result.value;
  } catch (error) {
    console.error('Error extracting text from Word document:', error);
    if (error.message.includes('not a valid')) {
      throw new Error('Invalid Word document format. Please ensure the file is a valid .docx file.');
    } else {
      throw new Error(`Failed to extract text from Word document: ${error.message}`);
    }
  }
};

export const extractTextFromText = async (file) => {
  try {
    console.log('Starting text file extraction for:', file.name);
    const text = await file.text();
    console.log('Text extraction completed, length:', text.length);
    
    if (text.trim().length === 0) {
      throw new Error('The text file is empty.');
    }
    
    return text;
  } catch (error) {
    console.error('Error reading text file:', error);
    throw new Error(`Failed to read text file: ${error.message}`);
  }
};

export const processDocument = async (file) => {
  console.log('Processing document:', file.name, 'Type:', file.type);
  const fileType = file.type;
  
  // Validate file size (limit to 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`);
  }
  
  if (fileType === 'application/pdf') {
    return await extractTextFromPDF(file);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
             fileType === 'application/msword') {
    return await extractTextFromWord(file);
  } else if (fileType === 'text/plain') {
    return await extractTextFromText(file);
  } else {
    throw new Error(`Unsupported file type: ${fileType}. Please upload PDF, Word, or text documents.`);
  }
};

// Simple text chunking for better RAG performance
export const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  console.log('Chunking text, length:', text.length, 'chunk size:', chunkSize);
  
  if (!text || text.length === 0) {
    console.log('Empty text, returning empty array');
    return [];
  }
  
  // Ensure overlap is less than chunk size to prevent infinite loops
  const safeOverlap = Math.min(overlap, chunkSize - 1);
  const chunks = [];
  let start = 0;
  let iterationCount = 0; // Safety counter
  const maxIterations = Math.ceil(text.length / (chunkSize - safeOverlap)) + 10; // Safety limit
  
  while (start < text.length && iterationCount < maxIterations) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    // Move start position, ensuring we always progress
    const nextStart = end - safeOverlap;
    if (nextStart <= start) {
      // If we're not progressing, jump forward
      start = start + chunkSize;
    } else {
      start = nextStart;
    }
    
    iterationCount++;
    
    // Log progress for large documents
    if (iterationCount % 100 === 0) {
      console.log(`Chunking progress: ${iterationCount} chunks created, position ${start}/${text.length}`);
    }
  }
  
  console.log('Created chunks:', chunks.length);
  
  if (iterationCount >= maxIterations) {
    console.warn('Chunking stopped due to safety limit');
  }
  
  return chunks;
};

export default { extractTextFromPDF, extractTextFromWord, extractTextFromText, processDocument, chunkText };