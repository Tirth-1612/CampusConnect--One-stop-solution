import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import ClubCard from '../../components/cards/ClubCard';
import { listClubsWithStatus, joinClub } from '../../api/clubs';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentClubs(){
  const [clubs, setClubs] = useState([]);
  const { token } = useAuth();

  useEffect(()=>{ (async()=> setClubs(await listClubsWithStatus(token)))(); }, [token]);

  async function onJoin(club){
    const ok = await joinClub(token, club.id);
    if (ok) setClubs(prev => prev.map(c => c.id === club.id ? { ...c, membership_status:'pending' } : c));
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cards">
        {clubs.map(c => <ClubCard key={c.id} club={c} onJoin={onJoin} />)}
      </div>
    </DashboardLayout>
  );
}
