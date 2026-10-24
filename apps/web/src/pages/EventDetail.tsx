import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, Calendar, MapPin, Users, Tag, CheckCircle, AlertTriangle, Building2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [event, setEvent] = useState<any>(null);
  const [myReg, setMyReg] = useState<any>(null);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [showAttendees, setShowAttendees] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [eventRes, regsRes, clubsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get('/events/my'),
        api.get('/organizations/my')
      ]);
      setEvent(eventRes.data);
      setMyReg(regsRes.data.find((r: any) => r.eventId === id));
      setMyClubs(clubsRes.data.filter((m: any) => m.role === 'CLUB_HEAD' || m.role === 'COMMITTEE_MEMBER'));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleRegister = async () => {
    try {
      const res = await api.post(`/events/${id}/register`);
      alert(res.data.status === 'WAITLISTED' ? 'Event is full. You have been added to the waitlist.' : 'Registered successfully!');
      loadData();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to register'); }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    try {
      await api.delete(`/events/${id}/cancel`);
      alert('Registration cancelled.');
      loadData();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to cancel'); }
  };

  const loadAttendees = async () => {
    try {
      const res = await api.get(`/events/${id}/attendees`);
      setAttendees(res.data);
      setShowAttendees(true);
    } catch (err) { alert('Failed to load attendees'); }
  };

  const markAttendance = async (regId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ATTENDED' ? 'REGISTERED' : 'ATTENDED';
    try {
      await api.patch(`/events/attendees/${regId}`, { status: newStatus });
      const res = await api.get(`/events/${id}/attendees`);
      setAttendees(res.data);
    } catch (err) { alert('Failed to update'); }
  };

  if (loading) return <div className="min-h-screen bg-surface-50 dark:bg-slate-900 flex items-center justify-center text-xl text-brand-600 font-bold">Loading event...</div>;
  if (!event) return <div className="min-h-screen bg-surface-50 dark:bg-slate-900 flex items-center justify-center text-xl text-slate-500">Event not found.</div>;

  const registeredCount = event.registrations?.filter((r: any) => r.status === 'REGISTERED').length || 0;
  const isFull = event.maxCapacity && registeredCount >= event.maxCapacity;
  const isManager = myClubs.some(c => c.organization.id === event.organizationId);
  const isPast = new Date(event.startDate) < new Date();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto w-full p-6 mt-4 space-y-6">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 font-bold transition">
          <ArrowLeft size={20} /> Back
        </button>

        {/* Hero Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`relative overflow-hidden rounded-3xl shadow-lg ${event.isFest ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-brand-600 to-purple-600'} p-8 text-white`}>
          <div className="flex items-center gap-2 mb-4">
            <Link to={`/clubs/${event.organizationId}`} className="flex items-center gap-1.5 text-sm font-bold bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition">
              <Building2 size={14} /> {event.organization?.name}
            </Link>
            {event.isFest && <span className="text-xs font-bold bg-yellow-300 text-yellow-900 px-3 py-1.5 rounded-full">🎪 Major Fest</span>}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{event.title}</h1>
          <div className="flex flex-wrap gap-6 text-sm font-semibold">
            <div className="flex items-center gap-2"><Calendar size={18} /> {new Date(event.startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
            {event.venue && <div className="flex items-center gap-2"><MapPin size={18} /> {event.venue}</div>}
            {event.maxCapacity && <div className="flex items-center gap-2"><Users size={18} /> {registeredCount}/{event.maxCapacity} Registered</div>}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About This Event</h2>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{event.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Starts</p>
                  <p className="font-bold text-slate-800 dark:text-white mt-1">{new Date(event.startDate).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Ends</p>
                  <p className="font-bold text-slate-800 dark:text-white mt-1">{new Date(event.endDate).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {isManager && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Attendees</h2>
                  <button onClick={loadAttendees} className="bg-slate-800 text-white px-5 py-2 rounded-xl font-bold hover:bg-slate-700 transition">View List</button>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">You are an organizer of this event. Click "View List" to check in attendees.</p>
              </div>
            )}
          </div>

          {/* Sidebar with Action */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Registration</h3>
              
              {isPast ? (
                <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-xl text-center">
                  <p className="font-bold text-slate-500 dark:text-slate-400">This event has already started.</p>
                </div>
              ) : isManager ? (
                <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-xl text-center">
                  <p className="font-bold text-slate-600 dark:text-slate-300">You are an organizer.</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Registration not required.</p>
                </div>
              ) : user.role !== 'STUDENT' ? (
                <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-xl text-center">
                  <p className="font-bold text-slate-600 dark:text-slate-300">Only students can register.</p>
                </div>
              ) : myReg ? (
                <div className="space-y-3">
                  <div className={`p-4 rounded-xl text-center ${myReg.status === 'REGISTERED' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                    <p className={`font-bold ${myReg.status === 'REGISTERED' ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>You are {myReg.status}</p>
                  </div>
                  <button onClick={handleCancel} className="w-full bg-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-200 transition">Cancel Registration</button>
                </div>
              ) : (
                <button onClick={handleRegister} className={`w-full py-3 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 ${isFull ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-600 hover:bg-brand-500'}`}>
                  {isFull ? <><AlertTriangle size={18}/> Join Waitlist</> : 'Register Now'}
                </button>
              )}

              {event.maxCapacity && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    <span>Spots filled</span>
                    <span>{registeredCount}/{event.maxCapacity}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${isFull ? 'bg-red-500' : 'bg-brand-600'}`} style={{ width: `${Math.min(100, (registeredCount / event.maxCapacity) * 100)}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attendees Modal */}
      <AnimatePresence>
        {showAttendees && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Attendees</h2>
                <button onClick={() => setShowAttendees(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><X size={24} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-3">
                {attendees.map(reg => (
                  <div key={reg.id} className="p-3 border rounded-xl flex justify-between items-center bg-slate-50 dark:bg-slate-700/50">
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-white">{reg.user.studentProfile?.firstName} {reg.user.studentProfile?.lastName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{reg.user.email}</p>
                    </div>
                    <button onClick={() => markAttendance(reg.id, reg.status)} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${reg.status === 'ATTENDED' ? 'bg-green-600 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white'}`}>
                      {reg.status === 'ATTENDED' ? 'Attended' : 'Check In'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}