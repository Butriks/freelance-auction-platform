import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const initialForm = {
  role: 'CLIENT',
  email: '',
  password: '',
  companyName: '',
  description: '',
  firstName: '',
  lastName: '',
  bio: '',
  hourlyRate: '',
};

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      email: form.email,
      password: form.password,
      role: form.role,
    };

    if (form.role === 'CLIENT') {
      payload.companyName = form.companyName;
      payload.description = form.description;
    } else {
      payload.firstName = form.firstName;
      payload.lastName = form.lastName;
      payload.bio = form.bio;
      payload.hourlyRate = form.hourlyRate ? Number(form.hourlyRate) : null;
    }

    try {
      await register(payload);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to create account right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card auth-card--wide">
      <div className="auth-card__header">
        <p className="auth-card__eyebrow">Create account</p>
        <h2>Start with a polished profile</h2>
        <p>Choose your role now. Role-based navigation and access can be tightened later.</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Role</span>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="CLIENT">Client</option>
            <option value="FREELANCER">Freelancer</option>
          </select>
        </label>

        <div className="form-grid form-grid--columns">
          <label className="form-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        {form.role === 'CLIENT' ? (
          <div className="form-grid form-grid--columns">
            <label className="form-field">
              <span>Company name</span>
              <input
                name="companyName"
                type="text"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Acme Studio"
                required
              />
            </label>

            <label className="form-field">
              <span>Description</span>
              <input
                name="description"
                type="text"
                value={form.description}
                onChange={handleChange}
                placeholder="What kind of work do you post?"
              />
            </label>
          </div>
        ) : (
          <>
            <div className="form-grid form-grid--columns">
              <label className="form-field">
                <span>First name</span>
                <input
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Ivan"
                  required
                />
              </label>

              <label className="form-field">
                <span>Last name</span>
                <input
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Ivanov"
                  required
                />
              </label>
            </div>

            <div className="form-grid form-grid--columns">
              <label className="form-field">
                <span>Bio</span>
                <input
                  name="bio"
                  type="text"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Node.js developer"
                />
              </label>

              <label className="form-field">
                <span>Hourly rate</span>
                <input
                  name="hourlyRate"
                  type="number"
                  value={form.hourlyRate}
                  onChange={handleChange}
                  placeholder="20"
                  min="1"
                  required
                />
              </label>
            </div>
          </>
        )}

        {error ? <p className="form-error">{error}</p> : null}

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="auth-card__footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
