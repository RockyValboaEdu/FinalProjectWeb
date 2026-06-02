const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onCall } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fetch = require('node-fetch');

initializeApp();

const anthropicKey = defineSecret("ANTHROPIC_API_KEY");

exports.notificarCambioEstado = onDocumentUpdated('Incidentes/{incidenteId}', async (event) => {
    const antes = event.data.before.data();
    const despues = event.data.after.data();

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

exports.analizarImagen = onCall({ secrets: [anthropicKey] }, async (request) => {
    const { base64, mediaType } = request.data;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey.value(),
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
                role: "user",
                content: [
                    {
                        type: "image",
                        source: { type: "base64", media_type: mediaType, data: base64 }
                    },
                    {
                        type: "text",
                        text: `Eres un asistente del sistema de reportes de incidentes universitarios.
Analiza esta imagen e identifica el problema que muestra.
Responde SOLO en formato JSON sin markdown, así:
{
  "tipo": "uno de: Baño, Electricidad, Infraestructura, Seguridad, Otro",
  "descripcion": "descripción detallada del problema en español",
  "ubicacionSugerida": "si puedes identificar el lugar, sino deja vacío"
}`
                    }
                ]
            }]
        })
    });

    const data = await response.json();
    const text = data.content[0].text;
    return JSON.parse(text);
});