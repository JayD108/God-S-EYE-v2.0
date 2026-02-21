from pydantic import BaseModel
from typing import List, Optional


class GraphNode(BaseModel):
    id: str
    type: str          # Central | Category | Entity
    label: str
    details: str
    summary: Optional[str] = ""
    date: Optional[str] = ""


class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str
    desc: Optional[str] = ""


class KnowledgeGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class FeedbackPayload(BaseModel):
    node_id: str
    node_label: Optional[str] = ""
    rating: Optional[int] = 0
    correction: Optional[str] = ""
    flagged_sources: Optional[List[int]] = []
    sources: Optional[List[dict]] = []