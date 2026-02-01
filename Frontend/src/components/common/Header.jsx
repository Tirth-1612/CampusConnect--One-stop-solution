import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from './logo.png'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <header className="header">
      <div className="container header-inner" style={{height:'70px'}}>
        <div className='brand'>
          <img src={logo} alt='logo' className="logo-img" />
          <h2>
            <Link to="/" onClick={logout} style={{textDecoration:'none',color:'white'}}>CampusConnect</Link>
          </h2>
        </div>
        <div className="header-actions">
          {!isAuthenticated ? (
            <Link to="/login" className="btn">Sign In</Link>
          ) : (
            <>
              <span className="muted">{user?.email}</span>
              <button className="btn" onClick={logout}>Sign Out</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
