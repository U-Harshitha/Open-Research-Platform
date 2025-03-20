import { Container, TextField, Button, Typography } from "@mui/material";

const Login = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      <TextField label="Email" fullWidth margin="normal" />
      <TextField label="Password" type="password" fullWidth margin="normal" />
      <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
        Login
      </Button>
    </Container>
  );
};

export default Login;
