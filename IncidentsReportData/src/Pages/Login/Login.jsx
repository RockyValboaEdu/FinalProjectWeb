import * as React from 'react';

import { Link as RouterLink, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import OutlinedInput from '@mui/material/OutlinedInput';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import logo from '../../assets/Logouniamazonia.png';

import appFirebase from '../../FireBase/config'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
const auth = getAuth(appFirebase);

const Card = styled(MuiCard)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  maxWidth: '420px',
  padding: '32px',
  gap: '20px',
  margin: 'auto',
  borderRadius: '16px',
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: `
    0px 2px 4px rgba(0,0,0,0.04),
    0px 8px 16px rgba(0,0,0,0.06),
    0px 24px 48px rgba(0,0,0,0.08),
    0px 48px 80px rgba(0,0,0,0.04)
  `,
  background: '#ffffff',
}));

const LoginContainer = styled(Stack)(() => ({
  minHeight: '100vh',
  padding: '24px 16px',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'radial-gradient(ellipse at 50% 40%, hsl(210, 100%, 95%), hsl(210, 60%, 88%) 60%, hsl(210, 40%, 80%))',
}));

const RoundedTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '50px',
    backgroundColor: '#fafafa',
    '&:hover fieldset': { borderColor: '#aaa' },
  },
}));

export default function Login() {
//Mostrar contraseña
  const [showPassword, setShowPassword] = React.useState(false);

  const navigate = useNavigate();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState({});

  const validate = () => {
    const newErrors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email))
      newErrors.email = 'Por favor ingresa un correo válido.';
    if (!password || password.length < 6)
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //Inicio de la función para enviar los datos a FireBase

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuario autenticado:', user);
      navigate('/dashboard'); //Redireccionar a la página principal después del login exitoso
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        setErrors({ password: 'Correo o contraseña incorrectos.' });
      } else {
        console.error('Error de autenticación:', error);
      }
    }
  };

  //Fin de la función para enviar los datos a FireBase

  return (
    <>
      <CssBaseline />
      <LoginContainer>
        <Card variant="outlined">

          {/* Logo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src={logo}
              alt="Logo Universidad de la Amazonia"
              sx={{ height: 72, objectFit: 'contain' }}
            />
            <Typography sx={{ fontWeight: 700, fontSize: '22px', color: '#1a1a2e', textAlign: 'center', lineHeight: 1.3 }}>
              Sistema reportes de incidentes ocurridos<br />
              <span style={{ fontWeight: 400, fontSize: '20px', color: '#444' }}>Dentro de las instalaciones</span>
            </Typography>
          </Box>

          <Divider />

          {/* Título */}
          <Typography component="h1" variant="h5" sx={{
            fontWeight: 600, color: '#0d0d0d', textAlign: 'center',
          }}>
            Iniciar Sesión
          </Typography>

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Correo */}
            <FormControl>
              <RoundedTextField
                id="email" type="email" required fullWidth
                placeholder="Correo"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#555' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>

            {/* Contraseña */}
            <FormControl>
              <OutlinedInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                fullWidth
                placeholder="Contraseña"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                error={!!errors.password}
                sx={{
                  borderRadius: '50px',
                  backgroundColor: '#fafafa',
                  '&:hover fieldset': { borderColor: '#aaa' },
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#555' }} />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseUp={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {errors.password && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.password}
                </Typography>
              )}
            </FormControl>

            {/* Botones */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                component={RouterLink}
                to="/signup"
                fullWidth
                variant="contained"
                sx={{
                  py: 1.4,
                  borderRadius: '50px',
                  fontWeight: 600,
                  fontSize: '15px',
                  background: '#c8c8c8',
                  color: '#333',
                  boxShadow: 'none',
                  '&:hover': { background: '#b0b0b0', boxShadow: 'none' },
                }}
              >
                Crear Cuenta
              </Button>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  py: 1.4,
                  borderRadius: '50px',
                  fontWeight: 600,
                  fontSize: '15px',
                  background: '#2e7d32',
                  boxShadow: '0px 4px 12px rgba(46,125,50,0.3)',
                  '&:hover': {
                    background: '#1b5e20',
                    boxShadow: '0px 6px 16px rgba(46,125,50,0.4)',
                  },
                }}
              >
                Ingresar
              </Button>
            </Box>

          </Box>
        </Card>
      </LoginContainer>
    </>
  );
}