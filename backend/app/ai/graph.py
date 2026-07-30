import logging
from langgraph.graph import StateGraph, END
from app.ai.nodes import (
    ComplaintState,
    extract_complaint_node,
    detect_duplicates_node,
    risk_and_capa_node
)

logger = logging.getLogger(__name__)

def build_complaint_graph():
    """Build and compile the LangGraph workflow for complaint processing."""
    workflow = StateGraph(ComplaintState)

    # Add nodes
    workflow.add_node("extract_complaint", extract_complaint_node)
    workflow.add_node("detect_duplicates", detect_duplicates_node)
    workflow.add_node("assess_risk_and_capa", risk_and_capa_node)

    # Define edges
    workflow.set_entry_point("extract_complaint")
    workflow.add_edge("extract_complaint", "detect_duplicates")
    workflow.add_edge("detect_duplicates", "assess_risk_and_capa")
    workflow.add_edge("assess_risk_and_capa", END)

    return workflow.compile()

complaint_ai_graph = build_complaint_graph()

def run_complaint_ai_pipeline(raw_text: str) -> dict:
    """Execute the full LangGraph AI pipeline on raw complaint text."""
    initial_state: ComplaintState = {
        "raw_text": raw_text,
        "extraction": None,
        "completeness_score": 0.0,
        "missing_fields": [],
        "is_duplicate": "No",
        "duplicate_match_details": None,
        "risk_assessment": None,
        "capas": [],
        "final_output": None
    }

    try:
        result_state = complaint_ai_graph.invoke(initial_state)
        return result_state.get("final_output", {})
    except Exception as e:
        logger.error(f"Error running LangGraph pipeline: {e}")
        # Fallback if execution fails
        from app.ai.groq_client import groq_llm
        fallback_data = groq_llm._mock_fallback(raw_text)
        return {
            "extraction": fallback_data,
            "completeness_score": fallback_data.get("completeness_score", 80.0),
            "missing_fields": fallback_data.get("missing_fields", []),
            "is_duplicate": "No",
            "duplicate_match_details": "No duplicate found",
            "risk_assessment": fallback_data.get("risk_assessment", {}),
            "capas": fallback_data.get("capas", [])
        }
