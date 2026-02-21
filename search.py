from ddgs import DDGS
from ..config import SEARCH_LIMIT


def search_web(query: str, mode: str) -> tuple[str, list[dict]]:
    """
    Returns (context_string, raw_sources_list).
    raw_sources contains dicts with title, url, body keys.
    """
    ddgs   = DDGS()
    suffix = (
        "biography controversy network connections"
        if mode == "person"
        else "history implications timeline key players"
    )

    raw_sources: list[dict] = []
    try:
        results = ddgs.text(f"{query} {suffix}", max_results=SEARCH_LIMIT)
        if results:
            for r in results:
                raw_sources.append({
                    "title": r.get("title", "Unknown Source"),
                    "url":   r.get("href", r.get("url", "")),
                    "body":  r.get("body", "")[:300],
                })
    except Exception as e:
        print(f"Search Warning: {e}")

    context = "\n".join(
        [f"Source {i+1} ({s['title']}): {s['body']}" for i, s in enumerate(raw_sources)]
    )
    if not context:
        context = f"Use your full training knowledge to build a comprehensive intelligence graph about: {query}"

    return context, raw_sources