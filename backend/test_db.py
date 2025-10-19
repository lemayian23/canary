import sys
import os

sys.path.append(os.path.dirname(__file__))

from sqlalchemy import text
from app.core.database import SessionLocal
from app.models.test_case import TestCase


def test_db_connection():
    print("Testing database connection...")

    # Test 1: Check if we can connect to the database
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        print("✓ Database connection successful")
        db.close()
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return

    # Test 2: Check if tables exist
    try:
        db = SessionLocal()
        test_cases = db.query(TestCase).all()
        print(f"✓ Tables exist. Found {len(test_cases)} test cases")
        db.close()
    except Exception as e:
        print(f"✗ Table query failed: {e}")
        return

    # Test 3: Try to create a test case
    try:
        db = SessionLocal()
        new_case = TestCase(
            name="test_db_connection",
            description="Test database connection",
            input_prompt="Test prompt",
            expected_behavior="Test behavior",
            category="test"
        )
        db.add(new_case)
        db.commit()
        db.refresh(new_case)
        print(f"✓ Successfully created test case with ID: {new_case.id}")
        db.close()
    except Exception as e:
        print(f"✗ Create test case failed: {e}")


if __name__ == "__main__":
    test_db_connection()