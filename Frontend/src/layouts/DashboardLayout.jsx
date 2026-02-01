import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Sidebar from '../components/common/Sidebar';

export default function DashboardLayout({ children }){
  return (
    <div className="app-shell">
      <Header />
      <div className="container shell-content">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
