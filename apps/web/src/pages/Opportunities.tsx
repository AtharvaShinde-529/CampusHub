import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

export default function Opportunities() {
  const [opps, setOpps] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOpps();
    if (user.role === 'ADMIN') fetchPending();
  }, []);

  const fetchOpps = async () => {
    try {
      const res = await api.get('/opportunities');
      setOpps(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchPending = async () => {
    try {
      const res = await api.get('/opportunities/pending');
      setPending(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/opportunities', { title, description, category, deadline });
      setSuccess('Opportunity submitted for moderation!');
      setTitle(''); setDescription(''); setCategory('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/opportunities/${id}/approve`);
      fetchOpps();
      fetchPending();
    } catch (err) { alert('Failed to approve'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-800">External Opportunities</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Dashboard</button>
        </div>

        {/* Submit Form (Faculty & Admin Only) */}
        {(user.role === 'FACULTY' || user.role === 'ADMIN') && (
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
            <h2 className="text-xl font-semibold mb-4">Post a New Opportunity</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Title (e.g., Smart India Hackathon)" required className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} />
              <input type="text" placeholder="Category (e.g., Hackathon, Workshop)" required className="w-full p-2 border rounded" value={category} onChange={e => setCategory(e.target.value)} />
              <textarea placeholder="Description" required className="w-full p-2 border rounded" value={description} onChange={e => setDescription(e.target.value)} />
              <div>
                <label className="text-sm text-gray-600">Application Deadline</label>
                <input type="datetime-local" required className="w-full p-2 border rounded" value={deadline} onChange={e => setDeadline(e.target.value)} />
              </div>
              <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">Submit for Approval</button>
            </form>
          </div>
        )}

        {/* Admin Moderation Queue */}
        {user.role === 'ADMIN' && pending.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-500">
            <h2 className="text-xl font-semibold mb-4 text-yellow-700">?? Moderation Queue</h2>
            <div className="space-y-4">
              {pending.map(opp => (
                <div key={opp.id} className="border p-4 rounded bg-yellow-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{opp.title}</h3>
                    <p className="text-sm text-gray-600">{opp.description}</p>
                  </div>
                  <button onClick={() => handleApprove(opp.id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Approve</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Approved Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opps.map(opp => (
              <div key={opp.id} className="border p-4 rounded shadow-sm bg-gray-50">
                <h3 className="font-bold text-lg text-purple-700">{opp.title}</h3>
                <p className="text-sm text-gray-500 font-semibold mb-2">{opp.category}</p>
                <p className="text-gray-700 mb-2">{opp.description}</p>
                <p className="text-sm text-red-600 font-semibold">Deadline: {new Date(opp.deadline).toLocaleString()}</p>
              </div>
            ))}
            {opps.length === 0 && <p className="text-gray-500">No approved opportunities right now.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
