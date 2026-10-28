import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/axios';

export default function Organizations() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { 
    fetchOrgs(); 
  }, [search, filterCategory]);

  const fetchOrgs = async () => {
    try {
      const res = await api.get('/organizations', { 
        params: { search: search || undefined, category: filterCategory || undefined } 
      });
      setOrgs(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/organizations', { name, description, category });
      toast.success('Organization submitted for Admin approval!');
      setSuccess('Organization submitted for Admin approval!');
      setName(''); setDescription(''); setCategory('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleJoin = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    try {
      await api.post(`/organizations/${id}/join`);
      toast.success('Successfully joined the club!');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to join'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Campus Organizations</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-slate-600 transition">Back to Feed</button>
        </div>

        {user.role === 'STUDENT' && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Register a New Club/Society</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Organization Name" required className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white" value={name} onChange={e => setName(e.target.value)} />
              <select className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Select Category</option>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Speaking">Speaking</option>
                <option value="Other">Other</option>
              </select>
              <textarea placeholder="Description" required className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white" value={description} onChange={e => setDescription(e.target.value)} />
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">Submit for Approval</button>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Registered Organizations</h2>
            <div className="flex gap-2 w-full md:w-auto">
              <input type="text" placeholder="Search by name..." className="p-2 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white flex-1" value={search} onChange={e => setSearch(e.target.value)} />
              <select className="p-2 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Speaking">Speaking</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgs.map(org => (
              <div key={org.id} className="border border-slate-200 dark:border-slate-700 p-4 rounded shadow-sm bg-gray-50 dark:bg-slate-800/50 flex flex-col justify-between">
                <div>
                  <Link to={`/clubs/${org.id}`}>
                    <h3 className="font-bold text-lg text-blue-700 dark:text-blue-400 hover:underline transition">{org.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-slate-400 font-semibold mb-2">{org.category}</p>
                  <p className="text-gray-700 dark:text-slate-300 mb-4 line-clamp-2">{org.description}</p>
                </div>
                {user.role === 'STUDENT' && (
                  <button onClick={(e) => handleJoin(e, org.id)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 self-start transition">Join Club</button>
                )}
              </div>
            ))}
            {orgs.length === 0 && <p className="text-gray-500 dark:text-slate-400">No organizations found matching your criteria.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
