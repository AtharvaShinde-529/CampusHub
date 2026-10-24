import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import { Moon, Sun, Camera, Save, ArrowLeft, ShieldAlert, Key, Globe, ExternalLink } from 'lucide-react';

export default function Settings() {
  const [profile, setProfile] = useState<any>(null);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    api.get('/users/profile').then(res => {
      setProfile(res.data);
      const p = res.data.studentProfile || res.data.facultyProfile;
      if (p) {
        setBio(p.bio || '');
        if (res.data.studentProfile) {
          setSkills(p.skills?.join(', ') || '');
          setProjects(p.projects?.join(', ') || '');
          setGithubUrl(p.githubUrl || '');
          setLinkedinUrl(p.linkedinUrl || '');
        }
      }
    }).catch(err => navigate('/dashboard'));
  }, [navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', {
        bio,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        projects: projects.split(',').map(p => p.trim()).filter(Boolean),
        interests: [],
        githubUrl,
        linkedinUrl
      });
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/users/password', { oldPassword, newPassword });
      alert('Password updated successfully!');
      setOldPassword(''); setNewPassword('');
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to update password'); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const res = await api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updatedUser = { ...user, avatarUrl: res.data.avatarUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfile({ ...profile, avatarUrl: res.data.avatarUrl });
      window.dispatchEvent(new Event('userUpdated')); 
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm1 = confirm('Are you sure you want to delete your account? This action CANNOT be undone.');
    if (!confirm1) return;
    const confirm2 = prompt('Type DELETE to confirm:');
    if (confirm2 !== 'DELETE') return alert('Account deletion cancelled.');

    setDeleting(true);
    try {
      await api.delete('/users/account');
      alert('Account deleted successfully. Logging out...');
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      alert('Failed to delete account');
      setDeleting(false);
    }
  };

  if (!profile) return <div className="min-h-screen bg-surface-50 dark:bg-slate-900 flex justify-center items-center text-xl font-bold dark:text-white">Loading Settings...</div>;

  let name = 'System Admin';
  if (profile.studentProfile) name = `${profile.studentProfile.firstName} ${profile.studentProfile.lastName}`;
  else if (profile.facultyProfile) name = `${profile.facultyProfile.firstName} ${profile.facultyProfile.lastName}`;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 pb-12">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 mt-4 space-y-8">
        
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 font-bold transition">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Account Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-brand-100 dark:border-brand-900" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-brand-600 to-purple-500 text-white flex items-center justify-center font-bold text-5xl">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 p-2 rounded-full shadow-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition">
                  <Camera size={20} className="text-slate-700 dark:text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 text-xs font-bold rounded-full">{profile.globalRole}</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Theme</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark</p>
              </div>
              <button onClick={() => setIsDark(!isDark)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                {isDark ? <Sun size={24} className="text-yellow-500" /> : <Moon size={24} className="text-slate-600" />}
              </button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            {profile.globalRole !== 'ADMIN' ? (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Edit Profile</h2>
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                    <textarea rows={3} className="w-full border border-slate-300 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." />
                  </div>

                  {profile.globalRole === 'STUDENT' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Skills (comma separated)</label>
                        <input className="w-full border border-slate-300 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Python, UI Design" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Projects (comma separated)</label>
                        <input className="w-full border border-slate-300 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition" value={projects} onChange={e => setProjects(e.target.value)} placeholder="CampusHub, Portfolio Website" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><Globe size={16}/> Portfolio / GitHub URL</label>
                          <input className="w-full border border-slate-300 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/username" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><ExternalLink size={16}/> LinkedIn URL</label>
                          <input className="w-full border border-slate-300 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" />
                        </div>
                      </div>
                    </>
                  )}

                  <button type="submit" className="flex items-center gap-2 bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-500 transition shadow-md">
                    <Save size={20} /> Save Changes
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center min-h-[200px]">
                <ShieldAlert size={64} className="text-slate-300 dark:text-slate-600 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">System Administrator</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">As an Administrator, you do not have a public-facing profile.</p>
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Key size={24} className="text-brand-600"/> Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                  <input type="password" required className="w-full border border-slate-300 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                  <input type="password" required className="w-full border border-slate-300 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <button type="submit" className="flex items-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700 transition shadow-md">
                  Update Password
                </button>
              </form>
            </div>
            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl shadow-sm border border-red-200 dark:border-red-900/50 mt-6">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
              <p className="text-sm text-red-500 dark:text-red-300 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
              <button onClick={handleDeleteAccount} disabled={deleting} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-md disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete Account Permanently'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
