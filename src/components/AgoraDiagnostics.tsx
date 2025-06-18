// src/components/AgoraDiagnostics.tsx
import React, { useState } from 'react';
import { AGORA_CLIENT_APP_ID } from '../config/agoraConfig';

interface AgoraDiagnosticsProps {
  channel: string;
  token: string;
  appId: string;
}

const AgoraDiagnostics: React.FC<AgoraDiagnosticsProps> = ({ 
  channel, 
  token, 
  appId
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Check if App ID seems valid (typically 32 characters)
  const isValidAppIdLength = appId && appId.length === 32;
  // Check if we have a token
  const hasToken = token && token.length > 0;
  // Check if channel name is valid
  const hasChannel = channel && channel.length > 0;
  
  // Get the configured App ID from the constants
  const configAppId = AGORA_CLIENT_APP_ID;
  const configAppIdValid = configAppId && configAppId.length === 32;
  
  // Create a safety-masked version of the app ID for display
  const maskAppId = (id: string) => id ? `${id.substring(0, 3)}...${id.substring(id.length - 3)}` : 'empty';
  
  return (
    <div className="p-4 my-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-lg font-medium text-white mb-2">Agora Configuration Diagnostics</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-gray-300">App ID Status:</div>
        <div className={isValidAppIdLength ? "text-green-400" : "text-red-400"}>
          {isValidAppIdLength ? "Valid Format" : "Invalid Format"}
        </div>

        <div className="text-gray-300">Config App ID:</div>
        <div className={configAppIdValid ? "text-green-400" : "text-red-400"}>
          {configAppIdValid ? "Valid Configuration" : "Invalid Configuration"}
        </div>
        
        <div className="text-gray-300">Token Status:</div>
        <div className={hasToken ? "text-green-400" : "text-red-400"}>
          {hasToken ? "Present" : "Missing"}
        </div>
        
        <div className="text-gray-300">Channel Status:</div>
        <div className={hasChannel ? "text-green-400" : "text-red-400"}>
          {hasChannel ? channel : "Missing"}
        </div>
      </div>
      
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
      >
        {showDetails ? "Hide Details" : "Show Details"}
      </button>
      
      {showDetails && (
        <div className="mt-4 p-3 bg-gray-900 rounded text-xs font-mono text-gray-300 overflow-x-auto">
          <div>Active App ID: {maskAppId(appId)} (length: {appId?.length || 0})</div>
          <div>Config App ID: {maskAppId(configAppId)} (length: {configAppId?.length || 0})</div>
          <div>Token Length: {token?.length || 0}</div>
          <div>Channel: {channel}</div>
          <div className="mt-2 text-yellow-400">
            Next.js Environment: {typeof window !== 'undefined' ? "Client" : "Server"}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgoraDiagnostics;
