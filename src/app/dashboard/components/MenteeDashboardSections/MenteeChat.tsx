"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import useChat from '@/hooks/useChat';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { FiSend, FiPaperclip } from 'react-icons/fi';

const MenteeChat: React.FC = () => {
  const { chatRooms, messages, sendMessageToRoom, getOrCreateRoomWithUser, userId, loading } = useChat();
  const supabase = useSupabaseClient();
  const [members, setMembers] = useState<Array<{ user_id: string; full_name: string; avatar_url: string }>>([]);
  useEffect(() => {
    // fetch mentors as chatable members
    supabase
      .from('mentors')
      .select('user_id, name, profile_image_url')
      .then(({ data, error }) => {
        if (!error && data) {
          setMembers(
            data.map(m => ({ user_id: m.user_id, full_name: m.name || '', avatar_url: m.profile_image_url || '' }))
          );
        }
      });
  }, [supabase]);

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');

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

  // Wait until authentication is ready
  if (!userId) {
    return <div className="p-4">Loading chat...</div>;
  }

  const filteredRooms = chatRooms.filter(room => {
    const other = room.participants.find(p => p.user_id !== userId);
    return other?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const filteredMembers = members.filter(m => m.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleRoomSelect = (roomId: string) => {
    console.log('Room clicked:', roomId);
    setSelectedRoom(roomId);
  };  const handleMemberSelect = async (otherId: string) => {
    console.log('MenteeChat: member clicked', otherId);
    console.log('MenteeChat: current userId', userId);
    
    try {
      const roomId = await getOrCreateRoomWithUser(otherId);
      console.log('MenteeChat: getOrCreateRoomWithUser returned:', roomId);
      
      if (roomId) {
        setSelectedRoom(roomId);
        setSearchTerm(''); // clear search to display rooms
        console.log('MenteeChat: room selected successfully:', roomId);
      } else {
        console.error('MenteeChat: Failed to create/get room');
      }
    } catch (error) {
      console.error('MenteeChat: Error in handleMemberSelect:', error);
    }
  };  // Send a chat message
  const handleSend = async () => {
    if (selectedRoom && newMessage.trim()) {
      console.log('MenteeChat: handleSend - Attempting to send message:', { selectedRoom, userId, message: newMessage.trim() });
      
      const success = await sendMessageToRoom(selectedRoom, newMessage.trim());
      if (success) {
        console.log('MenteeChat: handleSend - Message sent successfully');
        setNewMessage('');
      } else {
        console.error('MenteeChat: handleSend - Failed to send message');
        // Show more helpful error message to user
        alert('Failed to send message. Please check console for details.');
      }
    } else {
      console.warn('MenteeChat: handleSend - Missing selectedRoom or empty message', { selectedRoom, message: newMessage });
    }
  };
    // Upload a file and send its public URL
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
        alert('Failed to upload file: ' + uploadError.message);
        return; 
      }
      
      // Get public URL
      const { data } = supabase.storage.from('chat-files').getPublicUrl(path);      // Store file metadata in chat_files table (optional - don't fail if table doesn't exist)
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

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto">
      <div className="flex bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Chat List */}
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
            {/* show members when searching or if no rooms exist, else show existing rooms */}
            {(searchTerm || chatRooms.length === 0)
              ? filteredMembers.map(m => (
                  <div key={m.user_id} onClick={() => handleMemberSelect(m.user_id)} className="p-4 flex items-center cursor-pointer hover:bg-gray-50">
                    <Image src={m.avatar_url} alt={m.full_name} width={40} height={40} className="rounded-full" />
                    <div className="ml-4 flex-1">
                      <h4 className="font-semibold text-gray-900">{m.full_name}</h4>
                    </div>
                  </div>
                ))
              : filteredRooms.map(room => {
                  const other = room.participants.find(p => p.user_id !== userId);
                  return (
                    <div key={room.id} onClick={() => handleRoomSelect(room.id)} className="p-4 flex items-center cursor-pointer hover:bg-gray-50">
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
                })}
           </div>
         </div>
         {/* Message Area */}
         <div className="flex-1 flex flex-col">           <div className="flex-1 overflow-y-auto p-4">
             {selectedRoom && messages[selectedRoom]?.map(msg => {
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
             {/* hidden file input & paperclip label on the left */}
             <input type="file" id="mentee-file-input" accept="*/*" className="hidden" onChange={handleFileUpload} />
             <label htmlFor="mentee-file-input" className="mr-4 text-gray-500 hover:text-gray-700 cursor-pointer" aria-label="Attach file">
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
  );
};

export default MenteeChat;