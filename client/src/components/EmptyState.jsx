import { Box, Typography, Button } from '@mui/material';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

export default function EmptyState({ title = 'Nothing here yet', description, actionLabel, onAction, icon }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2, color: 'text.secondary' }}>
      <Box sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }}>{icon || <InboxRoundedIcon fontSize="inherit" />}</Box>
      <Typography variant="h6" color="text.primary" gutterBottom>{title}</Typography>
      {description && <Typography variant="body2" sx={{ maxWidth: 420, mx: 'auto', mb: 2 }}>{description}</Typography>}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>{actionLabel}</Button>
      )}
    </Box>
  );
}
