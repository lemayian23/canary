from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.test_case import TestCase
from app.models.test_run import TestRun
from app.api import test_execution_router

app = FastAPI(
    title='Canary',
    description='AI-Powered Production Canary Test & Diff Analyzer',
    version='0.1.0'
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/')
async def root():
    return {'message': 'Canary API', 'version': '0.1.0'}

@app.get('/health')
async def health_check():
    return {'status': 'healthy'}

# Include API routers
app.include_router(test_execution_router, prefix="/api/v1", tags=["test-execution"])

# Basic test case management (keep these for now)
@app.get('/api/v1/test-cases/')
async def get_test_cases(db: Session = Depends(get_db)):
    test_cases = db.query(TestCase).all()
    return {'test_cases': test_cases}

@app.post('/api/v1/test-cases/')
async def create_test_case(test_case_data: dict, db: Session = Depends(get_db)):
    test_case = TestCase(**test_case_data)
    db.add(test_case)
    db.commit()
    db.refresh(test_case)
    return test_case

@app.get('/api/v1/test-runs/')
async def get_test_runs(db: Session = Depends(get_db)):
    test_runs = db.query(TestRun).all()
    return {'test_runs': test_runs}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)