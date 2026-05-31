import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Toolbar from '@mui/material/Toolbar';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import appFirebase, { db } from '../../FireBase/config';

import Navbar from '../../Components/Layout/Navbar';
import Sidebar from '../../Components/Layout/Sidebar';
import Footer from '../../Components/Layout/Footer';

const auth = getAuth(appFirebase);
const DRAWER_WIDTH = 220;

const estadoConfig = {
    'Reportado': { color: '#e65100', background: 'rgba(230,81,0,0.1)' },
    'En Proceso': { color: '#1565c0', background: 'rgba(21,101,192,0.1)' },
    'Resuelto': { color: '#2e7d32', background: 'rgba(46,125,50,0.1)' },
};

export default function DashboardUsuario() {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [userData, setUserData] = React.useState(null);
    const [reportes, setReportes] = React.useState([]);
    const [filtroEstado, setFiltroEstado] = React.useState('Todos');
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
                    if (data.rol === 'admin') { navigate('/dashboard-admin'); return; }
                }
                const reportesRef = collection(db, 'Incidentes');
                const qReportes = query(reportesRef, where('usuarioId', '==', user.uid));
                const reportesSnap = await getDocs(qReportes);
                const lista = reportesSnap.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => {
                        const fechaA = a.fechaCreacion?.toDate?.() || new Date(0);
                        const fechaB = b.fechaCreacion?.toDate?.() || new Date(0);
                        return fechaB - fechaA;
                    });
                setReportes(lista);
            } catch (error) {
                console.error('Error cargando datos:', error);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const reportesFiltrados = filtroEstado === 'Todos'
        ? reportes : reportes.filter((r) => r.estado === filtroEstado);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>Cargando...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa', overflow: 'hidden' }}>
            <Navbar
                userName={userData ? `${userData.nombres} ${userData.apellidos}` : ''}
                rol="usuario"
                onMenuClick={() => setMobileOpen(true)}
            />
            <Sidebar rol="usuario" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <Box component="main" sx={{
                flexGrow: 1,
                ml: { xs: 0, sm: `${DRAWER_WIDTH}px` },
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                maxWidth: { xs: '100vw', sm: `calc(100vw - ${DRAWER_WIDTH}px)` },
                overflowX: 'hidden',
            }}>
                <Toolbar />
                <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, overflowX: 'hidden', width: '100%', boxSizing: 'border-box' }}>

                    <Typography sx={{ fontSize: '13px', color: '#888', mb: 2 }}>
                        Inicio / <span style={{ color: '#2e7d32', fontWeight: 600 }}>Panel de Usuario</span>
                    </Typography>

                    <Card
                        onClick={() => navigate('/nuevo-reporte')}
                        sx={{
                            mb: 3, p: 0, borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
                            border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0px 4px 20px rgba(0,0,0,0.06)',
                            '&:hover': { boxShadow: '0px 8px 30px rgba(46,125,50,0.15)' }, transition: 'all 0.3s',
                        }}
                    >
                        <Box sx={{
                            background: 'linear-gradient(135deg, #2e7d32, #66bb6a)',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            py: { xs: 4, sm: 5 }, gap: 1, px: 2,
                        }}>
                            <Box sx={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                <AddCircleIcon sx={{ color: '#fff', fontSize: 32 }} />
                            </Box>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '14px', sm: '18px' }, letterSpacing: 1, textAlign: 'center', wordBreak: 'break-word' }}>
                                REPORTAR NUEVO INCIDENTE
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', textAlign: 'center' }}>
                                Haz clic aquí para registrar un incidente
                            </Typography>
                        </Box>
                    </Card>

                    <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0px 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#1a1a2e' }}>Mis Reportes Recientes</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FilterListIcon sx={{ color: '#888', fontSize: 20 }} />
                                <FormControl size="small">
                                    <Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                                        sx={{ fontSize: '13px', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.15)' } }}>
                                        <MenuItem value="Todos">Todos</MenuItem>
                                        <MenuItem value="Reportado">Reportado</MenuItem>
                                        <MenuItem value="En Proceso">En Proceso</MenuItem>
                                        <MenuItem value="Resuelto">Resuelto</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', width: '100%' }}>
                            <Table sx={{ minWidth: 420 }}>
                                <TableHead>
                                    <TableRow sx={{ background: '#f9fafb' }}>
                                        {['Tipo', 'Descripción', 'Ubicación', 'Fecha', 'Estado', 'Ver'].map((col) => (
                                            <TableCell key={col} sx={{ fontWeight: 700, fontSize: '12px', color: '#555', borderBottom: '1px solid rgba(0,0,0,0.06)', whiteSpace: 'nowrap' }}>
                                                {col}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportesFiltrados.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#888' }}>
                                                No tienes reportes aún. ¡Crea tu primer reporte!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reportesFiltrados.map((reporte) => {
                                            const estado = estadoConfig[reporte.estado] || estadoConfig['Reportado'];
                                            const fecha = reporte.fechaCreacion?.toDate
                                                ? reporte.fechaCreacion.toDate().toLocaleString('es-CO')
                                                : 'Sin fecha';
                                            return (
                                                <TableRow key={reporte.id} sx={{ '&:hover': { background: '#f9fafb' }, transition: 'background 0.2s' }}>
                                                    <TableCell sx={{ fontSize: '12px', color: '#333', whiteSpace: 'nowrap' }}>{reporte.tipo}</TableCell>
                                                    <TableCell sx={{ fontSize: '12px', color: '#333', maxWidth: 120 }}>
                                                        {reporte.descripcion?.length > 30 ? reporte.descripcion.substring(0, 30) + '...' : reporte.descripcion}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '12px', color: '#333', whiteSpace: 'nowrap' }}>{reporte.ubicacionTexto}</TableCell>
                                                    <TableCell sx={{ fontSize: '11px', color: '#333', whiteSpace: 'nowrap' }}>{fecha}</TableCell>
                                                    <TableCell>
                                                        <Chip label={reporte.estado} size="small" sx={{ background: estado.background, color: estado.color, fontWeight: 600, fontSize: '10px' }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button size="small" startIcon={<VisibilityIcon />}
                                                            onClick={() => navigate(`/reporte/${reporte.id}`)}
                                                            sx={{ color: '#2e7d32', fontWeight: 600, fontSize: '11px', textTransform: 'none', whiteSpace: 'nowrap', '&:hover': { background: 'rgba(46,125,50,0.08)' } }}>
                                                            Ver
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Box>
                <Footer />
            </Box>
        </Box>
    );
}