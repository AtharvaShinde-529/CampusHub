import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import { ArrowLeft, Mail, BookOpen, Briefcase, Award, Building2, Globe, ExternalLink } from 'lucide-react';

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    api.get(`/users/${id}/public`)
      .then(res => setProfile(res.data))
      .catch(() => navigate('/dashboard'));
  }, [id, navigate]);

  if (!profile) return <div className="min-h-screen bg-surface-50 dark:bg-slate-900 flex justify-center items-center text-xl font-bold dark:text-white">Loading Profile...</div>;

  let name = 'System Admin';
  if (profile.studentProfile) name = `${profile.studentProfile.firstName} ${profile.studentProfile.lastName}`;
  else if (profile.facultyProfile) name = `${profile.facultyProfile.firstName} ${profile.facultyProfile.lastName}`;

  const bio = profile.studentProfile?.bio || profile.facultyProfile?.bio;
  const skills = profile.studentProfile?.skills || [];
  const projects = profile.studentProfile?.projects || [];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 pb-12">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 mt-4 space-y-6">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 font-bold transition">
          <ArrowLeft size={20} /> Go Back
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-brand-600 to-purple-600"></div>
          
          <div className="px-8 pb-8">
            <div className="flex justify-between items-end -mt-12 mb-6">
              <div className="relative">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 object-cover shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center font-bold text-3xl shadow-lg">
                    {profile.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="px-4 py-1.5 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 text-sm font-bold rounded-full">
                {profile.globalRole}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{name}</h1>
            
            <div className="flex flex-col gap-2 mt-2 mb-6">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Mail size={16} /> {profile.email}
              </div>
              <div className="flex gap-4 mt-2">
                {profile.studentProfile?.githubUrl && (
                  <a href={profile.studentProfile.githubUrl} target="_blank" rel="noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-brand-600 transition">
                    <Globe size={24} />
                  </a>
                )}
                {profile.studentProfile?.linkedinUrl && (
                  <a href={profile.studentProfile.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-700 dark:text-blue-400 hover:text-blue-500 transition">
                    <ExternalLink size={24} />
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <h3 className="flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-white mb-3">
                    <BookOpen size={20} className="text-brand-600" /> About
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{bio || 'No bio provided yet.'}</p>
                </div>

                {profile.globalRole === 'STUDENT' && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h3 className="flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-white mb-3">
                      <Award size={20} className="text-brand-600" /> Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.length > 0 ? skills.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 text-sm font-semibold rounded-lg">
                          {skill}
                        </span>
                      )) : <p className="text-slate-500 dark:text-slate-400 text-sm">No skills listed.</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {profile.globalRole === 'STUDENT' && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h3 className="flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-white mb-3">
                      <Briefcase size={20} className="text-brand-600" /> Projects
                    </h3>
                    <ul className="space-y-2">
                      {projects.length > 0 ? projects.map((proj: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                          <span className="text-brand-500 mt-1">•</span> {proj}
                        </li>
                      )) : <p className="text-slate-500 dark:text-slate-400 text-sm">No projects listed.</p>}
                    </ul>
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <h3 className="flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-white mb-3">
                    <Building2 size={20} className="text-brand-600" /> Clubs Joined
                  </h3>
                  <div className="space-y-2">
                    {profile.memberships?.length > 0 ? profile.memberships.map((m: any) => (
                      <div key={m.id} className="flex justify-between items-center bg-white dark:bg-slate-700 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-600">
                        <span className="font-semibold text-sm text-slate-800 dark:text-white">{m.organization.name}</span>
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{m.role}</span>
                      </div>
                    )) : <p className="text-slate-500 dark:text-slate-400 text-sm">Not a member of any clubs.</p>}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}