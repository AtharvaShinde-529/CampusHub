import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import { Search, Calendar as CalendarIcon, Tag, Users, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [isFest, setIsFest] = useState(false);
  const [parentEventId, setParentEventId] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<number | ''>('');
  const [venue, setVenue] = useState('');
  
  const [search, setSearch] = useState('');
  const [filterFest, setFilterFest] = useState<string>('all');
  
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchEvents();
    fetchMyClubs();
    fetchMyRegistrations();
  }, [search, filterFest]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events', { 
        params: { 
          search: search || undefined, 
          isFest: filterFest === 'all' ? undefined : filterFest 
        } 
      });
      setEvents(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMyClubs = async () => {
    const res = await api.get('/organizations/my');
    const headClubs = res.data.filter((m: any) => m.role === 'CLUB_HEAD' || m.role === 'COMMITTEE_MEMBER');
    setMyClubs(headClubs);
    if (headClubs.length > 0) setOrganizationId(headClubs[0].organization.id);
  };

  const fetchMyRegistrations = async () => {
    const res = await api.get('/events/my');
    setMyRegistrations(res.data);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/events', { 
        title, description, startDate, endDate, organizationId, 
        isFest, parentEventId: parentEventId || undefined,
        maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
        venue: venue || undefined
      });
      toast.success('Event created successfully!');
      setTitle(''); setDescription(''); setIsFest(false); setParentEventId(''); setMaxCapacity(''); setVenue('');
      fetchEvents();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to create event'); }
  };

  const handleRegister = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigating to details when clicking register
    try {
      const res = await api.post(`/events/${id}/register`);
      res.data.status === 'WAITLISTED' ? toast.success('Added to waitlist!') : toast.success('Registered successfully!');
      fetchMyRegistrations();
      fetchEvents();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to register'); }
  };

  const handleCancel = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    try {
      await api.delete(`/events/${id}/cancel`);
      toast.success('Registration cancelled.');
      fetchMyRegistrations();
      fetchEvents();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to cancel'); }
  };

  const handleCancelEvent = async (e: React.MouseEvent, event: any) => {
    e.preventDefault();
    if (!confirm('Cancel this event? All registrants will lose their spot.')) return;
    try {
      await api.patch(/events//cancel-event);
      alert('Event cancelled.');
      fetchEvents();
    } catch (err) { alert('Failed to cancel event'); }
  };

  const loadAttendees = async (e: React.MouseEvent, event: any) => {
    e.preventDefault();
    setSelectedEvent(event);
    setShowAttendeesModal(true);
    try {
      const res = await api.get(`/events/${event.id}/attendees`);
      setAttendees(res.data);
    } catch (err) { console.error(err); }
  };

  const markAttendance = async (regId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ATTENDED' ? 'REGISTERED' : 'ATTENDED';
    try {
      await api.patch(`/events/attendees/${regId}`, { status: newStatus });
      const res = await api.get(`/events/${selectedEvent.id}/attendees`);
      setAttendees(res.data);
    } catch (err) { toast.error('Failed to update status'); }
  };

  const isManager = (orgId: string) => myClubs.some(c => c.organization.id === orgId);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 pb-12 relative overflow-hidden">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6 mt-4 relative z-10 space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Campus Events</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Discover, register, and host events across the campus.</p>
          </div>
          <button onClick={() => navigate('/calendar')} className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-500 transition shadow-md">
            View Calendar
          </button>
        </div>

        {myClubs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Host a New Event / Fest</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Event Title" required className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition text-slate-800 dark:text-white" value={title} onChange={e => setTitle(e.target.value)} />
                <select className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition text-slate-800 dark:text-white" value={organizationId} onChange={e => setOrganizationId(e.target.value)}>
                  {myClubs.map(m => <option key={m.organization.id} value={m.organization.id}>{m.organization.name}</option>)}
                </select>
              </div>
              <textarea placeholder="Description" required className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition text-slate-800 dark:text-white" value={description} onChange={e => setDescription(e.target.value)} />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Start Date</label>
                  <input type="datetime-local" required className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition text-slate-800 dark:text-white" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">End Date</label>
                  <input type="datetime-local" required className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition text-slate-800 dark:text-white" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Venue</label>
                  <input type="text" placeholder="e.g. Auditorium" className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition text-slate-800 dark:text-white" value={venue} onChange={e => setVenue(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Capacity</label>
                  <input type="number" placeholder="Optional" min="1" className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition text-slate-800 dark:text-white" value={maxCapacity} onChange={e => setMaxCapacity(e.target.value ? Number(e.target.value) : '')} />
                </div>
              </div>

              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isFest} onChange={e => setIsFest(e.target.checked)} className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Is this a Major Fest?</span>
                </label>
                <div className="flex-1">
                  <select className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-sm text-slate-800 dark:text-white" value={parentEventId} onChange={e => setParentEventId(e.target.value)}>
                    <option value="">None (Standalone Event)</option>
                    {events.filter(e => e.isFest).map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-500 transition shadow-md">Create Event</button>
            </form>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" placeholder="Search events..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-white"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
            <button onClick={() => setFilterFest('all')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filterFest === 'all' ? 'bg-white dark:bg-slate-600 shadow-sm text-brand-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>All Events</button>
            <button onClick={() => setFilterFest('true')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filterFest === 'true' ? 'bg-white dark:bg-slate-600 shadow-sm text-brand-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Fests Only</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(event => {
            const myReg = myRegistrations.find(r => r.eventId === event.id);
            const registeredCount = event.registrations?.filter((r:any) => r.status === 'REGISTERED').length || 0;
            const isFull = event.maxCapacity && registeredCount >= event.maxCapacity;

            return (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={event.id} className={`flex flex-col border p-6 rounded-3xl shadow-sm transition-all hover:shadow-md ${event.isFest ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700/50' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      <Tag size={12} /> {event.organization?.name}
                    </div>
                    {event.isFest && <span className="text-xs font-bold px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">?? Major Fest</span>}
                  </div>
                  <Link to={`/events/${event.id}`} className="block">
                    <h3 className="font-extrabold text-xl text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-2">{event.title}</h3>
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">{event.description}</p>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4 mt-4 gap-3 md:gap-0">
                  <div className="flex items-center gap-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <CalendarIcon size={16} /> {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    {event.maxCapacity && (
                      <div className={`flex items-center gap-1 ${isFull ? 'text-red-500' : 'text-green-600'}`}>
                        <Users size={16} /> {registeredCount}/{event.maxCapacity} Spots
                      </div>
                    )}
                  </div>
                  
                  {isManager(event.organizationId) ? (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={(e) => loadAttendees(e, event)} className="flex-1 md:flex-none bg-slate-800 text-white px-5 py-2 rounded-xl font-bold hover:bg-slate-700 transition shadow-sm text-sm flex items-center justify-center gap-2">
                        <Users size={16}/> Attendees
                      </button>
                      <button onClick={(e) => handleCancelEvent(e, event)} className="flex-1 md:flex-none bg-red-100 text-red-600 px-5 py-2 rounded-xl font-bold hover:bg-red-200 transition shadow-sm text-sm">
                        Cancel
                      </button>
                    </div>
                  ) : user.role === 'STUDENT' ? (
                    myReg ? (
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${myReg.status === 'REGISTERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {myReg.status}
                        </span>
                        <button onClick={(e) => handleCancel(e, event.id)} className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-200 transition text-sm flex-1 md:flex-none">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={(e) => handleRegister(e, event.id)} className={`w-full md:w-auto px-5 py-2 rounded-xl font-bold transition shadow-sm text-sm flex items-center justify-center gap-2 ${isFull ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-brand-600 hover:bg-brand-500 text-white'}`}>
                        {isFull ? <AlertTriangle size={16}/> : null}
                        {isFull ? 'Join Waitlist' : 'Register'}
                      </button>
                    )
                  ) : null}
                </div>
              </motion.div>
            );
          })}
          {events.length === 0 && (
            <div className="col-span-2 text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-600">
              <CalendarIcon size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No events found</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAttendeesModal && selectedEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Event Attendees</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedEvent.title}</p>
                </div>
                <button onClick={() => setShowAttendeesModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition"><X size={24} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-3">
                {attendees.map(reg => (
                  <div key={reg.id} className={`p-4 rounded-2xl border flex justify-between items-center transition ${reg.status === 'ATTENDED' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'}`}>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">
                        {reg.user.studentProfile?.firstName} {reg.user.studentProfile?.lastName}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{reg.user.email}</p>
                      <p className="text-xs font-bold mt-1 text-brand-600">{reg.status}</p>
                    </div>
                    <button 
                      onClick={() => markAttendance(reg.id, reg.status)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition ${reg.status === 'ATTENDED' ? 'bg-green-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-300'}`}
                    >
                      <CheckCircle size={18} />
                      {reg.status === 'ATTENDED' ? 'Attended' : 'Check In'}
                    </button>
                  </div>
                ))}
                {attendees.length === 0 && (
                  <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                    No one has registered for this event yet.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

