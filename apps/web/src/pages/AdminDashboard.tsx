import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import { Users, GraduationCap, Building2, Calendar, Rocket, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/analytics').then(res => setStats(res.data));
  }, []);

  if (!stats) return <div className="min-h-screen bg-surface-50 dark:bg-slate-900 flex items-center justify-center text-xl font-bold dark:text-white">Loading Analytics...</div>;

  // Chart Data
  const userDistributionData = [
    { name: 'Students', value: stats.students },
    { name: 'Faculty', value: stats.faculty },
  ];
  const COLORS = ['#4f46e5', '#10b981'];

  const contentData = [
    { name: 'Clubs', count: stats.clubs },
    { name: 'Events', count: stats.events },
    { name: 'Opportunities', count: stats.opportunities },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 mt-4 space-y-8">
        
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Admin Control Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Platform overview and analytics.</p>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1"><Users size={16}/> <p className="text-sm font-semibold">Students</p></div>
            <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">{stats.students}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border-l-4 border-emerald-500">
            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1"><GraduationCap size={16}/> <p className="text-sm font-semibold">Faculty</p></div>
            <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">{stats.faculty}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1"><Building2 size={16}/> <p className="text-sm font-semibold">Active Clubs</p></div>
            <p className="text-3xl font-extrabold text-purple-700 dark:text-purple-400">{stats.clubs}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border-l-4 border-indigo-500">
            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1"><Calendar size={16}/> <p className="text-sm font-semibold">Events</p></div>
            <p className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400">{stats.events}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border-l-4 border-pink-500">
            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1"><Rocket size={16}/> <p className="text-sm font-semibold">Opportunities</p></div>
            <p className="text-3xl font-extrabold text-pink-700 dark:text-pink-400">{stats.opportunities}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1"><ShieldAlert size={16}/> <p className="text-sm font-semibold">Pending</p></div>
            <p className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400">{stats.pendingClubs}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Pie Chart: User Distribution */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">User Distribution</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={userDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Platform Content */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Platform Content Overview</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]}>
                    {contentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#4f46e5', '#6366f1', '#818cf8'][index % 3]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-800 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/approvals" className="block p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-md transition">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Club Approvals</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Review pending club registrations and assign mentors.</p>
          </Link>
          <Link to="/admin/users" className="block p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-md transition">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">User Management</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Suspend or activate student and faculty accounts.</p>
          </Link>
          <Link to="/admin/audit" className="block p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-md transition">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Audit Logs</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">View the immutable history of all platform actions.</p>
          </Link>
          <Link to="/admin/organizations" className="block p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-md transition">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Organization Lifecycle</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Manage renewals and monitor club health.</p>
          </Link>
          <Link to="/opportunities" className="block p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-md transition">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Moderate Opportunities</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Approve external hackathons and workshops.</p>
          </Link>
        </div>

      </div>
    </div>
  );
}

