from fastapi import FastAPI

app = FastAPI(
    title="API Service",
    description="Service de vérification",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "API Service is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }