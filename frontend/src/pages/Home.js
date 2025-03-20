import { Container, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Container sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Open Research Nexus
      </Typography>
      <Typography variant="subtitle1" paragraph>
        A global platform for open-source research collaboration.
      </Typography>
      <Button variant="contained" color="primary" component={Link} to="/dashboard">
        Explore Research
      </Button>
    </Container>
  );
};

export default Home;
