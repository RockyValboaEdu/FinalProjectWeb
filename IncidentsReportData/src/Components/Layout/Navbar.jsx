import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import appFirebase, { db } from '../../FireBase/config';

const logo = "https://firebasestorage.googleapis.com/v0/b/proyecto-web-65b12.firebasestorage.app/o/assets%2FLogouniamazonia.png?alt=media&token=c81e5968-00d6-4e49-9ad7-8379ef731a50";
const auth = getAuth(appFirebase);

export default function Navbar({ userName, rol, onMenuClick }) {
    const navigate = useNavigate();
    const [notificaciones, setNotificaciones] = React.useState([]);
    const [anchorEl, setAnchorEl] = React.useState(null);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, 'Notificaciones'),
                    where('usuarioId', '==', user.uid),
                    where('leida', '==', false)
                );
                const snap = await getDocs(q);
                setNotificaciones(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            } catch (error) {
                console.error('Error cargando notificaciones:', error);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleMarcarTodasLeidas = async () => {
        try {
            await Promise.all(notificaciones.map((n) => updateDoc(doc(db, 'Notificaciones', n.id), { leida: true })));
            setNotificaciones([]);
        } catch (error) {
            console.error('Error marcando notificaciones:', error);
        }
    };

    const handleLogout = async () => {
        try { await signOut(auth); navigate('/login'); }
        catch (error) { console.error('Error al cerrar sesión:', error); }
    };

    const open = Boolean(anchorEl);

    return (
        <AppBar position="fixed" elevation={0} sx={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.08)', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Botón hamburguesa solo en móvil */}
                    <IconButton
                        onClick={onMenuClick}
                        sx={{ display: { xs: 'flex', sm: 'none' }, color: '#555', mr: 0.5 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box component="img" src={logo} alt="Logo" sx={{ height: 40, objectFit: 'contain' }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e', display: { xs: 'none', sm: 'block' }, lineHeight: 1.2 }}>
                        Sistema de Reportes<br />
                        <span style={{ fontWeight: 400, fontSize: '12px', color: '#666' }}>Universidad de la Amazonia</span>
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 } }}>

                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: '#555' }}>
                        <Badge badgeContent={notificaciones.length} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    <Popover
                        open={open} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{ sx: { borderRadius: '12px', minWidth: { xs: 280, sm: 320 }, maxWidth: 360, boxShadow: '0px 8px 30px rgba(0,0,0,0.12)' } }}
                    >
                        <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e' }}>Notificaciones</Typography>
                            {notificaciones.length > 0 && (
                                <Button size="small" onClick={handleMarcarTodasLeidas} sx={{ fontSize: '11px', textTransform: 'none', color: '#2e7d32', fontWeight: 600 }}>
                                    Marcar todas como leídas
                                </Button>
                            )}
                        </Box>
                        <Divider />
                        {notificaciones.length === 0 ? (
                            <Box sx={{ px: 2.5, py: 3, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '13px', color: '#aaa' }}>No tienes notificaciones nuevas</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                                {notificaciones.map((n, i) => (
                                    <Box key={n.id}>
                                        <Box sx={{ px: 2.5, py: 1.5, background: 'rgba(46,125,50,0.04)' }}>
                                            <Typography sx={{ fontSize: '13px', color: '#333', lineHeight: 1.5 }}>{n.mensaje}</Typography>
                                            {n.fechaCreacion?.toDate && (
                                                <Typography sx={{ fontSize: '11px', color: '#aaa', mt: 0.5 }}>
                                                    {n.fechaCreacion.toDate().toLocaleString('es-CO')}
                                                </Typography>
                                            )}
                                        </Box>
                                        {i < notificaciones.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Popover>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #2e7d32, #66bb6a)', fontSize: '14px', fontWeight: 700 }}>
                            {userName ? userName.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.2 }}>{userName || 'Usuario'}</Typography>
                            <Chip
                                label={rol === 'admin' ? 'Administrador' : 'Usuario'} size="small"
                                sx={{ height: '18px', fontSize: '10px', fontWeight: 600, background: rol === 'admin' ? '#c62828' : '#2e7d32', color: '#fff', '& .MuiChip-label': { px: 1 } }}
                            />
                        </Box>
                    </Box>

                    <Box
                        onClick={handleLogout}
                        sx={{
                            display: { xs: 'none', sm: 'flex' }, alignItems: 'center', cursor: 'pointer',
                            px: 1.5, py: 0.8, borderRadius: '8px',
                            border: '1px solid rgba(198,40,40,0.3)',
                            '&:hover': { background: 'rgba(198,40,40,0.06)' }, transition: 'all 0.2s',
                        }}
                    >
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#c62828' }}>Cerrar sesión</Typography>
                    </Box>

                    {/* Cerrar sesión en móvil: solo ícono */}
                    <IconButton onClick={handleLogout} sx={{ display: { xs: 'flex', sm: 'none' }, color: '#c62828' }}>
                        <Avatar sx={{ width: 28, height: 28, background: 'rgba(198,40,40,0.1)', fontSize: '12px', color: '#c62828', fontWeight: 700 }}>
                            ✕
                        </Avatar>
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
}