from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.test_run import TestRun

router = APIRouter()

@router.get("/test-runs/", response_model=List[dict])
async def get_test_runs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    test_runs = db.query(TestRun).offset(skip).limit(limit).all()
    return test_runs

@router.post("/test-runs/", response_model=dict)
async def create_test_run(test_run: dict, db: Session = Depends(get_db)):
    db_test_run = TestRun(**test_run)
    db.add(db_test_run)
    db.commit()
    db.refresh(db_test_run)
    return db_test_run

@router.get("/test-runs/{test_run_id}", response_model=dict)
async def get_test_run(test_run_id: int, db: Session = Depends(get_db)):
    test_run = db.query(TestRun).filter(TestRun.id == test_run_id).first()
    if test_run is None:
        raise HTTPException(status_code=404, detail="Test run not found")
    return test_run