import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Toolbar from '@mui/material/Toolbar';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import WcIcon from '@mui/icons-material/Wc';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import appFirebase, { db } from '../../../FireBase/config';
import { useNavigate } from 'react-router-dom';

import Navbar from '../../../Components/Layout/Navbar';
import Sidebar from '../../../Components/Layout/Sidebar';
import Footer from '../../../Components/Layout/Footer';

const auth = getAuth(appFirebase);
const DRAWER_WIDTH = 220;

function CampoInfo({ icon, label, value }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
            <Box sx={{ color: '#2e7d32', flexShrink: 0 }}>{icon}</Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '11px', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: '15px', color: '#1a1a2e', fontWeight: 500, wordBreak: 'break-word' }}>
                    {value || '—'}
                </Typography>
            </Box>
        </Box>
    );
}

export default function Perfil() {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [userData, setUserData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) { navigate('/login'); return; }
            try {
                const clientesRef = collection(db, 'ClientManagement');
                const qUser = query(clientesRef, where('uid', '==', user.uid));
                const userSnap = await getDocs(qUser);
                if (!userSnap.empty) setUserData(userSnap.docs[0].data());
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>Cargando...</Typography>
            </Box>
        );
    }

    const iniciales = userData
        ? userData.nombres.charAt(0).toUpperCase() + userData.apellidos.charAt(0).toUpperCase()
        : 'U';

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa', overflow: 'hidden' }}>
            <Navbar userName={userData ? userData.nombres + ' ' + userData.apellidos : ''} rol={userData?.rol || 'usuario'} onMenuClick={() => setMobileOpen(true)} />
            <Sidebar rol={userData?.rol || 'usuario'} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <Box component="main" sx={{
                flexGrow: 1,
                ml: { xs: 0, sm: `${DRAWER_WIDTH}px` },
                display: 'flex', flexDirection: 'column', minHeight: '100vh',
                maxWidth: { xs: '100vw', sm: `calc(100vw - ${DRAWER_WIDTH}px)` },
                overflowX: 'hidden',
            }}>
                <Toolbar />
                <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, width: '100%', boxSizing: 'border-box' }}>

                    <Typography sx={{ fontSize: '13px', color: '#888', mb: 2 }}>
                        Inicio / <span style={{ color: '#2e7d32', fontWeight: 600 }}>Perfil</span>
                    </Typography>

                    <Card sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0px 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <Box sx={{ background: 'linear-gradient(135deg, #2e7d32, #66bb6a)', p: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 80, height: 80, fontSize: '28px', fontWeight: 700, background: 'rgba(255,255,255,0.25)', border: '3px solid rgba(255,255,255,0.6)' }}>
                                {iniciales}
                            </Avatar>
                            <Typography sx={{ fontWeight: 700, fontSize: { xs: '17px', sm: '20px' }, color: '#fff', textAlign: 'center' }}>
                                {userData?.nombres} {userData?.apellidos}
                            </Typography>
                            <Chip
                                label={userData?.rol === 'admin' ? 'Administrador' : 'Usuario'}
                                sx={{ background: userData?.rol === 'admin' ? '#c62828' : 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: '12px' }}
                            />
                        </Box>

                        <Box sx={{ p: { xs: 2, sm: 3 } }}>
                            <CampoInfo icon={<PersonIcon />} label="Nombres" value={userData?.nombres} />
                            <Divider />
                            <CampoInfo icon={<PersonIcon />} label="Apellidos" value={userData?.apellidos} />
                            <Divider />
                            <CampoInfo icon={<EmailIcon />} label="Correo Electrónico" value={userData?.email} />
                            <Divider />
                            <CampoInfo icon={<BadgeIcon />} label="Número de Identificación" value={userData?.identificacion} />
                            <Divider />
                            <CampoInfo icon={<PhoneIcon />} label="Teléfono" value={userData?.telefono} />
                            <Divider />
                            <CampoInfo icon={<WcIcon />} label="Género" value={userData?.genero} />
                        </Box>
                    </Card>
                </Box>
                <Footer />
            </Box>
        </Box>
    );
}