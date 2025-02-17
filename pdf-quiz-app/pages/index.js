import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [quizComplete, setQuizComplete] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64File = reader.result.split(",")[1]; // Extract base64 data

      try {
        const response = await axios.post("/api/upload", { file: base64File });
        const formattedQuestions = formatQuestions(response.data.questions);
        setQuestions(formattedQuestions);
        setCurrentQuestionIndex(0); // Reset to first question
        setQuizComplete(false);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to generate quiz. Check the console for details.");
      }
    };
  };

  // 🛠 FIX: Properly extract correct answers from OpenAI response
  const formatQuestions = (text) => {
    const questionBlocks = text.split("\n\n").filter((block) => block.includes("?"));
    return questionBlocks.map((block) => {
      const lines = block.split("\n");
      const questionText = lines[0]; // First line is the question
      const options = lines.slice(1, 5).map((option) => option.trim()); // Next 4 lines are answer choices
      let correctAnswer = options.find((option) => option.includes("*"));

      if (correctAnswer) {
        correctAnswer = correctAnswer.replace("*", "").trim(); // Remove * from correct answer
      }

      return {
        question: questionText,
        options: options.map((option) => option.replace("*", "").trim()), // Remove * from all options
        correctAnswer: correctAnswer,
      };
    });
  };

  const handleAnswerSelection = async (answer) => {
    if (!questions[currentQuestionIndex]) return;

    setSelectedAnswer(answer);
    setFeedback("Checking answer...");
    
    const currentQuestion = questions[currentQuestionIndex];
    
    try {
      const response = await axios.post("/api/check-answer", {
        question: currentQuestion.question,
        selectedAnswer: answer,
        options: currentQuestion.options
      });

      const isCorrect = response.data.isCorrect;

      if (isCorrect) {
        setFeedback("✅ Correct!");
        
        // Move to the next question after a short delay
        setTimeout(() => {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setFeedback("");
          } else {
            setQuizComplete(true);
          }
        }, 1000);
      } else {
        setFeedback("❌ Incorrect. Try again.");
      }
    } catch (error) {
      console.error("Error checking answer:", error);
      setFeedback("❌ Error checking answer. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>PDF Quiz Generator</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>Upload & Generate Quiz</button>

      {quizComplete ? (
        <h3>🎉 Quiz Complete! Well done! 🎉</h3>
      ) : (
        questions.length > 0 && (
          <div>
            <h3>{questions[currentQuestionIndex].question}</h3>
            {questions[currentQuestionIndex].options.map((option, index) => (
              <button 
                key={index} 
                onClick={() => handleAnswerSelection(option)}
                style={{ 
                  display: "block", margin: "10px auto", padding: "10px", 
                  cursor: "pointer", width: "50%", fontSize: "16px"
                }}
              >
                {option}
              </button>
            ))}
            <p>{feedback}</p>
          </div>
        )
      )}
    </div>
  );
}
