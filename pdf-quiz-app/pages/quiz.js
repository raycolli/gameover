import { useState } from "react";
import axios from "axios";

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

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [validationPdfUploaded, setValidationPdfUploaded] = useState(false);
  const [validationPdfText, setValidationPdfText] = useState("");
  const [pdfText, setPdfText] = useState("");

  const handleFileUpload = async (file) => {
    try {
      const text = await extractTextFromPdf(file);
      setPdfText(text);
      
      const response = await axios.post('/api/generate-questions', {
        pdfContent: text
      });
      
      setQuestions(response.data.questions);
      setShowQuiz(true);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF file');
    }
  };

  const handleValidationPdfUpload = async (file) => {
    try {
      const text = await extractTextFromPdf(file);
      setValidationPdfText(text);
      setValidationPdfUploaded(true);
      alert('Validation PDF uploaded successfully!');
    } catch (error) {
      console.error('Error processing validation PDF:', error);
      alert('Error uploading validation PDF');
    }
  };

  const handleAnswerSelection = async (answer) => {
    if (!questions[currentQuestionIndex]) return;
    
    if (!validationPdfUploaded) {
      alert('Please upload the validation PDF first!');
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {!showQuiz ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Upload PDF to Generate Quiz
          </h1>
          <div className="space-y-4">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="block w-full text-sm text-gray-500 
                file:mr-4 file:py-2 file:px-4 
                file:rounded-full file:border-0 
                file:text-sm file:font-semibold 
                file:bg-blue-50 file:text-blue-700 
                hover:file:bg-blue-100"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {!validationPdfUploaded && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upload Validation PDF
              </h2>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleValidationPdfUpload(e.target.files[0])}
                className="block w-full text-sm text-gray-500 
                  file:mr-4 file:py-2 file:px-4 
                  file:rounded-full file:border-0 
                  file:text-sm file:font-semibold 
                  file:bg-blue-50 file:text-blue-700 
                  hover:file:bg-blue-100"
              />
            </div>
          )}

          {!quizComplete ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-lg text-gray-800 mb-4">
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
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
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
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
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
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={currentQuestionIndex === 0}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <span className="text-gray-600">
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
                    currentQuestionIndex < questions.length - 1 && feedback.includes('✅')
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={currentQuestionIndex === questions.length - 1 || !feedback.includes('✅')}
                >
                  Next
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
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
    </div>
  );
}
