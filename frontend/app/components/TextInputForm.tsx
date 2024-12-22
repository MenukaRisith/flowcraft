import { useState } from "react";

interface TextInputFormProps {
  onComplete: (data: { idea: string; answers: string[] }) => void;
  onError: (err: string) => void;
}

export default function TextInputForm({ onComplete, onError }: TextInputFormProps) {
  const [idea, setIdea] = useState<string>(""); // User's initial idea
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null); // Current question
  const [answer, setAnswer] = useState<string>(""); // User's current answer
  const [previousAnswers, setPreviousAnswers] = useState<string[]>([]); // User's previous answers
  const [sessionId, setSessionId] = useState<string | null>(null); // Session ID
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  const handleStart = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/start-session/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setSessionId(data.session_id); // Save session ID
      setCurrentQuestion(data.question); // Set the first question
    } catch (error) {
      onError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!answer.trim()) {
      alert("Please provide an answer before proceeding.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/answer-question/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          answer,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      setPreviousAnswers((prev) => [...prev, answer]); // Save the current answer
      setAnswer(""); // Clear the answer input

      if (data.question) {
        setCurrentQuestion(data.question); // Show the next question
      } else {
        setCurrentQuestion(null); // No more questions
        onComplete({ idea, answers: [...previousAnswers, answer] }); // Notify parent of completion
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg">
      {!currentQuestion ? (
        <>
          <label htmlFor="idea" className="block text-gray-700 text-sm font-medium mb-2">
            Enter your idea:
          </label>
          <textarea
            id="idea"
            rows={4}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-500"
            placeholder="Describe your idea..."
            disabled={loading}
          ></textarea>
          <button
            onClick={handleStart}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            disabled={loading || !idea.trim()}
          >
            {loading ? "Starting..." : "Start Questions"}
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-700 text-sm font-medium mb-4">{currentQuestion}</p>
          <textarea
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-500"
            placeholder="Type your answer here..."
            disabled={loading}
          ></textarea>
          <button
            onClick={handleNext}
            className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50"
            disabled={loading || !answer.trim()}
          >
            {loading ? "Loading..." : "Next Question"}
          </button>
        </>
      )}
    </div>
  );
}
