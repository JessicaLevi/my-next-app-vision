from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from .config import ALLOWED_CONTENT_TYPES, MAX_UPLOAD_BYTES, MODEL_NAME
from .detector import detect_image

app = FastAPI(title="Computer Vision API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME}

@app.post("/detect")
async def detect(image: UploadFile = File(...)):
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Format harus JPEG, PNG, atau WebP.",
        )

    contents = await image.read(MAX_UPLOAD_BYTES + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="File gambar kosong.")
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Ukuran gambar maksimum 8 MiB.")

    try:
        return detect_image(contents)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        print(f"Vision inference error: {exc}")
        raise HTTPException(status_code=500, detail="Deteksi gagal diproses.") from exc
