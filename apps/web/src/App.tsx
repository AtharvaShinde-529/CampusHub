import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import Events from './pages/Events';
import Opportunities from './pages/Opportunities';
import Settings from './pages/Settings';
import Recruitment from './pages/Recruitment';
import AdminApprovals from './pages/AdminApprovals';
import ClubManagement from './pages/ClubManagement';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import Exchange from './pages/Exchange';
import Calendar from './pages/Calendar';
import Chat from './pages/Chat';
import PublicProfile from './pages/PublicProfile';
import AdminAudit from './pages/AdminAudit';
import AdminOrganizations from './pages/AdminOrganizations';
import EventDetail from './pages/EventDetail';
import ClubDetail from './pages/ClubDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/organizations/:id/manage" element={<ClubManagement />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/clubs/:id" element={<ClubDetail />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Settings />} />
        <Route path="/recruitment" element={<Recruitment />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/approvals" element={<AdminApprovals />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/audit" element={<AdminAudit />} />
        <Route path="/admin/organizations" element={<AdminOrganizations />} />
        <Route path="/exchange" element={<Exchange />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:userId" element={<Chat />} />
        <Route path="/user/:id" element={<PublicProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;