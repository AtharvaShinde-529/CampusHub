import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

export default function AdminApprovals() {
  const [pending, setPending] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/organizations/pending');
      setPending(res.data);
    } catch (err) { console.error(err); }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/organizations/${id}/approve`);
      fetchPending();
    } catch (err) { alert('Failed to approve'); }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Organization Approvals</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-200 px-4 py-2 rounded">Back to Feed</button>
        </div>
        <div className="space-y-4">
          {pending.map(org => (
            <div key={org.id} className="border p-4 rounded-lg bg-yellow-50 border-yellow-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-yellow-800">{org.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{org.category} • Created by {org.memberships[0]?.user.email}</p>
                <p className="text-gray-700">{org.description}</p>
              </div>
              <button onClick={() => handleApprove(org.id)} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">Approve</button>
            </div>
          ))}
          {pending.length === 0 && <p className="text-gray-500">No organizations pending approval.</p>}
        </div>
      </div>
    </div>
  );
}
