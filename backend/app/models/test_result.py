from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base


class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    test_run_id = Column(Integer, ForeignKey("test_runs.id"), nullable=False)
    test_case_id = Column(Integer, ForeignKey("test_cases.id"), nullable=False)

    # Test execution data
    input_prompt = Column(Text, nullable=False)
    actual_output = Column(Text)
    expected_behavior = Column(Text)

    # Judge evaluation results
    severity_score = Column(Float)  # 0-1, higher = more severe
    severity_label = Column(String)  # none, low, medium, high, critical
    change_type = Column(String)  # factual_error, style_change, refusal, etc.
    reasoning = Column(Text)  # AI judge's explanation
    is_regression = Column(Boolean, default=False)

    # Cost and performance
    judge_cost = Column(Float, default=0.0)
    processing_time = Column(Float)  # seconds

    # Caching
    diff_hash = Column(String, index=True)  # For caching identical diffs

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    test_run = relationship("TestRun", back_populates="test_results")
    test_case = relationship("TestCase")