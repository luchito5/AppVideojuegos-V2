const formulario = document.getElementById('form-recomendacion');
const boton = formulario.querySelector('button[type="submit"]');
const mensaje = document.getElementById('mensaje');

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = 'mensaje-' + tipo;
}

formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    const portadaInput = document.getElementById('portada-file');
    const archivo = portadaInput.files[0];

    if (!archivo) {
        mostrarMensaje('Seleccioná una imagen de portada', 'error');
        return;
    }

    boton.disabled = true;

    try {
        const nombreArchivo = Date.now() + '_' + archivo.name.replace(/\s+/g, '_');
        const { error: uploadError } = await supabase.storage
            .from('portadas')
            .upload(nombreArchivo, archivo);

        if (uploadError) {
            mostrarMensaje('No se pudo subir la imagen: ' + uploadError.message, 'error');
            return;
        }

        const { data: urlData } = supabase.storage
            .from('portadas')
            .getPublicUrl(nombreArchivo);

        const datos = {
            titulo: document.getElementById('titulo').value.trim(),
            genero: document.getElementById('genero').value,
            puntuacion: Number(document.getElementById('puntuacion').value),
            url_portada: urlData.publicUrl,
            resenia: document.getElementById('resenia').value.trim(),
            plataforma: document.getElementById('plataforma').value,
            anio: document.getElementById('anio').value || null,
            terminado: document.getElementById('terminado').checked,
        };

        const { error } = await supabase.from('AppVideojuegos').insert([datos]);

        if (error) {
            mostrarMensaje('No se pudo guardar la recomendación: ' + error.message, 'error');
        } else {
            mostrarMensaje('Recomendación guardada correctamente', 'ok');
            formulario.reset();
        }
    } catch (e) {
        mostrarMensaje('No se pudo guardar la recomendación: ' + e.message, 'error');
    } finally {
        boton.disabled = false;
    }
});
