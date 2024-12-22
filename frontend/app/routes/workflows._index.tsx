import { useEffect, useState } from "react";

interface Workflow {
  workflow_id: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/get-workflows/");
        if (!res.ok) {
          throw new Error("Failed to fetch workflows");
        }
        const data = await res.json();
        setWorkflows(data.workflows || []);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error("Unknown error occurred");
        }
      }
    };
    fetchWorkflows();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Saved Workflows</h1>
      <ul className="space-y-4">
        {workflows.map((workflow) => (
          <li
            key={workflow.workflow_id}
            className="p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-md"
          >
            <p>
              <strong>Prompt:</strong> {workflow.prompt}
            </p>
            <p>
              <strong>Response:</strong> {workflow.response}
            </p>
            <p className="text-gray-500 text-sm">
              <strong>Timestamp:</strong> {new Date(workflow.timestamp).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
