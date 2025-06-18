import React, { useRef, useEffect, useState } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs-backend-webgl';

interface VirtualBackgroundProps {
  videoTrack: any;
  enabled: boolean;
  backgroundImageUrl?: string;
}

const VirtualBackground: React.FC<VirtualBackgroundProps> = ({ videoTrack, enabled, backgroundImageUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<bodyPix.BodyPix | null>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  // store interval ID for segmentation loop
  const segmentationInterval = useRef<number>(0);

  useEffect(() => {
    const loadModel = async () => {
      const net = await bodyPix.load({ architecture: 'MobileNetV1', outputStride: 16, multiplier: 0.75, quantBytes: 2 });
      setModel(net);
    };
    loadModel();
  }, []);

  useEffect(() => {
    // preload background image
    if (backgroundImageUrl) {
      const img = new Image();
      img.src = backgroundImageUrl;
      img.onload = () => setBgImage(img);
    }
    if (!enabled || !model || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    video.muted = true;
    if (!video.srcObject) {
      video.srcObject = new MediaStream([videoTrack.getMediaStreamTrack()]);
    }
    video.play();

    // set canvas size once
    const onMeta = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };
    video.addEventListener('loadedmetadata', onMeta);

    // segmentation loop every 100ms for performance
    segmentationInterval.current = window.setInterval(async () => {
      if (!ctx) return;
      const segmentation = await model.segmentPerson(video, { internalResolution: 'medium', segmentationThreshold: 0.65 });
      const mask = bodyPix.toMask(segmentation);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // draw mask (person) opaque, background transparent
      bodyPix.drawMask(canvas, video, mask, 1, 0, false);
      // draw background image under mask
      if (bgImage) {
        ctx.globalCompositeOperation = 'destination-over';
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }
    }, 100);

    return () => {
      if (segmentationInterval.current) {
        window.clearInterval(segmentationInterval.current);
      }
      canvasRef.current = null;
      video.pause();
      video.removeEventListener('loadedmetadata', onMeta);
    };
  }, [enabled, model, backgroundImageUrl, videoTrack, bgImage]);

  return (
    <div className="absolute inset-0">
      {enabled ? (
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
      ) : (
        <video ref={videoRef} className="w-full h-full object-cover" />
      )}
    </div>
  );
};

export default VirtualBackground;
