import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import { ArrowLeft, Shield, Clock, User, Activity } from 'lucide-react';

export default function AdminAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/audit').then(res => setLogs(res.data));
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('APPROVE')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (action.includes('SUSPEND') || action.includes('REJECT')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 pb-12">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 mt-4 space-y-6">
        
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 font-bold transition">
          <ArrowLeft size={20} /> Back to Admin Panel
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <Shield className="text-brand-600" size={36} /> Audit Logs
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Immutable record of all governance and administrative actions.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {logs.map(log => (
              <div key={log.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex items-start gap-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl mt-1">
                  <Activity size={20} className="text-slate-500 dark:text-slate-300" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-white mt-2">{log.details}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <Clock size={14} />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                        <User size={14} />
                        {log.user.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                No audit logs found. Actions like approving clubs or suspending users will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}