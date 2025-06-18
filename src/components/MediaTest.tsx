import React, { useRef, useEffect } from 'react';
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

interface MediaTestProps {
  onClose: () => void;
}

const MediaTest: React.FC<MediaTestProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const rafRef = useRef<number | null>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    (async () => {
      try {
        const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        videoTrackRef.current = camTrack;
        audioTrackRef.current = micTrack;

        // play video preview
        camTrack.play(videoRef.current!);

        // setup audio meter
        const stream = micTrack.getMediaStreamTrack();
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(new MediaStream([stream]));
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const draw = () => {
          if (!analyser || !dataArray) return;
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
          // update status text
          if (statusRef.current) {
            const active = avg > 10;
            statusRef.current.textContent = active ? '🎤 Mic Active' : '🔇 Mic Silent';
            statusRef.current.style.color = active ? '#4ade80' : '#f87171';
          }
          // draw volume bar
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const h = canvas.height;
              const w = canvas.width;
              ctx.clearRect(0, 0, w, h);
              const bar = (avg / 255) * h;
              ctx.fillStyle = '#4ade80';
              ctx.fillRect(0, h - bar, w, bar);
            }
          }
          rafRef.current = requestAnimationFrame(draw);
        };
        draw();
      } catch (err: any) {
        console.error('MediaTest init error', err);
        if (statusRef.current) {
          statusRef.current.textContent = 'Error accessing devices';
          statusRef.current.style.color = '#f87171';
        }
      }
    })();

    return () => {
      // cleanup
      videoTrackRef.current?.stop();
      audioTrackRef.current?.stop();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioContext) audioContext.close();
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center p-4 z-50">
      <h2 className="text-white mb-2">Device Test</h2>
      <span ref={statusRef} className="mb-4 text-lg">Initializing...</span>
      <div className="bg-gray-800 p-2 rounded mb-4 w-full max-w-md">
        <div className="bg-black h-48 mb-2" ref={videoRef}></div>
        <canvas ref={canvasRef} width={300} height={50} className="w-full bg-gray-700"></canvas>
      </div>
      <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Close Test</button>
    </div>
  );
};

export default MediaTest;
