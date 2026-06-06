import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 3, textAlign: 'center' }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}><Brand /></Box>
        <Typography sx={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 96, lineHeight: 1, color: 'primary.main' }}>404</Typography>
        <Typography variant="h5" gutterBottom>Page not found</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>The page you're looking for doesn't exist or has moved.</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Back to dashboard</Button>
      </Box>
    </Box>
  );
}
