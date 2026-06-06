import { Box, Paper, Typography, Stack } from '@mui/material';
import { Outlet } from 'react-router-dom';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Brand from '../components/Brand.jsx';

const highlights = [
  'Isolated workspace for every organization',
  'Members, donations, volunteers & events in one place',
  'Branded receipts with QR verification',
  'Real-time dashboards and exportable reports',
];

export default function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' } }}>
      {/* Brand / value panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(1200px 600px at -10% -10%, #14B8A6 0%, transparent 50%), linear-gradient(135deg, #0B5853, #0F766E 55%, #0B1220)',
        }}
      >
        <Brand light />
        <Box>
          <Typography variant="h3" sx={{ color: '#fff', mb: 2, maxWidth: 460 }}>
            Run your nonprofit like a modern enterprise.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,.8)', mb: 4, maxWidth: 440 }}>
            ImpactHub is the all-in-one platform NGOs, charities and associations use to
            manage people, fundraising and impact — securely and at scale.
          </Typography>
          <Stack spacing={1.5}>
            {highlights.map((h) => (
              <Box key={h} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <CheckCircleRoundedIcon sx={{ color: '#F59E0B' }} />
                <Typography sx={{ color: 'rgba(255,255,255,.92)' }}>{h}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.6)' }}>
          © {new Date().getFullYear()} ImpactHub. All rights reserved.
        </Typography>
      </Box>

      {/* Form panel */}
      <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 3, sm: 6 }, bgcolor: 'background.default' }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, width: '100%', maxWidth: 440, borderRadius: 4 }}>
          <Box sx={{ mb: 3, display: { xs: 'block', md: 'none' } }}>
            <Brand />
          </Box>
          <Outlet />
        </Paper>
      </Box>
    </Box>
  );
}
