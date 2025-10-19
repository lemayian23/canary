from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from .base import Base


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    input_prompt = Column(Text, nullable=False)
    expected_behavior = Column(Text, nullable=False)  # Semantic description of expected output
    category = Column(String)  # e.g., "factual", "creative", "safety"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Metadata for cost tracking and analysis
    metadata_ = Column("metadata", JSON)  # Additional flexible data