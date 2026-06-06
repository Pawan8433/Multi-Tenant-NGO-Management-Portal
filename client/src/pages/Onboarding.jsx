import { useState, useEffect } from 'react';
import {
  Card, CardContent, Box, Typography, Stepper, Step, StepLabel, Button, LinearProgress, Stack, Checkbox, FormControlLabel,
} from '@mui/material';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader.jsx';
import { settingsApi } from '../api/resource.js';

const STEPS = [
  { key: 'create_organization', label: 'Create Organization', desc: 'Your workspace is provisioned.', to: '/settings' },
  { key: 'add_administrators', label: 'Add Administrators', desc: 'Invite your team and assign roles.', to: '/administrators' },
  { key: 'create_membership_types', label: 'Create Membership Types', desc: 'Define your membership tiers.', to: '/members' },
  { key: 'import_members', label: 'Import Members', desc: 'Bring in your existing members via CSV.', to: '/members' },
  { key: 'create_first_event', label: 'Create First Event', desc: 'Schedule your first program or event.', to: '/events' },
  { key: 'configure_donations', label: 'Configure Donation Settings', desc: 'Set currency and receipt preferences.', to: '/settings' },
  { key: 'complete', label: 'Complete Setup', desc: 'You are ready to go!', to: '/' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [steps, setSteps] = useState({});

  const { data } = useQuery({ queryKey: ['onboarding'], queryFn: settingsApi.onboarding });
  useEffect(() => {
    if (data?.steps) setSteps(typeof data.steps === 'string' ? JSON.parse(data.steps) : data.steps);
  }, [data]);

  const save = useMutation({
    mutationFn: (payload) => settingsApi.updateOnboarding(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onboarding'] }),
  });

  const done = STEPS.filter((s) => steps[s.key]).length;
  const progress = Math.round((done / STEPS.length) * 100);
  const activeStep = STEPS.findIndex((s) => !steps[s.key]);

  const toggle = (key) => {
    const next = { ...steps, [key]: !steps[key] };
    setSteps(next);
    save.mutate({ steps: next, completed: STEPS.every((s) => next[s.key]) });
  };

  return (
    <>
      <PageHeader title="Getting Started" subtitle="Set up your organization in a few steps" icon={<RocketLaunchRoundedIcon />} />

      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography fontWeight={700}>Setup progress</Typography>
            <Typography color="primary" fontWeight={700}>{progress}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep === -1 ? STEPS.length : activeStep} orientation="vertical" sx={{ mb: 1 }}>
            {STEPS.map((s) => (
              <Step key={s.key} completed={!!steps[s.key]}>
                <StepLabel>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
                    <Box>
                      <Typography fontWeight={700}>{s.label}</Typography>
                      <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FormControlLabel
                        control={<Checkbox checked={!!steps[s.key]} onChange={() => toggle(s.key)} />}
                        label="Done"
                      />
                      <Button size="small" variant="outlined" onClick={() => navigate(s.to)}>Go</Button>
                    </Stack>
                  </Stack>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {progress === 100 && (
            <Button variant="contained" size="large" onClick={() => navigate('/')} sx={{ mt: 2 }}>
              Finish & go to dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
}
