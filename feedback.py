import datetime
import json

import ollama
from fastapi import APIRouter

from ..config   import MODEL
from ..database import get_driver
from ..models   import FeedbackPayload

router = APIRouter()


@router.post("/feedback")
def submit_feedback(payload: FeedbackPayload):
    """
    Stores user corrections and ratings.
    - Saves to Neo4j on the node as a correction property
    - Writes to a local JSONL file for fine-tuning use
    - If correction provided, re-generates summary using correction as context
    """
    # 1. Log to JSONL file (fine-tuning dataset format)
    log_entry = {
        "timestamp":             datetime.datetime.utcnow().isoformat(),
        "node_id":               payload.node_id,
        "node_label":            payload.node_label,
        "rating":                payload.rating,
        "correction":            payload.correction,
        "flagged_source_indices": payload.flagged_sources,
        "flagged_source_titles": [
            payload.sources[i].get("title", "") for i in payload.flagged_sources
            if i < len(payload.sources)
        ] if payload.sources else [],
    }

    try:
        with open("corrections.jsonl", "a") as f:
            f.write(json.dumps(log_entry) + "\n")
        print(f"📝 Feedback logged: node='{payload.node_id}' rating={payload.rating}")
    except Exception as e:
        print(f"⚠️ Could not write correction log: {e}")

    # 2. Store rating and correction flag on the Neo4j node
    driver = get_driver()
    try:
        with driver.session() as session:
            session.run(
                """
                MATCH (n:Entity {name: $id})
                SET n.user_rating = $rating,
                    n.has_correction = true,
                    n.correction_text = $correction
                """,
                id=payload.node_id,
                rating=payload.rating,
                correction=payload.correction,
            )
    except Exception as e:
        print(f"⚠️ Could not update Neo4j node with feedback: {e}")

    # 3. If a correction was provided, regenerate the node summary
    if payload.correction and payload.correction.strip():
        try:
            flagged_titles = "\n".join([
                payload.sources[i].get("title", "")
                for i in payload.flagged_sources
                if i < len(payload.sources)
            ]) if payload.sources else "None specified"

            correction_prompt = f"""
A user has identified an error in the intelligence report for: '{payload.node_id}'

USER CORRECTION:
{payload.correction}

FLAGGED SOURCES (unreliable):
{flagged_titles}

Based on this correction, write a revised 60-word factual summary for '{payload.node_id}'.
Return ONLY the summary text, no JSON, no headers, no preamble.
"""
            response    = ollama.generate(model=MODEL, prompt=correction_prompt, keep_alive='60m')
            new_summary = response['response'].strip()

            with driver.session() as session:
                session.run(
                    "MATCH (n:Entity {name: $id}) SET n.summary = $summary",
                    id=payload.node_id, summary=new_summary,
                )
            print(f"✅ Node '{payload.node_id}' summary regenerated from correction")
            return {"status": "corrected", "new_summary": new_summary}

        except Exception as e:
            print(f"⚠️ Could not regenerate summary: {e}")

    return {"status": "feedback_recorded"}


@router.get("/corrections")
def get_corrections():
    """Returns all logged corrections — useful for reviewing fine-tuning data."""
    corrections = []
    try:
        with open("corrections.jsonl", "r") as f:
            for line in f:
                line = line.strip()
                if line:
                    corrections.append(json.loads(line))
    except FileNotFoundError:
        pass
    return {"corrections": corrections, "total": len(corrections)}