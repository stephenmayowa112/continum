import React, { useEffect, useState, useRef } from "react";
import AgoraRTC, { 
  IAgoraRTCClient, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack
} from 'agora-rtc-sdk-ng';
import { AGORA_CLIENT_APP_ID } from '../config/agoraConfig';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaImage, FaTools, FaSpinner, FaCommentDots, FaDesktop, FaUsers, FaRedo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import type { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import MediaTest from './MediaTest';
import VirtualBackground from './VirtualBackground';
import ChatPanel from './ChatPanel';
import AgoraDiagnostics from './AgoraDiagnostics';

interface AgoraMeetingProps {
  channel: string;
  token: string;
  appId?: string; // made optional to allow default from config
  userName: string;
}

const AgoraMeeting: React.FC<AgoraMeetingProps> = ({ 
  channel, 
  token, 
  appId = AGORA_CLIENT_APP_ID || '6bce0f40bd7e431ea852bcb69f66ad61', 
  userName 
}) => {
  // Debug - check if App ID is available client-side
  useEffect(() => {
    // Log with more detailed information about the appId
    const appIdInfo = appId ? {
      value: `${appId.substring(0, 3)}...${appId.substring(appId.length - 3)}`, 
      length: appId.length,
      isEmpty: appId === '',
      isUndefined: appId === undefined
    } : 'undefined/empty';
    
    console.log('DEBUG Agora Configuration:', {
      configAppId: AGORA_CLIENT_APP_ID ? `${AGORA_CLIENT_APP_ID.substring(0, 3)}...${AGORA_CLIENT_APP_ID.substring(AGORA_CLIENT_APP_ID.length - 3)}` : 'not available',
      propsAppId: appIdInfo,
      tokenLength: token?.length || 0,
      channel
    });
  }, [appId, token, channel]);

  const localTracksRef = useRef<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const hasJoinedRef = useRef(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [fullScreenUser, setFullScreenUser] = useState<IAgoraRTCRemoteUser | null>(null);
  const [virtualBg, setVirtualBg] = useState(false);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string>('');

  // Revoke object URL for background image on change/unmount
  useEffect(() => {
    return () => {
      if (bgImageUrl) URL.revokeObjectURL(bgImageUrl);
    };
  }, [bgImageUrl]);

  const [showDeviceTest, setShowDeviceTest] = useState(false);
  const [chatStreamId, setChatStreamId] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const screenTrackRef = useRef<any>(null);
  // Track connection state for UX
  const [connectionState, setConnectionState] = useState<'CONNECTED'|'RECONNECTING'|'DISCONNECTED'>('CONNECTED');
  // Volume and network quality indicators
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  // Volume levels for local user (UID 0)
  const localVolumeLevel = volumes['0'] || 0;
  // Compute dynamic glow radius based on raw volume level
  const glowRadius = Math.min(localVolumeLevel * 20 + 2, 24);

  useEffect(() => {
    // Filter out non-fatal permission and SDK errors
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      // Combine all args into a single string for robust matching
      const msg = args.map(arg => {
        if (typeof arg === 'string') return arg;
        try { return JSON.stringify(arg); } catch { return String(arg); }
      }).join(' ');
      const lower = msg.toLowerCase();
      // Suppress Agora permission and internal error logs
      if (
        lower.includes('permission_denied') ||
        lower.includes('permission denied') ||
        lower.includes('notallowederror') ||
        lower.includes('agorartcerror')
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    // reduce SDK verbosity to warnings and above
    AgoraRTC.setLogLevel(2);
    let chatDataId: number | null = null;
    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    // Initialize Agora client
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    // suppress WS_ABORT traffic_stats errors
    client.on('error', async (err: any) => {
      const msg = (err.message || '').toLowerCase();
      
      // Add more detailed logging for app ID errors
      if (err.code === 'CAN_NOT_GET_GATEWAY_SERVER' && (msg.includes('invalid vendor key') || msg.includes('can not find appid'))) {
        console.error('CRITICAL: Invalid Agora App ID error:', { 
          appId: appId ? `${appId.substring(0, 3)}...${appId.substring(appId.length - 3)}` : 'undefined',
          appIdLength: appId?.length || 0,
          isEmptyString: appId === '',
          isUndefined: appId === undefined
        });
        setError(`Agora configuration error: Invalid App ID. Please check your environment variables (.env.local) and ensure NEXT_PUBLIC_AGORA_APP_ID is set correctly.`);
        return;
      }
      
      // Auto-renew token if invalid or unauthorized
      if (err.code === 'CAN_NOT_GET_GATEWAY_SERVER' || msg.includes('invalid token') || msg.includes('authorized failed')) {
        try {
          const res = await fetch(`/api/video/token?channel=${channel}`);
          const json = await res.json();
          await client.renewToken(json.token);
          console.log('Agora token renewed after error');
        } catch (renewErr: any) {
          console.error('Token renewal failed:', renewErr);
          setError('Failed to renew token: ' + (renewErr.message || renewErr));
        }
        return;
      }
      // Suppress WS_ABORT for internal stats/ping and all permission errors
      if (
        (err.code === 'WS_ABORT' && (msg.includes('traffic_stats') || msg.includes('ping'))) ||
        err.name === 'NotAllowedError' ||
        msg.includes('permission')
      ) {
        return;
      }
      console.error('AgoraRTC client error:', err);
      setError(err.message || String(err));
    });
    clientRef.current = client;

    // Define event handlers
    const onUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'video') setRemoteUsers(prev => prev.find(u => u.uid === user.uid) ? prev : [...prev, user]);
      if (mediaType === 'audio') user.audioTrack?.play();
    };
    const onUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      if (mediaType === 'video') setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      if (mediaType === 'audio') user.audioTrack?.stop();
    };
    const onUserLeft = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    };

    // Register listeners
    client.on('user-published', onUserPublished);
    client.on('user-unpublished', onUserUnpublished);
    client.on('user-left', onUserLeft);    // Join the channel when component mounts
    const joinChannel = async () => {
      // DEBUG: inspect Agora credentials
      console.log('AgoraMeeting.joinChannel => appId:', appId, 'channel:', channel, 'token length:', token?.length);
      
      // Validate App ID - make sure it's present and has correct format
      if (!appId) {
        const errorMsg = 'Missing Agora App ID (empty string).';
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }
      
      // Add validation for proper format - Agora App IDs are typically 32 characters
      if (appId.length !== 32) {
        console.warn(`App ID may be invalid: length ${appId.length} (expected 32 characters)`);
      }

      let microphoneTrack: IMicrophoneAudioTrack;
      let cameraTrack: ICameraVideoTrack;
      // Request media tracks first to trigger permissions prompt
      try {
        [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      } catch (trackError: any) {
        console.error('Track creation failed:', trackError);
        setError(trackError.message || 'Failed to access camera and microphone.');
        return;
      }      try {
        // Join the channel with the UID matching the token (default 0)
        console.log(`Joining channel: ${channel} with appId: ${appId.substring(0, 3)}...${appId.substring(appId.length - 3)}`);
        await client.join(appId, channel, token, 0);
        console.log('Successfully joined channel');
      } catch (joinError: any) {
        console.error('Error joining channel:', joinError);
        const msg = joinError.message || '';
        // Handle token expiration (dynamic key timeout) from both explicit and gateway errors
        if (joinError.code === 'DYNAMIC_KEY_TIMEOUT' ||
            (joinError.code === 'CAN_NOT_GET_GATEWAY_SERVER' && msg.toLowerCase().includes('dynamic key expired'))) {
          setError('Your token has expired. Please refresh the page to get a new token.');
        } else if (joinError.code === 'CAN_NOT_GET_GATEWAY_SERVER') {
          // If the message indicates vendor key/appId issues, surface a clear credential error
          if (msg.toLowerCase().includes('invalid vendor key') || msg.toLowerCase().includes('can not find appid')) {
            setError('Invalid Agora App ID or certificate. Please verify your AGORA_APP_ID and AGORA_APP_CERTIFICATE environment variables.');
          } else {
            setError(`Connection error: ${msg || 'Cannot connect to Agora servers'}. Please check your internet connection and Agora App ID.`);
          }
        } else if (joinError.code === 'INVALID_VENDOR_KEY') {
          setError('Invalid Agora App ID. Please check your credentials.');
        } else {
          setError(msg || 'Failed to join meeting. Check your Agora App ID and token UID.');
        }
        
         // Cleanup tracks
         microphoneTrack.close();
         cameraTrack.close();
         return;
       }

      try {
        // Publish local tracks
        await client.publish([microphoneTrack, cameraTrack]);
      } catch (publishError: any) {
        console.error('Error publishing tracks:', publishError);
        setError(publishError.message || 'Failed to publish tracks');
        return;
      }

      // store tracks and mark joined
      localTracksRef.current = [microphoneTrack, cameraTrack];
      // setup chat data stream if supported
      if (typeof (client as any).createDataStream === 'function') {
        try {
          chatDataId = await (client as any).createDataStream({ ordered: true, reliable: true }) as number;
          setChatStreamId(chatDataId);
        } catch (e: any) { // typed as any
          console.error('Failed to create chat data stream', e);
        }
      } else {
        console.warn('createDataStream not available on AgoraRTCClient, chat disabled');
      }
      setJoined(true);
    };
    joinChannel();

    // Listen to network state changes
    const onConnectionStateChange = (cur: string) => {
      // Update connection state
      if (cur === 'DISCONNECTED') {
        setConnectionState('DISCONNECTED');
      } else if (cur === 'RECONNECTING') {
        setConnectionState('RECONNECTING');
      } else if (cur === 'CONNECTED') {
        setConnectionState('CONNECTED');
        setError(null);
      }
    };
    client.on('connection-state-change', onConnectionStateChange);
    
    // Enable audio volume indicator
    (client as any).enableAudioVolumeIndicator();
    const onVolumeIndicator = (volumesArray: any[]) => {
      volumesArray.forEach(({ uid, level }) => {
        setVolumes(prev => ({ ...prev, [uid]: level }));
      });
    };
    client.on('volume-indicator', onVolumeIndicator);

    // Network quality indicator removed (not supported in SDK NG typings)

    // Clean up on unmount
    return () => {
      client.off('user-published', onUserPublished);
      client.off('user-unpublished', onUserUnpublished);
      client.off('user-left', onUserLeft);
      client.off('connection-state-change', onConnectionStateChange);
      (client as any).off('volume-indicator', onVolumeIndicator);
      const tracks = localTracksRef.current;
      if (tracks) {
        tracks[0].close();
        tracks[1].close();
      }
      if (chatDataId !== null && typeof (client as any).destroyDataStream === 'function') {
        (client as any).destroyDataStream(chatDataId);
      }
      // cleanup screen share
      if (screenTrackRef.current) {
        client.unpublish(screenTrackRef.current);
        try { screenTrackRef.current.close(); } catch {};
      }
      client.leave();
      // restore console.error
      console.error = originalConsoleError;
    };
  }, [appId, channel, token]);

  const toggleAudio = () => {
    const tracks = localTracksRef.current;
    if (tracks) {
      tracks[0].setEnabled(!audioEnabled);
      setAudioEnabled(prev => !prev);
    }
  };

  const toggleVideo = async () => {
    const client = clientRef.current;
    const tracks = localTracksRef.current;
    if (!client || !tracks) return;
    const [audioTrack, cameraTrack] = tracks;
    if (videoEnabled) {
      // Disable video: unpublish and stop camera track
      try {
        await client.unpublish(cameraTrack);
        cameraTrack.stop();
        cameraTrack.close();
      } catch (e) {
        console.warn('Error disabling video track', e);
      }
      setVideoEnabled(false);
    } else {
      // Enable video: recreate and publish camera track
      try {
        const newCameraTrack = await AgoraRTC.createCameraVideoTrack();
        localTracksRef.current = [audioTrack, newCameraTrack];
        await client.publish(newCameraTrack);
        setVideoEnabled(true);
      } catch (e: any) {
        console.error('Error enabling video track', e);
        setError(e.message || 'Failed to enable video');
      }
    }
  };

  const handleBgToggle = () => {
    if (virtualBg) {
      // disable virtual background and revoke URL
      setVirtualBg(false);
      if (bgImageUrl) URL.revokeObjectURL(bgImageUrl);
      setBgImageUrl('');
    } else {
      // open file picker
      bgFileRef.current?.click();
    }
  };

  const onBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgImageUrl(url);
      setVirtualBg(true);
    }
  };

  const toggleScreenShare = async () => {
    const client = clientRef.current;
    if (!client) return;
    if (!screenSharing) {
      setScreenShareError(null);
      // Stop and close camera track before screen share
      const tracks = localTracksRef.current;
      if (tracks && tracks[1]) {
        try {
          await client.unpublish(tracks[1]);
          tracks[1].stop();
          tracks[1].close();
        } catch (e) {
          console.warn('Error closing camera for screen share', e);
        }
      }
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({ encoderConfig: '1080p_1' });
        screenTrackRef.current = screenTrack;
        await client.publish(screenTrack);
        setScreenSharing(true);
      } catch (err: any) {
        console.error('Screen share failed', err);
        if (err.name === 'NotAllowedError' || err.code === 'PERMISSION_DENIED') {
          setScreenShareError('Screen share permission denied. Please allow screen sharing.');
        } else {
          setScreenShareError('Screen share failed: ' + (err.message || 'Unknown error'));
        }
      }
    } else {
      // Stop screen share
      if (screenTrackRef.current) {
        try {
          await client.unpublish(screenTrackRef.current);
          screenTrackRef.current.stop();
          screenTrackRef.current.close();
        } catch (e: any) {
          console.warn('Error stopping screen share', e);
        }
        screenTrackRef.current = null;
      }
      // Recreate and publish camera track after screen share
      const audioTrack = localTracksRef.current ? localTracksRef.current[0] : null;
      try {
        const newCameraTrack = await AgoraRTC.createCameraVideoTrack();
        localTracksRef.current = audioTrack ? [audioTrack, newCameraTrack] : [null as any, newCameraTrack];
        await client.publish(newCameraTrack);
        setVideoEnabled(true);
      } catch (e: any) {
        console.error('Failed to reinitialize camera after screen share', e);
        setScreenShareError('Could not restore camera: ' + (e.message || e));
      }
      setScreenSharing(false);
    }
  };

  const leaveCall = async () => {
    const client = clientRef.current;
    const tracks = localTracksRef.current;
    if (tracks) {
      tracks[0].close(); tracks[1].close();
    }
    await client?.leave();
    window.location.reload();
  };

  const toggleDeviceTest = () => {
    setShowDeviceTest(prev => !prev);
  };

  const toggleParticipants = () => setShowParticipants(prev => !prev);
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-2xl w-full p-8 bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Meeting Error</h1>
          <p className="mb-6 text-gray-300">{error}</p>
          
          {/* Display diagnostics to aid troubleshooting */}
          <AgoraDiagnostics 
            channel={channel}
            token={token}
            appId={appId}
          />
          
          <div className="flex space-x-4 mt-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              Try Again
            </button>
            <a 
              href="/dashboard" 
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Joining meeting...</p>
      </div>
    );
  }

  if (fullScreenUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="relative w-full h-full max-w-4xl max-h-full">
          <button
            onClick={() => setFullScreenUser(null)}
            className="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 p-2 rounded-full"
            title="Close Fullscreen"
            aria-label="Close Fullscreen"
          >
            ✕
          </button>
          <div className="w-full h-full bg-black">
            <RemoteVideoView user={fullScreenUser} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top header bar */}
      <div className="fixed top-0 left-0 w-full bg-gray-800 text-white flex justify-between items-center px-4 py-2 z-40">
        <span className="text-lg font-semibold">{channel}</span>
        <div className="flex items-center space-x-4">
          <button onClick={toggleParticipants} title="Participants" className="flex items-center space-x-1 hover:text-gray-300">
            <FaUsers />
            <span>{remoteUsers.length + 1}</span>
          </button>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} title="Copy Meeting Link" className="hover:text-gray-300">
            Copy Link
          </button>
        </div>
      </div>
      {/* Main meeting container with top padding for header */}
      <div className="pt-12 rounded-lg overflow-visible border border-gray-200 bg-gray-100">
        {/* Header */}
        <div className="bg-gray-900 text-white p-3 flex justify-between items-center transition-colors duration-200">
          <h3 className="font-medium">{channel}</h3>
          {/* Header icons removed — relocated to floating controls */}
        </div>  {/* end of Header */}

        {/* hidden file input for background image selection */}
        <input
          type="file"
          accept="image/*"
          ref={bgFileRef}
          onChange={onBgFileChange}
          aria-label="Select background image"
          style={{ display: 'none' }}
        />

        {/* Connection State Banner */}
        {joined && connectionState !== 'CONNECTED' && (
          <div className={
            connectionState === 'DISCONNECTED'
              ? 'bg-red-100 text-red-800 p-2 text-center'
              : 'bg-yellow-100 text-yellow-800 p-2 text-center'
          }>
            {connectionState === 'RECONNECTING' ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" /> Reconnecting...
              </span>
            ) : (
              <span>
                Connection lost. <button onClick={() => window.location.reload()} className="underline">Reconnect</button>
              </span>
            )}
          </div>
        )}

        {/* Screen share error banner */}
        {screenShareError && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 p-2 rounded z-50">
            {screenShareError}
          </div>
        )}

        {/* Floating Controls */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-75 backdrop-filter backdrop-blur-md p-4 rounded-full flex space-x-6 z-50 animate-fade-in">
          {/* Mic level indicator */}
          <motion.button
            onClick={toggleAudio}
            title={audioEnabled ? 'Mute' : 'Unmute'}
            className="text-white p-2 rounded hover:bg-gray-700"
            style={{ boxShadow: audioEnabled ? `0 0 ${glowRadius}px rgba(74,222,128, 0.8)` : undefined }}
            disabled={connectionState !== 'CONNECTED'}
            whileTap={{ scale: 0.9 }}
          >
            {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </motion.button>
          <button onClick={toggleVideo} title={videoEnabled ? 'Hide Video' : 'Show Video'} className="text-white p-2 rounded hover:bg-gray-700" disabled={connectionState !== 'CONNECTED'}>
            {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
          </button>
          <button onClick={toggleDeviceTest} title="Test Camera & Mic" className="text-white p-2 rounded hover:bg-gray-700" disabled={connectionState !== 'CONNECTED'}>
            <FaTools />
          </button>
          <motion.button onClick={toggleScreenShare} title={screenSharing ? 'Stop Sharing' : 'Share Screen'} className="text-white p-2 rounded hover:bg-gray-700" disabled={connectionState !== 'CONNECTED'} whileTap={{ scale: 0.9 }}>
            <FaDesktop />
          </motion.button>
          <motion.button onClick={() => setShowChat(prev => !prev)} title="Toggle Chat" className="text-white p-2 rounded hover:bg-gray-700" disabled={connectionState !== 'CONNECTED'} whileTap={{ scale: 0.9 }}>
            <FaCommentDots />
          </motion.button>
          <motion.button onClick={toggleParticipants} title="Participants" className="text-white p-2 rounded hover:bg-gray-700" whileTap={{ scale: 0.9 }}>
            <FaUsers />
          </motion.button>
          {/* Virtual Background toggle */}
          <motion.button
            onClick={handleBgToggle}
            title={virtualBg ? 'Disable Virtual Background' : 'Enable Virtual Background'}
            className="text-white p-2 rounded hover:bg-gray-700"
            disabled={connectionState !== 'CONNECTED'}
            whileTap={{ scale: 0.9 }}
          >
            <FaImage />
          </motion.button>
          {/* Reload Meeting button */}
          <motion.button
            onClick={() => window.location.reload()}
            title="Reload Meeting"
            className="text-white p-2 rounded hover:bg-gray-700"
            whileTap={{ scale: 0.9 }}
          >
            <FaRedo />
          </motion.button>
          <button onClick={leaveCall} title="End Call" className="text-red-500 p-2 rounded hover:bg-red-700 bg-white">
            <FaPhoneSlash />
          </button>
        </div>
        {showDeviceTest && <MediaTest onClose={toggleDeviceTest} />}

        {/* Video Layout */}
        <AnimatePresence>
          {/* Main local video view, large */}
          <motion.div key="local-video-view" className="relative w-full bg-black mb-4" style={{ height: '60vh' }}>
            {localTracksRef.current && (
              virtualBg ? (
                <VirtualBackground
                  videoTrack={localTracksRef.current[1]}
                  enabled={true}
                  backgroundImageUrl={bgImageUrl}
                />
              ) : (
                <LocalVideoView videoTrack={localTracksRef.current[1]} />
              )
            )}
          </motion.div>
          {/* Remote users thumbnails, horizontal list */}
          <motion.div key="remote-thumbnails" className="flex space-x-2 p-2 overflow-x-auto">
            {remoteUsers.map((user, idx) => (
               <div key={`${user.uid}-${idx}`} className="w-32 h-24 relative bg-black rounded-lg overflow-hidden flex-shrink-0">
                <RemoteVideoView user={user} />
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                  User {user.uid}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Chat Panel (hidden by default) */}
        {showChat && clientRef.current && (
          <ChatPanel
            client={clientRef.current}
            streamId={chatStreamId}
            userName={userName}
            channel={channel}
            participantsCount={remoteUsers.length + 1}
            onToggleParticipants={toggleParticipants}
            onClose={() => setShowChat(false)}
          />
        )}
        {/* Participants Panel */}
        {showParticipants && (
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-50 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Participants ({remoteUsers.length + 1})</h3>
              <button onClick={toggleParticipants} className="text-gray-600 hover:text-gray-800">✕</button>
            </div>
            <ul className="flex-1 overflow-auto">
              {/* Local user */}
              <li className="flex items-center mb-2">
                <FaMicrophoneSlash className="mr-2 text-green-500" />
                <span>You</span>
              </li>
              {/* Remote users */}
              {remoteUsers.map((user, idx) => (
                <li key={`${user.uid}-${idx}`} className="flex items-center mb-2">
                  {volumes[user.uid]?.toString() && volumes[user.uid]! > 0 ? (
                    <FaMicrophone className="mr-2 text-green-500" />
                  ) : (
                    <FaMicrophoneSlash className="mr-2 text-red-400" />
                  )}
                  <span>User {user.uid}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

const RemoteVideoView = ({ user }: { user: IAgoraRTCRemoteUser }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const el = videoRef.current;
    if (el && user.videoTrack) {
      try {
        user.videoTrack.play(el);
      } catch (err) {
        console.error('Error playing remote track', err);
      }
    }
    
    return () => {
      user.videoTrack?.stop();
    };
  }, [user]);
  
  return <div ref={videoRef} className="h-full w-full"></div>;
};

const LocalVideoView = ({ videoTrack }: { videoTrack: ICameraVideoTrack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      try {
        videoTrack.play(el);
        // Ensure full camera feed is visible without zoom
        const videoElem = el.querySelector('video');
        if (videoElem) {
          videoElem.style.objectFit = 'contain';
        }
      } catch (err) {
        console.error('Error playing local track', err);
      }
    }
    return () => {
      try { videoTrack.stop(); } catch {};
    };
  }, [videoTrack]);
  return <div ref={containerRef} className="h-full w-full bg-black"></div>;
};

export default AgoraMeeting;
