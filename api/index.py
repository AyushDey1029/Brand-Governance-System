from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "healthy", "platform": "vercel-serverless"}

@app.get("/api/test")
def test():
    return {"message": "hello from vercel serverless"}
