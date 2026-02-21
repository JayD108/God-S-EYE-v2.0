# God's Eye — Omni Intelligence

Knowledge graph builder powered by a local LLM (Ollama), Neo4j, and DuckDuckGo search.

## Project Structure

```
gods-eye/
│
├── main.py                         # FastAPI app entry point  →  python main.py
├── requirements.txt
│
├── backend/
│   ├── config.py                   # NEO4J creds, MODEL name, SEARCH_LIMIT
│   ├── database.py                 # Neo4j driver init + run_query helper
│   ├── models.py                   # Pydantic models (GraphNode, GraphEdge, FeedbackPayload)
│   │
│   ├── services/
│   │   ├── graph_generator.py      # LLM prompt + JSON parsing → KnowledgeGraph
│   │   └── search.py               # DuckDuckGo web search wrapper
│   │
│   └── routers/
│       ├── graph.py                # POST /api/scan  GET /api/graph  POST /api/wipe
│       └── feedback.py             # POST /api/feedback  GET /api/corrections
│
└── frontend/
    ├── index.html                  # Shell HTML — imports CSS & JS
    │
    ├── css/
    │   ├── base.css                # CSS variables, reset, animations
    │   ├── header.css              # Header, buttons, status lights
    │   ├── panel.css               # Left panel, tabs, node info, rating
    │   └── graph.css               # Graph area, loader, modals, popups, toast
    │
    └── js/
        ├── graph.js                # vis-network init, render, filter, zoom
        ├── demo.js                 # Offline demo graph (Elon Musk fallback)
        ├── api.js                  # fetch wrappers: scan, fetchGraph, wipeDB, health
        ├── ui.js                   # Node click, tabs, expand popup
        ├── feedback.js             # Star rating, feedback modal, toast
        └── relationship.js         # Multi-select, BFS path finding, rel modal
```

## Running

**Backend**
```bash
pip install -r requirements.txt
python main.py          # starts on http://localhost:8000
```

**Frontend**
Open `frontend/index.html` in your browser (or serve with any static file server).
```bash
cd frontend && python -m http.server 3000
```

## Configuration

Edit `backend/config.py`:
- `NEO4J_URI` / `NEO4J_AUTH` — your Neo4j instance
- `MODEL` — Ollama model name (e.g. `gemma2:9b`, `gemma2:27b`)
- `SEARCH_LIMIT` — number of DuckDuckGo results per scan