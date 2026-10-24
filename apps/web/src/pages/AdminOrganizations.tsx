import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminOrganizations() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      const res = await api.get('/organizations/admin/all');
      setOrgs(res.data);
    } catch (err) { console.error(err); }
  };

  const handleRenew = async (id: string) => {
    try {
      await api.patch(`/organizations/${id}/renew`);
      alert('Organization renewed for 1 year!');
      fetchOrgs();
    } catch (err) { alert('Failed to renew'); }
  };

  const isExpiringSoon = (date: string) => {
    const renewal = new Date(date);
    const today = new Date();
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 30; // Expiring within 30 days
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 pb-12">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 mt-4 space-y-6">
        
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 font-bold transition">
          <ArrowLeft size={20} /> Back to Admin Panel
        </button>

        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Organization Lifecycle</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage active organizations and renew their annual status.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Club Name</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Category</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Status</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Members</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Renewal Date</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => (
                <tr key={org.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <td className="p-4 font-bold text-slate-800 dark:text-white">{org.name}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{org.category}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${org.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{org.memberships?.length || 0}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 text-sm font-semibold ${isExpiringSoon(org.renewalDate) ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                      {isExpiringSoon(org.renewalDate) && <AlertCircle size={16} />}
                      {new Date(org.renewalDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleRenew(org.id)} className="flex items-center gap-2 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 px-4 py-2 rounded-xl font-bold hover:bg-brand-100 transition">
                      <RefreshCw size={16} /> Renew 1 Year
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}