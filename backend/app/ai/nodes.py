from typing import TypedDict, Dict, Any, List, Optional
from app.ai.groq_client import groq_llm
from app.ai.prompts import (
    PHARMA_EXTRACTION_SYSTEM_PROMPT,
    PHARMA_RISK_CAPA_SYSTEM_PROMPT
)

class ComplaintState(TypedDict):
    raw_text: str
    extraction: Optional[Dict[str, Any]]
    completeness_score: float
    missing_fields: List[str]
    is_duplicate: str
    duplicate_match_details: Optional[str]
    risk_assessment: Optional[Dict[str, Any]]
    capas: List[Dict[str, Any]]
    final_output: Optional[Dict[str, Any]]


def extract_complaint_node(state: ComplaintState) -> ComplaintState:
    """Node 1: Extract structured fields from raw complaint text."""
    raw_text = state.get("raw_text", "")
    response = groq_llm.call_json_completion(
        system_prompt=PHARMA_EXTRACTION_SYSTEM_PROMPT,
        user_prompt=f"Extract complaint details from this text:\n\n{raw_text}"
    )

    state["extraction"] = response
    state["completeness_score"] = float(response.get("completeness_score", 70.0))
    state["missing_fields"] = response.get("missing_fields", [])
    return state


def detect_duplicates_node(state: ComplaintState) -> ComplaintState:
    """Node 2: Detect duplicate complaints (simulation or matching logic)."""
    extraction = state.get("extraction", {})
    batch = extraction.get("batch_number", "").upper()
    product = extraction.get("product_name", "").lower()

    # Rule-based duplicate simulation
    if "X99" in batch or "dup" in product:
        state["is_duplicate"] = "Yes"
        state["duplicate_match_details"] = f"Matches existing Complaint CMP-2026-0004 for batch {batch}"
    elif "test" in product:
        state["is_duplicate"] = "Potential"
        state["duplicate_match_details"] = "Similar packaging defect reported 3 days ago for same batch."
    else:
        state["is_duplicate"] = "No"
        state["duplicate_match_details"] = "No matching duplicate complaints found in QMS database."

    return state


def risk_and_capa_node(state: ComplaintState) -> ComplaintState:
    """Node 3: Assess risk levels, root causes, and generate CAPAs."""
    raw_text = state.get("raw_text", "")
    extraction = state.get("extraction", {})

    prompt_context = f"Raw Complaint: {raw_text}\nExtracted Data: {extraction}"
    response = groq_llm.call_json_completion(
        system_prompt=PHARMA_RISK_CAPA_SYSTEM_PROMPT,
        user_prompt=prompt_context
    )

    state["risk_assessment"] = response.get("risk_assessment", {})
    state["capas"] = response.get("capas", [])

    # Assemble final output state
    state["final_output"] = {
        "extraction": state["extraction"],
        "completeness_score": state["completeness_score"],
        "missing_fields": state["missing_fields"],
        "is_duplicate": state["is_duplicate"],
        "duplicate_match_details": state["duplicate_match_details"],
        "risk_assessment": state["risk_assessment"],
        "capas": state["capas"]
    }

    return state
