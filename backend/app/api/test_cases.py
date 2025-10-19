from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.test_case import TestCase

router = APIRouter()

@router.get("/test-cases/", response_model=List[dict])
async def get_test_cases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    test_cases = db.query(TestCase).offset(skip).limit(limit).all()
    return test_cases

@router.post("/test-cases/", response_model=dict)
async def create_test_case(test_case: dict, db: Session = Depends(get_db)):
    db_test_case = TestCase(**test_case)
    db.add(db_test_case)
    db.commit()
    db.refresh(db_test_case)
    return db_test_case

@router.get("/test-cases/{test_case_id}", response_model=dict)
async def get_test_case(test_case_id: int, db: Session = Depends(get_db)):
    test_case = db.query(TestCase).filter(TestCase.id == test_case_id).first()
    if test_case is None:
        raise HTTPException(status_code=404, detail="Test case not found")
    return test_case