import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import { ArrowLeft, CheckCircle, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminApprovals() {
  const [pending, setPending] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPending();
    fetchFaculty();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/organizations/pending');
      setPending(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/users/faculty');
      setFacultyList(res.data);
    } catch (err) { console.error(err); }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/organizations/${id}/approve`);
      toast.success('Organization approved successfully!');
      fetchPending();
    } catch (err) { toast.error('Failed to approve'); }
  };

  const assignFaculty = async (orgId: string, facultyId: string) => {
    if (!facultyId) return;
    try {
      await api.patch(`/organizations/${orgId}/guardian`, { facultyId });
      toast.success('Faculty Guardian Assigned!');
    } catch (err) { toast.error('Failed to assign faculty'); }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 pb-12">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 mt-4">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 mb-6 font-bold transition">
          <ArrowLeft size={20} /> Back to Admin Panel
        </button>
        
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
              <CheckCircle size={24} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Organization Approvals</h1>
          </div>
          
          <div className="space-y-4">
            {pending.map(org => (
              <div key={org.id} className="border border-slate-200 dark:border-slate-700 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{org.name}</h3>
                    <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-1">{org.category}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Created by: {org.memberships[0]?.user.email}</p>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">{org.description}</p>
                  </div>
                  <button onClick={() => handleApprove(org.id)} className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-700 transition shadow-sm">
                    Approve
                  </button>
                </div>
                
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mr-2 flex items-center gap-2 mb-2">
                    <UserCheck size={16} /> Assign Faculty Guardian:
                  </label>
                  <select 
                    className="w-full md:w-1/2 border border-slate-300 dark:border-slate-600 p-2 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" 
                    onChange={(e) => assignFaculty(org.id, e.target.value)} 
                    defaultValue=""
                  >
                    <option value="" disabled>Select Faculty...</option>
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.facultyProfile?.firstName} {f.facultyProfile?.lastName} ({f.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <CheckCircle size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-lg font-bold">All Caught Up!</p>
                <p>No organizations are pending approval right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}