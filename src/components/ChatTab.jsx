import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Smile, Paperclip, Search, ShieldAlert, Circle, User, FileText, Image, FileSpreadsheet, File as FileIcon, Download, X, Loader2, Trash2, Mic, MicOff, Square, ChevronLeft } from 'lucide-react';
import { io } from 'socket.io-client';
import { getChatMessages, uploadChatAttachment, deleteChatMessage, getDoctors, getPatients, getChatContacts } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://homeoai-backend-83yt.onrender.com/api';
const HOST_URL = API_URL.replace('/api', '');

// Custom premium AudioPlayer component with seek-bar and NO download option
const AudioPlayer = ({ src, isMe }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error(err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      if (dur === Infinity || isNaN(dur)) {
        // Fast-seek to end to force the browser to compute duration
        audioRef.current.currentTime = 1e10;
        audioRef.current.ontimeupdate = () => {
          audioRef.current.ontimeupdate = handleTimeUpdate; // restore standard handler
          audioRef.current.currentTime = 0;
          setDuration(audioRef.current.duration || 0);
        };
      } else {
        setDuration(dur || 0);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleScrub = (e) => {
    if (audioRef.current && duration > 0 && isFinite(duration)) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl min-w-0 sm:min-w-[200px] max-w-full shadow-sm ${
      isMe ? 'bg-white/10 text-white' : 'bg-slate-50 border border-slate-200/60 text-slate-800'
    }`}>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
        preload="metadata"
      />
      
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ${
          isMe ? 'bg-white text-[#062E6F]' : 'bg-[#062E6F] text-white'
        }`}
      >
        {isPlaying ? (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <rect x="4" y="4" width="4" height="16" rx="1"></rect>
            <rect x="16" y="4" width="4" height="16" rx="1"></rect>
          </svg>
        ) : (
          <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"></path>
          </svg>
        )}
      </button>

      {/* Progress & Duration */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleScrub}
          className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-current opacity-80 hover:opacity-100 transition-opacity"
          style={{
            background: `linear-gradient(to right, ${isMe ? '#fff' : '#062E6F'} 0%, ${isMe ? '#fff' : '#062E6F'} ${duration ? (currentTime / duration) * 100 : 0}%, ${isMe ? 'rgba(255,255,255,0.2)' : '#e2e8f0'} ${duration ? (currentTime / duration) * 100 : 0}%, ${isMe ? 'rgba(255,255,255,0.2)' : '#e2e8f0'} 100%)`
          }}
        />
        <div className="flex justify-between items-center text-[9px] font-medium leading-none mt-0.5">
          <span className={isMe ? 'text-blue-100' : 'text-slate-500'}>
            {formatTime(currentTime)}
          </span>
          <span className={isMe ? 'text-blue-100' : 'text-slate-500'}>
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ChatTab({ role = 'Director', lang = 'en', currentUser = null }) {
  const isPatient = role === 'Patient';
  const t = (en, hi) => lang === 'en' ? en : hi;

  // Use actual logged-in user's ID from database
  const myId = currentUser?._id || 'unknown-user';
  const myName = currentUser?.name || 'User';
  


  // Dynamic contact lists from database
  const [doctorsList, setDoctorsList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);

  const contacts = isPatient ? doctorsList : patientsList;

  // Ref to always-current patientsList (avoids stale closure in socket handler)
  const patientsListRef = useRef(patientsList);
  useEffect(() => { patientsListRef.current = patientsList; }, [patientsList]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState(null);
  
  // Chat history database by contact ID
  const [chats, setChats] = useState({});

  const chatEndRef = useRef(null);

  // Attachment states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Typing indicator states
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Deletion menu states
  const [activeMenuMessageId, setActiveMenuMessageId] = useState(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recordingStreamRef = useRef(null);

  // Refs to always hold latest socket + selectedContact (avoids stale closures in recorder.onstop)
  const socketRef = useRef(socket);
  const selectedContactRef = useRef(selectedContact);
  useEffect(() => { socketRef.current = socket; }, [socket]);
  useEffect(() => { selectedContactRef.current = selectedContact; }, [selectedContact]);

  // Helper: format raw user/doctor data from API into a contact object
  const formatContact = (user, idx, type) => {
    const colors = [
      'bg-amber-600', 'bg-sky-600', 'bg-rose-600', 'bg-teal-600', 'bg-orange-600',
      'bg-slate-800', 'bg-emerald-700', 'bg-indigo-700', 'bg-blue-700', 'bg-purple-700'
    ];
    return {
      id: user._id || user.id,
      name: user.name || (type === 'doctor' ? 'Doctor' : 'Patient'),
      role: user.specialization || user.type || user.role,
      type: user.type || user.role,
      lastMessage: user.lastMessage || null,
      lastMessageTime: user.lastMessageTime || null,
      online: false,
      avatarColor: colors[idx % colors.length]
    };
  };

  // Fetch contacts from database on mount (and when role changes)
  const fetchContacts = useCallback(async (silent = false) => {
    if (!silent) setContactsLoading(true);
    try {
      if (isPatient) {
        // Patients see all approved doctors
        const doctors = await getDoctors();
        const formattedDoctors = (doctors || []).map((doc, idx) => formatContact(doc, idx, 'doctor'));
        setDoctorsList(formattedDoctors);
        if (formattedDoctors.length > 0 && !selectedContactRef.current) {
          setSelectedContact(formattedDoctors[0]);
        }
      } else {
        // Doctors/Admin see patients — backend returns patients sorted by last message
        const patientsData = await getChatContacts();
        const userArray = patientsData.users || [];
        const formattedPatients = userArray.map((user, idx) => formatContact(user, idx, 'patient'));
        setPatientsList(formattedPatients);
        if (formattedPatients.length > 0 && !selectedContactRef.current) {
          setSelectedContact(formattedPatients[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      if (!silent) setContactsLoading(false);
    }
  }, [isPatient]); // Uses selectedContactRef to avoid stale closure / infinite loop

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert(t("File size exceeds 50MB limit.", "फ़ाइल का आकार 50MB सीमा से अधिक है।"));
        return;
      }
      setSelectedFile(file);
    }
  };

  // Format seconds as mm:ss
  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      audioChunksRef.current = [];

      // Pick the best supported format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const chunks = [...audioChunksRef.current];
        audioChunksRef.current = [];

        if (chunks.length === 0) {
          console.warn('No audio data recorded');
          return;
        }

        const blob = new Blob(chunks, { type: mimeType });
        if (blob.size === 0) {
          console.warn('Empty audio blob');
          return;
        }

        const ext = mimeType.includes('ogg') ? 'ogg' : 'webm';
        const audioFile = new File([blob], `voice-message-${Date.now()}.${ext}`, { type: mimeType });

        // Stop all mic tracks
        stream.getTracks().forEach(t => t.stop());
        recordingStreamRef.current = null;

        // ── Step 1: Show audio bubble IMMEDIATELY via local blob URL ──
        const localBlobUrl = URL.createObjectURL(blob);
        const tempId = 'temp-audio-' + Date.now();
        const contact = selectedContactRef.current;
        const contactId = contact.id;
        const msgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const localMsg = {
          id: tempId,
          sender: 'me',
          text: '',
          time: msgTime,
          attachmentUrl: localBlobUrl,   // local blob — plays instantly
          attachmentName: audioFile.name,
          attachmentType: mimeType,
          isLocalBlob: true
        };
        setChats(prev => ({ ...prev, [contactId]: [...(prev[contactId] || []), localMsg] }));

        // ── Step 2: Upload in background, then emit via socket ──
        setIsUploading(true);
        try {
          const res = await uploadChatAttachment(audioFile);
          if (res.success) {
            const serverUrl = res.data.fileUrl;

            // Replace local blob msg with server URL msg
            setChats(prev => {
              const list = prev[contactId] || [];
              return {
                ...prev,
                [contactId]: list.map(m =>
                  m.id === tempId
                    ? { ...m, attachmentUrl: serverUrl, isLocalBlob: false }
                    : m
                )
              };
            });

            // Emit to socket so the other user receives it
            const currentSocket = socketRef.current;
            if (currentSocket) {
              const roomId = [myId, contact.id].sort().join('_');
              currentSocket.emit('send_message', {
                roomId,
                senderId: myId,
                text: '',
                time: msgTime,
                attachmentUrl: serverUrl,
                attachmentName: audioFile.name,
                attachmentType: mimeType,
              }, (response) => {
                if (response?.success && response._id) {
                  setChats(prev => {
                    const list = prev[contactId] || [];
                    return { ...prev, [contactId]: list.map(m => m.id === tempId ? { ...m, id: response._id } : m) };
                  });
                }
              });
            }
          }
        } catch (err) {
          console.error('Audio upload failed:', err);
        } finally {
          setIsUploading(false);
        }
      };

      recorder.start(100); // collect data every 100ms — avoids empty blob bug
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert(t('Microphone access is required for voice messages.', 'वॉइस संदेश के लिए माइक्रोफ़ोन की अनुमति आवश्यक है।'));
    }
  }, []);

  const stopRecording = useCallback(() => {
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingDuration(0);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingDuration(0);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach(t => t.stop());
      recordingStreamRef.current = null;
    }
    audioChunksRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(recordingTimerRef.current);
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Ref-safe version used inside recorder.onstop (reads live socket + contact via refs)
  const sendAudioMessageViaRef = (attachmentData) => {
    const contact = selectedContactRef.current;
    const currentSocket = socketRef.current;
    const tempId = 'temp-' + Date.now();
    const contactId = contact.id;
    const newMsg = {
      id: tempId,
      sender: 'me',
      text: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentUrl: attachmentData.url,
      attachmentName: attachmentData.name,
      attachmentType: attachmentData.type
    };
    setChats(prev => ({ ...prev, [contactId]: [...(prev[contactId] || []), newMsg] }));
    if (currentSocket) {
      const roomId = [myId, contact.id].sort().join('_');
      currentSocket.emit('send_message', {
        roomId,
        senderId: myId,
        text: '',
        time: newMsg.time,
        attachmentUrl: newMsg.attachmentUrl,
        attachmentName: newMsg.attachmentName,
        attachmentType: newMsg.attachmentType
      }, (response) => {
        if (response?.success && response._id) {
          setChats(prev => {
            const list = prev[contactId] || [];
            return { ...prev, [contactId]: list.map(m => m.id === tempId ? { ...m, id: response._id } : m) };
          });
        }
      });
    }
  };

  const sendAudioMessage = (attachmentData) => {
    if (!selectedContact) return;
    
    const tempId = 'temp-' + Date.now();
    const contactId = selectedContact.id;
    const newMsg = {
      id: tempId,
      sender: 'me',
      text: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentUrl: attachmentData.url,
      attachmentName: attachmentData.name,
      attachmentType: attachmentData.type
    };
    setChats(prev => ({ ...prev, [contactId]: [...(prev[contactId] || []), newMsg] }));
    if (socket) {
      const roomId = [myId, selectedContact.id].sort().join('_');
      socket.emit('send_message', {
        roomId,
        senderId: myId,
        text: '',
        time: newMsg.time,
        attachmentUrl: newMsg.attachmentUrl,
        attachmentName: newMsg.attachmentName,
        attachmentType: newMsg.attachmentType
      }, (response) => {
        if (response?.success && response._id) {
          setChats(prev => {
            const list = prev[contactId] || [];
            return { ...prev, [contactId]: list.map(m => m.id === tempId ? { ...m, id: response._id } : m) };
          });
        }
      });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderFileIcon = (typeOrName) => {
    const nameStr = String(typeOrName).toLowerCase();
    if (nameStr.startsWith('image/')) {
      return <Image className="h-5 w-5 text-emerald-600" />;
    } else if (nameStr.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (nameStr.includes('word') || nameStr.includes('docx') || nameStr.includes('doc')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (nameStr.includes('sheet') || nameStr.includes('xls') || nameStr.includes('xlsx') || nameStr.includes('csv')) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
    }
    return <FileIcon className="h-5 w-5 text-slate-500" />;
  };

  // Close message dropdown menu on clicking anywhere else
  useEffect(() => {
    const handleWindowClick = () => setActiveMenuMessageId(null);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  useEffect(() => {
    // Connect to Render backend for Socket.IO
    const backendURL = 'https://homeoai-backend-83yt.onrender.com';
    const newSocket = io(backendURL, {
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      withCredentials: true,
      auth: { token: localStorage.getItem('homeo_auth_token') },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    newSocket.on('connect', () => {
      // Socket.IO connected
    });
    
    newSocket.on('connect_error', () => {
      // Connection failed silently — will retry automatically
    });
    
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!selectedContact) return;
    const roomId = [myId, selectedContact.id].sort().join('_');
    getChatMessages(roomId)
      .then(msgs => {
        const formatted = (msgs || []).map(m => ({
          id: m._id,
          sender: m.senderId === myId ? 'me' : 'them',
          text: m.text,
          time: m.time,
          attachmentUrl: m.attachmentUrl,
          attachmentName: m.attachmentName,
          attachmentType: m.attachmentType
        }));
        setChats(prev => ({
          ...prev,
          [selectedContact.id]: formatted
        }));
      })
      .catch(err => console.error("Could not fetch messages:", err));
  }, [selectedContact, myId]);

  // Join the selected contact's room when it changes
  useEffect(() => {
    if (!socket || !selectedContact) return;
    const roomId = [myId, selectedContact.id].sort().join('_');
    socket.emit('join_room', roomId);
  }, [socket, selectedContact, myId]);

  // Global receive_message handler — independent of selectedContact
  // This ensures messages from ANY patient/doctor arrive correctly
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (data) => {
      const senderId = data.senderId;

      // Add message to the correct chat thread
      setChats(prev => ({
        ...prev,
        [senderId]: [...(prev[senderId] || []), {
          id: data._id || data.id,
          sender: 'them',
          text: data.text,
          time: data.time,
          attachmentUrl: data.attachmentUrl,
          attachmentName: data.attachmentName,
          attachmentType: data.attachmentType
        }]
      }));

      // If the sender is NOT already in our contacts list, add them dynamically
      // (handles the case where a patient messages first before the doctor loaded contacts)
      if (!isPatient) {
        const currentList = patientsListRef.current;
        const alreadyInList = currentList.some(c => c.id === senderId);
        if (!alreadyInList && data.senderName) {
          const newContact = {
            id: senderId,
            name: data.senderName || 'Patient',
            role: 'Patient',
            type: 'Patient',
            lastMessage: data.text || (data.attachmentName ? '📎 Attachment' : ''),
            lastMessageTime: new Date().toISOString(),
            online: false,
            avatarColor: ['bg-amber-600', 'bg-sky-600', 'bg-rose-600', 'bg-teal-600', 'bg-orange-600'][currentList.length % 5]
          };
          setPatientsList(prev => [newContact, ...prev]);
        } else {
          // Update last message preview for existing contacts
          setPatientsList(prev => prev.map(c =>
            c.id === senderId
              ? { ...c, lastMessage: data.text || (data.attachmentName ? '📎 Attachment' : c.lastMessage), lastMessageTime: new Date().toISOString() }
              : c
          ));
        }
      }

      // Stop typing indicator if the message came from selected contact
      setIsOtherUserTyping(false);
    };

    const handleDeleteMessageEvent = (data) => {
      const { messageId } = data;
      setChats(prev => {
        const updated = {};
        Object.keys(prev).forEach(contactId => {
          updated[contactId] = (prev[contactId] || []).filter(msg => msg.id !== messageId);
        });
        return updated;
      });
    };

    const handleUserTyping = (data) => {
      if (selectedContactRef.current && data.userId === selectedContactRef.current.id) {
        setIsOtherUserTyping(data.isTyping);
      }
    };

    socket.on('receive_message', handleReceive);
    socket.on('message_deleted', handleDeleteMessageEvent);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('message_deleted', handleDeleteMessageEvent);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, isPatient]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, selectedContact]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() && !selectedFile) return;
    if (!selectedContact) return;

    // Stop typing indicator
    if (socket && selectedContact) {
      const roomId = [myId, selectedContact.id].sort().join('_');
      socket.emit('stop_typing', {
        roomId,
        userId: myId,
        userName: 'User'
      });
    }

    // Clear typing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    let attachmentData = null;
    if (selectedFile) {
      setIsUploading(true);
      try {
        const res = await uploadChatAttachment(selectedFile);
        if (res.success) {
          attachmentData = {
            url: res.data.fileUrl,
            name: res.data.fileName,
            type: res.data.fileType
          };
        }
      } catch (err) {
        console.error("Failed to upload attachment:", err);
        alert(t("Failed to upload file. Please try again.", "फ़ाइल अपलोड करने में विफल। कृपया पुन: प्रयास करें।"));
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const tempId = 'temp-' + Date.now();
    const newMsg = {
      id: tempId,
      sender: 'me',
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentUrl: attachmentData ? attachmentData.url : null,
      attachmentName: attachmentData ? attachmentData.name : null,
      attachmentType: attachmentData ? attachmentData.type : null
    };

    const contactId = selectedContact.id;
    setChats(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMsg]
    }));

    if (socket) {
      const roomId = [myId, selectedContact.id].sort().join('_');
      socket.emit('send_message', {
        roomId,
        senderId: myId,
        text: messageInput,
        time: newMsg.time,
        attachmentUrl: newMsg.attachmentUrl,
        attachmentName: newMsg.attachmentName,
        attachmentType: newMsg.attachmentType
      }, (response) => {
        if (response && response.success && response._id) {
          // Update the message ID from tempId to the database _id!
          setChats(prev => {
            const list = prev[contactId] || [];
            const updatedList = list.map(m => m.id === tempId ? { ...m, id: response._id } : m);
            return {
              ...prev,
              [contactId]: updatedList
            };
          });
        }
      });
    }

    setMessageInput('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!msgId || !selectedContact) return;
    try {
      // Call REST API to delete from DB with senderId
      await deleteChatMessage(msgId, myId);
      
      // Emit socket event to notify other clients
      if (socket) {
        const roomId = [myId, selectedContact.id].sort().join('_');
        socket.emit('delete_message', {
          roomId,
          messageId: msgId
        });
      }

      // Update state locally
      setChats(prev => ({
        ...prev,
        [selectedContact.id]: (prev[selectedContact.id] || []).filter(m => m.id !== msgId)
      }));
    } catch (err) {
      console.error("Failed to delete message:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete message.";
      alert(t(errorMsg, "संदेश हटाने में विफल।"));
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);

    if (!socket || !selectedContact) return;

    const roomId = [myId, selectedContact.id].sort().join('_');

    // Emit typing event
    if (value.trim()) {
      socket.emit('typing', {
        roomId,
        userId: myId,
        userName: 'User' // You can pass actual user name if available
      });

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Stop typing after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        socket.emit('stop_typing', {
          roomId,
          userId: myId,
          userName: 'User'
        });
      }, 2000);

      setTypingTimeout(timeout);
    } else {
      // If input is empty, stop typing immediately
      socket.emit('stop_typing', {
        roomId,
        userId: myId,
        userName: 'User'
      });
    }
  };

  const activeMessages = selectedContact ? (chats[selectedContact.id] || []) : [];

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-white">
      
      {/* Sidebar contact list - Hidden on mobile when chat is open */}
      <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col min-h-0 bg-white ${
        selectedContact ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Search bar */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('Search messages...', 'संदेश खोजें...')}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30"
            />
          </div>
        </div>

        {/* Contacts */}
        <div 
          className="flex-1 overflow-y-auto overscroll-y-contain thin-scroll divide-y divide-slate-50"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {contactsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 text-[#062E6F] animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <User className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs text-slate-400">
                {isPatient 
                  ? t('No doctors available', 'कोई डॉक्टर उपलब्ध नहीं है')
                  : t('No patients available', 'कोई मरीज़ उपलब्ध नहीं है')
                }
              </p>
            </div>
          ) : (
            contacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              return (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50/60 transition-colors text-left ${
                    isSelected ? 'bg-[#062E6F]/5 border-l-4 border-[#062E6F]' : ''
                  }`}
                >
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full ${contact.avatarColor || 'bg-slate-600'} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                      {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{contact.name}</h4>
                      {isPatient && contact.type && (
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap shrink-0 ${
                          contact.type === 'Admin'
                            ? 'bg-rose-600/10 text-rose-700'
                            : contact.type === 'Core Team' 
                            ? 'bg-[#062E6F]/10 text-[#062E6F]' 
                            : 'bg-emerald-600/10 text-emerald-700'
                        }`}>
                          {contact.type}
                        </span>
                      )}
                      {!isPatient && contact.lastMessageTime && (
                        <span className="text-[8px] text-slate-300 whitespace-nowrap shrink-0">
                          {new Date(contact.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {isPatient
                        ? (contact.role || contact.type || '')
                        : (contact.lastMessage || 'No messages yet')
                      }
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Info panel */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-slate-500">
          <ShieldAlert className="h-4 w-4 text-[#062E6F]" />
          <span className="text-[10px] leading-tight font-medium">
            {t('End-to-end encrypted medical consultation.', 'सुरक्षित और गोपनिय चिकित्सा परामर्श।')}
          </span>
        </div>
      </div>

      {/* Main chat window - Hidden on mobile when no contact selected */}
      <div className={`flex-1 min-h-0 flex flex-col bg-slate-50/40 ${
        !selectedContact ? 'hidden md:flex' : 'flex'
      }`}>
        
        {!selectedContact ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center space-y-2">
              <User className="h-12 w-12 text-slate-300 mx-auto" />
              <p className="text-sm font-medium">
                {t('Select a contact to start chatting', 'चैट शुरू करने के लिए एक संपर्क चुनें')}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Back button - only visible on mobile */}
                <button
                  onClick={() => setSelectedContact(null)}
                  className="md:hidden text-slate-600 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition-colors -ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={t('Back to contacts', 'संपर्कों पर वापस')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${selectedContact.avatarColor || 'bg-slate-600'} text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0`}>
                  {selectedContact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 truncate">{selectedContact.name}</h3>
                    {isPatient && selectedContact.type && (
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold ${
                        selectedContact.type === 'Admin'
                          ? 'bg-rose-600/10 text-rose-700'
                          : selectedContact.type === 'Core Team' 
                          ? 'bg-[#062E6F]/10 text-[#062E6F]' 
                          : 'bg-emerald-600/10 text-emerald-700'
                      }`}>
                        {selectedContact.type}
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 flex items-center gap-1">
                    {isOtherUserTyping ? (
                      <>
                        <span className="flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 bg-[#062E6F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-[#062E6F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-[#062E6F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                        <span className="text-[#062E6F] font-medium">{t('typing...', 'टाइप कर रहे हैं...')}</span>
                      </>
                    ) : (
                      <>
                        <Circle className={`h-1.5 w-1.5 fill-current ${selectedContact.online ? 'text-emerald-500' : 'text-slate-300'}`} />
                        {selectedContact.online ? t('Online', 'सक्रिय') : t('Offline', 'निष्क्रिय')}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

        {/* Message bubbles area */}
        <div 
          className="flex-1 p-3 sm:p-4 overflow-y-auto overscroll-y-contain space-y-3 thin-scroll"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {activeMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <User className="h-10 w-10 text-slate-300 bg-slate-100 p-2 rounded-full" />
              <p className="text-xs font-semibold">{t('No messages yet. Send a greeting!', 'अभी कोई संदेश नहीं है। बधाई भेजें!')}</p>
            </div>
          ) : (
            activeMessages.map((msg, i) => {
              const isMe = msg.sender === 'me';
              const isMenuOpen = activeMenuMessageId === msg.id;
              return (
                <div key={msg.id || i} className={`flex items-center gap-1.5 ${isMe ? 'justify-end flex-row-reverse' : 'justify-start flex-row'} animate-fade-in group relative`}>
                  <div className={`max-w-[70%] rounded-xl px-3.5 py-2.5 shadow-sm text-xs relative ${
                    isMe 
                      ? 'bg-[#062E6F] text-white rounded-br-none' 
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                  }`}>
                    {/* Render Attachment if exists */}
                    {msg.attachmentUrl && (
                      <div className="mb-2">
                        {/* Audio message player */}
                        {(msg.attachmentType?.startsWith('audio/') || msg.attachmentName?.match(/\.(webm|ogg|mp3|wav|m4a)$/i)) ? (
                          <div className="py-1">
                            <AudioPlayer
                              src={msg.attachmentUrl.startsWith('blob:') || msg.attachmentUrl.startsWith('http') ? msg.attachmentUrl : `${HOST_URL}${msg.attachmentUrl}`}
                              isMe={isMe}
                            />
                          </div>
                        ) : msg.attachmentType?.startsWith('image/') ? (
                          <div className="relative rounded-lg overflow-hidden border border-slate-200/50 bg-slate-50 max-w-xs">
                            <img
                              src={msg.attachmentUrl.startsWith('blob:') || msg.attachmentUrl.startsWith('http') ? msg.attachmentUrl : `${HOST_URL}${msg.attachmentUrl}`}
                              alt={msg.attachmentName}
                              className="max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(msg.attachmentUrl.startsWith('blob:') || msg.attachmentUrl.startsWith('http') ? msg.attachmentUrl : `${HOST_URL}${msg.attachmentUrl}`, '_blank')}
                            />
                          </div>
                        ) : (
                          <div className={`flex items-center gap-2 p-2 rounded-lg border ${
                            isMe 
                              ? 'bg-white/10 border-white/20 text-white' 
                              : 'bg-slate-50 border-slate-100 text-slate-800'
                          }`}>
                            {renderFileIcon(msg.attachmentType || msg.attachmentName)}
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold truncate leading-normal">
                                {msg.attachmentName}
                              </p>
                              <p className={`text-[8px] ${isMe ? 'text-orange-200' : 'text-slate-400'}`}>
                                {msg.attachmentType?.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
                              </p>
                            </div>
                            <a
                              href={msg.attachmentUrl.startsWith('blob:') || msg.attachmentUrl.startsWith('http') ? msg.attachmentUrl : `${HOST_URL}${msg.attachmentUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-2 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                                isMe 
                                  ? 'hover:bg-white/20 text-white' 
                                  : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    {msg.text && <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>}
                    <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                      {msg.time}
                    </span>
                  </div>

                  {/* Direct Dustbin (Delete) Button on hover - Only show for own messages */}
                  {isMe && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-lg p-0.5 shadow-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(t("Delete this message/attachment?", "क्या आप इस संदेश/संलग्नक को हटाना चाहते हैं?"))) {
                            handleDeleteMessage(msg.id);
                          }
                        }}
                        className="p-2 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center min-h-[44px] min-w-[44px]"
                        title={t("Delete message", "संदेश हटाएं")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Attachment Preview Area */}
        {selectedFile && (
          <div className="px-3 md:px-4 py-2 border-t border-slate-100 bg-white flex items-center justify-between animate-fade-in shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg p-2 max-w-[90%] truncate">
              {renderFileIcon(selectedFile.type || selectedFile.name)}
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-700 truncate">{selectedFile.name}</p>
                <p className="text-[9px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              {isUploading && (
                <Loader2 className="h-3 w-3 text-[#062E6F] animate-spin ml-2 shrink-0" />
              )}
            </div>
            <button
              type="button"
              disabled={isUploading}
              onClick={handleRemoveFile}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-2 sm:p-3 md:p-4 border-t border-slate-200 bg-white flex items-center gap-1.5 sm:gap-2 shrink-0 w-full min-w-0">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
          />

          {isRecording ? (
            /* ── Recording Active UI ── */
            <>
              {/* Cancel button */}
              <button
                type="button"
                onClick={cancelRecording}
                className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                title={t('Cancel recording', 'रिकॉर्डिंग रद्द करें')}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Live recording indicator */}
              <div className="flex-1 flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2 min-w-0">
                {/* Pulsing red dot */}
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
                {/* Waveform bars animation */}
                <div className="hidden sm:flex items-end gap-0.5 h-5">
                  {[1,2,3,4,5,6,7].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-red-400 rounded-full animate-pulse"
                      style={{
                        height: `${30 + Math.sin(i * 1.2) * 40}%`,
                        animationDelay: `${i * 80}ms`,
                        animationDuration: `${600 + i * 100}ms`
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-red-700 tabular-nums">
                  {formatDuration(recordingDuration)}
                </span>
                <span className="text-[10px] text-red-500 ml-auto shrink-0">
                  {t('Recording…', 'रिकॉर्ड…')}
                </span>
              </div>

              {/* Stop & Send button */}
              <button
                type="button"
                onClick={stopRecording}
                disabled={isUploading}
                className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-sm min-h-[44px] min-w-[44px]"
                title={t('Stop and send', 'रोकें और भेजें')}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-3.5 w-3.5 fill-white" />}
              </button>
            </>
          ) : (
            /* ── Normal Input UI ── */
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex text-slate-400 hover:text-slate-600 p-2.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] items-center justify-center shrink-0"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={t('Type a message...', 'संदेश लिखें...')}
                className="flex-1 min-w-0 border border-slate-200 rounded-lg px-2.5 sm:px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F] min-h-[44px]"
              />

              <button type="button" className="flex text-slate-400 hover:text-slate-600 p-2.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] items-center justify-center shrink-0">
                <Smile className="h-4 w-4" />
              </button>

              {/* Mic button — shown when input is empty, Send when typing */}
              {messageInput.trim() || selectedFile ? (
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`bg-[#062E6F] hover:bg-[#042050] text-white p-2.5 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer min-h-[44px] min-w-[44px] ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isUploading}
                  className="bg-[#062E6F] hover:bg-[#042050] text-white p-2.5 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer min-h-[44px] min-w-[44px]"
                  title={t('Send voice message', 'वॉइस भेजें')}
                >
                  <Mic className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </form>
      </>
        )}
      </div>

    </div>
  );
}
