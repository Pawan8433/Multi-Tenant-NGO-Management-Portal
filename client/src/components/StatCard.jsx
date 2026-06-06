import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';

export default function StatCard({ label, value, icon, color = 'primary', hint, loading }) {
  return (
    <Card
      sx={{
        height: '100%',
        '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
      }}
    >
      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 48, height: 48, borderRadius: 3, display: 'grid', placeItems: 'center',
            color: `${color}.main`, bgcolor: (t) => alpha(t.palette[color].main, 0.14), flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600} noWrap>
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={80} height={36} />
          ) : (
            <Typography variant="h4" sx={{ fontSize: 26, mt: 0.25 }}>{value}</Typography>
          )}
          {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}
