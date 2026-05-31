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
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query, where, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
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

export default function DashboardAdmin() {
  const navigate = useNavigate();

  const [userData, setUserData] = React.useState(null);
  const [reportes, setReportes] = React.useState([]);
  const [filtroEstado, setFiltroEstado] = React.useState('Todos');
  const [loading, setLoading] = React.useState(true);

  // Dialog cambiar estado
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
        setReportes(reportesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const totalIncidentes = reportes.length;
  const reportado = reportes.filter((r) => r.estado === 'Reportado').length;
  const enProceso = reportes.filter((r) => r.estado === 'En Proceso').length;
  const resuelto = reportes.filter((r) => r.estado === 'Resuelto').length;

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
        await updateDoc(doc(db, 'Incidentes', reporteSeleccionado.id), { estado: nuevoEstado });

        // Crear notificación para el usuario que reportó
        await addDoc(collection(db, 'Notificaciones'), {
            usuarioId: reporteSeleccionado.usuarioId,
            mensaje: `Tu reporte de tipo "${reporteSeleccionado.tipo}" en ${reporteSeleccionado.ubicacionTexto} cambió a estado: ${nuevoEstado}.`,
            leida: false,
            fechaCreacion: serverTimestamp(),
        });

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
            Inicio / <span style={{ color: '#2e7d32', fontWeight: 600 }}>Dashboard</span>
          </Typography>

          {/* Fila superior */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>

            {/* Estadísticas */}
            <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0px 4px 20px rgba(0,0,0,0.06)' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e', mb: 2 }}>Estadísticas</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid #2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#2e7d32' }}>{totalIncidentes}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '13px', color: '#888' }}>Incidentes Totales</Typography>
                  <Typography sx={{ fontSize: '12px', color: '#aaa', mt: 0.5 }}>
                    Reportado: {reportado} · En Proceso: {enProceso} · Resuelto: {resuelto}
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* Botón Reportar */}
            <Card
              onClick={() => navigate('/nuevo-reporte')}
              sx={{ borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0px 4px 20px rgba(0,0,0,0.06)', '&:hover': { boxShadow: '0px 8px 30px rgba(46,125,50,0.2)' }, transition: 'all 0.3s' }}
            >
              <Box sx={{ background: 'linear-gradient(135deg, #2e7d32, #66bb6a)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 120, gap: 1 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AddCircleIcon sx={{ color: '#fff', fontSize: 26 }} />
                </Box>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '14px', letterSpacing: 0.5, textAlign: 'center' }}>
                  REPORTAR NUEVO INCIDENTE
                </Typography>
              </Box>
            </Card>

            {/* Estados */}
            <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0px 4px 20px rgba(0,0,0,0.06)' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e', mb: 2 }}>Estados de Reportes</Typography>
              {totalIncidentes === 0 ? (
                <Typography sx={{ fontSize: '13px', color: '#aaa', textAlign: 'center', mt: 2 }}>Sin datos aún</Typography>
              ) : (
                <Box>
                  {[
                    { label: 'Reportado', value: reportado, color: '#e65100' },
                    { label: 'En Proceso', value: enProceso, color: '#1565c0' },
                    { label: 'Resuelto', value: resuelto, color: '#2e7d32' },
                  ].map(({ label, value, color }) => (
                    <Box key={label} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '12px', color, fontWeight: 600 }}>{label}</Typography>
                        <Typography sx={{ fontSize: '12px', color: '#888' }}>
                          {value} ({Math.round((value / totalIncidentes) * 100)}%)
                        </Typography>
                      </Box>
                      <Box sx={{ height: 8, borderRadius: '4px', background: '#f0f0f0', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: (value / totalIncidentes) * 100 + '%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          </Box>

          {/* Tabla */}
          <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0px 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#1a1a2e' }}>Todos los Reportes Recientes</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon sx={{ color: '#888', fontSize: 20 }} />
                <FormControl size="small">
                  <Select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    sx={{ fontSize: '13px', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.15)' } }}
                  >
                    <MenuItem value="Todos">Todos</MenuItem>
                    <MenuItem value="Reportado">Reportado</MenuItem>
                    <MenuItem value="En Proceso">En Proceso</MenuItem>
                    <MenuItem value="Resuelto">Resuelto</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

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
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#888' }}>No hay reportes aún.</TableCell>
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
                                Ver detalle
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