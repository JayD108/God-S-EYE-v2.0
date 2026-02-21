# ─── CONFIGURATION ───────────────────────────────────────────────────────────
NEO4J_URI  = "neo4j://127.0.0.1:7687"
NEO4J_AUTH = ("neo4j", "password123")

# OPTIMIZATION: Use 'gemma2:9b' for 3x speed, or 'gemma2:27b' for max intelligence.
MODEL = "gemma-flash"

# PERFORMANCE: 4 results is the sweet spot for speed vs context depth
SEARCH_LIMIT = 4