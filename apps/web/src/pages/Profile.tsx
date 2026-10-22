import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/users/profile').then(res => {
      setProfile(res.data);
      const p = res.data.studentProfile || res.data.facultyProfile;
      if (p) {
        setBio(p.bio || '');
        if (res.data.studentProfile) {
          setSkills(p.skills?.join(', ') || '');
          setProjects(p.projects?.join(', ') || '');
        }
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', {
        bio,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        projects: projects.split(',').map(p => p.trim()).filter(Boolean),
        interests: []
      });
      alert('Profile updated!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  if (!profile) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-200 px-4 py-2 rounded">Back</button>
        </div>
        
        <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-100">
          <p className="font-bold text-blue-800">{user.email}</p>
          <p className="text-sm text-blue-600">Role: {user.role}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Bio</label>
            <textarea className="w-full border p-2 rounded" rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." />
          </div>

          {user.role === 'STUDENT' && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Skills (comma separated)</label>
                <input className="w-full border p-2 rounded" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Python, UI Design" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Projects (comma separated)</label>
                <input className="w-full border p-2 rounded" value={projects} onChange={e => setProjects(e.target.value)} placeholder="CampusHub, Portfolio Website" />
              </div>
            </>
          )}

          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Save Profile</button>
        </form>
      </div>
    </div>
  );
}
