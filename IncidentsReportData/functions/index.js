const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp();

exports.notificarCambioEstado = onDocumentUpdated('Incidentes/{incidenteId}', async (event) => {
    const antes = event.data.before.data();
    const despues = event.data.after.data();

    // Solo actuar si cambió el estado
    if (antes.estado === despues.estado) return null;

    const db = getFirestore();

    await db.collection('Notificaciones').add({
        usuarioId: despues.usuarioId,
        mensaje: `Tu reporte de tipo "${despues.tipo}" en ${despues.ubicacionTexto} cambió a estado: ${despues.estado}.`,
        leida: false,
        fechaCreacion: FieldValue.serverTimestamp(),
    });

    return null;
});