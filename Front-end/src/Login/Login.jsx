import React, { useState } from 'react';
import './Login.css';

export function Login() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    // For now just log the values. Integrate API call here.
    console.log('Signup:', { username, email, password });
    alert('Signed up successfully (mock)');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirm('');
  };

  return (
    <div className="signup-page">
      <form className="signup-form" onSubmit={handleSubmit} noValidate>
        <h2>Create account</h2>

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
          />
        </label>

        <label>
          Re-enter Password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            required
            minLength={6}
          />
        </label>

        {error && <div className="form-error">{error}</div>}

        <button type="submit" className="submit-btn">Sign up</button>
      </form>
    </div>
  );
}