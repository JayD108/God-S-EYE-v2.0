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


# 👁️ God's Eye & 📚 SRM StudyMind 
**The Omni-Intelligence & AI Learning Ecosystem**

Transform unstructured information—whether from the live internet or your personal study notes—into deep, interactive, and actionable Knowledge Graphs. 

This repository houses a dual-engine architecture powered entirely by **Local AI** (Ollama), ensuring complete privacy and maximum control. It combines real-time web scraping, advanced Natural Language Processing, and Graph Database storage (Neo4j) to map out complex relationships visually.

### 🌟 The Two Engines:
1. **God's Eye (OSINT Dashboard):** An automated intelligence analyst. Give it a person, event, or concept, and it will autonomously search the web, read multiple sources, and construct a massive, physics-based knowledge web (35+ nodes) detailing hidden connections, controversies, and hierarchies.
   
2. **SRM StudyMind (Educational RAG):** A personalized AI tutor. Upload your PDFs, PPTs, or text notes to generate a hyper-specific knowledge graph of your syllabus. Chat with your materials, generate flashcards, and visualize how concepts link together for better exam preparation.

### 🚀 Key Highlights:
* **100% Local AI:** Powered by `gemma2:9b` and `nomic-embed-text` via Ollama. No expensive cloud API keys required.
* **Graph Persistence:** Backed by Neo4j to ensure knowledge isn't just generated, but permanently stored and queried.
* **Self-Healing Data:** Built-in Pydantic validators and `dirtyjson` parsers automatically fix AI hallucinations and malformed JSON.
* **Dynamic Physics Visualization:** Frontend powered by `vis-network` where high-priority relationships physically pull nodes closer together.
* **Recursive Expansion:** Right-click any node in the graph to instantly "Expand" it, triggering a targeted sub-scan to grow your intelligence web infinitely.
