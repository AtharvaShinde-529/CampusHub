import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

export default function ClubManagement() {
  const { id } = useParams();
  const [members, setMembers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, [id]);

  const fetchMembers = async () => {
    const res = await api.get(`/organizations/${id}/members`);
    setMembers(res.data);
  };

  const updateRole = async (memberId: string, role: string) => {
    await api.patch(`/organizations/members/${memberId}`, { role });
    fetchMembers();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Club Member Management</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-200 px-4 py-2 rounded">Back to Feed</button>
        </div>
        <div className="space-y-4">
          {members.map(member => (
            <div key={member.id} className="border p-4 rounded-lg bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{member.user.studentProfile?.firstName || member.user.facultyProfile?.firstName} {member.user.studentProfile?.lastName || member.user.facultyProfile?.lastName}</h3>
                <p className="text-sm text-gray-500">{member.user.email}</p>
                <p className="text-sm font-bold text-blue-600 mt-1">Current Role: {member.role}</p>
              </div>
              <select 
                className="border p-2 rounded" 
                value={member.role} 
                onChange={(e) => updateRole(member.id, e.target.value)}
              >
                <option value="MEMBER">Member</option>
                <option value="COMMITTEE_MEMBER">Committee Member</option>
                <option value="CLUB_HEAD">Club Head</option>
              </select>
            </div>
          ))}
          {members.length === 0 && <p className="text-gray-500">No members found.</p>}
        </div>
      </div>
    </div>
  );
}
