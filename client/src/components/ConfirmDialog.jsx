import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export default function ConfirmDialog({
  open, title = 'Are you sure?', message, confirmLabel = 'Confirm', color = 'error', loading, onConfirm, onClose,
}) {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, width: 420 } }}>
      <DialogTitle fontWeight={700}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color={color} disabled={loading}>
          {loading ? 'Working…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
