import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Toolbar from '@mui/material/Toolbar';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import appFirebase, { db, storage } from '../../../FireBase/config';

import Navbar from '../../../Components/Layout/Navbar';
import Sidebar from '../../../Components/Layout/Sidebar';
import Footer from '../../../Components/Layout/Footer';

const auth = getAuth(appFirebase);
const DRAWER_WIDTH = 220;

const StyledTextField = styled(TextField)(() => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        backgroundColor: '#fafafa',
        '&:hover fieldset': { borderColor: '#aaa' },
    },
}));

const StyledSelect = styled(Select)(() => ({
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#aaa' },
}));

const TIPOS_INCIDENTE = [
    'Baño',
    'Electricidad',
    'Infraestructura',
    'Seguridad',
    'Plomería',
    'Otro',
];

const UBICACIONES = [
    'Bloque 1',
    'Bloque 2',
    'Bloque 3',
    'Bloque 4',
    'Bloque 5',
    'Bloque 6',
    'Bloque 7',
    'Biblioteca',
    'Cafetería',
    'Parqueadero',
    'Cancha Deportiva',
    'Laboratorio',
    'Sala de Sistemas',
    'Otro',
];

export default function NuevoReporte() {
    const navigate = useNavigate();

    const [userData, setUserData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [enviando, setEnviando] = React.useState(false);

    const [form, setForm] = React.useState({
        tipo: '',
        descripcion: '',
        ubicacionTexto: '',
    });
    const [errors, setErrors] = React.useState({});
    const [imagen, setImagen] = React.useState(null);
    const [previstaImagen, setPrevistaImagen] = React.useState(null);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) { navigate('/login'); return; }
            try {
                const clientesRef = collection(db, 'ClientManagement');
                const qUser = query(clientesRef, where('uid', '==', user.uid));
                const userSnap = await getDocs(qUser);
                if (!userSnap.empty) {
                    setUserData(userSnap.docs[0].data());
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar que sea imagen
        if (!file.type.startsWith('image/')) {
            setErrors((prev) => ({ ...prev, imagen: 'El archivo debe ser una imagen.' }));
            return;
        }

        // Validar tamaño máximo 5MB
        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, imagen: 'La imagen no debe superar 5MB.' }));
            return;
        }

        setImagen(file);
        setErrors((prev) => ({ ...prev, imagen: '' }));

        // Previsualización
        const reader = new FileReader();
        reader.onloadend = () => setPrevistaImagen(reader.result);
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const newErrors = {};
        if (!form.tipo) newErrors.tipo = 'Selecciona el tipo de incidente.';
        if (!form.descripcion.trim() || form.descripcion.length < 10)
            newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres.';
        if (!form.ubicacionTexto) newErrors.ubicacionTexto = 'Selecciona la ubicación.';
        if (!imagen) newErrors.imagen = 'La fotografía es obligatoria.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setEnviando(true);
        try {
            const user = auth.currentUser;

            // 1. Subir imagen a Firebase Storage
            const nombreArchivo = 'incidentes/' + user.uid + '_' + Date.now() + '_' + imagen.name;
            const storageRef = ref(storage, nombreArchivo);
            await uploadBytes(storageRef, imagen);
            const imagenURL = await getDownloadURL(storageRef);

            // 2. Guardar en Firestore
            await addDoc(collection(db, 'Incidentes'), {
                usuarioId: user.uid,
                usuarioNombre: userData ? userData.nombres + ' ' + userData.apellidos : '',
                tipo: form.tipo,
                descripcion: form.descripcion,
                ubicacionTexto: form.ubicacionTexto,
                imagenURL: imagenURL,
                fechaCreacion: serverTimestamp(),
                estado: 'Reportado',
            });

            alert('¡Reporte enviado exitosamente!');

            // 3. Redirigir según rol
            if (userData?.rol === 'admin') {
                navigate('/dashboard-admin');
            } else {
                navigate('/dashboard-usuario');
            }

        } catch (error) {
            console.error('Error al enviar reporte:', error);
            alert('Ocurrió un error al enviar el reporte. Intenta de nuevo.');
        } finally {
            setEnviando(false);
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
            <Navbar
                userName={userData ? userData.nombres + ' ' + userData.apellidos : ''}
                rol={userData?.rol || 'usuario'}
            />
            <Sidebar rol={userData?.rol || 'usuario'} />

            <Box component="main" sx={{ flexGrow: 1, ml: DRAWER_WIDTH + 'px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Toolbar />
                <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, maxWidth: 680 }}>

                    {/* Breadcrumb */}
                    <Typography sx={{ fontSize: '13px', color: '#888', mb: 2 }}>
                        Inicio / <span style={{ color: '#2e7d32', fontWeight: 600 }}>Nuevo Reporte</span>
                    </Typography>

                    <Typography sx={{ fontWeight: 700, fontSize: '22px', color: '#1a1a2e', mb: 3 }}>
                        Reportar Nuevo Incidente
                    </Typography>

                    <Card sx={{
                        borderRadius: '16px',
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0px 4px 20px rgba(0,0,0,0.06)',
                        p: 3,
                    }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                            {/* Tipo */}
                            <FormControl error={!!errors.tipo}>
                                <FormLabel sx={{ fontWeight: 500, mb: 0.5, color: '#333' }}>
                                    Tipo de Incidente *
                                </FormLabel>
                                <StyledSelect
                                    value={form.tipo}
                                    onChange={handleChange('tipo')}
                                    displayEmpty
                                    renderValue={(val) => val || 'Seleccione el tipo'}
                                >
                                    {TIPOS_INCIDENTE.map((tipo) => (
                                        <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                                    ))}
                                </StyledSelect>
                                {errors.tipo && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                        {errors.tipo}
                                    </Typography>
                                )}
                            </FormControl>

                            {/* Descripción */}
                            <FormControl>
                                <FormLabel sx={{ fontWeight: 500, mb: 0.5, color: '#333' }}>
                                    Descripción Detallada *
                                </FormLabel>
                                <StyledTextField
                                    multiline
                                    rows={4}
                                    placeholder="Describe detalladamente el incidente ocurrido..."
                                    value={form.descripcion}
                                    onChange={handleChange('descripcion')}
                                    error={!!errors.descripcion}
                                    helperText={errors.descripcion}
                                    inputProps={{ maxLength: 500 }}
                                />
                                <Typography sx={{ fontSize: '11px', color: '#aaa', textAlign: 'right', mt: 0.5 }}>
                                    {form.descripcion.length}/500
                                </Typography>
                            </FormControl>

                            {/* Ubicación */}
                            <FormControl error={!!errors.ubicacionTexto}>
                                <FormLabel sx={{ fontWeight: 500, mb: 0.5, color: '#333' }}>
                                    Ubicación *
                                </FormLabel>
                                <StyledSelect
                                    value={form.ubicacionTexto}
                                    onChange={handleChange('ubicacionTexto')}
                                    displayEmpty
                                    renderValue={(val) => val || 'Seleccione la ubicación'}
                                >
                                    {UBICACIONES.map((ub) => (
                                        <MenuItem key={ub} value={ub}>{ub}</MenuItem>
                                    ))}
                                </StyledSelect>
                                {errors.ubicacionTexto && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                        {errors.ubicacionTexto}
                                    </Typography>
                                )}
                            </FormControl>

                            {/* Fotografía */}
                            <FormControl>
                                <FormLabel sx={{ fontWeight: 500, mb: 0.5, color: '#333' }}>
                                    Fotografía del Incidente *
                                </FormLabel>

                                {/* Zona de carga */}
                                <Box
                                    component="label"
                                    htmlFor="input-imagen"
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1,
                                        p: 3,
                                        borderRadius: '12px',
                                        border: errors.imagen
                                            ? '2px dashed #d32f2f'
                                            : '2px dashed rgba(46,125,50,0.4)',
                                        background: previstaImagen
                                            ? 'transparent'
                                            : 'rgba(46,125,50,0.03)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': { background: 'rgba(46,125,50,0.06)', borderColor: '#2e7d32' },
                                        overflow: 'hidden',
                                        minHeight: 140,
                                    }}
                                >
                                    {previstaImagen ? (
                                        <Box
                                            component="img"
                                            src={previstaImagen}
                                            alt="Vista previa"
                                            sx={{ maxHeight: 200, maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <>
                                            <CloudUploadIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#2e7d32' }}>
                                                Haz clic para subir una foto
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', color: '#aaa' }}>
                                                PNG, JPG o JPEG — Máximo 5MB
                                            </Typography>
                                        </>
                                    )}
                                    <input
                                        id="input-imagen"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleImagenChange}
                                    />
                                </Box>

                                {imagen && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                        <ImageIcon sx={{ color: '#2e7d32', fontSize: 16 }} />
                                        <Typography sx={{ fontSize: '12px', color: '#2e7d32' }}>
                                            {imagen.name}
                                        </Typography>
                                        <Button
                                            size="small"
                                            onClick={() => { setImagen(null); setPrevistaImagen(null); }}
                                            sx={{ color: '#c62828', fontSize: '11px', textTransform: 'none', ml: 'auto' }}
                                        >
                                            Eliminar
                                        </Button>
                                    </Box>
                                )}

                                {errors.imagen && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                        {errors.imagen}
                                    </Typography>
                                )}
                            </FormControl>

                            {/* Fecha automática */}
                            <Box sx={{ p: 2, borderRadius: '8px', background: 'rgba(46,125,50,0.05)', border: '1px solid rgba(46,125,50,0.15)' }}>
                                <Typography sx={{ fontSize: '12px', color: '#2e7d32', fontWeight: 600 }}>
                                    Fecha y hora de registro
                                </Typography>
                                <Typography sx={{ fontSize: '13px', color: '#555', mt: 0.3 }}>
                                    {new Date().toLocaleString('es-CO')} — Se registrará automáticamente
                                </Typography>
                            </Box>

                            {/* Botones */}
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => navigate(-1)}
                                    sx={{
                                        py: 1.4,
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        borderColor: 'rgba(0,0,0,0.2)',
                                        color: '#555',
                                        '&:hover': { borderColor: '#c62828', color: '#c62828' },
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={enviando}
                                    startIcon={enviando ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                                    sx={{
                                        py: 1.4,
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        textTransform: 'none',
                                        background: 'linear-gradient(135deg, #2e7d32, #66bb6a)',
                                        boxShadow: '0px 4px 12px rgba(46,125,50,0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #1b5e20, #43a047)',
                                            boxShadow: '0px 6px 16px rgba(46,125,50,0.4)',
                                        },
                                    }}
                                >
                                    {enviando ? 'Enviando...' : 'Enviar Reporte'}
                                </Button>
                            </Box>

                        </Box>
                    </Card>
                </Box>
                <Footer />
            </Box>
        </Box>
    );
}