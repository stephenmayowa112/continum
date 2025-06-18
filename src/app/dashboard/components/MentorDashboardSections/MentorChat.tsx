"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import useChat from '@/hooks/useChat';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { FiSend, FiPaperclip } from 'react-icons/fi';

const MentorChat: React.FC = () => {
  const { chatRooms, messages, sendMessageToRoom, getOrCreateRoomWithUser, userId, loading } = useChat();
  const supabase = useSupabaseClient();
  
  // DEBUG: log rooms and messages for troubleshooting
  useEffect(() => {
    console.log('MentorChat - chatRooms:', chatRooms);
    console.log('MentorChat - messages:', messages);
  }, [chatRooms, messages]);
  const [members, setMembers] = useState<Array<{ user_id: string; full_name: string; avatar_url: string }>>([]);

  // Fetch all mentees as potential chat members
  useEffect(() => {
    supabase
      .from('mentees')
      .select('user_id, name, profile_image_url')
      .then(({ data, error }) => {
        if (!error && data) {
          setMembers(
            data.map(m => ({ user_id: m.user_id, full_name: m.name || '', avatar_url: m.profile_image_url || '' }))
          );
        }
      });
  }, [supabase]);

  // Internal state for room, search and message
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  
  // Auto-select the first room on initial load
  useEffect(() => {
    if (!selectedRoom && chatRooms.length > 0) {
      setSelectedRoom(chatRooms[0].id);
    }
  }, [chatRooms, selectedRoom]);

  // User clicks a member to start or open a room
  const handleMemberSelect = async (otherId: string) => {
    try {
      const roomId = await getOrCreateRoomWithUser(otherId);
      if (roomId) {
        setSelectedRoom(roomId);
        setSearchTerm('');
      }
    } catch (err) {
      console.error('MentorChat: handleMemberSelect error', err);
    }
  };
  
  const handleRoomSelect = (roomId: string) => setSelectedRoom(roomId);
  // Send a chat message in the selected room
  const handleSend = async () => {
    if (selectedRoom && newMessage.trim()) {
      const success = await sendMessageToRoom(selectedRoom, newMessage.trim());
      if (success) {
        setNewMessage('');
      } else {
        console.error('MentorChat: failed to send message');
      }
    }
  };  // Upload a file and send its public URL
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedRoom) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB');
      return;
    }
    
    try {
      const ext = file.name.split('.').pop();
      const path = `${selectedRoom}/${Date.now()}.${ext}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(path, file);
      
      if (uploadError) {
        console.error('Upload error:', uploadError.message);
        if (uploadError.message.includes('Bucket not found')) {
          alert('Upload failed: storage bucket "chat-files" not found. Please create this bucket in your Supabase project storage.');
        } else {
          alert('Failed to upload file: ' + uploadError.message);
        }
        return;
      }
      
      // Get public URL
      const { data } = supabase.storage.from('chat-files').getPublicUrl(path);
        // Store file metadata in chat_files table (optional - don't fail if table doesn't exist)
      try {
        const { error: dbError } = await supabase
          .from('chat_files')
          .insert({
            room_id: selectedRoom,
            sender_id: userId,
            file_name: file.name,
            file_url: data.publicUrl
          });
        
        if (dbError) {
          console.warn('chat_files table insert failed (table may not exist yet):', dbError);
        }
      } catch (dbErr) {
        console.warn('chat_files table operation failed:', dbErr);
      }
      
      // Send the file URL as a message
      await sendMessageToRoom(selectedRoom, `📎 ${file.name}: ${data.publicUrl}`);
    } catch (error) {
      console.error('File upload failed:', error);
      alert('File upload failed. Please try again.');
    }
  };

  // Show loading skeleton while fetching chat data
  if (loading) {
    return (
      <div className="flex animate-pulse flex-col w-full max-w-6xl mx-auto">
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Left skeleton list */}
          <div className="w-1/3 border-r border-gray-100 p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded" />
            ))}
          </div>
          {/* Right skeleton messages */}
          <div className="flex-1 flex flex-col p-4 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 self-start" />
            <div className="h-4 bg-gray-200 rounded w-1/2 self-end" />
            <div className="h-4 bg-gray-200 rounded w-2/3 self-start" />
          </div>
        </div>
      </div>
    );
  }

  // Show loading until authentication is ready
  if (!userId) {
    return <div className="p-4">Loading authentication...</div>;
  }

  const filteredRooms = chatRooms.filter(room => {
    const other = room.participants.find(p => p.user_id !== userId);
    return other?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const filteredMembers = members.filter(m => m.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return userId ? (
    <div className="flex flex-col w-full max-w-6xl mx-auto">
      {/* Chat Interface - Split View */}
      <div className="flex bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Left side - Chat List */}
        <div className="w-1/3 border-r border-gray-100">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search member"
              className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Member List - Scrollable Container */}
          <div className="h-[calc(100vh-250px)] overflow-y-auto scrollbar-hide" style={{ overflowY: 'auto', height: 'calc(100vh - 250px)' }}>
            <style jsx global>{`
              /* Hide scrollbar for Chrome, Safari and Opera */
              .scrollbar-hide::-webkit-scrollbar { display: none; }
              
              /* Hide scrollbar for IE, Edge and Firefox */
              .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; overflow-y: auto !important; }
            `}</style>
            
            {/* Show search results: members when searching or if no rooms exist, else show existing rooms */}
            {(searchTerm || chatRooms.length === 0) ? (
              filteredMembers.map(m => {
                const isActive = chatRooms.some(
                  r => r.id === selectedRoom && r.participants.some(p => p.user_id === m.user_id)
                );
                return (
                  <div
                    key={m.user_id}
                    onClick={() => handleMemberSelect(m.user_id)}
                    className={`p-4 flex items-center cursor-pointer hover:bg-gray-50 ${isActive ? 'bg-blue-100' : ''}`}
                  >
                    <Image src={m.avatar_url} alt={m.full_name} width={40} height={40} className="rounded-full" />
                    <div className="ml-4 flex-1">
                      <h4 className="font-semibold text-gray-900">{m.full_name}</h4>
                    </div>
                  </div>
                );
              })
            ) : (
              filteredRooms.map(room => {
                const other = room.participants.find(p => p.user_id !== userId);
                const isActive = room.id === selectedRoom;
                return (
                  <div
                    key={room.id}
                    onClick={() => handleRoomSelect(room.id)}
                    className={`p-4 flex items-center cursor-pointer hover:bg-gray-50 ${isActive ? 'bg-blue-100' : ''}`}
                  >
                    <Image src={other?.avatar_url || ''} alt={other?.full_name || 'User'} width={40} height={40} className="rounded-full" />
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-semibold text-gray-900">{other?.full_name}</h4>
                        <span className="text-xs text-gray-400">{new Date(room.last_message_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{room.last_message}</p>
                    </div>
                  </div>
                );
              })
            )}
           </div>
         </div>
         
         {/* Right side - Chat Messages */}
         <div className="flex-1 flex flex-col">           <div className="flex-1 overflow-y-auto p-4">
             {selectedRoom != null && messages[selectedRoom]?.map(msg => {
               // Check if message is a file link
               const isFileMessage = msg.text.startsWith('📎 ') && msg.text.includes(': https://');
               
               if (isFileMessage) {
                 const [fileInfo, fileUrl] = msg.text.split(': ');
                 const fileName = fileInfo.replace('📎 ', '');
                 
                 return (
                   <div key={msg.id} className={`mb-2 ${msg.sender_id === userId ? 'text-right' : 'text-left'}`}>
                     <div className="inline-block px-4 py-2 rounded-lg bg-blue-100 text-gray-800">
                       <div className="flex items-center gap-2">
                         <span>📎</span>
                         <a 
                           href={fileUrl} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="text-blue-600 hover:text-blue-800 underline"
                         >
                           {fileName}
                         </a>
                       </div>
                     </div>
                     <p className="text-xs text-gray-400 mt-1">{new Date(msg.inserted_at).toLocaleTimeString()}</p>
                   </div>
                 );
               }
               
               return (
                 <div key={msg.id} className={`mb-2 ${msg.sender_id === userId ? 'text-right' : 'text-left'}`}>
                   <p className="inline-block px-4 py-2 rounded-lg bg-blue-100 text-gray-800">{msg.text}</p>
                   <p className="text-xs text-gray-400 mt-1">{new Date(msg.inserted_at).toLocaleTimeString()}</p>
                 </div>
               );
             })}
           </div>
           <div className="p-4 border-t border-gray-100 flex items-center">
             {/* File upload on left */}
             <input type="file" id="mentor-file-input" accept="*/*" className="hidden" onChange={handleFileUpload} />
             <label htmlFor="mentor-file-input" className="mr-4 text-gray-500 hover:text-gray-700 cursor-pointer" aria-label="Attach file">
               <FiPaperclip size={20} />
             </label>
             <input
               type="text"
               className="flex-1 pl-4 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="Type a message"
               value={newMessage}
               onChange={e => setNewMessage(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
             />
             <button onClick={handleSend} className="ml-4 text-blue-500 hover:text-blue-600" aria-label="Send message">
               <FiSend size={20} />
             </button>
           </div>
         </div>
       </div>
    </div>
  ) : (
    <div className="p-4">Loading chat...</div>
  );
};

export default MentorChat;