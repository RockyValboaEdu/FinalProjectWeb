import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonIcon from '@mui/icons-material/Person';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 220;

const menuUsuario = [
    { label: 'Inicio', icon: <HomeIcon />, path: '/dashboard-usuario' },
    { label: 'Nuevo Reporte', icon: <AddCircleIcon />, path: '/nuevo-reporte' },
    { label: 'Perfil', icon: <PersonIcon />, path: '/perfil' },
];

const menuAdmin = [
    { label: 'Inicio', icon: <HomeIcon />, path: '/dashboard-admin' },
    { label: 'Mis Reportes', icon: <ListAltIcon />, path: '/reportes' },
    { label: 'Estadísticas', icon: <BarChartIcon />, path: '/estadisticas' },
    { label: 'Perfil', icon: <PersonIcon />, path: '/perfil' },
];

export default function Sidebar({ rol }) {
    const navigate = useNavigate();
    const location = useLocation();
    const menu = rol === 'admin' ? menuAdmin : menuUsuario;

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    borderRight: '1px solid rgba(0,0,0,0.08)',
                },
            }}
        >
            <Toolbar /> {/* Espaciado para que no quede debajo del Navbar */}
            <Box sx={{ overflow: 'auto', mt: 1 }}>
                <List>
                    {menu.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem key={item.label} disablePadding sx={{ px: 1, mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        borderRadius: '10px',
                                        background: isActive ? 'rgba(46,125,50,0.1)' : 'transparent',
                                        color: isActive ? '#2e7d32' : '#444',
                                        '&:hover': {
                                            background: 'rgba(46,125,50,0.07)',
                                            color: '#2e7d32',
                                        },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        color: isActive ? '#2e7d32' : '#777',
                                        minWidth: '36px',
                                    }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            fontSize: '14px',
                                            fontWeight: isActive ? 700 : 500,
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        </Drawer>
    );
}