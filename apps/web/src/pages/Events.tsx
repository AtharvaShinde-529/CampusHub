import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [isFest, setIsFest] = useState(false);
  const [parentEventId, setParentEventId] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    fetchMyClubs();
  }, []);

  const fetchEvents = async () => {
    const res = await api.get('/events');
    setEvents(res.data);
  };

  const fetchMyClubs = async () => {
    const res = await api.get('/organizations/my');
    const headClubs = res.data.filter((m: any) => m.role === 'CLUB_HEAD' || m.role === 'COMMITTEE_MEMBER');
    setMyClubs(headClubs);
    if (headClubs.length > 0) setOrganizationId(headClubs[0].organization.id);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/events', { 
        title, description, startDate, endDate, organizationId, 
        isFest, parentEventId: parentEventId || undefined 
      });
      alert('Event created!');
      setTitle(''); setDescription(''); setIsFest(false); setParentEventId('');
      fetchEvents();
    } catch (err: any) { alert('Failed to create event'); }
  };

  const handleRegister = async (id: string) => {
    try {
      await api.post(`/events/${id}/register`);
      alert('Registered!');
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-800">Campus Events & Fests</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Dashboard</button>
        </div>

        {myClubs.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
            <h2 className="text-xl font-semibold mb-4">Host a New Event / Fest</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <input type="text" placeholder="Event Title" required className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} />
              <textarea placeholder="Description" required className="w-full p-2 border rounded" value={description} onChange={e => setDescription(e.target.value)} />
              
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="text-xs text-gray-500">Start Date</label>
                  <input type="datetime-local" required className="w-full p-2 border rounded" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="w-1/2">
                  <label className="text-xs text-gray-500">End Date</label>
                  <input type="datetime-local" required className="w-full p-2 border rounded" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Hosting Organization</label>
                <select className="w-full p-2 border rounded bg-gray-50" value={organizationId} onChange={e => setOrganizationId(e.target.value)}>
                  {myClubs.map(m => <option key={m.organization.id} value={m.organization.id}>{m.organization.name}</option>)}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isFest" checked={isFest} onChange={e => setIsFest(e.target.checked)} />
                <label htmlFor="isFest" className="text-sm font-semibold text-gray-700">Is this a Major Fest?</label>
              </div>

              <div>
                <label className="text-sm text-gray-600">Parent Event (Optional - if this is a sub-event)</label>
                <select className="w-full p-2 border rounded bg-gray-50" value={parentEventId} onChange={e => setParentEventId(e.target.value)}>
                  <option value="">None (Standalone Event)</option>
                  {events.filter(e => e.isFest).map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>

              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Create</button>
            </form>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upcoming Events & Fests</h2>
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className={`border p-4 rounded shadow-sm ${event.isFest ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-blue-700">
                      {event.isFest && '?? [FEST] '} {event.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-semibold mb-2">Hosted by: {event.organization?.name}</p>
                    <p className="text-gray-700 mb-2">{event.description}</p>
                    {event.parentEventId && <p className="text-xs text-purple-600 font-bold mb-2">Part of a larger Fest</p>}
                    <p className="text-sm text-gray-600">?? {new Date(event.startDate).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleRegister(event.id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap">Register</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
