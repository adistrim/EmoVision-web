from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np
import cv2
import tensorflow as tf
from app.services.preprocess_image import preprocess_image

router = APIRouter()

loaded_model = tf.keras.models.load_model("models/emotionCheck.h5")
label = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

@router.post("/predict/")
async def predict_emotion(file: UploadFile = File(...)):
    try:
        # Read image from file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)  # Use np.frombuffer (not np.fromstring)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) # greyscale

        #  face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4)  # Adjusted values

        if len(faces) == 0:
            raise HTTPException(status_code=404, detail="No face detected")

        emotions_detected = []

        for (x, y, w, h) in faces:
            face_roi = gray[y:y + h, x:x + w]

            # Preprocess the face image and make prediction
            face_input = preprocess_image(face_roi)
            emotion_probabilities = loaded_model.predict(face_input)

            # Convert NumPy types to Python native types
            predicted_emotion = label[int(np.argmax(emotion_probabilities))]  # Convert to int

            emotions_detected.append({
                "emotion": predicted_emotion,
                "coordinates": {
                    "x": int(x),        # Convert to int
                    "y": int(y),        # Convert to int
                    "width": int(w),    # Convert to int
                    "height": int(h)    # Convert to int
                }
            })

        return {"emotions": emotions_detected}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
