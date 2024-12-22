from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import json
import uuid
import google.generativeai as genai

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update to match your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to store session data
CONVERSATION_DIR = "./conversations"
os.makedirs(CONVERSATION_DIR, exist_ok=True)

# Pydantic models
class IdeaInput(BaseModel):
    idea: str

class AnswerInput(BaseModel):
    session_id: str
    answer: str

@app.get("/")
def root():
    return {"message": "Welcome to FlowCraft API!"}

@app.post("/start-session/")
async def start_session(idea_input: IdeaInput):
    """
    Start a new session by generating a list of questions for the given idea.
    """
    try:
        # Generate clarifying questions
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            "You are a helpful assistant refining workflows. Generate a concise list of clarifying questions "
            "to gather missing details for the following idea. Provide only questions:\n\n"
            f"Idea: {idea_input.idea}"
        )
        response = model.generate_content(prompt)
        questions = [q.strip() for q in response.text.split("\n") if q.strip()]

        if not questions:
            raise HTTPException(status_code=400, detail="No questions generated.")

        # Save session data
        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,
            "idea": idea_input.idea,
            "questions": questions,
            "answers": []
        }
        with open(os.path.join(CONVERSATION_DIR, f"{session_id}.json"), "w") as f:
            json.dump(session_data, f, indent=4)

        return {"session_id": session_id, "question": questions[0]}  # Return the first question
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

@app.post("/answer-question/")
async def answer_question(answer_input: AnswerInput):
    """
    Accept an answer, save it, and return the next question if available.
    """
    try:
        # Load session data
        session_file = os.path.join(CONVERSATION_DIR, f"{answer_input.session_id}.json")
        if not os.path.exists(session_file):
            raise HTTPException(status_code=404, detail="Session not found.")

        with open(session_file, "r") as f:
            session_data = json.load(f)

        # Check if all questions are answered
        if len(session_data["questions"]) <= len(session_data["answers"]):
            return {"message": "All questions have been answered."}

        # Save the answer
        session_data["answers"].append(answer_input.answer)
        with open(session_file, "w") as f:
            json.dump(session_data, f, indent=4)

        # Return the next question
        if len(session_data["questions"]) > len(session_data["answers"]):
            next_question = session_data["questions"][len(session_data["answers"])]
            return {"question": next_question}
        else:
            return {"message": "All questions have been answered."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing answer: {str(e)}")
