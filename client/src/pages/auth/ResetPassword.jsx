import { useState } from 'react';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Box, Link, Alert, Stack } from '@mui/material';
import { api, apiError } from '../../api/client.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h4" gutterBottom>Set a new password</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Choose a strong password for your account.</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {done && <Alert severity="success" sx={{ mb: 2 }}>Password updated. Redirecting to sign in…</Alert>}

      <Stack spacing={2}>
        {!params.get('token') && (
          <TextField label="Reset token" value={token} onChange={(e) => setToken(e.target.value)} fullWidth required />
        )}
        <TextField label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
        <TextField label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} fullWidth required />
      </Stack>

      <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mt: 2 }}>
        {loading ? 'Updating…' : 'Update password'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Link component={RouterLink} to="/login" underline="hover" variant="body2">Back to sign in</Link>
      </Box>
    </Box>
  );
}
