import * as React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { GoogleIcon, FacebookIcon } from '../../Components/CustomIcons/CustomIcons';

const logo = "https://firebasestorage.googleapis.com/v0/b/proyecto-web-65b12.firebasestorage.app/o/assets%2FLogouniamazonia.png?alt=media&token=c81e5968-00d6-4e49-9ad7-8379ef731a50";

import appFirebase, { db } from '../../FireBase/config';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const auth = getAuth(appFirebase);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// — styled components igual que antes —
const Card = styled(MuiCard)(() => ({
    display: 'flex', flexDirection: 'column', alignSelf: 'center',
    width: '100%', maxWidth: '480px', padding: '32px', gap: '16px',
    margin: 'auto', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: `0px 2px 4px rgba(0,0,0,0.04), 0px 8px 16px rgba(0,0,0,0.06),
    0px 24px 48px rgba(0,0,0,0.08), 0px 48px 80px rgba(0,0,0,0.04)`,
    background: '#ffffff',
}));

const SignUpContainer = styled(Stack)(() => ({
    minHeight: '100vh', padding: '24px 16px',
    alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse at 50% 40%, hsl(210, 100%, 95%), hsl(210, 60%, 88%) 60%, hsl(210, 40%, 80%))',
}));

const StyledTextField = styled(TextField)(() => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px', backgroundColor: '#fafafa',
        '&:hover fieldset': { borderColor: '#aaa' },
    },
}));

const StyledSelect = styled(Select)(() => ({
    borderRadius: '8px', backgroundColor: '#fafafa',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#aaa' },
}));

const passwordRequirements = [
    { label: 'Al menos debería tener una letra', test: (v) => /[a-z]/.test(v) },
    { label: 'Al menos debería tener una letra en mayúsculas', test: (v) => /[A-Z]/.test(v) },
    { label: 'Al menos debería tener un número', test: (v) => /[0-9]/.test(v) },
    { label: 'Debería tener 8 caracteres como mínimo', test: (v) => v.length >= 8 },
];

function PasswordTooltip({ password, visible }) {
    if (!visible) return null;
    return (
        <Paper elevation={4} sx={{ position: 'absolute', zIndex: 10, mt: 1, p: '12px 16px', borderRadius: '10px', width: '100%', border: '1px solid rgba(0,0,0,0.08)' }}>
            <Typography variant="body2" sx={{ mb: 1, color: '#333', fontWeight: 500, fontSize: '12px' }}>
                La contraseña debería cumplir con los siguientes requerimientos:
            </Typography>
            {passwordRequirements.map((req) => {
                const ok = req.test(password);
                return (
                    <Box key={req.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '3px', flexShrink: 0, background: ok ? '#2e7d32' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {ok && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </Box>
                        <Typography variant="body2" sx={{ fontSize: '12px', color: ok ? '#2e7d32' : '#555' }}>{req.label}</Typography>
                    </Box>
                );
            })}
        </Paper>
    );
}

// Función para guardar usuario social en Firestore si no existe
async function guardarUsuarioSocialSiNoExiste(user) {
    const ref = doc(db, 'ClientManagement', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        const nombreCompleto = user.displayName || '';
        const partes = nombreCompleto.split(' ');
        await setDoc(ref, {
            nombres: partes[0] || '',
            apellidos: partes.slice(1).join(' ') || '',
            email: user.email || '',
            identificacion: '',
            telefono: '',
            genero: '',
            uid: user.uid,
            rol: 'usuario',
        });
    }
}

export default function SignUp() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = React.useState(false);
    const [form, setForm] = React.useState({
        nombres: '', apellidos: '', email: '', identificacion: '', telefono: '', genero: '', password: '',
    });
    const [errors, setErrors] = React.useState({});
    const [passwordFocused, setPasswordFocused] = React.useState(false);

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const allPasswordReqsMet = passwordRequirements.every((r) => r.test(form.password));

    const validate = () => {
        const newErrors = {};
        if (!form.nombres.trim()) newErrors.nombres = 'El nombre es requerido.';
        if (!form.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos.';
        if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Por favor ingresa un correo válido.';
        if (!form.identificacion.trim()) newErrors.identificacion = 'El número de identificación es requerido.';
        if (!form.telefono.trim() || !/^[0-9]{7,10}$/.test(form.telefono)) newErrors.telefono = 'Ingresa un número de teléfono válido (7 a 10 dígitos).';
        if (!form.genero) newErrors.genero = 'Por favor selecciona un género.';
        if (!allPasswordReqsMet) newErrors.password = 'La contraseña no cumple los requisitos.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;
            await setDoc(doc(db, 'ClientManagement', form.identificacion), {
                nombres: form.nombres, apellidos: form.apellidos,
                email: form.email, identificacion: form.identificacion,
                telefono: form.telefono, genero: form.genero,
                uid: user.uid, rol: 'usuario',
            });
            alert('Usuario registrado exitosamente');
            navigate('/login');
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setErrors({ email: 'Este correo ya está registrado.' });
            } else {
                console.error('Error al registrar usuario:', error);
            }
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await guardarUsuarioSocialSiNoExiste(result.user);
            navigate('/dashboard-usuario');
        } catch (error) {
            console.error('Error con Google:', error);
            alert('Error al iniciar sesión con Google.');
        }
    };

    const handleFacebookSignUp = async () => {
        try {
            const result = await signInWithPopup(auth, facebookProvider);
            await guardarUsuarioSocialSiNoExiste(result.user);
            navigate('/dashboard-usuario');
        } catch (error) {
            console.error('Error con Facebook:', error);
            alert('Error al iniciar sesión con Facebook.');
        }
    };

    return (
        <>
            <CssBaseline />
            <SignUpContainer>
                <Card variant="outlined">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Box component="img" src={logo} alt="Logo Universidad de la Amazonia" sx={{ height: 72, objectFit: 'contain' }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '22px', color: '#1a1a2e', textAlign: 'center', lineHeight: 1.3 }}>
                            Crear cuenta sistema de reportes<br />
                            <span style={{ fontWeight: 400, fontSize: '20px', color: '#444' }}>Universidad de la Amazonia</span>
                        </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                        <FormControl>
                            <FormLabel htmlFor="nombres" sx={{ fontWeight: 500, mb: 0.5 }}>Nombres</FormLabel>
                            <StyledTextField id="nombres" required fullWidth placeholder="Juan" value={form.nombres} onChange={handleChange('nombres')} error={!!errors.nombres} helperText={errors.nombres} />
                        </FormControl>

                        <FormControl>
                            <FormLabel htmlFor="apellidos" sx={{ fontWeight: 500, mb: 0.5 }}>Apellidos</FormLabel>
                            <StyledTextField id="apellidos" required fullWidth placeholder="Pérez García" value={form.apellidos} onChange={handleChange('apellidos')} error={!!errors.apellidos} helperText={errors.apellidos} />
                        </FormControl>

                        <FormControl>
                            <FormLabel htmlFor="email" sx={{ fontWeight: 500, mb: 0.5 }}>Correo Electrónico</FormLabel>
                            <StyledTextField id="email" type="email" required fullWidth placeholder="correo@udla.edu.co" value={form.email} onChange={handleChange('email')} error={!!errors.email} helperText={errors.email} />
                        </FormControl>

                        <FormControl>
                            <FormLabel htmlFor="identificacion" sx={{ fontWeight: 500, mb: 0.5 }}>Número Identificación</FormLabel>
                            <StyledTextField id="identificacion" required fullWidth placeholder="123456789" value={form.identificacion} onChange={handleChange('identificacion')} error={!!errors.identificacion} helperText={errors.identificacion} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />
                        </FormControl>

                        <FormControl>
                            <FormLabel htmlFor="telefono" sx={{ fontWeight: 500, mb: 0.5 }}>Número de Teléfono</FormLabel>
                            <StyledTextField id="telefono" required fullWidth placeholder="3001234567" value={form.telefono} onChange={handleChange('telefono')} error={!!errors.telefono} helperText={errors.telefono} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 10 }} />
                        </FormControl>

                        <FormControl error={!!errors.genero}>
                            <FormLabel htmlFor="genero" sx={{ fontWeight: 500, mb: 0.5 }}>Género</FormLabel>
                            <StyledSelect id="genero" value={form.genero} onChange={handleChange('genero')} displayEmpty renderValue={(val) => val || 'Seleccione la respuesta'}>
                                <MenuItem value="Masculino">Masculino</MenuItem>
                                <MenuItem value="Femenino">Femenino</MenuItem>
                            </StyledSelect>
                            {errors.genero && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{errors.genero}</Typography>}
                        </FormControl>

                        <FormControl>
                            <FormLabel htmlFor="password" sx={{ fontWeight: 500, mb: 0.5 }}>Contraseña</FormLabel>
                            <Box sx={{ position: 'relative' }}>
                                <OutlinedInput
                                    id="password" type={showPassword ? 'text' : 'password'} required fullWidth
                                    placeholder="••••••••" value={form.password} onChange={handleChange('password')}
                                    onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)}
                                    error={!!errors.password || (form.password.length > 0 && !allPasswordReqsMet)}
                                    sx={{ borderRadius: '8px', backgroundColor: '#fafafa', '&:hover fieldset': { borderColor: '#aaa' } }}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword((prev) => !prev)} onMouseDown={(e) => e.preventDefault()} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                                <PasswordTooltip password={form.password} visible={passwordFocused && form.password.length > 0} />
                            </Box>
                            {errors.password && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{errors.password}</Typography>}
                        </FormControl>

                        <Button type="submit" fullWidth variant="contained" sx={{ py: 1.4, borderRadius: '8px', fontWeight: 600, fontSize: '15px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', boxShadow: '0px 4px 12px rgba(0,0,0,0.25)', '&:hover': { background: 'linear-gradient(135deg, #16213e, #0f3460)' } }}>
                            Crear cuenta
                        </Button>
                    </Box>

                    <Divider sx={{ color: 'text.secondary', fontSize: '13px' }}>o</Divider>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Button fullWidth variant="outlined" onClick={handleGoogleSignUp} startIcon={<GoogleIcon />}
                            sx={{ py: 1.2, borderRadius: '8px', borderColor: 'rgba(0,0,0,0.15)', color: '#333', fontWeight: 500, '&:hover': { borderColor: 'rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.02)' } }}>
                            Continuar con Google
                        </Button>
                        <Button fullWidth variant="outlined" onClick={handleFacebookSignUp} startIcon={<FacebookIcon />}
                            sx={{ py: 1.2, borderRadius: '8px', borderColor: 'rgba(0,0,0,0.15)', color: '#333', fontWeight: 500, '&:hover': { borderColor: 'rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.02)' } }}>
                            Continuar con Facebook
                        </Button>

                        <Typography sx={{ textAlign: 'center', fontSize: '14px', color: '#555' }}>
                            ¿Ya tienes cuenta?{' '}
                            <RouterLink to="/login" style={{ fontWeight: 600, color: '#1976d2', textDecoration: 'none' }}>Inicia sesión</RouterLink>
                        </Typography>
                    </Box>
                </Card>
            </SignUpContainer>
        </>
    );
}