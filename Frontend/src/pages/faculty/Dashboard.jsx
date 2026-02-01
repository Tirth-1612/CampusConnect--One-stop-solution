import DashboardLayout from '../../layouts/DashboardLayout';
import { useEffect, useState } from 'react';
import { listAnnouncements } from '../../api/announcements';
import { listEvents } from '../../api/events';
import AnnouncementCard from '../../components/cards/AnnouncementCard';
import EventCard from '../../components/cards/EventCard';

export default function FacultyDashboard(){
  const [anns, setAnns] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try{
        const [a, e] = await Promise.all([listAnnouncements(), listEvents()]);
        setAnns(a); setEvents(e);
      } catch(err){ setError('Failed to load data'); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <DashboardLayout>
      <h2>Faculty Dashboard</h2>
      {loading && <div className="loader" />}
      {error && <div className="error">{error}</div>}
      <h3 className="section-title">Announcements</h3>
      <div className="grid grid-cards">
        {anns.map(a => <AnnouncementCard key={a.id} item={a} />)}
      </div>
      <h3 className="section-title">Events</h3>
      <div className="grid grid-cards">
        {events.map(e => <EventCard key={e.id} item={e} />)}
      </div>
    </DashboardLayout>
  );
}
