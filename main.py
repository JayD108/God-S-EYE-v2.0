import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database       import init_driver
from backend.routers        import graph_router, feedback_router

app = FastAPI(title="God's Eye — Omni Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialise DB connection on startup
init_driver()

# Register routers
app.include_router(graph_router,    prefix="/api")
app.include_router(feedback_router, prefix="/api")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)