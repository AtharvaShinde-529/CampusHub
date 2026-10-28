import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import { MessageSquare, Megaphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ClubManagement() {
  const { id } = useParams();
  const [members, setMembers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
    fetchAnnouncements();
  }, [id]);

  const fetchMembers = async () => {
    const res = await api.get(`/organizations/${id}/members`);
    setMembers(res.data);
  };

  const fetchAnnouncements = async () => {
    const res = await api.get(`/announcements/${id}`);
    setAnnouncements(res.data);
  };

  const updateRole = async (memberId: string, role: string) => {
    await api.patch(`/organizations/members/${memberId}`, { role });
    fetchMembers();
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/announcements', { title, content, organizationId: id });
      toast.success('Announcement sent to all members!');
      setTitle(''); setContent(''); setShowModal(false);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 pb-12">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 mt-4 space-y-8">
        
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Club Management</h1>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-500 transition shadow-md">
                <Megaphone size={18} /> Broadcast
              </button>
              <button onClick={() => navigate('/dashboard')} className="bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-slate-600 transition">Back</button>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Manage Members</h2>
          <div className="space-y-4">
            {members.map(member => {
               const firstName = member.user.studentProfile?.firstName || member.user.facultyProfile?.firstName || '';
               const lastName = member.user.studentProfile?.lastName || member.user.facultyProfile?.lastName || '';
               const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';
               
               return (
                <div key={member.id} className="border border-slate-200 dark:border-slate-700 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <div>
                    <Link to={`/user/${member.userId}`} className="font-bold text-lg text-brand-600 hover:underline">
                      {fullName}
                    </Link>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{member.user.email}</p>
                    <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-1">Role: {member.role}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link to={`/chat/${member.userId}`} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                      <MessageSquare size={18} /> Message
                    </Link>
                    <select 
                      className="border border-slate-300 dark:border-slate-600 p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 outline-none" 
                      value={member.role} 
                      onChange={(e) => updateRole(member.id, e.target.value)}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="COMMITTEE_MEMBER">Committee Member</option>
                      <option value="CLUB_HEAD">Club Head</option>
                    </select>
                  </div>
                </div>
               );
            })}
            {members.length === 0 && <p className="text-slate-500 dark:text-slate-400">No members found.</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Megaphone className="text-brand-600" /> Past Announcements
          </h2>
          <div className="space-y-4">
            {announcements.map(ann => (
              <div key={ann.id} className="border-l-4 border-brand-500 pl-4 py-2">
                <h3 className="font-bold text-slate-800 dark:text-white">{ann.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{ann.content}</p>
                <p className="text-xs text-slate-400 mt-2">{new Date(ann.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-slate-500 dark:text-slate-400">No announcements sent yet.</p>}
          </div>
        </div>

      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Send Announcement</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><X size={24}/></button>
              </div>
              <form onSubmit={handleSendAnnouncement} className="space-y-4">
                <input type="text" placeholder="Announcement Title" required className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none text-slate-800 dark:text-white" value={title} onChange={e => setTitle(e.target.value)} />
                <textarea placeholder="Write your message to all members..." required rows={4} className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none text-slate-800 dark:text-white" value={content} onChange={e => setContent(e.target.value)} />
                <button type="submit" disabled={sending} className="w-full bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-500 transition shadow-md disabled:opacity-50">
                  {sending ? 'Sending...' : 'Broadcast to Members'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
