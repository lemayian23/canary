from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class TestCaseBase(BaseModel):
    name: str
    description: Optional[str] = None
    input_prompt: str
    expected_behavior: str
    category: Optional[str] = None
    is_active: bool = True
    metadata: Optional[Dict[str, Any]] = None

class TestCaseCreate(TestCaseBase):
    pass

class TestCaseResponse(TestCaseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True