import { Card, CardContent, Grid, Typography, Accordion, AccordionSummary, AccordionDetails, Box, Button, Stack } from '@mui/material';
import HelpCenterRoundedIcon from '@mui/icons-material/HelpCenterRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PageHeader from '../components/PageHeader.jsx';

const FAQS = [
  { q: 'How do I add a new member?', a: 'Go to Members → Add New, fill in the details and save. You can also bulk import via CSV using the import icon.' },
  { q: 'How are donation receipts generated?', a: 'Open Donations and click the receipt icon on any donation, or visit Receipts to manage all issued receipts. Each receipt includes a QR verification token.' },
  { q: 'Can I invite other administrators?', a: 'Yes. Visit Administrators (or Settings → Administrators) to invite teammates and assign roles such as Staff or Finance Manager.' },
  { q: 'Is my organization’s data isolated?', a: 'Absolutely. Every record is scoped to your tenant. Users from other organizations can never access your data.' },
  { q: 'How do I switch to dark mode?', a: 'Use the sun/moon toggle in the top bar, or go to My Account → Preferences.' },
];

const RESOURCES = [
  { icon: <MenuBookRoundedIcon />, title: 'Documentation', desc: 'Guides and how-tos for every module.' },
  { icon: <ChatRoundedIcon />, title: 'Live chat', desc: 'Talk to our support team in real time.' },
  { icon: <EmailRoundedIcon />, title: 'Email support', desc: 'support@impacthub.app · replies within 24h.' },
];

export default function HelpCenter() {
  return (
    <>
      <PageHeader title="Help Center" subtitle="Answers, guides and support" icon={<HelpCenterRoundedIcon />} />
      <Grid container spacing={2.5}>
        {RESOURCES.map((r) => (
          <Grid item xs={12} md={4} key={r.title}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, display: 'grid', placeItems: 'center', color: 'primary.main', bgcolor: 'action.selected', mb: 1.5 }}>{r.icon}</Box>
                <Typography variant="h6">{r.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{r.desc}</Typography>
                <Button size="small">Open</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>Frequently asked questions</Typography>
              {FAQS.map((f) => (
                <Accordion key={f.q} disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: 1, borderColor: 'divider' }}>
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}><Typography fontWeight={600}>{f.q}</Typography></AccordionSummary>
                  <AccordionDetails><Typography color="text.secondary">{f.a}</Typography></AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
