import json
import re

import dirtyjson
import ollama

from ..config import MODEL
from ..models import KnowledgeGraph


# ─── HELPERS ─────────────────────────────────────────────────────────────────

def clean_llm_json(raw_text: str) -> str:
    text = re.sub(r'<think>.*?</think>', '', raw_text, flags=re.DOTALL)
    text = re.sub(r'```json|```', '', text).strip()
    start = text.find('{')
    end   = text.rfind('}')
    if start != -1 and end != -1:
        text = text[start:end + 1]
    return text


# ─── CATEGORY DEFINITIONS ────────────────────────────────────────────────────

CATEGORIES = {
    "person": [
        ("Origins",       "cat_origins",   "🌍 ORIGINS"),
        ("Career",        "cat_career",    "🚀 CAREER"),
        ("Network",       "cat_network",   "🕸 NETWORK"),
        ("Controversies", "cat_controversy","⚡ CONTROVERSIES"),
        ("Ideology",      "cat_ideology",  "💡 IDEOLOGY"),
    ],
    "event": [
        ("RootCauses", "cat_causes",    "🔥 ROOT CAUSES"),
        ("TheEvent",   "cat_event",     "📍 THE EVENT"),
        ("KeyPlayers", "cat_players",   "👥 KEY PLAYERS"),
        ("Aftermath",  "cat_aftermath", "💥 AFTERMATH"),
        ("GlobalImpact","cat_impact",   "🌐 GLOBAL IMPACT"),
    ],
    "concept": [
        ("CoreDefinition","cat_core",         "📌 CORE"),
        ("Components",    "cat_components",   "🔧 COMPONENTS"),
        ("RelatedConcepts","cat_related",     "🔗 RELATED"),
        ("Applications",  "cat_applications", "⚙ APPLICATIONS"),
        ("Implications",  "cat_implications", "💡 IMPLICATIONS"),
    ],
}


# ─── MAIN GENERATION FUNCTION ────────────────────────────────────────────────

def generate_graph_data(text: str, center_entity: str, mode: str) -> KnowledgeGraph | None:
    categories  = CATEGORIES.get(mode, CATEGORIES["concept"])
    cat_ids     = [c[1] for c in categories]
    cat_labels  = [c[2] for c in categories]

    prompt = f"""
You are an Elite Intelligence Analyst building a LARGE, STRUCTURED Knowledge Graph for '{center_entity}'.

=== STRICT ARCHITECTURE RULES ===

NODE TYPES — use EXACTLY these strings for the "type" field:
- "Central" — only ONE node: the main subject '{center_entity}'
- "Category" — exactly 5 structural grouping nodes
- "Entity" — individual facts, people, events, companies, concepts

YOU MUST USE THESE EXACT CATEGORY IDs (copy them verbatim):
{json.dumps(cat_ids)}

With these labels:
{json.dumps(cat_labels)}

=== TOPOLOGY RULES ===
1. The Central node ('{center_entity}') connects ONLY to the 5 Category nodes
2. Each Category connects to AT LEAST 5 Entity nodes
3. Entities MUST also connect to OTHER entities where real relationships exist (minimum 8 cross-links)
4. NEVER create a node with id or label containing "Unknown" — use real specific names only
5. Entity IDs must be unique meaningful strings (e.g. "SpaceX" not "e1" or "company1")

=== REQUIRED COUNTS ===
- Total nodes: minimum 35 (1 Central + 5 Category + 29+ Entity)
- Total edges: minimum 40
- Cross-edges between entities (not through categories): minimum 8

=== CONTENT RULES ===
- Central node summary: 250-word Executive Dossier with markdown (## headers, **bold**)
- Category node summary: 120-word strategic analysis of that theme
- Entity node summary: 40-60 words, factual and specific
- Edge "desc": one specific sentence, e.g. "Co-founded 2002, invested $100M personally"
- Edge "relation": SCREAMING_SNAKE_CASE verb phrase, e.g. "CO_FOUNDED", "ACQUIRED_IN_2022"

=== OUTPUT ===
Return ONLY raw JSON — no markdown fences, no explanation text before or after:

{{
  "nodes": [
    {{"id": "{center_entity}", "type": "Central", "label": "{center_entity}", "details": "Central subject", "summary": "## Dossier\\n...", "date": ""}},
    {{"id": "cat_origins", "type": "Category", "label": "🌍 ORIGINS", "details": "Origins category", "summary": "...", "date": ""}},
    {{"id": "SomeRealEntity", "type": "Entity", "label": "Some Real Entity", "details": "Short description", "summary": "40-60 word description...", "date": "2001"}}
  ],
  "edges": [
    {{"source": "{center_entity}", "target": "cat_origins", "relation": "EMERGED_FROM", "desc": "Formative background shaped worldview"}},
    {{"source": "cat_origins", "target": "SomeRealEntity", "relation": "BORN_IN", "desc": "Birthplace in 1971"}},
    {{"source": "EntityA", "target": "EntityB", "relation": "PARTNERED_WITH", "desc": "Cross-entity relationship example"}}
  ]
}}

=== SOURCE INTELLIGENCE ===
{text}
"""

    try:
        print(f"⚡ Analyzing '{center_entity}' with {MODEL}...")
        response     = ollama.generate(model=MODEL, prompt=prompt, keep_alive='60m')
        cleaned_text = clean_llm_json(response['response'])
        json_data    = dirtyjson.loads(cleaned_text)

        # Strip any "Unknown" nodes that slipped through
        if 'nodes' in json_data:
            json_data['nodes'] = [
                n for n in json_data['nodes']
                if 'unknown' not in str(n.get('id',   '')).lower()
                and 'unknown' not in str(n.get('label', '')).lower()
            ]

        # Validate edges reference existing node ids
        if 'nodes' in json_data and 'edges' in json_data:
            valid_ids = {n['id'] for n in json_data['nodes']}
            json_data['edges'] = [
                e for e in json_data['edges']
                if e.get('source') in valid_ids and e.get('target') in valid_ids
            ]

        kg = KnowledgeGraph(**json_data)
        print(f"✅ Generated {len(kg.nodes)} nodes, {len(kg.edges)} edges")
        return kg

    except Exception as e:
        print(f"❌ LLM Parsing Failed: {e}")
        return None