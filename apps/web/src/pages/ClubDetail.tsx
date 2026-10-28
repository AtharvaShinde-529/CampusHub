import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, Users, Calendar, Megaphone, Briefcase, GraduationCap, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [org, setOrg] = useState<any>(null);
  const [myMembership, setMyMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [orgRes, myClubsRes] = await Promise.all([api.get(`/organizations/${id}`), api.get('/organizations/my')]);
      setOrg(orgRes.data);
      setMyMembership(myClubsRes.data.find((m: any) => m.organizationId === id));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      await api.post(`/organizations/${id}/join`);
      toast.success('Successfully joined the club!');
      loadData();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to join'); }
    setJoining(false);
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this club?')) return;
    try {
      await api.delete(`/organizations/${id}/leave`);
      toast.success('You have left the club.');
      loadData();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to leave'); }
  };

  if (loading) return <div className="min-h-screen bg-surface-50 dark:bg-slate-900 flex items-center justify-center text-xl text-brand-600 font-bold">Loading club...</div>;
  if (!org) return <div className="min-h-screen bg-surface-50 dark:bg-slate-900 flex items-center justify-center text-xl text-slate-500">Club not found.</div>;

  const guardians = org.facultyGuardian;
  const heads = org.memberships?.filter((m: any) => m.role === 'CLUB_HEAD') || [];
  const totalMembers = org.memberships?.length || 0;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto w-full p-6 mt-4 space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 font-bold transition">
          <ArrowLeft size={20} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white">
          <div className="flex items-center gap-2 mb-4"><span className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full uppercase tracking-wider">{org.category}</span></div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{org.name}</h1>
          <p className="text-emerald-100 text-lg max-w-3xl">{org.description}</p>
          <div className="flex flex-wrap gap-6 mt-6 text-sm font-semibold">
            <div className="flex items-center gap-2"><Users size={18} /> {totalMembers} Members</div>
            <div className="flex items-center gap-2"><Calendar size={18} /> {org.events?.length || 0} Upcoming Events</div>
            {guardians && <div className="flex items-center gap-2"><GraduationCap size={18} /> Guardian: {guardians.facultyProfile?.firstName} {guardians.facultyProfile?.lastName}</div>}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Calendar className="text-indigo-600" /> Upcoming Events</h2>
              {org.events?.length > 0 ? (
                <div className="space-y-4">
                  {org.events.map((event: any) => (
                    <Link to={`/events/${event.id}`} key={event.id} className="block p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md hover:border-indigo-300 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 dark:text-white">{event.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{event.description}</p>
                          <div className="flex gap-4 mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>📅 {new Date(event.startDate).toLocaleDateString('en-IN')}</span>
                            {event.venue && <span>📍 {event.venue}</span>}
                          </div>
                        </div>
                        {event.isFest && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">FEST</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : <p className="text-slate-500 dark:text-slate-400">No upcoming events.</p>}
            </div>

            {org.announcements?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Megaphone className="text-brand-600" /> Latest Announcements</h2>
                <div className="space-y-4">
                  {org.announcements.map((ann: any) => (
                    <div key={ann.id} className="border-l-4 border-brand-500 pl-4 py-1">
                      <h3 className="font-bold text-slate-800 dark:text-white">{ann.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{ann.content}</p>
                      <p className="text-xs text-slate-400 mt-2">{new Date(ann.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {org.recruitmentCycles?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Briefcase className="text-purple-600" /> Open Recruitment</h2>
                <div className="space-y-3">
                  {org.recruitmentCycles.map((cycle: any) => (
                    <Link to="/recruitment" key={cycle.id} className="block p-4 border border-purple-200 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:shadow-md transition">
                      <h3 className="font-bold text-purple-900 dark:text-purple-300">{cycle.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deadline: {new Date(cycle.deadline).toLocaleString('en-IN')}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Membership</h3>
              {myMembership ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                    <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
                    <p className="font-bold text-green-700 dark:text-green-400">You are a {myMembership.role.replace('_', ' ')}</p>
                  </div>
                  {myMembership.role !== 'CLUB_HEAD' && (
                    <button onClick={handleLeave} className="w-full bg-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-200 transition">Leave Club</button>
                  )}
                  {myMembership.role === 'CLUB_HEAD' && (
                    <Link to={`/organizations/${id}/manage`} className="block w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition text-center">Manage Club</Link>
                  )}
                </div>
              ) : user.role === 'STUDENT' ? (
                <button onClick={handleJoin} disabled={joining} className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-500 transition disabled:opacity-50">
                  {joining ? 'Joining...' : 'Join Club'}
                </button>
              ) : (
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl text-center"><p className="text-sm font-bold text-slate-600 dark:text-slate-300">Only students can join this club.</p></div>
              )}
            </div>

            {heads.length > 0 && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Club Heads</h3>
                <div className="space-y-2">
                  {heads.map((h: any) => (
                    <Link to={`/user/${h.userId}`} key={h.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                      <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">{(h.user.studentProfile?.firstName || h.user.facultyProfile?.firstName)?.charAt(0)}</div>
                      <div><p className="font-bold text-sm text-slate-800 dark:text-white">{h.user.studentProfile?.firstName} {h.user.studentProfile?.lastName}</p><p className="text-xs text-slate-500 dark:text-slate-400">{h.user.email}</p></div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}