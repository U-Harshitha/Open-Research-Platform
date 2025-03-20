import { Container, Grid, Typography } from "@mui/material";
import ResearchList from "../components/ResearchList";

const Dashboard = () => {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Research Papers
      </Typography>
      <Grid container spacing={3}>
        <ResearchList />
      </Grid>
    </Container>
  );
};

export default Dashboard;
