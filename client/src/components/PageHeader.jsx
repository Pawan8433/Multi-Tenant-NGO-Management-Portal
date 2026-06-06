import { Box, Typography, Stack } from '@mui/material';

export default function PageHeader({ title, subtitle, actions, icon }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        {icon && (
          <Box
            sx={{
              width: 44, height: 44, borderRadius: 2.5, display: 'grid', placeItems: 'center',
              color: 'primary.main', bgcolor: (t) => t.palette.action.selected,
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: 22, md: 28 } }}>{title}</Typography>
          {subtitle && <Typography color="text.secondary" variant="body2">{subtitle}</Typography>}
        </Box>
      </Box>
      {actions && <Stack direction="row" spacing={1.5}>{actions}</Stack>}
    </Stack>
  );
}
