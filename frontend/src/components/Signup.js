import { Container, TextField, Button, Typography } from "@mui/material";

const Signup = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>Sign Up</Typography>
      <TextField label="Full Name" fullWidth margin="normal" />
      <TextField label="Email" fullWidth margin="normal" />
      <TextField label="Password" type="password" fullWidth margin="normal" />
      <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
        Sign Up
      </Button>
    </Container>
  );
};

export default Signup;
