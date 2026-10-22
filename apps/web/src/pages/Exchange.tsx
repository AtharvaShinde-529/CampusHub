import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

export default function Exchange() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('SELL');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchItems();
  }, [search, filterType]);

  const fetchItems = async () => {
    try {
      const res = await api.get('/exchange', { 
        params: { search: search || undefined, type: filterType || undefined } 
      });
      setItems(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/exchange', { title, description, type });
      setTitle(''); setDescription('');
      fetchItems();
    } catch (err) { alert('Failed to post item'); }
  };

  const markResolved = async (id: string) => {
    try {
      await api.patch(`/exchange/${id}/status`, { status: 'RESOLVED' });
      fetchItems();
    } catch (err) { alert('Failed to update status'); }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'LOST': return 'bg-red-100 text-red-700';
      case 'FOUND': return 'bg-green-100 text-green-700';
      case 'SELL': return 'bg-blue-100 text-blue-700';
      case 'EXCHANGE': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800">Campus Exchange & Lost/Found</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Feed</button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-500">
          <h2 className="text-xl font-bold mb-4">Post a New Listing</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input type="text" placeholder="Item Title (e.g. Lost Black Wallet)" required className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea placeholder="Description / Contact Info" required className="w-full p-2 border rounded" value={description} onChange={e => setDescription(e.target.value)} />
            <select className="w-full p-2 border rounded" value={type} onChange={e => setType(e.target.value)}>
              <option value="SELL">Sell</option>
              <option value="EXCHANGE">Exchange</option>
              <option value="LOST">Lost Item</option>
              <option value="FOUND">Found Item</option>
            </select>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Post Listing</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Active Listings</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="Search items..." className="p-2 border rounded" value={search} onChange={e => setSearch(e.target.value)} />
              <select className="p-2 border rounded" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="">All Types</option>
                <option value="SELL">Sell</option>
                <option value="EXCHANGE">Exchange</option>
                <option value="LOST">Lost</option>
                <option value="FOUND">Found</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className={`border p-4 rounded-lg shadow-sm ${item.status === 'RESOLVED' ? 'opacity-50 bg-gray-50' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${getTypeColor(item.type)}`}>{item.type}</span>
                  {item.status === 'RESOLVED' && <span className="text-xs font-bold text-gray-500">RESOLVED</span>}
                </div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                
                <div className="text-xs text-gray-500 border-t pt-2 mt-auto">
                  <p>Posted by: {item.user?.studentProfile?.firstName || item.user?.facultyProfile?.firstName || 'User'}</p>
                  <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>

                {item.userId === user.id && item.status === 'OPEN' && (
                  <button onClick={() => markResolved(item.id)} className="mt-3 w-full bg-gray-800 text-white py-1 rounded text-sm hover:bg-gray-900">Mark as Resolved</button>
                )}
              </div>
            ))}
          </div>
          {items.length === 0 && <p className="text-gray-500 text-center py-4">No items found matching your criteria.</p>}
        </div>
      </div>
    </div>
  );
}
