import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64File = reader.result.split(",")[1]; // Extract base64 data

      const response = await axios.post("/api/upload", { file: base64File });

      setQuestions(response.data.questions.split("\n").filter((q) => q));
    };
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>PDF Quiz Generator</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>
        Upload & Generate Quiz
      </button>

      {questions.length > 0 && (
        <div>
          <h3>Generated Questions:</h3>
          {questions.map((q, index) => (
            <p key={index}>{q}</p>
          ))}
        </div>
      )}
    </div>
  );
}
