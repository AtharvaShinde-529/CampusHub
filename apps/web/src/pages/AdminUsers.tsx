import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';

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

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 mt-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <button onClick={() => navigate('/admin')} className="bg-gray-200 px-4 py-2 rounded">Back to Admin Panel</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 font-semibold text-gray-600">Name</th>
                  <th className="p-3 font-semibold text-gray-600">Email</th>
                  <th className="p-3 font-semibold text-gray-600">Role</th>
                  <th className="p-3 font-semibold text-gray-600">Status</th>
                  <th className="p-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const name = u.studentProfile ? `${u.studentProfile.firstName} ${u.studentProfile.lastName}` 
                             : u.facultyProfile ? `${u.facultyProfile.firstName} ${u.facultyProfile.lastName}` 
                             : 'Admin';
                  return (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{name}</td>
                      <td className="p-3 text-gray-600">{u.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${u.globalRole === 'ADMIN' ? 'bg-red-100 text-red-700' : u.globalRole === 'FACULTY' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {u.globalRole}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.globalRole !== 'ADMIN' && (
                          <button 
                            onClick={() => toggleStatus(u.id, u.status)}
                            className={`px-3 py-1 rounded text-sm font-semibold text-white ${u.status === 'ACTIVE' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
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
