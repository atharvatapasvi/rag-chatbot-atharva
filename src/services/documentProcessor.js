import mammoth from 'mammoth';

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
  
  if (fileType === 'application/pdf') {
    throw new Error('PDF support is temporarily disabled. Please upload Word or text documents.');
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
             fileType === 'application/msword') {
    return await extractTextFromWord(file);
  } else if (fileType === 'text/plain') {
    return await extractTextFromText(file);
  } else {
    throw new Error(`Unsupported file type: ${fileType}. Please upload Word or text documents.`);
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

export default { extractTextFromWord, extractTextFromText, processDocument, chunkText };