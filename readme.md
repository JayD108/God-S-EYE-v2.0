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


How It Works
God's Eye is an automated Open-Source Intelligence (OSINT) pipeline that transforms unstructured web data into a highly structured, visual Knowledge Graph.
Here is the step-by-step flow of data:
1. Target Acquisition (Input): The user enters a target (a person, event, or concept) into the UI and initiates a "Deep Scan".
2. Intelligent Web Scraping: The backend utilizes the DuckDuckGo Search API to fetch live, up-to-date context from the internet (articles, biographies, news, etc.) based on the selected mode.
3. Neural Processing (LLM): The scraped text is fed into a locally hosted Large Language Model (via Ollama). Using a highly optimized, density-focused prompt, the AI acts as an intelligence analyst. It extracts entities, creates category hubs (e.g., Early Life, Controversies), and defines the exact relationships and "connection weights" between them.
4. Data Healing: Because LLMs occasionally output malformed JSON, the backend passes the response through a custom regex cleaner and dirtyjson parser, validated by Pydantic models to guarantee crash-proof data ingestion.
5. Knowledge Persistence: The extracted nodes and edges are merged into a Neo4j graph database, ensuring no duplicate data is created and the knowledge is stored permanently.
6. Dynamic Visualization: The frontend pulls this network from the database and renders it using a physics-based engine (vis-network). Nodes naturally organize themselves based on their AI-assigned connection weights.
Technology Stack
Backend (The Engine):
• Python 3.10+: Core programming language.
• FastAPI: High-performance asynchronous web framework for handling API endpoints.
• Ollama: Local AI inference engine (running models like Gemma 2 or DeepSeek without requiring cloud APIs).
• Neo4j: Native graph database designed to store and query highly connected data using the Cypher query language.
• DuckDuckGo Search (ddgs): Anonymous, rate-limit-free web searching for live data retrieval.
• Pydantic: Strict data validation and typing.
• DirtyJSON: Failsafe parsing for imperfect AI outputs.
Frontend (The Dashboard):
• Vanilla HTML/CSS/JS: Lightweight, dependency-free core structure.
• vis-network: Advanced browser-based visualization library for handling physics, dynamic clustering, and interactive graph manipulation.
• Marked.js: Markdown parser to render rich, formatted AI dossiers and summaries inside the UI.
Key Features
• High-Density Extraction: Forces the AI to generate a minimum of 35+ nodes and 40+ edges per query, preventing sparse or overly summarized graphs.
• Recursive Expansion: Right-click any specific node in the graph and select "Expand Node" to trigger a targeted sub-scan, growing your intelligence web infinitely.
• Smart Physics & Gravity: Edges are assigned "Weights" (1-10) by the AI. Stronger connections physically pull nodes closer together on the screen, creating natural hierarchical clusters.
• Deep Dossiers: Clicking a central node reveals a comprehensive, multi-paragraph markdown report detailing the entity's history, rather than just a single sentence.
• Cross-Linking: The AI is instructed to connect extracted entities to each other (e.g., connecting a sibling directly to a parent), avoiding the messy "starburst" graph effect where everything just connects to the central node.
• Pathfinding & Analytics: Includes built-in Breadth-First Search (BFS) logic to highlight the shortest relationship path between any two disparate nodes on the graph.
