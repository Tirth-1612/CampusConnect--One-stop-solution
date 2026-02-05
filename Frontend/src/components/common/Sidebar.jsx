import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar(){
  const { user } = useAuth();
  const { pathname } = useLocation();

  const itemsByRole = {
    student: [
      { to:'/dashboard/student', label:'Home' },
      { to:'/dashboard/student/profile', label:'Profile' },
      { to:'/dashboard/student/clubs', label:'Clubs' },
      { to:'/dashboard/student/saved/announcements', label:'Saved Announcements' },
      { to:'/dashboard/student/saved/events', label:'Saved Events' },
    ],
    faculty: [
      { to:'/dashboard/faculty', label:'Home' },
      { to:'/dashboard/faculty/profile', label:'Profile' },
      { to:'/dashboard/faculty/announcements/create', label:'Create Announcement' },
      { to:'/dashboard/faculty/events/create', label:'Create Event' },
      { to:'/dashboard/faculty/saved/announcements', label:'Saved Announcements' },
      { to:'/dashboard/faculty/saved/events', label:'Saved Events' },
    ],
    admin: [
      { to:'/dashboard/admin', label:'Home' },
      { to:'/dashboard/admin/profile', label:'Profile' },
      { to:'/dashboard/admin/announcements/create', label:'Create Announcement' },
      { to:'/dashboard/admin/events/create', label:'Create Event' },
      { to:'/dashboard/admin/clubs/create', label:'Create Club' },
      { to:'/dashboard/admin/requests', label:'Join Requests' },
      { to:'/dashboard/admin/members', label:'Club Members' },
    ],
  };

  const items = itemsByRole[user?.role] || [];

  return (
    <aside className="card minw-240">
      <nav className="col gap-sm">
        {items.map(it => (
          <Link
            key={it.to}
            to={it.to}
            className={pathname===it.to ? 'link active-link' : 'link'}
          >{it.label}</Link>
        ))}
      </nav>
    </aside>
  );
}
