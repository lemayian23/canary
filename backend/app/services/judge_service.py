import openai
from app.core.config import OPENAI_API_KEY
import json
from typing import Dict, Any
import hashlib
import redis
import json


class JudgeService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=OPENAI_API_KEY)
        self.redis_client = redis.from_url("redis://localhost:6379/0")

    def _get_cache_key(self, prompt: str, expected: str, actual: str) -> str:
        """Generate cache key for identical diffs"""
        content = f"{prompt}|{expected}|{actual}"
        return hashlib.md5(content.encode()).hexdigest()

    def _get_cached_result(self, cache_key: str) -> Dict[str, Any]:
        """Get cached judge result"""
        try:
            cached = self.redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception:
            pass
        return None

    def _set_cached_result(self, cache_key: str, result: Dict[str, Any]):
        """Cache judge result for 24 hours"""
        try:
            self.redis_client.setex(cache_key, 86400, json.dumps(result))
        except Exception:
            pass

    def evaluate_diff(self, prompt: str, expected_behavior: str, actual_output: str) -> Dict[str, Any]:
        """
        Evaluate the semantic difference between expected and actual outputs
        """
        # Check cache first
        cache_key = self._get_cache_key(prompt, expected_behavior, actual_output)
        cached_result = self._get_cached_result(cache_key)
        if cached_result:
            cached_result["cached"] = True
            return cached_result

        # AI evaluation prompt
        evaluation_prompt = f"""
        You are an AI quality assurance judge. Evaluate the following:

        PROMPT: {prompt}

        EXPECTED BEHAVIOR: {expected_behavior}

        ACTUAL OUTPUT: {actual_output}

        Analyze the difference and provide:
        1. severity_score: 0-1 (0=no issue, 1=critical regression)
        2. severity_label: "none", "low", "medium", "high", "critical"
        3. change_type: one of ["factual_error", "style_change", "refusal", "hallucination", "safety_issue", "format_change", "content_omission", "content_addition"]
        4. reasoning: brief explanation of the issue
        5. is_regression: true/false

        Respond with JSON only:
        {{
            "severity_score": 0.8,
            "severity_label": "high", 
            "change_type": "factual_error",
            "reasoning": "The response contains factual inaccuracies",
            "is_regression": true
        }}
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system",
                     "content": "You are a precise AI evaluation judge. Always respond with valid JSON."},
                    {"role": "user", "content": evaluation_prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            result["cached"] = False
            result["judge_cost"] = response.usage.total_tokens * 0.000002  # Approximate cost

            # Cache the result
            self._set_cached_result(cache_key, result)

            return result

        except Exception as e:
            # Fallback evaluation
            return {
                "severity_score": 0.5,
                "severity_label": "medium",
                "change_type": "evaluation_error",
                "reasoning": f"Judge evaluation failed: {str(e)}",
                "is_regression": False,
                "cached": False,
                "judge_cost": 0.0
            }