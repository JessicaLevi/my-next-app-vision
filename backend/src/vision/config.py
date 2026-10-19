import os
MODEL_NAME = os.getenv("VISION_MODEL", "yolo26s.pt")
CONFIDENCE_THRESHOLD = float(os.getenv("VISION_CONFIDENCE", "0.25"))
MAX_UPLOAD_BYTES = int(os.getenv("VISION_MAX_UPLOAD_BYTES", str(8 * 1024 * 1024)))
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}