from typing import List, Dict, Any
from app.models.test_case import TestCase
from app.models.test_run import TestRun
from app.models.test_result import TestResult
from app.services.judge_service import JudgeService
from sqlalchemy.orm import Session
import time


class TestExecutor:
    def __init__(self):
        self.judge_service = JudgeService()

    def execute_test_suite(self, db: Session, test_cases: List[TestCase], test_run_id: int,
                           llm_client: Any, llm_model: str = "gpt-3.5-turbo") -> Dict[str, Any]:
        """
        Execute a test suite against an LLM and evaluate results
        """
        results = []
        total_cost = 0.0
        passed_tests = 0
        failed_tests = 0

        for test_case in test_cases:
            if not test_case.is_active:
                continue

            print(f"Executing test: {test_case.name}")

            # Get LLM response (mock for now - we'll integrate real LLM later)
            actual_output = self._get_llm_response(
                test_case.input_prompt, llm_client, llm_model
            )

            # Evaluate with judge
            evaluation = self.judge_service.evaluate_diff(
                prompt=test_case.input_prompt,
                expected_behavior=test_case.expected_behavior,
                actual_output=actual_output
            )

            # Create test result
            test_result = TestResult(
                test_run_id=test_run_id,
                test_case_id=test_case.id,
                input_prompt=test_case.input_prompt,
                actual_output=actual_output,
                expected_behavior=test_case.expected_behavior,
                severity_score=evaluation["severity_score"],
                severity_label=evaluation["severity_label"],
                change_type=evaluation["change_type"],
                reasoning=evaluation["reasoning"],
                is_regression=evaluation["is_regression"],
                judge_cost=evaluation.get("judge_cost", 0.0),
                processing_time=0.0,  # We'll calculate this
                diff_hash=self.judge_service._get_cache_key(
                    test_case.input_prompt,
                    test_case.expected_behavior,
                    actual_output
                )
            )

            db.add(test_result)
            db.flush()  # Flush to get ID but don't commit yet

            # Track statistics
            total_cost += evaluation.get("judge_cost", 0.0)
            if evaluation["severity_score"] < 0.3:  # Low severity = pass
                passed_tests += 1
            else:
                failed_tests += 1

            results.append({
                "test_case_id": test_case.id,
                "test_case_name": test_case.name,
                "severity_score": evaluation["severity_score"],
                "severity_label": evaluation["severity_label"],
                "is_regression": evaluation["is_regression"],
                "cached": evaluation.get("cached", False)
            })

        return {
            "results": results,
            "summary": {
                "total_tests": len(results),
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "total_cost": total_cost
            }
        }

    def _get_llm_response(self, prompt: str, llm_client: Any, model: str) -> str:
        """
        Get response from LLM (mock implementation for now)
        """
        # TODO: Integrate with actual LLM client
        # For now, return a mock response
        mock_responses = {
            "What is the capital of France?": "Paris is the capital of France.",
            "What is 2+2?": "The answer is 4.",
            "Tell me about quantum computing": "Quantum computing uses quantum bits to process information in ways classical computers cannot."
        }

        return mock_responses.get(prompt, "I don't have a response for that question.")