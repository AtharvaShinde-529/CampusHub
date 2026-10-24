import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import { Send, MessageSquare } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

export default function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUser, setActiveUser] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();

    // Listen for incoming WebSocket messages
    socket.on('newMessage', (msg: any) => {
      // If the message belongs to the current open chat, append it
      if ((msg.senderId === currentUser.id && msg.receiverId === userId) || 
          (msg.senderId === userId && msg.receiverId === currentUser.id)) {
        setMessages((prev) => [...prev, msg]);
      }
      // Refresh conversation list to show latest message
      fetchConversations();
    });

    return () => {
      socket.off('newMessage');
    };
  }, [userId, currentUser.id]);

  useEffect(() => {
    if (userId) {
      fetchMessages(userId);
    }
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    const res = await api.get('/messages/conversations');
    setConversations(res.data);
  };

  const fetchMessages = async (otherId: string) => {
    const res = await api.get(`/messages/${otherId}`);
    setMessages(res.data);
    
    const active = conversations.find(c => c.id === otherId);
    if (active) setActiveUser(active);
    else setActiveUser({ id: otherId, email: 'User', avatarUrl: null });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    // Emit to WebSocket instead of REST API
    socket.emit('sendMessage', {
      senderId: currentUser.id,
      receiverId: userId,
      content: newMessage
    });
    
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 pb-12">
      <Navbar />
      
      <div className="max-w-6xl mx-auto mt-6 px-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex h-[calc(100vh-10rem)]">
          
          {/* Sidebar: Conversations List */}
          <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => navigate(`/chat/${c.id}`)}
                  className={`p-4 flex items-center gap-3 cursor-pointer border-b border-slate-100 dark:border-slate-700 transition ${userId === c.id ? 'bg-brand-50 dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                >
                  {c.avatarUrl ? (
                    <img src={c.avatarUrl} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-purple-500 text-white flex items-center justify-center font-bold text-lg">
                      {c.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-white truncate">{c.email}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{c.latestMessage}</p>
                  </div>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="p-8 text-center text-slate-500">No conversations yet.</div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
            {userId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50">
                  {activeUser?.avatarUrl ? (
                    <img src={activeUser.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-purple-500 text-white flex items-center justify-center font-bold">
                      {activeUser?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <h3 className="font-bold text-slate-800 dark:text-white">{activeUser?.email || 'Chat'}</h3>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, index) => {
                    const isMine = msg.senderId === currentUser.id;
                    return (
                      <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-2xl ${isMine ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-tl-none'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-brand-200' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-500 transition shadow-md">
                    <Send size={20} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <MessageSquare size={64} className="mb-4 opacity-50" />
                <h2 className="text-2xl font-bold">Your Messages</h2>
                <p>Select a conversation to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}