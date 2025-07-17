document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA COMÚN (MENÚ, BOTONES FLOTANTES, MODALES) ---
    // ... (esta parte no cambia) ...

    // --- LÓGICA DE LA PÁGINA DE INICIO ---
    // ... (esta parte no cambia) ...
    
    // --- LÓGICA PARA VER ANUNCIOS Y FILTROS ---
    // ... (esta parte no cambia) ...

    // --- LÓGICA PARA ENVIAR EL FORMULARIO DE NUEVO ANUNCIO (MODIFICADO) ---
    const anuncioForm = document.getElementById('anuncioForm');
    if (anuncioForm) {
        anuncioForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const submitButton = anuncioForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;

            const formData = new FormData(anuncioForm);
            
            // AHORA RECOGEMOS LOS DATOS DE LOS NUEVOS CAMPOS
            const nuevoAnuncio = {
                titulo: formData.get('titulo'),
                direccion: formData.get('direccion'),
                email: formData.get('email'),
                descripcion: formData.get('descripcion'),
                precio: parseInt(formData.get('precio')), // Convertimos a número
                habitaciones: parseInt(formData.get('habitaciones')), // Convertimos a número
                banos: parseInt(formData.get('banos')), // Convertimos a número
                superficie: parseInt(formData.get('superficie')), // Convertimos a número
                imagen: 'https://via.placeholder.com/400x250.png?text=Anuncio+Nuevo'
            };

            const apiUrl = 'https://b3e75e34-bbdc-4f97-a34f-56b934e026a7-00-1ivwxos54f12f.kirk.replit.dev/api/anuncios';

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoAnuncio),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al enviar el anuncio');
                }
                return response.json();
            })
            .then(data => {
                console.log('Anuncio enviado con éxito:', data);
                window.location.href = 'Gracias.html';
            })
            .catch((error) => {
                console.error('Error al enviar el anuncio:', error);
                alert('Hubo un error al enviar tu anuncio. Por favor, inténtalo de nuevo.');
                submitButton.textContent = 'Enviar Anuncio';
                submitButton.disabled = false;
            });
        });
    }
});
