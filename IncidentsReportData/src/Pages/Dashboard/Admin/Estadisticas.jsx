import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import PrintIcon from '@mui/icons-material/Print';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import appFirebase, { db } from '../../../FireBase/config';
import { useNavigate } from 'react-router-dom';

import Navbar from '../../../Components/Layout/Navbar';
import Sidebar from '../../../Components/Layout/Sidebar';
import Footer from '../../../Components/Layout/Footer';

const auth = getAuth(appFirebase);
const DRAWER_WIDTH = 220;

export default function Estadisticas() {
    const navigate = useNavigate();
    const [userData, setUserData] = React.useState(null);
    const [reportes, setReportes] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) { navigate('/login'); return; }
            try {
                const clientesRef = collection(db, 'ClientManagement');
                const qUser = query(clientesRef, where('uid', '==', user.uid));
                const userSnap = await getDocs(qUser);
                if (!userSnap.empty) {
                    const data = userSnap.docs[0].data();
                    setUserData(data);
                    if (data.rol !== 'admin') { navigate('/dashboard-usuario'); return; }
                }
                const reportesSnap = await getDocs(query(collection(db, 'Incidentes'), orderBy('fechaCreacion', 'desc')));
                setReportes(reportesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const total = reportes.length;
    const reportado = reportes.filter((r) => r.estado === 'Reportado').length;
    const enProceso = reportes.filter((r) => r.estado === 'En Proceso').length;
    const resuelto = reportes.filter((r) => r.estado === 'Resuelto').length;

    // Agrupar por tipo
    const porTipo = reportes.reduce((acc, r) => {
        const tipo = r.tipo || 'Sin tipo';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
    }, {});

    const tiposOrdenados = Object.entries(porTipo).sort((a, b) => b[1] - a[1]);

    const estadoData = [
        { label: 'Reportado', value: reportado, color: '#e65100', bg: 'rgba(230,81,0,0.1)' },
        { label: 'En Proceso', value: enProceso, color: '#1565c0', bg: 'rgba(21,101,192,0.1)' },
        { label: 'Resuelto', value: resuelto, color: '#2e7d32', bg: 'rgba(46,125,50,0.1)' },
    ];

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>Cargando...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
            <Navbar userName={userData ? userData.nombres + ' ' + userData.apellidos : ''} rol="admin" />
            <Sidebar rol="admin" />

            <Box component="main" sx={{ flexGrow: 1, ml: DRAWER_WIDTH + 'px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Toolbar />
                <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }} id="seccion-imprimible">

                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                            <Typography sx={{ fontSize: '13px', color: '#888' }}>
                                Inicio / <span style={{ color: '#2e7d32', fontWeight: 600 }}>Estadísticas</span>
                            </Typography>
                            <Typography sx={{ fontWeight: 700, fontSize: '22px', color: '#1a1a2e', mt: 0.5 }}>
                                Estadísticas del Sistema
                            </Typography>
                        </Box>
                        <Button
                            onClick={handlePrint}
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: '#2e7d32',
                                color: '#2e7d32',
                                '&:hover': { background: 'rgba(46,125,50,0.06)' },
                            }}
                        >
                            Imprimir reporte
                        </Button>
                    </Box>

                    {/* Card total */}
                    <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0px 4px 20px rgba(0,0,0,0.06)', mb: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', border: '5px solid #2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '24px', color: '#2e7d32' }}>{total}</Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#1a1a2e' }}>
                                Total de Incidentes Registrados
                            </Typography>
                            <Typography sx={{ fontSize: '13px', color: '#888', mt: 0.5 }}>
                                Desde el inicio del sistema
                            </Typography>
                        </Box>
                    </Card>

                    {/* Grid: por estado + por tipo */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>

                        {/* Por estado */}
                        <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0px 4px 20px rgba(0,0,0,0.06)' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e', mb: 2 }}>
                                Incidentes por Estado
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {estadoData.map((item) => (
                                    <Box key={item.label}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip label={item.label} size="small" sx={{ background: item.bg, color: item.color, fontWeight: 600, fontSize: '11px' }} />
                                            </Box>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: item.color }}>
                                                {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                                            </Typography>
                                        </Box>
                                        <Box sx={{ height: 10, borderRadius: '5px', background: '#f0f0f0', overflow: 'hidden' }}>
                                            <Box sx={{ height: '100%', width: total > 0 ? (item.value / total) * 100 + '%' : '0%', background: item.color, borderRadius: '5px', transition: 'width 0.6s ease' }} />
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Card>

                        {/* Por tipo */}
                        <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0px 4px 20px rgba(0,0,0,0.06)' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e', mb: 2 }}>
                                Incidentes por Tipo
                            </Typography>
                            {tiposOrdenados.length === 0 ? (
                                <Typography sx={{ fontSize: '13px', color: '#aaa', textAlign: 'center', mt: 2 }}>Sin datos aún</Typography>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {tiposOrdenados.map(([tipo, cantidad]) => (
                                        <Box key={tipo}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>{tipo}</Typography>
                                                <Typography sx={{ fontSize: '13px', color: '#888' }}>
                                                    {cantidad} ({total > 0 ? Math.round((cantidad / total) * 100) : 0}%)
                                                </Typography>
                                            </Box>
                                            <Box sx={{ height: 10, borderRadius: '5px', background: '#f0f0f0', overflow: 'hidden' }}>
                                                <Box sx={{ height: '100%', width: total > 0 ? (cantidad / total) * 100 + '%' : '0%', background: 'linear-gradient(135deg, #2e7d32, #66bb6a)', borderRadius: '5px', transition: 'width 0.6s ease' }} />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Card>
                    </Box>
                </Box>
                <Footer />
            </Box>
        </Box>
    );
}