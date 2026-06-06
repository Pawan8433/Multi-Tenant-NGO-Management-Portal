import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Box, Link, Alert, Grid, Stack } from '@mui/material';
import { useAuth } from '../../app/AuthContext.jsx';
import { apiError } from '../../api/client.js';

const FIELDS = [
  { name: 'ngoName', label: 'NGO Name', cols: 12, required: true },
  { name: 'registrationNumber', label: 'Registration Number', cols: 6 },
  { name: 'phone', label: 'Phone', cols: 6 },
  { name: 'email', label: 'Email', cols: 12, required: true, type: 'email' },
  { name: 'country', label: 'Country', cols: 6 },
  { name: 'address', label: 'Address', cols: 6 },
  { name: 'password', label: 'Password', cols: 12, required: true, type: 'password' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(form);
      // Show generated identifiers briefly, then enter onboarding.
      console.info('Tenant created:', res.tenant);
      navigate('/onboarding');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h4" gutterBottom>Create your workspace</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Register your organization — we’ll provision an isolated tenant for you.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        {FIELDS.map((f) => (
          <Grid item xs={12} sm={f.cols} key={f.name}>
            <TextField
              label={f.label}
              type={f.type || 'text'}
              value={form[f.name] || ''}
              onChange={set(f.name)}
              fullWidth
              required={f.required}
            />
          </Grid>
        ))}
      </Grid>

      <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mt: 3 }}>
        {loading ? 'Creating…' : 'Create account'}
      </Button>

      <Stack direction="row" justifyContent="center" sx={{ mt: 2 }} spacing={0.5}>
        <Typography variant="body2" color="text.secondary">Already have an account?</Typography>
        <Link component={RouterLink} to="/login" underline="hover" variant="body2">Sign in</Link>
      </Stack>
    </Box>
  );
}
