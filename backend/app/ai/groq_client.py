import os
import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class GroqLLMClient:
    def __init__(self):
        self.model = settings.DEFAULT_GROQ_MODEL

    def _get_client(self):
        from app.config import settings
        api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
        if api_key:
            try:
                from groq import Groq
                return Groq(api_key=api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}")
        return None

    def call_json_completion(self, system_prompt: str, user_prompt: str) -> dict:
        """Call Groq API expecting JSON response, with fallback to rule-based parser if key missing."""
        client = self._get_client()
        if client:
            try:
                chat_completion = client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt + "\nReturn ONLY valid JSON format."},
                        {"role": "user", "content": user_prompt}
                    ],
                    model=self.model,
                    response_format={"type": "json_object"}
                )
                raw_response = chat_completion.choices[0].message.content
                return json.loads(raw_response)
            except Exception as e:
                logger.error(f"Groq API call error: {e}. Falling back to mock engine.")

        # Fallback engine if no key or error occurs
        return self._mock_fallback(user_prompt)

    def call_text_completion(self, system_prompt: str, user_prompt: str) -> str:
        """Call Groq API for free-text completion (Copilot Chat)."""
        client = self._get_client()
        if client:
            try:
                chat_completion = client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    model=self.model
                )
                return chat_completion.choices[0].message.content
            except Exception as e:
                logger.error(f"Groq text API error: {e}")

        return (
            f"Based on pharmaceutical QMS guidelines (ICH Q9 & Q10), "
            f"the complaint requires quality assessment for batch record review, retain sample analysis, "
            f"and CAPA verification. Let me know if you would like me to draft an investigation protocol."
        )

    def _mock_fallback(self, user_prompt: str) -> dict:
        """Rule-based mock extraction engine for local testing before user sets GROQ_API_KEY."""
        text_lower = user_prompt.lower()

        # Product detection
        product = "Amoxicillin Trihydrate 500mg Capsules"
        product_type = "FDF"
        if "api" in text_lower or "active ingredient" in text_lower or "powder" in text_lower:
            product_type = "API"
            product = "Paracetamol API (Active Pharmaceutical Ingredient)"

        # Batch detection
        batch = "BT-2026-X99"
        import re
        batch_match = re.search(r'(batch|lot)\s*#?\:?\s*([A-Za-z0-9\-]+)', user_prompt, re.IGNORECASE)
        if batch_match:
            batch = batch_match.group(2)

        # Severity & Risk
        severity = "Medium"
        risk_level = "Class II"
        score = 6.5
        if "critical" in text_lower or "contamination" in text_lower or "hospital" in text_lower or "death" in text_lower:
            severity = "Critical"
            risk_level = "Class I"
            score = 9.2
        elif "label" in text_lower or "packaging" in text_lower or "box" in text_lower:
            severity = "Low"
            risk_level = "Class III"
            score = 3.5

        # Complaint type
        complaint_type = "Quality Defect"
        if "pack" in text_lower or "seal" in text_lower or "blister" in text_lower:
            complaint_type = "Packaging Defect"
        elif "color" in text_lower or "dissolution" in text_lower or "particle" in text_lower:
            complaint_type = "Chemical Contamination / Efficacy"

        return {
            "reporter_name": "Dr. Sarah Jenkins",
            "reporter_email": "s.jenkins@stjude-hospital.org",
            "reporter_type": "Hospital Pharmacy",
            "product_name": product,
            "product_type": product_type,
            "batch_number": batch,
            "manufacturing_date": "2026-01-15",
            "expiry_date": "2028-01-14",
            "complaint_type": complaint_type,
            "severity": severity,
            "summary": user_prompt[:180] + "..." if len(user_prompt) > 180 else user_prompt,
            "completeness_score": 85.0,
            "missing_fields": ["Storage Temperature Log"],
            "risk_assessment": {
                "health_hazard_level": risk_level,
                "patient_impact": "Potential sub-therapeutic dosing or mild adverse reaction. Quarantine recommended.",
                "probable_root_cause": "HVAC moisture spike in primary packaging room or raw material vendor batch variance.",
                "investigation_steps": [
                    "Perform immediate visual and chemical assay test on retain samples.",
                    "Review batch manufacturing record (BMR) and environmental monitoring logs.",
                    "Check temperature/humidity logs of shipping container during transit."
                ],
                "risk_justification": f"Assessed as {risk_level} based on ICH Q9 Risk Assessment framework."
            },
            "capas": [
                {
                    "capa_type": "Corrective Action",
                    "description": "Quarantine remaining stock of batch and initiate 100% visual inspection of stored inventory.",
                    "target_department": "Quality Control",
                    "priority": severity
                },
                {
                    "capa_type": "Preventive Action",
                    "description": "Re-calibrate HVAC ambient humidity sensors in packaging bay 3 and issue SOP update.",
                    "target_department": "Engineering & QA",
                    "priority": "Medium"
                }
            ]
        }

groq_llm = GroqLLMClient()
