import { useState } from "react";
import TextInputForm from "../components/TextInputForm";

export default function IndexRoute() {
  const [sessionId, setSessionId] = useState<string>(""); // Store the session ID
  const [workflow, setWorkflow] = useState<{ idea: string; answers: string[] } | null>(null); // Store workflow data
  const [error, setError] = useState<string>("");

  const handleStartSession = async (idea: string) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/start-session/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea }),
      });

      if (!response.ok) {
        throw new Error("Failed to start session.");
      }

      const data = await response.json();
      setSessionId(data.session_id); // Set the session ID
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  };

  const handleComplete = (data: { idea: string; answers: string[] }) => {
    setWorkflow(data); // Save completed workflow
    setError(""); // Clear any errors
  };

  const handleError = (err: string) => {
    setError(err); // Display error message
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to FlowCraft</h1>
      {!workflow ? (
        <>
          {!sessionId ? (
            <div className="bg-white p-6 shadow-md rounded-lg">
              <label htmlFor="idea" className="block text-gray-700 text-sm font-medium mb-2">
                Enter your idea:
              </label>
              <textarea
                id="idea"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-500"
                placeholder="Type your idea here..."
                onChange={(e) => handleStartSession(e.target.value)}
              ></textarea>
              <button
                onClick={() => handleStartSession}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Start Session
              </button>
            </div>
          ) : (
            <TextInputForm
              sessionId={sessionId}
              onComplete={handleComplete}
              onError={handleError}
            />
          )}
        </>
      ) : (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Workflow Summary:</h3>
          <p><strong>Idea:</strong> {workflow.idea}</p>
          <p><strong>Answers:</strong></p>
          <ul className="list-disc ml-6">
            {workflow.answers.map((answer, index) => (
              <li key={index}>{answer}</li>
            ))}
          </ul>
        </div>
      )}
      {error && (
        <div className="mt-4 bg-red-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-700">Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
