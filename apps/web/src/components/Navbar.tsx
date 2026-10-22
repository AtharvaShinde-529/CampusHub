import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">CampusHub</h1>
        <div className="hidden md:flex space-x-4 font-medium text-gray-600">
          <Link to="/dashboard" className="hover:text-blue-600">Feed</Link>
          <Link to="/organizations" className="hover:text-blue-600">Clubs</Link>
          <Link to="/recruitment" className="hover:text-blue-600">Recruitment</Link>
          <Link to="/events" className="hover:text-blue-600">Events</Link>
          <Link to="/opportunities" className="hover:text-blue-600">Opportunities</Link>
          {user.role === 'ADMIN' && <Link to="/admin" className="text-red-600 font-bold hover:text-red-800">Admin Panel</Link>}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="/profile" className="text-sm font-semibold text-blue-600 hover:underline">My Profile</Link>
        <button onClick={handleLogout} className="text-sm font-semibold text-red-500 hover:text-red-700">Logout</button>
      </div>
    </nav>
  );
}
