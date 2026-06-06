import { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import { api, apiError } from '../../api/client.js';
import Brand from '../../components/Brand.jsx';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); setMessage('No verification token provided.'); return; }
    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch((err) => { setStatus('error'); setMessage(apiError(err)); });
  }, [params]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 3 }}>
      <Paper variant="outlined" sx={{ p: 5, maxWidth: 440, textAlign: 'center', borderRadius: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}><Brand /></Box>
        {status === 'loading' && (<><CircularProgress sx={{ mb: 2 }} /><Typography>Verifying your email…</Typography></>)}
        {status === 'success' && (
          <>
            <CheckCircleRoundedIcon color="success" sx={{ fontSize: 64, mb: 1 }} />
            <Typography variant="h5" gutterBottom>Email verified!</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Your email address has been confirmed.</Typography>
            <Button component={RouterLink} to="/login" variant="contained">Continue to sign in</Button>
          </>
        )}
        {status === 'error' && (
          <>
            <ErrorRoundedIcon color="error" sx={{ fontSize: 64, mb: 1 }} />
            <Typography variant="h5" gutterBottom>Verification failed</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>{message}</Typography>
            <Button component={RouterLink} to="/login" variant="outlined">Back to sign in</Button>
          </>
        )}
      </Paper>
    </Box>
  );
}
