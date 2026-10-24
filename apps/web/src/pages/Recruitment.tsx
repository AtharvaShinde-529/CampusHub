import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';

export default function Recruitment() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [viewApplicants, setViewApplicants] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  
  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [orgId, setOrgId] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCycles();
    fetchMyClubs();
  }, []);

  const fetchCycles = async () => {
    try {
      const res = await api.get('/recruitment');
      setCycles(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  
  const fetchMyClubs = async () => {
    try {
      const res = await api.get('/organizations/my');
      // Allow both CLUB_HEAD and COMMITTEE_MEMBER to post notices
      const heads = res.data.filter((m: any) => m.role === 'CLUB_HEAD' || m.role === 'COMMITTEE_MEMBER');
      setMyClubs(heads);
      if (heads.length > 0) setOrgId(heads[0].organization.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return alert('Please select an organization');
    
    try {
      await api.post('/recruitment', { title, description, deadline, organizationId: orgId });
      alert('Recruitment notice published successfully!');
      setTitle(''); 
      setDescription(''); 
      setDeadline('');
      fetchCycles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish notice');
      console.error(err);
    }
  };

  const handleApply = async (id: string) => {
    const pitch = prompt('Why do you want to join? (Short pitch)');
    if (pitch) {
      try {
        await api.post(`/recruitment/${id}/apply`, { pitch });
        alert('Applied successfully!');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to apply');
      }
    }
  };

  const loadApplicants = async (id: string) => {
    try {
      const res = await api.get(`/recruitment/${id}/applications`);
      setApplicants(res.data);
      setViewApplicants(id);
    } catch (err) {
      alert('Failed to load applicants');
    }
  };

  const updateStatus = async (appId: string, status: string) => {
    try {
      await api.patch(`/recruitment/applications/${appId}`, { status });
      loadApplicants(viewApplicants!);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800">Club Recruitment</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-200 px-4 py-2 rounded">Back to Feed</button>
        </div>

        {myClubs.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-yellow-500">
            <h2 className="text-xl font-bold mb-4">Post a Recruitment Notice</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Title (e.g. Core Team Recruitment)" required className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} />
              <textarea placeholder="Description / Requirements" required className="w-full p-2 border rounded" value={description} onChange={e => setDescription(e.target.value)} />
              <div>
                <label className="text-xs text-gray-500">Deadline Date & Time</label>
                <input type="datetime-local" required className="w-full p-2 border rounded" value={deadline} onChange={e => setDeadline(e.target.value)} />
              </div>
              <select className="w-full p-2 border rounded" value={orgId} onChange={e => setOrgId(e.target.value)}>
                {myClubs.map(c => <option key={c.organization.id} value={c.organization.id}>{c.organization.name}</option>)}
              </select>
              <button type="submit" className="bg-yellow-500 text-white font-bold px-6 py-2 rounded">Publish Notice</button>
            </form>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">Open Applications</h2>
          <div className="space-y-4">
            {cycles.map(cycle => (
              <div key={cycle.id} className="border p-4 rounded-lg bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-blue-800">{cycle.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{cycle.organization.name}</p>
                  <p className="text-sm text-gray-700">{cycle.description}</p>
                  <p className="text-xs text-red-500 font-bold mt-2">Deadline: {new Date(cycle.deadline).toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleApply(cycle.id)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Apply</button>
                  <button onClick={() => loadApplicants(cycle.id)} className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-900">View Applicants</button>
                </div>
              </div>
            ))}
            {cycles.length === 0 && <p className="text-gray-500">No open recruitment cycles right now.</p>}
          </div>
        </div>

        {viewApplicants && (
          <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-800">Applicant List</h2>
              <button onClick={() => setViewApplicants(null)} className="text-red-500 font-bold">Close</button>
            </div>
            {applicants.map(app => (
              <div key={app.id} className="border-b p-4 flex justify-between items-start">
                <div>
                  <Link to={/user/} className="font-bold text-brand-600 hover:underline">{app.user.studentProfile?.firstName} {app.user.studentProfile?.lastName}</Link>
                  <p className="text-sm text-gray-600 italic">"{app.pitch}"</p>
                  <p className={`text-xs font-bold mt-1 ${app.status === 'ACCEPTED' ? 'text-green-600' : app.status === 'REJECTED' ? 'text-red-600' : 'text-gray-600'}`}>{app.status}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(app.id, 'ACCEPTED')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Accept</button>
                  <button onClick={() => updateStatus(app.id, 'REJECTED')} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Reject</button>
                </div>
              </div>
            ))}
            {applicants.length === 0 && <p className="text-gray-500">No applicants yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

