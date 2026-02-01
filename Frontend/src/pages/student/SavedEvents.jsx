import DashboardLayout from '../../layouts/DashboardLayout';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { listSavedEvents } from '../../api/saved';
import EventCard from '../../components/cards/EventCard';

export default function SavedEvents(){
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try{
        setItems(await listSavedEvents(token));
      }
       catch(err){ setError('Failed to load saved events'); }
      finally{ setLoading(false); }
    })();
  }, [token]);

  return (
    <DashboardLayout>
      <h2>Saved Events</h2>
      {loading && <div className="loader" />}
      {error && <div className="error">{error}</div>}
      {!loading && !items.length && <div className="text-muted">You have no saved events.</div>}
      <div className="grid grid-cards">
        {items.map(e => (
          <EventCard key={e.id} item={e} saved />
        ))}
      </div>
    </DashboardLayout>
  );
}
