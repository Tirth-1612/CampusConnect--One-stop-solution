import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';

export default function Landing(){
  return (
    <PublicLayout>
      <div className="container stack-lg">
        <h1>CampusConnect</h1>
        <p className="text-muted">A centralized platform for campus announcements, events, and clubs. Stay updated and get involved.</p>
        <div>
          <Link to="/login" className="btn">Sign in to continue</Link>
        </div>
      </div>
    </PublicLayout>
  );
}
