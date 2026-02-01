import DashboardLayout from '../../layouts/DashboardLayout';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { listSavedAnnouncements } from '../../api/saved';
import AnnouncementCard from '../../components/cards/AnnouncementCard';

export default function SavedAnnouncements(){
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try{
        setItems(await listSavedAnnouncements(token));
      } catch(err){ setError('Failed to load saved announcements'); }
      finally{ setLoading(false); }
    })();
  }, [token]);

  return (
    <DashboardLayout>
      <h2>Saved Announcements</h2>
      {loading && <div className="loader" />}
      {error && <div className="error">{error}</div>}
      {!loading && !items.length && <div className="text-muted">You have no saved announcements.</div>}
      <div className="grid grid-cards">
        {items.map(a => (
          <AnnouncementCard key={a.id} item={a} saved />
        ))}
      </div>
    </DashboardLayout>
  );
}
