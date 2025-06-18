"use client";
import React from "react";
import dynamic from "next/dynamic";
import { AGORA_CLIENT_APP_ID } from "../config/agoraConfig";

// Dynamically load AgoraMeeting component on client side
const AgoraMeeting = dynamic(() => import("./AgoraMeeting"), { ssr: false });

interface AgoraMeetingRoomProps {
  meetingId: string;
  token: string;
  userName: string;
}

const AgoraMeetingRoom: React.FC<AgoraMeetingRoomProps> = ({ meetingId, token, userName }) => {
  return (
    <AgoraMeeting
      channel={meetingId}
      token={token}
      appId={AGORA_CLIENT_APP_ID}
      userName={userName}
    />
  );
};

export default AgoraMeetingRoom;