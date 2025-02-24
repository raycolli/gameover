import { useState, useEffect } from "react";
import axios from "axios";
import { withAuth } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

// Import PDF.js in a way that works with Next.js
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// Initialize the worker in a way that works with Next.js
if (typeof window !== 'undefined') {
  const pdfjsWorker = require('pdfjs-dist/legacy/build/pdf.worker.entry');
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

const extractTextFromPdf = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Get text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      fullText += pageText + ' ';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

const extractTextFromTxt = async (file) => {
  try {
    const text = await file.text();
    return text;
  } catch (error) {
    console.error('Error extracting text from TXT:', error);
    throw new Error('Failed to extract text from TXT');
  }
};

const extractTextFromDoc = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/extract-doc', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to extract text from DOC/DOCX');
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error extracting text from DOC/DOCX:', error);
    throw new Error(error.message || 'Failed to extract text from DOC/DOCX');
  }
};

const extractTextFromFile = async (file) => {
  const fileType = file.name.split('.').pop().toLowerCase();
  
  switch (fileType) {
    case 'pdf':
      return extractTextFromPdf(file);
    case 'txt':
      return extractTextFromTxt(file);
    case 'doc':
    case 'docx':
      return extractTextFromDoc(file);
    default:
      throw new Error('Unsupported file type');
  }
};

function Quiz() {
  const { userProfile } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [validationPdfUploaded, setValidationPdfUploaded] = useState(false);
  const [validationPdfText, setValidationPdfText] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [expandedNoteIndex, setExpandedNoteIndex] = useState(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isValidationFileUploading, setIsValidationFileUploading] = useState(false);
  const router = useRouter();

  // Handler functions remain the same
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('burrow')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setIsFileUploading(true);
      const text = await extractTextFromFile(file);
      if (!text) {
        throw new Error('No text could be extracted from the file');
      }
      
      setPdfText(text);
      
      const response = await axios.post('/api/generate-questions', {
        pdfContent: text,
        questionCount: questionCount
      });
      
      if (!response.data.questions) {
        throw new Error('No questions were generated');
      }
      
      setQuestions(response.data.questions);
      setShowQuiz(true);
    } catch (error) {
      console.error('Error processing file:', error);
      alert(error.message || 'Error processing file');
    } finally {
      setIsFileUploading(false);
    }
  };

  const handleValidationPdfUpload = async (file) => {
    try {
      setIsValidationFileUploading(true);
      const text = await extractTextFromFile(file);
      if (!text) {
        throw new Error('No text could be extracted from the file');
      }
      
      setValidationPdfText(text);
      setValidationPdfUploaded(true);
    } catch (error) {
      console.error('Error processing validation file:', error);
      alert(error.message || 'Error uploading validation file');
      setValidationPdfUploaded(false);
      setValidationPdfText('');
    } finally {
      setIsValidationFileUploading(false);
    }
  };

  const handleAnswerSelection = async (answer) => {
    if (!questions[currentQuestionIndex]) return;
    
    if (!validationPdfUploaded) {
      alert('Please upload the validation file first!');
      return;
    }

    setSelectedAnswer(answer);
    setFeedback("Checking answer...");
    
    const currentQuestion = questions[currentQuestionIndex];
    
    try {
      const response = await axios.post("/api/check-answer", {
        question: currentQuestion.question,
        selectedAnswer: answer,
        options: currentQuestion.options,
        pdfContent: validationPdfText
      });

      const { isCorrect, explanation } = response.data;

      if (isCorrect) {
        setFeedback(`✅ Correct! ${explanation}`);
      } else {
        setFeedback(`❌ Incorrect. ${explanation}`);
      }
    } catch (error) {
      console.error("Error checking answer:", error);
      setFeedback("❌ Error checking answer. Please try again.");
    }
  };

  const handleSaveNote = async () => {
    try {
      const { data, error } = await supabase
        .from('burrow')
        .insert([
          {
            title: noteTitle,
            body: noteBody,
            user_id: userProfile.id
          }
        ]);

      if (error) throw error;

      // Clear the form
      setNoteTitle('');
      setNoteBody('');
      
      // Refresh the notes list
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const { error } = await supabase
        .from('burrow')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const toggleNoteExpansion = (index) => {
    setExpandedNoteIndex(expandedNoteIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl bg-gray-900 text-white">
      {!showQuiz ? (
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-blue-400 mb-6">
            Upload File to Generate Quiz
          </h1>
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Number of Questions (1-20)</label>
              <input
                type="text"
                pattern="[0-9]*"
                value={questionCount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setQuestionCount('');
                  } else {
                    const num = parseInt(value);
                    if (!isNaN(num)) {
                      setQuestionCount(Math.min(20, Math.max(1, num)));
                    }
                  }
                }}
                onBlur={() => {
                  if (questionCount === '' || questionCount < 1) {
                    setQuestionCount(1);
                  }
                }}
                className="w-full p-2 bg-gray-700 text-white rounded-lg"
              />
            </div>
            <div>
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className={`block w-full text-sm text-gray-300 
                  file:mr-4 file:py-2 file:px-4 
                  file:rounded-full file:border-0 
                  file:text-sm file:font-semibold 
                  file:bg-gray-700 file:text-white 
                  hover:file:bg-gray-600
                  ${isFileUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isFileUploading}
              />
              {isFileUploading && (
                <div className="mt-2 text-blue-400">
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {!validationPdfUploaded && (
            <div className="bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-blue-400 mb-4">
                Upload Validation File
              </h2>
              <div>
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={(e) => handleValidationPdfUpload(e.target.files[0])}
                  className={`block w-full text-sm text-gray-300 
                    file:mr-4 file:py-2 file:px-4 
                    file:rounded-full file:border-0 
                    file:text-sm file:font-semibold 
                    file:bg-gray-700 file:text-white 
                    hover:file:bg-gray-600
                    ${isValidationFileUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isValidationFileUploading}
                />
                {isValidationFileUploading && (
                  <div className="mt-2 text-blue-400">
                    Loading...
                  </div>
                )}
              </div>
            </div>
          )}

          {!quizComplete ? (
            <div className="bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-blue-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h2>
                  <span className="px-3 py-1 bg-gray-700 text-blue-400 rounded-full text-sm font-medium">
                    {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-700 rounded-full">
                  <div
                    className="h-2 bg-blue-400 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-lg text-gray-300 mb-4">
                  {questions[currentQuestionIndex]?.question}
                </p>
                <div className="space-y-3">
                  {questions[currentQuestionIndex]?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelection(option)}
                      className={`w-full p-4 text-left rounded-lg transition-all duration-200 
                        ${selectedAnswer === option
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                    </button>
                  ))}
                </div>
              </div>

              {feedback && (
                <div className={`p-4 rounded-lg mb-4 ${
                  feedback.includes('✅')
                    ? 'bg-green-900 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  {feedback}
                </div>
              )}

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                      setSelectedAnswer(null);
                      setFeedback("");
                    }
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentQuestionIndex > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={currentQuestionIndex === 0}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <span className="text-gray-300">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>

                <button
                  onClick={() => {
                    if (currentQuestionIndex < questions.length - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                      setSelectedAnswer(null);
                      setFeedback("");
                    }
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentQuestionIndex < questions.length - 1
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-blue-400 mb-6">
                Quiz Complete! 🎉
              </h2>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg 
                  hover:bg-blue-700 transition-colors duration-200
                  font-semibold"
              >
                Start New Quiz
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-blue-400 mb-4">Stash</h2>
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Note "
        />
        <textarea
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          rows="6"
          className="w-full p-4 mb-4 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nibble away at your thoughts…"
        />
        <button
          onClick={handleSaveNote}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Save Note
        </button>
      </div>

      
    </div>
  );
}

// Wrap the Quiz component with withAuth to protect it
export default withAuth(Quiz, ['user', 'admin']);
