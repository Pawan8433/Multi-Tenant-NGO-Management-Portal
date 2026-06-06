import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Typography, TextField, Button, Box, Link, Alert, InputAdornment, IconButton, Divider, Stack,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../app/AuthContext.jsx';
import { apiError } from '../../api/client.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@hopefoundation.org');
  const [password, setPassword] = useState('Password123!');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate(data?.user?.role === 'super_admin' ? '/superadmin/dashboard' : '/');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h4" gutterBottom>Welcome back</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Sign in to your ImpactHub workspace.</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={2}>
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
        <TextField
          label="Password"
          type={show ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShow((s) => !s)} edge="end">
                  {show ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Box sx={{ textAlign: 'right', mt: 1 }}>
        <Link component={RouterLink} to="/forgot-password" underline="hover" variant="body2">
          Forgot password?
        </Link>
      </Box>

      <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mt: 2 }}>
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>

      <Divider sx={{ my: 3 }}>New to ImpactHub?</Divider>
      <Button component={RouterLink} to="/register" variant="outlined" fullWidth>
        Create an organization account
      </Button>

      <Alert severity="info" sx={{ mt: 3 }}>
        Demo: <strong>admin@hopefoundation.org</strong> / <strong>Password123!</strong>
      </Alert>
    </Box>
  );
}
