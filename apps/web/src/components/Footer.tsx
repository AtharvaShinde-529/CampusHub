import { Link } from 'react-router-dom';
import { Hexagon } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex items-center gap-2">
          <div className="bg-brand-600 p-1.5 rounded-lg">
            <Hexagon className="text-white fill-white/20" size={18} />
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Campus<span className="text-brand-600 dark:text-brand-500">Hub</span>
          </span>
        </div>

        <div className="flex space-x-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Link to="/organizations" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Clubs</Link>
          <Link to="/events" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Events</Link>
          <Link to="/opportunities" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Opportunities</Link>
          <Link to="/exchange" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Exchange</Link>
        </div>

        <p className="text-sm text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} CampusHub. Built for VIT Pune.
        </p>
      </div>
    </footer>
  );
}