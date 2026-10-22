import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import Events from './pages/Events';
import Opportunities from './pages/Opportunities';
import Profile from './pages/Profile';
import Recruitment from './pages/Recruitment';
import AdminApprovals from './pages/AdminApprovals';
import ClubManagement from './pages/ClubManagement';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import Exchange from './pages/Exchange';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/organizations/:id/manage" element={<ClubManagement />} />
        <Route path="/events" element={<Events />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recruitment" element={<Recruitment />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/approvals" element={<AdminApprovals />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/exchange" element={<Exchange />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
