from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base


class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(String, default="running")  # running, completed, failed
    trigger_source = Column(String)  # ci, manual, scheduled
    git_commit = Column(String)
    git_branch = Column(String)

    # Cost tracking
    total_cost = Column(Float, default=0.0)
    judge_model_used = Column(String)

    # Results summary
    total_tests = Column(Integer, default=0)
    passed_tests = Column(Integer, default=0)
    failed_tests = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))

    # Relationships
    test_results = relationship("TestResult", back_populates="test_run")