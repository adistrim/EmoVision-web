import cv2

def preprocess_image(image):
    feature = cv2.resize(image, (48, 48))
    feature = feature.reshape(1, 48, 48, 1)
    return feature / 255.0
