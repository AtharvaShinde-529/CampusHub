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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/events" element={<Events />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recruitment" element={<Recruitment />} />
        <Route path="/admin/approvals" element={<AdminApprovals />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
