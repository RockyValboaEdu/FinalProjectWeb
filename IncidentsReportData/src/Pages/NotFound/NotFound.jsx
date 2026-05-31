import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

const error404img = "https://firebasestorage.googleapis.com/v0/b/proyecto-web-65b12.firebasestorage.app/o/assets%2Ferror404.png?alt=media&token=2f5751cc-9f53-4a4f-bd13-569b46728cd8";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <>
            <CssBaseline />
            <Box sx={{
                minHeight: '100vh',
                background: 'radial-gradient(ellipse at 50% 40%, hsl(210, 100%, 95%), hsl(210, 60%, 88%) 60%, hsl(210, 40%, 80%))',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 3,
                position: 'relative',
                overflow: 'hidden',
            }}>

                {/* Imagen del robot */}
                <Box
                    component="img"
                    src={error404img}
                    alt="Error 404"
                    sx={{
                        width: { xs: '260px', sm: '320px', md: '380px' },
                        objectFit: 'contain',
                        mb: 2,
                        filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.15))',
                    }}
                />

                {/* Título */}
                <Typography
                    sx={{
                        fontWeight: 800,
                        fontSize: { xs: '36px', sm: '48px', md: '64px' },
                        color: '#1a1a2e',
                        lineHeight: 1,
                        mb: 1,
                    }}
                >
                    Página no encontrada
                </Typography>

                {/* Subtítulo */}
                <Typography
                    sx={{
                        fontSize: { xs: '14px', sm: '16px' },
                        color: '#555',
                        maxWidth: '420px',
                        mb: 4,
                        lineHeight: 1.6,
                    }}
                >
                    Parece que esta página no existe o fue movida.
                </Typography>

                {/* Botones */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button
                        onClick={() => navigate(-1)}
                        variant="outlined"
                        sx={{
                            px: 3, py: 1.2,
                            borderRadius: '50px',
                            fontWeight: 600,
                            fontSize: '14px',
                            borderColor: 'rgba(0,0,0,0.2)',
                            color: '#444',
                            '&:hover': {
                                borderColor: '#2e7d32',
                                color: '#2e7d32',
                                background: 'rgba(46,125,50,0.05)',
                            },
                        }}
                    >
                        Volver atrás
                    </Button>
                    <Button
                        onClick={() => navigate('/')}
                        variant="contained"
                        startIcon={<HomeIcon />}
                        sx={{
                            px: 3, py: 1.2,
                            borderRadius: '50px',
                            fontWeight: 600,
                            fontSize: '14px',
                            background: 'linear-gradient(135deg, #2e7d32, #66bb6a)',
                            boxShadow: '0px 4px 12px rgba(46,125,50,0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1b5e20, #43a047)',
                                boxShadow: '0px 6px 16px rgba(46,125,50,0.4)',
                            },
                        }}
                    >
                        Ir al inicio
                    </Button>
                </Box>

                <Typography sx={{
                    position: 'absolute',
                    fontSize: { xs: '120px', sm: '200px', md: '280px' },
                    fontWeight: 900,
                    color: 'rgba(46,125,50,0.04)',
                    userSelect: 'none',
                    zIndex: 0,
                    lineHeight: 1,
                    bottom: '-20px',
                    pointerEvents: 'none',
                }}>
                    404
                </Typography>

            </Box>
        </>
    );
}