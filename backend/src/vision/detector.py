import base64
from io import BytesIO
import cv2
from ultralytics import YOLO
from .config import MODEL_NAME, CONFIDENCE_THRESHOLD

_model = YOLO(MODEL_NAME)

def detect_image(image_bytes: bytes) -> dict:
    array = __import__("numpy").frombuffer(image_bytes, dtype="uint8")
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("File tidak dapat dibaca sebagai gambar.")

    results = _model.predict(
        source=image,
        conf=CONFIDENCE_THRESHOLD,
        verbose=False,
    )
    result = results[0]
    names = result.names
    detections = []

    if result.boxes is not None:
        for box in result.boxes:
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())
            xyxy = box.xyxy[0].tolist()
            detections.append({
                "class_id": class_id,
                "label": str(names[class_id]),
                "confidence": confidence,
                "confidence_percent": confidence * 100,
                "bbox_xyxy": {
                    "x1": float(xyxy[0]),
                    "y1": float(xyxy[1]),
                    "x2": float(xyxy[2]),
                    "y2": float(xyxy[3]),
                },
            })

    annotated = result.plot()
    ok, encoded = cv2.imencode(".jpg", annotated)
    if not ok:
        raise RuntimeError("Gagal membuat gambar anotasi.")

    image_b64 = base64.b64encode(encoded.tobytes()).decode("ascii")
    return {
        "count": len(detections),
        "detections": detections,
        "model": MODEL_NAME,
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "annotated_image": f"data:image/jpeg;base64,{image_b64}",
    }
