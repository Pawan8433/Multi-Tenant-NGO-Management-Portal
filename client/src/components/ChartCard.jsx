import { Card, CardContent, Box, Typography } from '@mui/material';

export default function ChartCard({ title, subtitle, action, height = 300, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6">{title}</Typography>
            {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
          </Box>
          {action}
        </Box>
        <Box sx={{ height }}>{children}</Box>
      </CardContent>
    </Card>
  );
}
