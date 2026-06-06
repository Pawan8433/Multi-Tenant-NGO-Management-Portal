import { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
  MenuItem, FormControlLabel, Switch, Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

/**
 * Schema-driven create/edit dialog.
 * fields: [{ name, label, type, options?, required?, cols?, multiline?, rows?, min?, step? }]
 */
export default function FormDialog({ open, title, fields, defaultValues, onSubmit, onClose, submitting, error }) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: defaultValues || {} });

  useEffect(() => {
    if (open) reset(defaultValues || {});
  }, [open, defaultValues, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle fontWeight={700}>{title}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            {fields.map((f) => (
              <Grid item xs={12} sm={f.cols || 12} key={f.name}>
                <Controller
                  name={f.name}
                  control={control}
                  rules={{ required: f.required ? `${f.label} is required` : false }}
                  render={({ field }) => {
                    if (f.type === 'switch') {
                      return (
                        <FormControlLabel
                          control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked ? 1 : 0)} />}
                          label={f.label}
                        />
                      );
                    }
                    return (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        label={f.label}
                        fullWidth
                        required={f.required}
                        select={f.type === 'select'}
                        type={['number', 'date', 'datetime-local', 'email', 'tel'].includes(f.type) ? f.type : 'text'}
                        multiline={f.multiline}
                        rows={f.rows}
                        InputLabelProps={['date', 'datetime-local'].includes(f.type) ? { shrink: true } : undefined}
                        inputProps={f.type === 'number' ? { min: f.min, step: f.step } : undefined}
                        error={!!errors[f.name]}
                        helperText={errors[f.name]?.message}
                      >
                        {f.type === 'select' &&
                          (f.options || []).map((o) => (
                            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                          ))}
                      </TextField>
                    );
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
