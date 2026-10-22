import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

export default function Organizations() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      const res = await api.get('/organizations');
      setOrgs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/organizations', { name, description, category });
      setName('');
      setDescription('');
      setCategory('');
      fetchOrgs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleJoin = async (id: string) => {
    try {
      await api.post(`/organizations/${id}/join`);
      alert('Successfully joined the club!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to join');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-800">Campus Organizations</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Dashboard</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create a New Club/Society</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <input type="text" placeholder="Organization Name" required className="w-full p-2 border rounded" value={name} onChange={e => setName(e.target.value)} />
            <input type="text" placeholder="Category (e.g. Technical, Cultural)" required className="w-full p-2 border rounded" value={category} onChange={e => setCategory(e.target.value)} />
            <textarea placeholder="Description" required className="w-full p-2 border rounded" value={description} onChange={e => setDescription(e.target.value)} />
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Create Organization</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Registered Organizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgs.map(org => (
              <div key={org.id} className="border p-4 rounded shadow-sm bg-gray-50 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-blue-700">{org.name}</h3>
                  <p className="text-sm text-gray-500 font-semibold mb-2">{org.category}</p>
                  <p className="text-gray-700 mb-4">{org.description}</p>
                </div>
                <button onClick={() => handleJoin(org.id)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 self-start">
                  Join Club
                </button>
              </div>
            ))}
            {orgs.length === 0 && <p className="text-gray-500">No organizations created yet.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
