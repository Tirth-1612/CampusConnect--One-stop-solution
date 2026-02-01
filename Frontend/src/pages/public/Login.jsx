import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import TextInput from '../../components/forms/TextInput';
import PasswordInput from '../../components/forms/PasswordInput';
import { login as apiLogin } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();
  const { login } = useAuth();

  async function onSubmit(e){
    e.preventDefault(); setError('');
    const res = await apiLogin({ email, password });
    if (!res.ok) { setError(res.error || 'Login failed'); return; }
    login(res.token, res.user);
    const role = res.user?.role;
    if (role === 'faculty') nav('/dashboard/faculty');
    else if (role === 'admin') nav('/dashboard/admin');
    else nav('/dashboard/student');
  }

  return (
    <PublicLayout>
      <form onSubmit={onSubmit} className="card form form-narrow mt-2 w-420">
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <TextInput label="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <PasswordInput label="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn" type="submit">Sign In</button>
        <Link to="/signup" className="link text-center">Sign up</Link>
      </form>
    </PublicLayout>
  );
}
