from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.test_case import TestCase
from app.models.test_run import TestRun
from app.models.test_result import TestResult
from app.services.test_executor import TestExecutor
import uuid
from datetime import datetime

router = APIRouter()


@router.post("/test-runs/execute", response_model=Dict[str, Any])
async def execute_test_run(
        background_tasks: BackgroundTasks,
        run_name: str = None,
        git_commit: str = None,
        git_branch: str = None,
        db: Session = Depends(get_db)
):
    """
    Execute a test run with all active test cases
    """
    print(f"Received test run request: {run_name}")

    # Get all active test cases
    test_cases = db.query(TestCase).filter(TestCase.is_active == True).all()

    if not test_cases:
        raise HTTPException(status_code=400, detail="No active test cases found")

    print(f"Found {len(test_cases)} active test cases")

    # Create test run record
    test_run = TestRun(
        name=run_name or f"Test Run {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        status="running",
        trigger_source="api",
        git_commit=git_commit,
        git_branch=git_branch,
        total_tests=len(test_cases)
    )

    db.add(test_run)
    db.commit()
    db.refresh(test_run)

    print(f"Created test run with ID: {test_run.id}")

    # Execute tests in background
    background_tasks.add_task(
        execute_tests_background,
        db,
        test_run.id,
        test_cases
    )

    return {
        "test_run_id": test_run.id,
        "status": "started",
        "total_tests": len(test_cases),
        "message": "Test execution started in background"
    }


@router.get("/test-runs/{test_run_id}/results", response_model=Dict[str, Any])
async def get_test_run_results(test_run_id: int, db: Session = Depends(get_db)):
    """
    Get results for a specific test run
    """
    test_run = db.query(TestRun).filter(TestRun.id == test_run_id).first()
    if not test_run:
        raise HTTPException(status_code=404, detail="Test run not found")

    test_results = db.query(TestResult).filter(TestResult.test_run_id == test_run_id).all()

    # Calculate summary
    severity_counts = {}
    for result in test_results:
        severity = result.severity_label or "unknown"
        severity_counts[severity] = severity_counts.get(severity, 0) + 1

    return {
        "test_run": {
            "id": test_run.id,
            "name": test_run.name,
            "status": test_run.status,
            "total_tests": test_run.total_tests,
            "passed_tests": test_run.passed_tests,
            "failed_tests": test_run.failed_tests,
            "total_cost": test_run.total_cost,
            "created_at": test_run.created_at,
            "completed_at": test_run.completed_at
        },
        "results": [
            {
                "id": result.id,
                "test_case_id": result.test_case_id,
                "severity_score": result.severity_score,
                "severity_label": result.severity_label,
                "change_type": result.change_type,
                "reasoning": result.reasoning,
                "is_regression": result.is_regression,
                "judge_cost": result.judge_cost,
                "created_at": result.created_at
            }
            for result in test_results
        ],
        "summary": {
            "severity_counts": severity_counts,
            "regression_count": len([r for r in test_results if r.is_regression])
        }
    }


@router.get("/test-runs/", response_model=List[Dict[str, Any]])
async def get_all_test_runs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get all test runs
    """
    test_runs = db.query(TestRun).order_by(TestRun.created_at.desc()).offset(skip).limit(limit).all()

    return [
        {
            "id": run.id,
            "name": run.name,
            "status": run.status,
            "total_tests": run.total_tests,
            "passed_tests": run.passed_tests,
            "failed_tests": run.failed_tests,
            "total_cost": run.total_cost,
            "created_at": run.created_at,
            "completed_at": run.completed_at
        }
        for run in test_runs
    ]


# Background task function
def execute_tests_background(db: Session, test_run_id: int, test_cases: List[TestCase]):
    """
    Execute tests in background and update test run
    """
    print(f"Starting background test execution for run {test_run_id} with {len(test_cases)} test cases")

    try:
        executor = TestExecutor()
        print("✓ TestExecutor created")

        # Mock LLM client for now
        llm_client = None

        # Execute tests
        print("Starting test execution...")
        results = executor.execute_test_suite(
            db=db,
            test_cases=test_cases,
            test_run_id=test_run_id,
            llm_client=llm_client
        )
        print(f"✓ Test execution completed: {results['summary']}")

        # Update test run with results
        test_run = db.query(TestRun).filter(TestRun.id == test_run_id).first()
        if test_run:
            test_run.status = "completed"
            test_run.passed_tests = results["summary"]["passed_tests"]
            test_run.failed_tests = results["summary"]["failed_tests"]
            test_run.total_cost = results["summary"]["total_cost"]
            test_run.completed_at = datetime.now()

            db.commit()
            print(f"✓ Test run {test_run_id} updated in database")

        print(f"Test run {test_run_id} completed successfully: {results['summary']}")

    except Exception as e:
        print(f"✗ Test run {test_run_id} failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

        # Update test run as failed
        test_run = db.query(TestRun).filter(TestRun.id == test_run_id).first()
        if test_run:
            test_run.status = "failed"
            db.commit()
            print(f"✓ Test run {test_run_id} marked as failed in database")