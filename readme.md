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



💻 Hardware Requirements & Hardware Utilization
Because God's Eye and StudyMind rely entirely on Local AI Models to process massive amounts of text and generate complex graph structures, your hardware dictates the speed and intelligence of the system.
System Requirements
Minimum Specs (Runs Okay, but slower):
• OS: Windows 10/11, macOS (M1/M2), or Linux
• CPU: Modern 6-core+ processor (Intel i5/Ryzen 5 or Apple Silicon)
• RAM: 16 GB System Memory
• GPU: 8 GB VRAM (e.g., RTX 3060, RTX 4060)
• Storage: SSD (Required for fast Neo4j database read/writes)

Recommended "God-Tier" Specs (For instant, real-time generation):
• OS: Windows 11 or Linux
• CPU: Modern 8-core+ processor (Intel i7/Ryzen 7)
• RAM: 32 GB System Memory
• GPU: 16 GB+ VRAM (e.g., RTX 5080, RTX 4080, RTX 3090, or Mac M-series with 32GB+ Unified Memory)
• Model Used: Custom optimized gemma-flash (Based on Gemma 2 9B) or deepseek-gpu (Based on DeepSeek R1 14B).


How It Uses Your System (Under the Hood)
This ecosystem is designed to intelligently distribute the workload across your machine's components:

1. The VRAM Heavy-Lifter (Ollama & The GPU):
• The core AI reasoning (reading web pages, structuring JSON, generating node connections) is extremely compute-heavy.
• Custom GPU Offloading: We utilize a custom Ollama Modelfile with the parameter num_gpu 999. This forces the system to load 100% of the AI model's layers directly into your GPU's high-speed VRAM, preventing bottlenecking between the CPU and System RAM.
• On a 16GB VRAM GPU (like the RTX 5080), a 9B to 14B parameter model fits perfectly, resulting in lightning-fast, sub-10-second graph generation.

2. The CPU & Disk Manager (Neo4j & FastAPI):
• The Python FastAPI backend uses your CPU to orchestrate concurrent web scraping via DuckDuckGo and parse the raw data.
• The Neo4j Graph Database utilizes your storage drive (SSD highly recommended) to permanently structure and write the nodes and edges. Indexes and constraints are applied at the database level to ensure queries remain fast even when the graph scales to thousands of nodes.

3. The Browser Renderer (vis-network):
• The interactive physics simulation (where nodes pull and push against each other based on relationship "weights") is rendered on the client side.
• This means if you host the backend on a powerful PC, you can access the frontend from a low-end laptop or tablet, and it will still run perfectly smoothly.

Devs:
Mrittunjay Dubey 
Haardik Dave
Prince Siddharth 