import { Box, Typography } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';

// Logo lockup used in the sidebar and auth screens.
export default function Brand({ dense = false, light = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: dense ? 34 : 40,
          height: dense ? 34 : 40,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          background: 'linear-gradient(135deg, #14B8A6, #0F766E)',
          boxShadow: '0 6px 16px rgba(15,118,110,.35)',
        }}
      >
        <FavoriteRoundedIcon fontSize={dense ? 'small' : 'medium'} />
      </Box>
      <Box sx={{ lineHeight: 1 }}>
        <Typography
          sx={{ fontFamily: 'Sora', fontWeight: 800, fontSize: dense ? 18 : 20, color: light ? '#fff' : 'text.primary' }}
        >
          Impact<span style={{ color: '#F59E0B' }}>Hub</span>
        </Typography>
        {!dense && (
          <Typography sx={{ fontSize: 11, color: light ? 'rgba(255,255,255,.7)' : 'text.secondary', letterSpacing: '.08em' }}>
            NGO MANAGEMENT
          </Typography>
        )}
      </Box>
    </Box>
  );
}
