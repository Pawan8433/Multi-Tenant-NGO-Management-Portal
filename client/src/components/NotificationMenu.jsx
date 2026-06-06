import { useState } from 'react';
import {
  IconButton, Badge, Menu, Box, Typography, List, ListItem, ListItemText, Button, Divider, Chip,
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/resource.js';
import { fromNow } from '../utils/format.js';

const typeColor = { success: 'success', warning: 'warning', error: 'error', info: 'info' };

export default function NotificationMenu() {
  const [anchor, setAnchor] = useState(null);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['notifications'], queryFn: notificationsApi.list });
  const readAll = useMutation({
    mutationFn: notificationsApi.readAll,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const items = data?.data || [];
  const unread = data?.unread || 0;

  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} color="inherit">
        <Badge badgeContent={unread} color="error">
          <NotificationsRoundedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { width: 360, maxWidth: '90vw', borderRadius: 3, mt: 1 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
          {unread > 0 && (
            <Button size="small" onClick={() => readAll.mutate()}>Mark all read</Button>
          )}
        </Box>
        <Divider />
        <List dense sx={{ maxHeight: 360, overflowY: 'auto', py: 0 }}>
          {items.length === 0 && (
            <ListItem><ListItemText primary="You're all caught up 🎉" /></ListItem>
          )}
          {items.map((n) => (
            <ListItem key={n.id} sx={{ bgcolor: n.is_read ? 'transparent' : (t) => t.palette.action.hover }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip size="small" label={n.type} color={typeColor[n.type] || 'default'} variant="outlined" />
                    <Typography variant="body2" fontWeight={600}>{n.title}</Typography>
                  </Box>
                }
                secondary={`${n.body || ''} · ${fromNow(n.created_at)}`}
              />
            </ListItem>
          ))}
        </List>
      </Menu>
    </>
  );
}
