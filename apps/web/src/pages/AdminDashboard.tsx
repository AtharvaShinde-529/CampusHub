import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/analytics').then(res => setStats(res.data));
  }, []);

  if (!stats) return <div className="min-h-screen p-8 text-center">Loading Analytics...</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 mt-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Control Center</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <p className="text-gray-500 font-semibold">Total Students</p>
            <p className="text-4xl font-extrabold text-blue-700">{stats.students}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-gray-500 font-semibold">Total Faculty</p>
            <p className="text-4xl font-extrabold text-green-700">{stats.faculty}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
            <p className="text-gray-500 font-semibold">Active Clubs</p>
            <p className="text-4xl font-extrabold text-purple-700">{stats.clubs}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <p className="text-gray-500 font-semibold">Pending Approvals</p>
            <p className="text-4xl font-extrabold text-yellow-600">{stats.pendingClubs}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
            <p className="text-gray-500 font-semibold">Events Hosted</p>
            <p className="text-4xl font-extrabold text-indigo-700">{stats.events}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pink-500">
            <p className="text-gray-500 font-semibold">Live Opportunities</p>
            <p className="text-4xl font-extrabold text-pink-700">{stats.opportunities}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/admin/approvals" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Club Approvals</h3>
            <p className="text-gray-600">Review pending club registrations and assign mentors.</p>
          </Link>
          <Link to="/admin/users" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition">
            <h3 className="text-xl font-bold text-gray-800 mb-2">User Management</h3>
            <p className="text-gray-600">Suspend or activate student and faculty accounts.</p>
          </Link>
          <Link to="/opportunities" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Moderate Opportunities</h3>
            <p className="text-gray-600">Approve external hackathons and workshops.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
