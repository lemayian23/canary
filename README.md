Canary
AI-Powered Production Canary Test & Diff Analyzer

Automatically detects and semantically diffs behavioral regressions in LLM-powered features before they reach users.

Features
Semantic Diffing: AI-powered classification of change type and severity

CI/CD Integration: Test against golden datasets on every PR

Cost Controls: Caching and budget limits for judge model evaluations

Professional Dashboard: React-based UI for test management and monitoring

Production Ready: FastAPI backend with PostgreSQL and Redis

Quick Start
Prerequisites
Python 3.8+

Docker & Docker Compose

Node.js 16+

OpenAI API key

Installation
Clone and setup backend:

bash
cd backend
python -m venv venv
.\venv\Scripts\Activate  # Windows
pip install -r requirements.txt
Start services:

bash
docker-compose up -d
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Setup frontend:

bash
cd frontend
npm install
npm run dev
Access the application:

Frontend: http://localhost:5173

API: http://localhost:8000

Usage
Add test cases via the web UI or API

Execute test runs manually or via CI/CD

View detailed reports with AI-generated failure analysis

Monitor costs and regression trends

API Examples
bash
# Create test case
curl -X POST "http://localhost:8000/api/v1/test-cases/" \
  -H "Content-Type: application/json" \
  -d '{"name": "test_factual", "input_prompt": "What is 2+2?", "expected_behavior": "Should respond with 4"}'

# Execute test run
curl -X POST "http://localhost:8000/api/v1/test-runs/execute?run_name=CI+Test"

# Get results
curl "http://localhost:8000/api/v1/test-runs/1/results"
Configuration
Set environment variables in backend/.env:

text
OPENAI_API_KEY=your_key_here
DATABASE_URL=postgresql://canary_user:canary_password@localhost:5432/canary_db
REDIS_URL=redis://localhost:6379/0
Project Structure
text
canary/
├── backend/          # FastAPI application
├── frontend/         # React dashboard
├── datasets/         # Golden datasets
└── docker-compose.yml
License
MIT License - see LICENSE file for details.s