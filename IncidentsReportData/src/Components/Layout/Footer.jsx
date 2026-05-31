import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                py: 2,
                px: 3,
                mt: 'auto',
                borderTop: '1px solid rgba(0,0,0,0.08)',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
            }}
        >
            <Typography sx={{ fontSize: '12px', color: '#888' }}>
                © {new Date().getFullYear()} Universidad de la Amazonia — Sistema de Reportes
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#888' }}>
                Todos los derechos reservados
            </Typography>
        </Box>
    );
}