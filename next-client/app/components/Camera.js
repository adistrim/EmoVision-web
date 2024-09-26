'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';

export default function Camera() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isStreamActive, setIsStreamActive] = useState(false);
    const [model, setModel] = useState(null);

    useEffect(() => {
        loadModel();
        return () => {
            stopCamera();
        };
    }, []);

    const loadModel = async () => {
        await tf.ready();
        const loadedModel = await blazeface.load();
        setModel(loadedModel);
        console.log("Blazeface model loaded");
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreamActive(true);
                detectFaces();
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

    const detectFaces = async () => {
        if (model && videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            const detectFrame = async () => {
                if (isStreamActive) {
                    const predictions = await model.estimateFaces(video, false);

                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    predictions.forEach(prediction => {
                        const start = prediction.topLeft;
                        const end = prediction.bottomRight;
                        const size = [end[0] - start[0], end[1] - start[1]];

                        ctx.strokeStyle = 'red';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(start[0], start[1], size[0], size[1]);
                    });

                    requestAnimationFrame(detectFrame);
                }
            };

            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                detectFrame();
            };
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Face Detection</CardTitle>
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