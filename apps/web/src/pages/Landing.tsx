import { Link } from 'react-router-dom';
import { Hexagon, ArrowRight, ShieldCheck, Rocket, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-brand-600 p-2 rounded-xl"><Hexagon className="text-white fill-white/20" size={28} /></div>
          <span className="text-3xl font-extrabold tracking-tight">Campus<span className="text-brand-500">Hub</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-300 hover:text-white font-semibold transition">Log In</Link>
          <Link to="/register" className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-500 transition shadow-lg">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-semibold tracking-wide text-brand-300 mb-6 inline-block">
            🚀 The Ultimate Campus Experience
          </span>
          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-6 max-w-4xl">
            One Platform. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">A More Connected Campus.</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Discover clubs, participate in events, find hackathons, and manage your campus ecosystem all in one unified, beautifully designed platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-brand-500 transition shadow-xl flex items-center gap-2">
              Join CampusHub <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition">
              Explore Features
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl text-left hover:bg-white/10 transition">
            <div className="bg-brand-500/20 p-4 rounded-2xl w-max mb-6"><Users className="text-brand-400" size={32} /></div>
            <h3 className="text-2xl font-bold mb-3">Unified Clubs</h3>
            <p className="text-slate-400">Discover and join technical, cultural, and sports clubs. Manage memberships and roles seamlessly.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl text-left hover:bg-white/10 transition">
            <div className="bg-purple-500/20 p-4 rounded-2xl w-max mb-6"><Calendar className="text-purple-400" size={32} /></div>
            <h3 className="text-2xl font-bold mb-3">Events & Fests</h3>
            <p className="text-slate-400">Never miss out. View upcoming fests, register for events, and manage your campus calendar.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl text-left hover:bg-white/10 transition">
            <div className="bg-emerald-500/20 p-4 rounded-2xl w-max mb-6"><Rocket className="text-emerald-400" size={32} /></div>
            <h3 className="text-2xl font-bold mb-3">Opportunities</h3>
            <p className="text-slate-400">Access curated external hackathons, workshops, and competitions approved by faculty.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}