import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, TextField, Button, Box, Link, Alert } from '@mui/material';
import { api, apiError } from '../../api/client.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (data.resetToken) setToken(data.resetToken); // dev convenience
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h4" gutterBottom>Reset your password</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Enter your email and we’ll send you a reset link.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {sent ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          If an account exists for {email}, a reset link has been sent.
          {token && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption">Dev token: </Typography>
              <Link component={RouterLink} to={`/reset-password?token=${token}`}>Continue to reset →</Link>
            </Box>
          )}
        </Alert>
      ) : (
        <>
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </>
      )}

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Link component={RouterLink} to="/login" underline="hover" variant="body2">Back to sign in</Link>
      </Box>
    </Box>
  );
}
