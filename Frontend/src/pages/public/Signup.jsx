import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import TextInput from '../../components/forms/TextInput';
import PasswordInput from '../../components/forms/PasswordInput';
import SelectInput from '../../components/forms/SelectInput';
import { signup as apiSignup } from '../../api/auth';

export default function Signup(){
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student', department:'', year:'' });
  const [error, setError] = useState('');
  const nav = useNavigate();

  const update = (k,v)=> setForm(f=>({ ...f, [k]: v }));

  async function onSubmit(e){
    e.preventDefault();   
    setError('');
    console.log(form)
    const res = await apiSignup(form);
    if (!res.ok) { setError(res.error || 'Signup failed'); return; }
    nav('/login');
  }

  return (
    <PublicLayout>
      <form onSubmit={onSubmit} className="card form form-narrow mt-2" style={{maxWidth:520}}>
        <h2>Sign Up</h2>

        {error && <div className="error">{error}</div>}

        <TextInput label="Name" value={form.name} onChange={e=>update('name', e.target.value)} required />
        <TextInput label="Email" type="email" value={form.email} onChange={e=>update('email', e.target.value)} required />
        <PasswordInput label="Password" value={form.password} onChange={e=>update('password', e.target.value)} required />
        
        <SelectInput label="Role" value={form.role} onChange={e=>update('role', e.target.value)}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
        </SelectInput>
        
        <TextInput label="Department" value={form.department} onChange={e=>update('department', e.target.value)} />
        <TextInput label="Year" type="number" value={form.year} onChange={e=>update('year', Number(e.target.value))} />
        <button className="btn" type="submit">Create account</button>
        <Link to="/login" className="link text-center">Back to login</Link>
      </form>
    </PublicLayout>
  );
}
