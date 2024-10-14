"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Camera() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isStreamActive, setIsStreamActive] = useState(false);
    const [emotions, setEmotions] = useState([]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreamActive(true);
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreamActive(false);
        }
    };

    const captureFrame = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg');
        }
        return null;
    };

    const predictEmotions = async (imageDataUrl) => {

        const apiUrl = process.env.NEXT_PUBLIC_API_URL

        try {
            const formData = new FormData();
            const blob = await (await fetch(imageDataUrl)).blob();
            formData.append('file', blob, 'frame.jpg');

            const response = await fetch(apiUrl, {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                setEmotions(data.emotions);
            } else {
                console.error("Error predicting emotions:", data);
            }
        } catch (error) {
            console.error("Error calling the API:", error);
        }
    };

    useEffect(() => {
        let intervalId;
        if (isStreamActive) {
            intervalId = setInterval(() => {
                const frame = captureFrame();
                if (frame) {
                    predictEmotions(frame);
                }
            }, 100);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isStreamActive]);

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
            </CardHeader>
            <CardContent>
                <div className="relative aspect-video mb-4">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full"
                    />
                </div>
                <div className="flex justify-center items-center space-x-2 my-4">
                    <h3 className="text-lg font-semibold">Detected Emotion:</h3>
                    {emotions.length > 0 && (
                        <div>
                            {emotions.map((emotion, index) => (
                                <h3 className='text-lg' key={index}>
                                    {emotion.emotion} (X: {emotion.coordinates.x}, Y: {emotion.coordinates.y})
                                </h3>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-center space-x-4">
                    <Button onClick={startCamera} disabled={isStreamActive}>
                        Start Camera
                    </Button>
                    <Button onClick={stopCamera} disabled={!isStreamActive} variant="outline">
                        Stop Camera
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}