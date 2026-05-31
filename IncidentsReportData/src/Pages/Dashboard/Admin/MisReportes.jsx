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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query, where, doc, updateDoc } from 'firebase/firestore';
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

export default function MisReportes() {
    const navigate = useNavigate();

    const [userData, setUserData] = React.useState(null);
    const [reportes, setReportes] = React.useState([]);
    const [filtroEstado, setFiltroEstado] = React.useState('Todos');
    const [loading, setLoading] = React.useState(true);

    // Estado para el dialog de cambio de estado
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [reporteSeleccionado, setReporteSeleccionado] = React.useState(null);
    const [nuevoEstado, setNuevoEstado] = React.useState('');
    const [actualizando, setActualizando] = React.useState(false);

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

                const reportesRef = collection(db, 'Incidentes');
                const qReportes = query(reportesRef, orderBy('fechaCreacion', 'desc'));
                const reportesSnap = await getDocs(qReportes);
                setReportes(reportesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const reportesFiltrados = filtroEstado === 'Todos'
        ? reportes
        : reportes.filter((r) => r.estado === filtroEstado);

    const abrirDialogEditar = (reporte) => {
        setReporteSeleccionado(reporte);
        setNuevoEstado(reporte.estado);
        setDialogOpen(true);
    };

    const handleCambiarEstado = async () => {
        if (!reporteSeleccionado || !nuevoEstado) return;
        setActualizando(true);
        try {
            await updateDoc(doc(db, 'Incidentes', reporteSeleccionado.id), {
                estado: nuevoEstado,
            });
            // Actualizar localmente
            setReportes((prev) => prev.map((r) =>
                r.id === reporteSeleccionado.id ? { ...r, estado: nuevoEstado } : r
            ));
            setDialogOpen(false);
        } catch (error) {
            console.error('Error actualizando estado:', error);
        } finally {
            setActualizando(false);
        }
    };

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
                <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>

                    <Typography sx={{ fontSize: '13px', color: '#888', mb: 2 }}>
                        Inicio / <span style={{ color: '#2e7d32', fontWeight: 600 }}>Mis Reportes</span>
                    </Typography>

                    <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0px 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

                        {/* Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 1 }}>
                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#1a1a2e' }}>
                                    Todos los Reportes
                                </Typography>
                                <Typography sx={{ fontSize: '12px', color: '#888' }}>
                                    {reportesFiltrados.length} reporte(s) encontrado(s)
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FilterListIcon sx={{ color: '#888', fontSize: 20 }} />
                                <FormControl size="small">
                                    <Select
                                        value={filtroEstado}
                                        onChange={(e) => setFiltroEstado(e.target.value)}
                                        sx={{ fontSize: '13px', borderRadius: '8px' }}
                                    >
                                        <MenuItem value="Todos">Todos</MenuItem>
                                        <MenuItem value="Reportado">Reportado</MenuItem>
                                        <MenuItem value="En Proceso">En Proceso</MenuItem>
                                        <MenuItem value="Resuelto">Resuelto</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        {/* Tabla */}
                        <TableContainer component={Paper} elevation={0}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ background: '#f9fafb' }}>
                                        {['Tipo', 'Descripción', 'Ubicación', 'Fecha', 'Estado', 'Acciones'].map((col) => (
                                            <TableCell key={col} sx={{ fontWeight: 700, fontSize: '13px', color: '#555', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                                {col}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportesFiltrados.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#888' }}>
                                                No hay reportes con ese filtro.
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
                                                    <TableCell sx={{ fontSize: '13px', color: '#333' }}>{reporte.tipo}</TableCell>
                                                    <TableCell sx={{ fontSize: '13px', color: '#333', maxWidth: 180 }}>
                                                        {reporte.descripcion?.length > 50 ? reporte.descripcion.substring(0, 50) + '...' : reporte.descripcion}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '13px', color: '#333' }}>{reporte.ubicacionTexto}</TableCell>
                                                    <TableCell sx={{ fontSize: '13px', color: '#333' }}>{fecha}</TableCell>
                                                    <TableCell>
                                                        <Chip label={reporte.estado} size="small" sx={{ background: estado.background, color: estado.color, fontWeight: 600, fontSize: '11px' }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                            <Button
                                                                size="small"
                                                                startIcon={<VisibilityIcon />}
                                                                onClick={() => navigate('/reporte/' + reporte.id)}
                                                                sx={{ color: '#2e7d32', fontWeight: 600, fontSize: '11px', textTransform: 'none', '&:hover': { background: 'rgba(46,125,50,0.08)' } }}
                                                            >
                                                                Ver
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                startIcon={<EditIcon />}
                                                                onClick={() => abrirDialogEditar(reporte)}
                                                                sx={{ color: '#1565c0', fontWeight: 600, fontSize: '11px', textTransform: 'none', '&:hover': { background: 'rgba(21,101,192,0.08)' } }}
                                                            >
                                                                Cambiar estado
                                                            </Button>
                                                        </Box>
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

            {/* Dialog cambiar estado */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1, minWidth: 320 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '16px', color: '#1a1a2e' }}>
                    Cambiar Estado del Reporte
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 2 }}>
                        {reporteSeleccionado?.usuarioNombre?.substring(0, 80)}...
                    </Typography>
                    <FormControl fullWidth size="small">
                        <Select
                            value={nuevoEstado}
                            onChange={(e) => setNuevoEstado(e.target.value)}
                            sx={{ borderRadius: '8px' }}
                        >
                            <MenuItem value="Reportado">Reportado</MenuItem>
                            <MenuItem value="En Proceso">En Proceso</MenuItem>
                            <MenuItem value="Resuelto">Resuelto</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: '#888', textTransform: 'none' }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCambiarEstado}
                        disabled={actualizando}
                        variant="contained"
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, background: '#2e7d32', '&:hover': { background: '#1b5e20' } }}
                    >
                        {actualizando ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}