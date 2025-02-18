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

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [validationPdfUploaded, setValidationPdfUploaded] = useState(false);
  const [validationPdfText, setValidationPdfText] = useState("");

  const handleQuizPdfUpload = async (file) => {
    try {
      setFeedback("Processing PDF...");
      const text = await extractTextFromPdf(file);
      
      if (!text) {
        throw new Error('No text was extracted from the PDF');
      }

      console.log('Sending PDF content to API...');
      const response = await axios.post('/api/generate-questions', {
        pdfContent: text
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      if (!response.data || !response.data.questions) {
        throw new Error('Invalid response from server');
      }

      setQuestions(response.data.questions);
      setShowQuiz(true);
      setValidationPdfUploaded(false);
      setFeedback("");
    } catch (error) {
      console.error('Error details:', error);
      setFeedback(`Error: ${error.message || 'Failed to process PDF'}`);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  const handleValidationPdfUpload = async (file) => {
    try {
      setFeedback("Processing validation PDF...");
      const text = await extractTextFromPdf(file);
      
      if (!text) {
        throw new Error('No text was extracted from the validation PDF');
      }

      setValidationPdfText(text);
      setValidationPdfUploaded(true);
      setFeedback("Validation PDF uploaded successfully!");
    } catch (error) {
      console.error('Error processing validation PDF:', error);
      setFeedback(`Error: ${error.message || 'Failed to process validation PDF'}`);
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
        
        setTimeout(() => {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setFeedback("");
          } else {
            setQuizComplete(true);
          }
        }, 2000);
      } else {
        setFeedback(`❌ Incorrect. ${explanation}`);
      }
    } catch (error) {
      console.error("Error checking answer:", error);
      setFeedback("❌ Error checking answer. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      {!showQuiz ? (
        <div className="text-center">
          <h1 className="text-2xl mb-4">Upload PDF to Generate Quiz</h1>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleQuizPdfUpload(e.target.files[0])}
            className="mb-4"
          />
        </div>
      ) : (
        <div>
          {!validationPdfUploaded && (
            <div className="text-center mb-4">
              <h2 className="text-xl mb-2">Upload Validation PDF</h2>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleValidationPdfUpload(e.target.files[0])}
                className="mb-4"
              />
            </div>
          )}
          
          {!quizComplete ? (
            <div>
              <h2 className="text-xl mb-4">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <p className="mb-4">{questions[currentQuestionIndex]?.question}</p>
              <div className="space-y-2">
                {questions[currentQuestionIndex]?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelection(option)}
                    className={`w-full p-2 text-left rounded ${
                      selectedAnswer === option
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {feedback && (
                <div className="mt-4 p-2 rounded bg-gray-100">
                  {feedback}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl">Quiz Complete!</h2>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
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
