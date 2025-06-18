"use client";
import React, { useEffect } from "react";
import { MeetingProvider, useMeeting, useParticipant } from "@videosdk.live/react-sdk";

interface MeetingRoomProps {
  meetingId: string;
  token: string;
  userName: string;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ meetingId, token, userName }) => {
  return (
    <MeetingProvider
      config={{
        meetingId,
        name: userName,
        micEnabled: true,
        webcamEnabled: true,
        debugMode: false, // required by SDK types
      }}
      token={token}
    >
      <MeetingInner />
    </MeetingProvider>
  );
};

const MeetingInner: React.FC = () => {
  const { join, leave, participants } = useMeeting();

  useEffect(() => {
    join();
    return () => {
      leave();
    };
  }, [join, leave]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from(participants.values()).map((participant) => (
        <ParticipantView key={participant.id} participantId={participant.id} />
      ))}
    </div>
  );
};

interface ParticipantViewProps {
  participantId: string;
}

const ParticipantView: React.FC<ParticipantViewProps> = ({ participantId }) => {
  const { displayName, webcamStream, webcamOn } = useParticipant(participantId);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (webcamOn && webcamStream && videoRef.current) {
      // Cast SDK stream to MediaStream for video element
      videoRef.current.srcObject = webcamStream as unknown as MediaStream;
    }
  }, [webcamStream, webcamOn]);

  return (
    <div className="border rounded-lg p-2">
      <video
        autoPlay
        playsInline
        muted={!webcamOn}
        ref={videoRef}
        className="w-full h-auto rounded"
      />
      <p className="text-center mt-2 font-medium">{displayName}</p>
    </div>
  );
};

export default MeetingRoom;
