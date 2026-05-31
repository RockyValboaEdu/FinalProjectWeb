import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import Footer from '../../Components/Layout/Footer';
import { Link as RouterLink } from 'react-router-dom';

const ReportIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);
const CameraIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
);
const LocationIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);

// import del logo institucional
const logo = "https://firebasestorage.googleapis.com/v0/b/proyecto-web-65b12.firebasestorage.app/o/assets%2FLogouniamazonia.png?alt=media&token=c81e5968-00d6-4e49-9ad7-8379ef731a50";

// estilos Personalizados con Styled
const HomeContainer = styled(Box)(() => ({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fafafa',
}));

const HeroSection = styled(Box)(() => ({
    padding: '80px 0 60px 0',
    background: 'radial-gradient(ellipse at 50% 30%, #f4fbf7, #e8f5e9 60%, #c8e6c9 100%)', // color verde institucional
    borderBottom: '1px solid rgba(46, 125, 50, 0.08)',
}));

const FeatureCard = styled(MuiCard)(() => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0px 4px 12px rgba(0,0,0,0.02)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0px 12px 24px rgba(0,0,0,0.06)',
    }
}));

const SiriTitle = styled(Box)(() => ({
    textAlign: 'center',
    marginBottom: '0px',
    '& .title-sistema': {
        fontSize: '31px',
        fontWeight: 800,
        color: '#000000',
        letterSpacing: '0.1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    '& .title-siri': {
        fontSize: '31px',
        fontWeight: 800,
        color: '#c62828',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
}));


export default function Home() {
    return (
        <HomeContainer>
            <CssBaseline />

            {/* NAV BAR SUPERIOR */}
            <AppBar position="sticky" color="default" elevation={1} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ justifyContent: 'between', height: '80px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                            <Box
                                component="img"
                                src={logo}
                                alt="Logo Universidad de la Amazonia"
                                sx={{ height: 54, objectFit: 'contain' }}
                            />

                        </Box>

                        <Stack direction="row" spacing={2}>
                            <Button
                                component={RouterLink}
                                to="/login"
                                variant="text"
                                sx={{ color: '#1b5e20', fontWeight: 600, textTransform: 'none' }}
                            >
                                Iniciar Sesión
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/signup"
                                variant="contained"
                                sx={{
                                    backgroundColor: '#2e7d32',
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    '&:hover': { backgroundColor: '#1b5e20' }
                                }}
                            >
                                Registrarse
                            </Button>
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* SECCIÓN DE INTRODUCCIÓN */}
            <HeroSection>
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Stack spacing={3}>
                                <SiriTitle>
                                    <span className="title-sistema">SISTEMA DE REPORTES <br /></span>
                                    <span className="title-siri">SIRI-UA</span>
                                </SiriTitle>

                                <Typography variant="h2" component="h1" sx={{ fontWeight: 800, fontSize: { xs: '32px', sm: '46px' }, color: '#1a1a2e', lineHeight: 1.2 }}>
                                    Reporta incidentes en tu campus <br />
                                    <span style={{ color: '#2e7d32' }}>Construyamos una mejor universidad.</span>
                                </Typography>

                                <Typography variant="body1" sx={{ color: '#555555', fontSize: '16px', lineHeight: 1.6, maxWidth: '580px' }}>
                                    La plataforma oficial diseñada para que estudiantes, docentes y personal administrativo informen de manera ágil fallas de infraestructura, daños eléctricos, problemas de fontanería o riesgos de seguridad dentro de las instalaciones de la <strong>Universidad de la Amazonia</strong>.
                                </Typography>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
                                    <Button
                                        component={RouterLink}
                                        to="/login"
                                        variant="contained"
                                        sx={{
                                            py: 1.5,
                                            px: 4,
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            backgroundColor: '#1a1a2e',
                                            textTransform: 'none',
                                            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                                            '&:hover': { backgroundColor: '#16213e' }
                                        }}
                                    >
                                        Crear Reporte Ahora
                                    </Button>
                                    <Button
                                        component={RouterLink}
                                        to="/signup"
                                        variant="outlined"
                                        sx={{
                                            py: 1.5,
                                            px: 4,
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            borderColor: '#ccc',
                                            color: '#333',
                                            textTransform: 'none',
                                            '&:hover': { borderColor: '#999', backgroundColor: 'rgba(0,0,0,0.02)' }
                                        }}
                                    >
                                        Registrar Cuenta
                                    </Button>
                                </Stack>
                            </Stack>
                        </Grid>

                        {/* Pre-visualización ilustrativa usando puros componentes de MUI */}
                    </Grid>
                </Container>
            </HeroSection>

            {/* SECCIÓN DE INFORMACIÓN ADICIONAL / REQUISITOS */}
            <Box sx={{ py: 8, backgroundColor: '#ffffff', flexGrow: 1 }}>
                <Container maxWidth="lg">

                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
                            Requisitos para Generar un Reporte
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '15px' }}>
                            Asegúrate de cumplir con los siguientes pasos al registrar una novedad en la plataforma.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {/* Requisito 1 */}
                        <Grid item xs={12} sm={4}>
                            <FeatureCard>
                                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ width: 44, height: 44, borderRadius: '8px', bgcolor: '#e8f5e9', color: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ReportIcon />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px', color: '#1a1a2e' }}>
                                        1. Detallar el Incidente
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.5 }}>
                                        Especifica la categoría del daño (baños, electricidad, infraestructura o seguridad) junto a una descripción clara de la situación.
                                    </Typography>
                                </CardContent>
                            </FeatureCard>
                        </Grid>

                        {/* Requisito 2 */}
                        <Grid item xs={12} sm={4}>
                            <FeatureCard>
                                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ width: 44, height: 44, borderRadius: '8px', bgcolor: '#ffebee', color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CameraIcon />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px', color: '#1a1a2e' }}>
                                        2. Evidencia Obligatoria
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.5 }}>
                                        Es mandatorio adjuntar una fotografía real del incidente, la cual se almacenará de manera segura en el servidor de la aplicación.
                                    </Typography>
                                </CardContent>
                            </FeatureCard>
                        </Grid>

                        {/* Requisito 3 */}
                        <Grid item xs={12} sm={4}>
                            <FeatureCard>
                                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ width: 44, height: 44, borderRadius: '8px', bgcolor: '#e8f5e9', color: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <LocationIcon />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px', color: '#1a1a2e' }}>
                                        3. Ubicación Exacta
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.5 }}>
                                        Selecciona manualmente el aula o bloque del suceso o, de ser posible, activa el GPS del dispositivo para una geolocalización exacta.
                                    </Typography>
                                </CardContent>
                            </FeatureCard>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            <Footer />
        </HomeContainer>
    );
}