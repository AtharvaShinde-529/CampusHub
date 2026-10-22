import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    fetchMyClubs();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyClubs = async () => {
    try {
      const res = await api.get('/organizations/my');
      // Only allow creating events for clubs where the user is CLUB_HEAD or COMMITTEE_MEMBER
      const headClubs = res.data.filter((m: any) => m.role === 'CLUB_HEAD' || m.role === 'COMMITTEE_MEMBER');
      setMyClubs(headClubs);
      if (headClubs.length > 0) setOrganizationId(headClubs[0].organization.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/events', { title, description, startDate, endDate, organizationId });
      setSuccess('Event created successfully!');
      setTitle('');
      setDescription('');
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleRegister = async (id: string) => {
    try {
      await api.post(`/events/${id}/register`);
      alert('Successfully registered for the event!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-800">Campus Events</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Dashboard</button>
        </div>

        {/* Only show Create Form if user is a Head of at least one club */}
        {myClubs.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
            <h2 className="text-xl font-semibold mb-4">Host a New Event</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
            
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <input type="text" placeholder="Event Title" required className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} />
              <textarea placeholder="Event Description" required className="w-full p-2 border rounded" value={description} onChange={e => setDescription(e.target.value)} />
              
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="text-sm text-gray-600">Start Date & Time</label>
                  <input type="datetime-local" required className="w-full p-2 border rounded" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="w-1/2">
                  <label className="text-sm text-gray-600">End Date & Time</label>
                  <input type="datetime-local" required className="w-full p-2 border rounded" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Hosting Organization</label>
                <select className="w-full p-2 border rounded bg-gray-50" value={organizationId} onChange={e => setOrganizationId(e.target.value)}>
                  {myClubs.map(m => (
                    <option key={m.organization.id} value={m.organization.id}>{m.organization.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Create Event</button>
            </form>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="border p-4 rounded shadow-sm bg-gray-50 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-blue-700">{event.title}</h3>
                  <p className="text-sm text-gray-500 font-semibold mb-2">Hosted by: {event.organization?.name}</p>
                  <p className="text-gray-700 mb-2">{event.description}</p>
                  <p className="text-sm text-gray-600">
                    ?? {new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => handleRegister(event.id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap">
                  Register
                </button>
              </div>
            ))}
            {events.length === 0 && <p className="text-gray-500">No upcoming events yet.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
