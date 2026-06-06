import { Chip } from '@mui/material';
import { titleCase } from '../utils/format.js';

// Maps domain statuses to a consistent color language across the app.
const COLORS = {
  active: 'success', received: 'success', issued: 'success', completed: 'success', sent: 'success',
  pending: 'warning', invited: 'warning', scheduled: 'warning', upcoming: 'info', ongoing: 'info',
  trial: 'info', trialing: 'info',
  draft: 'default', inactive: 'default', no_show: 'default', cancelled: 'default', void: 'default',
  suspended: 'error', refunded: 'error', past_due: 'error', expired: 'error',
};

export default function StatusChip({ value, size = 'small' }) {
  if (!value) return null;
  return (
    <Chip size={size} variant="outlined" color={COLORS[value] || 'default'} label={titleCase(value)} />
  );
}
