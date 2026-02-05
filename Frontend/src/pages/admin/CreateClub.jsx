import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createClub as apiCreateClub } from '../../api/clubs';
import DashboardLayout from '../../layouts/DashboardLayout';
import SelectInput from '../../components/forms/SelectInput';
import TextInput from '../../components/forms/TextInput';

export default function CreateClub() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', image_url: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim(),
    };
    const ok = await apiCreateClub(token, payload);
    setSubmitting(false);
    if (ok) {
      setSuccess('Club created successfully');
    } else {
      setError('Failed to create club');
    }
  }

  return (
    <DashboardLayout>
      <div className="card col gap-md">
        <h2>Create Club</h2>
        <form className="col gap-sm" onSubmit={onSubmit}>
          <label className="col gap-xs">
            <span>Name</span>
            <TextInput
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Club name"
              required
            />
          </label>
          <label className="col gap-xs">
            <span>Description</span>
            <TextInput
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Short description"
              rows={4}
            />
          </label>
          <label className="col gap-xs">
            <span>Image URL</span>
            <TextInput
              name="image_url"
              value={form.image_url}
              onChange={onChange}
              placeholder="https://..."
              type="url"
            />
          </label>
          {error && <div className="error-text">{error}</div>}
          {success && <div className="success-text">{success}</div>}
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Club'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
