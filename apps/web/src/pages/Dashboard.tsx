import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Building2, Calendar, Rocket, GraduationCap, ChevronRight, Users, FileText, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [feed, setFeed] = useState<any>({ events: [], opportunities: [], clubs: [] });
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [guardedClubs, setGuardedClubs] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any>({ clubs: [], events: [], opportunities: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
      return;
    }
    if (user.role === 'ADMIN') {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [navigate, user.role]);

  const fetchData = async () => {
    try {
      const promises: any[] = [
        api.get('/feed'),
        api.get('/organizations/my')
      ];

      // If student, fetch recommendations
      if (user.role === 'STUDENT') {
        promises.push(api.get('/recommendations'));
      }

      const results = await Promise.all(promises);
      
      setFeed(results[0].data);
      setMyClubs(results[1].data);
      
      if (user.role === 'STUDENT') {
        setRecommendations(results[2].data);
      }
      
      if (user.role === 'FACULTY') {
        const guardedRes = await api.get('/organizations/guarded');
        setGuardedClubs(guardedRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl text-brand-600 font-bold animate-pulse">Loading your portal...</div>;

  const hasRecommendations = 
    recommendations.clubs.length > 0 || 
    recommendations.events.length > 0 || 
    recommendations.opportunities.length > 0;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6 relative z-10 mt-4 flex-1 w-full">
        
        {/* =========================================
            STUDENT DASHBOARD VIEW
        ========================================= */}
        {user.role === 'STUDENT' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              {/* RECOMMENDATIONS SECTION */}
              {hasRecommendations && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-brand-600 to-purple-600 p-1 rounded-3xl shadow-lg">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-[22px] h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="text-yellow-500" size={24} />
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Recommended For You</h2>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Based on your skills and interests.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.clubs.map((c: any) => (
                        <Link to="/organizations" key={c.id} className="block border border-brand-100 dark:border-slate-700 p-4 rounded-xl bg-brand-50 dark:bg-slate-700/50 hover:shadow-md transition">
                          <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">CLUB</p>
                          <h3 className="font-bold text-slate-800 dark:text-white">{c.name}</h3>
                        </Link>
                      ))}
                      {recommendations.events.map((e: any) => (
                        <Link to="/events" key={e.id} className="block border border-indigo-100 dark:border-slate-700 p-4 rounded-xl bg-indigo-50 dark:bg-slate-700/50 hover:shadow-md transition">
                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">EVENT</p>
                          <h3 className="font-bold text-slate-800 dark:text-white">{e.title}</h3>
                        </Link>
                      ))}
                      {recommendations.opportunities.map((o: any) => (
                        <Link to="/opportunities" key={o.id} className="block border border-purple-100 dark:border-slate-700 p-4 rounded-xl bg-purple-50 dark:bg-slate-700/50 hover:shadow-md transition">
                          <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">OPPORTUNITY</p>
                          <h3 className="font-bold text-slate-800 dark:text-white">{o.title}</h3>
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/40 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"><Building2 size={24} /></div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Clubs</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myClubs.map((c: any) => (
                    <div key={c.id} className="group border border-slate-100 dark:border-slate-700 p-5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-slate-700 transition-all duration-300 hover:shadow-md">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-brand-600 transition-colors">{c.organization.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">Role: <span className="text-brand-600 dark:text-brand-400 font-bold">{c.role}</span></p>
                      {c.role === 'CLUB_HEAD' && (
                        <Link to={`/organizations/${c.organization.id}/manage`} className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:underline">
                          Manage Club <ChevronRight size={16} />
                        </Link>
                      )}
                    </div>
                  ))}
                  {myClubs.length === 0 && <p className="text-slate-500">You haven't joined any clubs yet.</p>}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/40 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"><Calendar size={24} /></div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Upcoming Events</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feed.events.map((e: any) => (
                    <div key={e.id} className="border border-slate-100 dark:border-slate-700 p-5 rounded-2xl bg-white dark:bg-slate-800 hover:border-indigo-200 transition-all duration-300">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{e.title}</h3>
                      <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-3">Hosted by {e.organization?.name}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-700 w-max px-3 py-1 rounded-lg">
                        <Calendar size={14} /> {new Date(e.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="space-y-8">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/40 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"><Rocket size={24} /></div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Opportunities</h2>
                </div>
                <div className="space-y-4">
                  {feed.opportunities.map((o: any) => (
                    <Link to="/opportunities" key={o.id} className="block border-l-4 border-purple-400 pl-4 py-2 hover:bg-purple-50 dark:hover:bg-slate-700 rounded-r-xl transition-all">
                      <h3 className="font-bold text-purple-900 dark:text-purple-300 text-sm">{o.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{o.description}</p>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* FACULTY DASHBOARD VIEW remains unchanged */}
        {user.role === 'FACULTY' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-emerald-100 dark:border-slate-700 dark:bg-slate-800/80">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"><GraduationCap size={24} /></div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Clubs I Mentor</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guardedClubs.map((c: any) => (
                    <div key={c.id} className="border border-emerald-100 dark:border-slate-700 p-5 rounded-2xl bg-emerald-50/50 dark:bg-slate-800">
                      <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-300">{c.name}</h3>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium mb-3 flex items-center gap-1"><Users size={14}/> {c.memberships?.length || 0} Active Members</p>
                      <button className="text-sm font-bold text-emerald-600 hover:underline">View Roster</button>
                    </div>
                  ))}
                  {guardedClubs.length === 0 && <p className="text-slate-500">You have not been assigned as a guardian to any club yet.</p>}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/40 dark:border-slate-700 dark:bg-slate-800/80">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><FileText size={24} /></div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Recent Student Applications</h2>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Review applications from students wanting to join the clubs you oversee.</p>
                <Link to="/recruitment" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition">
                  Go to Recruitment Board
                </Link>
              </motion.div>
            </div>

            <div className="space-y-8">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl shadow-lg text-white">
                <h2 className="text-2xl font-bold mb-2">Faculty Quick Action</h2>
                <p className="text-emerald-50 text-sm mb-6">Have you found a hackathon or workshop? Share it with the students.</p>
                <Link to="/opportunities" className="w-full flex justify-center items-center gap-2 bg-white text-emerald-700 px-5 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-sm">
                  <Rocket size={18} /> Post Opportunity
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/40 dark:border-slate-700 dark:bg-slate-800/80">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Campus Events</h2>
                <div className="space-y-4">
                  {feed.events.slice(0, 3).map((e: any) => (
                    <div key={e.id} className="border-l-4 border-indigo-400 pl-4 py-1">
                      <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">{e.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(e.startDate).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}