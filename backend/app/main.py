from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .endpoints.translation import router as translation_router
from .endpoints.speech import router as speech_router
import os
from fastapi.responses import FileResponse

app = FastAPI()

# Enable CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Absolute path to the frontend
frontend_path = os.path.join(os.path.dirname(__file__), "../../frontend")

# Serve static files
app.mount("/static", StaticFiles(directory=os.path.join(frontend_path, "static")), name="static")
app.mount("/frontend", StaticFiles(directory=frontend_path, html=True), name="frontend")

@app.get("/")
async def serve_frontend():
    """Returns the index.html file"""
    return FileResponse(os.path.join(frontend_path, "templates", "index.html"))

# Register API routes
app.include_router(translation_router, prefix="/api")
app.include_router(speech_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)