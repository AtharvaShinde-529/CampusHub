import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function Calendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/events').then(res => setEvents(res.data));
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group events by day of the month for the current view
  const eventsByDay: { [key: number]: any[] } = {};
  events.forEach(event => {
    const eventDate = new Date(event.startDate);
    if (eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear()) {
      const day = eventDate.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(event);
    }
  });

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 pb-12">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 mt-4">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Campus Calendar</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">View all upcoming events and fests.</p>
          </div>
          <button onClick={() => navigate('/events')} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-500 transition">
            List View
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Calendar Header */}
          <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition text-slate-600 dark:text-slate-300">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition text-slate-600 dark:text-slate-300">
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            {daysOfWeek.map(day => (
              <div key={day} className="py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-[120px] bg-slate-200 dark:bg-slate-700 gap-px">
            {/* Empty cells for days before the 1st */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50 dark:bg-slate-800/30 opacity-50"></div>
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = eventsByDay[day] || [];
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

              return (
                <div key={day} className="bg-white dark:bg-slate-800 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition overflow-y-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-bold h-7 w-7 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                        {dayEvents.length} Event{dayEvents.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div key={event.id} className="text-xs p-1.5 rounded bg-brand-50 dark:bg-slate-700 border-l-2 border-brand-500 dark:border-brand-400 text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:bg-brand-100 transition" title={event.title}>
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}