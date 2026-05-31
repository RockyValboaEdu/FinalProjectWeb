import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import appFirebase, { db } from '../../../FireBase/config';

import Navbar from '../../../Components/Layout/Navbar';
import Sidebar from '../../../Components/Layout/Sidebar';
import Footer from '../../../Components/Layout/Footer';

const auth = getAuth(appFirebase);
const DRAWER_WIDTH = 220;

const estadoConfig = {
    'Reportado': { color: '#e65100', background: 'rgba(230,81,0,0.1)' },
    'En Proceso': { color: '#1565c0', background: 'rgba(21,101,192,0.1)' },
    'Resuelto': { color: '#2e7d32', background: 'rgba(46,125,50,0.1)' },
};

function InfoRow({ icon, label, value }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 2 }}>
            <Box sx={{
                width: 36, height: 36, borderRadius: '8px',
                background: 'rgba(46,125,50,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                {React.cloneElement(icon, { sx: { color: '#2e7d32', fontSize: 18 } })}
            </Box>
            <Box>
                <Typography sx={{ fontSize: '11px', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#333', mt: 0.3 }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

export default function DetalleReporte() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [userData, setUserData] = React.useState(null);
    const [reporte, setReporte] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) { navigate('/login'); return; }
            try {
                // Cargar reporte por ID
                const reporteDoc = await getDoc(doc(db, 'Incidentes', id));
                if (!reporteDoc.exists()) {
                    navigate('/reportes');
                    return;
                }
                setReporte({ id: reporteDoc.id, ...reporteDoc.data() });

                // Cargar datos del usuario logueado (para el Navbar)
                const { collection, getDocs, query, where } = await import('firebase/firestore');
                const qUser = query(collection(db, 'ClientManagement'), where('uid', '==', user.uid));
                const userSnap = await getDocs(qUser);
                if (!userSnap.empty) setUserData(userSnap.docs[0].data());

            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [id, navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>Cargando...</Typography>
            </Box>
        );
    }

    if (!reporte) return null;

    const estado = estadoConfig[reporte.estado] || estadoConfig['Reportado'];
    const fecha = reporte.fechaCreacion?.toDate
        ? reporte.fechaCreacion.toDate().toLocaleString('es-CO')
        : 'Sin fecha';

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
            <Navbar
                userName={userData ? userData.nombres + ' ' + userData.apellidos : ''}
                rol={userData?.rol || 'admin'}
            />
            <Sidebar rol={userData?.rol || 'admin'} />

            <Box component="main" sx={{ flexGrow: 1, ml: DRAWER_WIDTH + 'px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Toolbar />
                <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, maxWidth: 750 }}>

                    {/* Breadcrumb */}
                    <Typography sx={{ fontSize: '13px', color: '#888', mb: 2 }}>
                        Inicio / Reportes / <span style={{ color: '#2e7d32', fontWeight: 600 }}>Detalle</span>
                    </Typography>

                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate(-1)}
                                sx={{ color: '#555', textTransform: 'none', fontWeight: 600, '&:hover': { background: 'rgba(0,0,0,0.05)' } }}
                            >
                                Volver
                            </Button>
                            <Typography sx={{ fontWeight: 700, fontSize: '20px', color: '#1a1a2e' }}>
                                Detalle del Reporte
                            </Typography>
                        </Box>
                        <Chip
                            label={reporte.estado}
                            sx={{ background: estado.background, color: estado.color, fontWeight: 700, fontSize: '12px' }}
                        />
                    </Box>

                    {/* Card info */}
                    <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0px 4px 20px rgba(0,0,0,0.06)', p: 3, mb: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e', mb: 1 }}>
                            Información del Incidente
                        </Typography>
                        <Divider sx={{ mb: 1 }} />

                        <InfoRow icon={<CategoryIcon />} label="Tipo de incidente" value={reporte.tipo} />
                        <Divider />
                        <InfoRow icon={<LocationOnIcon />} label="Ubicación" value={reporte.ubicacionTexto} />
                        <Divider />
                        <InfoRow icon={<PersonIcon />} label="Reportado por" value={reporte.usuarioNombre || 'Desconocido'} />
                        <Divider />
                        <InfoRow icon={<CalendarTodayIcon />} label="Fecha de registro" value={fecha} />
                        <Divider />
                        <InfoRow icon={<DescriptionIcon />} label="Descripción" value={reporte.descripcion} />
                    </Card>

                    {/* Card foto */}
                    {reporte.imagenURL && (
                        <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0px 4px 20px rgba(0,0,0,0.06)', p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <ImageIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                                <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e' }}>
                                    Fotografía del Incidente
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Box
                                component="img"
                                src={reporte.imagenURL}
                                alt="Foto del incidente"
                                sx={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: '12px', background: '#f9fafb' }}
                            />
                        </Card>
                    )}

                </Box>
                <Footer />
            </Box>
        </Box>
    );
}