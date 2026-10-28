import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import { Printer, Download } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/all');
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/users/${id}/status`, { status: newStatus });
      fetchUsers();
    } catch (err) { alert('Failed to update status'); }
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Joined'];
    const csvData = users.map(u => {
      const name = u.studentProfile 
        ? `${u.studentProfile.firstName} ${u.studentProfile.lastName}` 
        : u.facultyProfile 
          ? `${u.facultyProfile.firstName} ${u.facultyProfile.lastName}` 
          : 'Admin';
      return `"${name}","${u.email}","${u.globalRole}","${u.status}","${new Date(u.createdAt).toLocaleDateString()}"`;
    });
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'CampusHub_Users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 pb-12">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 mt-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/40 dark:border-slate-700">
          
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 mb-6 font-bold transition"><ArrowLeft size={20} /> Back to Admin Panel</button>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">User Management</h1>
            <div className="flex gap-3 no-print">
              <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-700 transition">
                <Printer size={18} /> Print Report
              </button>
              <button onClick={downloadCSV} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition">
                <Download size={18} /> Export CSV
              </button>
              <button onClick={() => navigate('/admin')} className="bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-slate-600 transition">
                Back to Admin Panel
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Name</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Email</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Role</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Status</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-300 no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const name = u.studentProfile ? `${u.studentProfile.firstName} ${u.studentProfile.lastName}` 
                             : u.facultyProfile ? `${u.facultyProfile.firstName} ${u.facultyProfile.lastName}` 
                             : 'System Admin';
                  return (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-4 text-slate-800 dark:text-slate-200 font-semibold">{name}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${u.globalRole === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : u.globalRole === 'FACULTY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {u.globalRole}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 no-print">
                        {u.globalRole !== 'ADMIN' && (
                          <button 
                            onClick={() => toggleStatus(u.id, u.status)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold text-white transition ${u.status === 'ACTIVE' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
