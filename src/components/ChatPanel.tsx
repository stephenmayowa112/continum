import React, { useState, useEffect, useRef } from 'react';
import type { IAgoraRTCClient, UID } from 'agora-rtc-sdk-ng';
import { FaLink, FaUsers } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EmojiPicker from 'emoji-picker-react';
import Image from 'next/image';

interface ChatPanelProps {
  client: IAgoraRTCClient;
  streamId: number | null;
  userName: string;
  channel: string;
  participantsCount: number;
  onToggleParticipants: () => void;
  onClose: () => void;
}

type Message = {
  id: string;
  user: string;
  type: 'text' | 'file';
  status?: 'pending' | 'sent' | 'seen';
  text?: string;
  fileName?: string;
  fileType?: string;
  data?: string;
  timestamp: number;
};

const ChatPanel: React.FC<ChatPanelProps> = ({ client, streamId, userName, channel, participantsCount, onToggleParticipants, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const lastTypingSentRef = useRef<number>(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (streamId !== null && client) {
      const handleStreamMessage = (uid: UID, payload: Uint8Array, eventStreamId: number) => {
        if (eventStreamId !== streamId) return; // Filter messages for this specific stream
        const decodedMsg = new TextDecoder().decode(payload);
        const msgObj = JSON.parse(decodedMsg) as any;
        // Handle typing indicator
        if (msgObj.type === 'typing' && msgObj.user !== userName) {
          setTypingUsers(prev => Array.from(new Set([...prev, msgObj.user])));
          setTimeout(() => setTypingUsers(prev => prev.filter(u => u !== msgObj.user)), 3000);
          return;
        }
        // Handle ACKs
        if (msgObj.type === 'ack') {
          setMessages(prev => prev.map(m => m.id === msgObj.ackId ? { ...m, status: 'seen' } : m));
          return;
        }
        // Handle incoming text/file
        if (msgObj.type === 'text' || msgObj.type === 'file') {
          // ACK back
          const ack = { user: userName, type: 'ack', ackId: msgObj.id, timestamp: Date.now() };
          const payloadAck = new TextEncoder().encode(JSON.stringify(ack));
          (client as any).sendStreamMessage(streamId, payloadAck).catch(() => {});
          // Append message
          const msg: Message = { ...msgObj, status: 'sent' };
          setMessages(prev => {
            const arr: Message[] = [...prev, msg];
            arr.sort((a, b) => a.timestamp - b.timestamp);
            return arr;
          });
        }
      };
      
      // Type assertion for client methods if not fully typed by IAgoraRTCClient for stream messages
      (client as any).on('stream-message', handleStreamMessage);
      
      return () => {
        (client as any).off('stream-message', handleStreamMessage);
      };
    }
  }, [client, streamId, userName]); // streamId is crucial here

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    scrollToBottom();
    // Removed incorrect cleanup for 'stream-message' from here
  }, [messages]);

  const sendText = async () => {
    if (!input.trim()) return;
    const id = `${Date.now()}-${Math.random()}`;
    const msg: Message = { id, user: userName, type: 'text', text: input.trim(), timestamp: Date.now(), status: 'pending' };
    // Append locally
    setMessages(prev => {
      const arr: Message[] = [...prev, msg];
      arr.sort((a, b) => a.timestamp - b.timestamp);
      return arr;
    });
    setInput('');
    setTypingUsers([]);
    if (streamId !== null) {
      try {
        const payload = new TextEncoder().encode(JSON.stringify(msg));
        await (client as any).sendStreamMessage(streamId, payload);
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'sent' } : m));
      } catch { /* swallow */ }
    }
  };

  const sendFile = () => {
    const file = fileRef.current?.files?.[0];
    if (!file || streamId === null) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const id = `${Date.now()}-${Math.random()}`;
      const msg: Message = { id, user: userName, type: 'file', fileName: file.name, fileType: file.type, data: dataUrl, timestamp: Date.now() };
      try {
        const payload = new TextEncoder().encode(JSON.stringify(msg));
        await (client as any).sendStreamMessage(streamId, payload);
        setMessages(prev => {
          const arr = [...prev, msg];
          arr.sort((a, b) => a.timestamp - b.timestamp);
          return arr;
        });
        fileRef.current!.value = '';
      } catch (error) {
        console.error('Failed to send file message:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handler for drag-and-drop file uploads
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (fileRef.current) {
      fileRef.current.files = e.dataTransfer.files;
      // reuse existing sendFile logic
      sendFile();
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg flex flex-col z-50">
      {/* Header: channel, status, copy link, participants, close */}
      <div className="p-3 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-700">{channel}</span>
          <span className="text-sm text-green-600">Active</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} title="Copy Link" className="text-gray-600 hover:text-gray-800">
            <FaLink />
          </button>
          <button onClick={onToggleParticipants} title="Participants" className="flex items-center space-x-1 text-gray-600 hover:text-gray-800">
            <FaUsers /><span className="text-sm">{participantsCount}</span>
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors text-xl" aria-label="Close chat">
            &times;
          </button>
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto p-3 bg-gray-50"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.user === userName ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-xs p-2 rounded-lg shadow ${m.user === userName ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              <strong className="text-sm block mb-0.5">{m.user === userName ? 'You' : m.user}</strong>
              {m.type === 'text' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text || ''}</ReactMarkdown>
              ) : m.fileType?.startsWith('image/') ? (
                <>
                  <Image src={m.data!} alt={m.fileName || ''} width={200} height={150} objectFit="contain" className="mb-1 rounded" />
                  <a href={m.data} download={m.fileName} className="text-sm underline">{m.fileName}</a>
                </>
              ) : (
                <a href={m.data} download={m.fileName} className="text-sm underline">{m.fileName} ({m.fileType})</a>
              )}
              <div className={`text-xs mt-1 ${m.user === userName ? 'text-blue-200' : 'text-gray-500'} text-right`}>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {typingUsers.length > 0 && <div className="text-xs text-gray-500 italic">{typingUsers.join(', ')} typing...</div>}
      </div>
      <div className="p-3 border-t border-gray-300 bg-gray-100 relative">
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            aria-label="Chat message"
            placeholder="Type a message..."
            value={input}
            onChange={e => {
              setInput(e.target.value);
              const now = Date.now();
              if (streamId && now - lastTypingSentRef.current > 2000) {
                lastTypingSentRef.current = now;
                const typingEvent = { user: userName, type: 'typing', timestamp: now };
                (client as any).sendStreamMessage(streamId, new TextEncoder().encode(JSON.stringify(typingEvent))).catch(() => {});
              }
            }}
            onKeyPress={e => e.key === 'Enter' && sendText()}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <button onClick={() => setShowEmojiPicker(prev => !prev)} type="button" aria-label="Emoji picker" className="text-gray-600">
            😊
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-24 right-3 z-50">
              <EmojiPicker onEmojiClick={(emoji) => setInput(prev => prev + emoji.emoji)} />
            </div>
          )}
          <button onClick={sendText} disabled={!input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
            Send
          </button>
        </div>
        <label htmlFor="file-input" className="sr-only">Attach file</label>
        <input
          id="file-input"
          type="file"
          ref={fileRef}
          onChange={sendFile}
          aria-label="Select file to send"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
    </div>
  );
};

export default ChatPanel;
