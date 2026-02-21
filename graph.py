from fastapi import APIRouter, Body, HTTPException

from ..database import get_driver, run_query
from ..services  import generate_graph_data, search_web

router = APIRouter()


@router.post("/scan")
def scan_target(target: str = Body(...), mode: str = Body(...)):
    print(f"🚀 Scan Initiated: '{target}' mode={mode}")

    context, raw_sources = search_web(target, mode)
    graph_data = generate_graph_data(context, target, mode)

    if not graph_data:
        raise HTTPException(500, "AI Data Generation Failed")

    driver = get_driver()
    with driver.session() as session:
        for node in graph_data.nodes:
            if "unknown" in node.id.lower():
                continue
            session.run(
                """
                MERGE (n:Entity {name: $id})
                SET n.type=$type, n.label=$label, n.details=$details,
                    n.summary=$summary, n.date=$date
                """,
                id=node.id, type=node.type, label=node.label,
                details=node.details, summary=node.summary or "", date=node.date or "",
            )

        for edge in graph_data.edges:
            session.run(
                """
                MATCH (a:Entity {name: $src}), (b:Entity {name: $tgt})
                MERGE (a)-[r:RELATION {type: $rel}]->(b)
                SET r.desc = $desc
                """,
                src=edge.source, tgt=edge.target,
                rel=edge.relation, desc=edge.desc or "",
            )

    sources_map = {node.id: raw_sources for node in graph_data.nodes}

    return {
        "status":      "success",
        "nodes_added": len(graph_data.nodes),
        "edges_added": len(graph_data.edges),
        "sources":     sources_map,
    }


@router.get("/graph")
def get_graph():
    nodes = run_query(
        "MATCH (n) RETURN n.name as id, n.type as type, n.label as label, "
        "n.details as details, n.summary as summary, n.date as date"
    )
    edges = run_query(
        "MATCH (n)-[r]->(m) RETURN n.name as source, m.name as target, "
        "r.type as label, r.desc as desc"
    )
    return {"nodes": nodes, "links": edges}


@router.post("/wipe")
def wipe_database():
    driver = get_driver()
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
    return {"status": "cleared"}