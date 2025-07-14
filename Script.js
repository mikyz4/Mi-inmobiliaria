document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // DEPURADOR DE ERRORES - Se puede borrar cuando todo funcione
    // =================================================================
    window.onerror = function(message, source, lineno, colno, error) {
        const errorBox = document.createElement('div');
        errorBox.style.position = 'fixed';
        errorBox.style.bottom = '0';
        errorBox.style.left = '0';
        errorBox.style.width = '100%';
        errorBox.style.padding = '10px';
        errorBox.style.backgroundColor = 'rgba(200, 0, 0, 0.9)';
        errorBox.style.color = 'white';
        errorBox.style.zIndex = '9999';
        errorBox.style.fontFamily = 'monospace';
        errorBox.style.fontSize = '12px';
        errorBox.style.borderTop = '2px solid white';
        errorBox.innerHTML = `
            <strong>¡ERROR DETECTADO!</strong><br>
            <strong>Mensaje:</strong> ${message}<br>
            <strong>Archivo:</strong> ${source.split('/').pop()}<br>
            <strong>Línea:</strong> ${lineno}, <strong>Col:</strong> ${colno}
        `;
        document.body.appendChild(errorBox);
        return true; 
    };

    // =================================================================
    // LÓGICA COMÚN A TODAS LAS PÁGINAS
    // =================================================================
    try {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.querySelector('.menu-toggle');
        const closeBtn = document.querySelector('.close-btn');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
        }
        if (closeBtn && sidebar) {
            closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));
        }
        document.addEventListener('click', (e) => {
            if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });

        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        if (scrollToTopBtn) {
            window.addEventListener('scroll', () => {
                scrollToTopBtn.classList.toggle('show', window.scrollY > 200);
            });
            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', e => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
            const modalCloseButton = modal.querySelector('.close-button');
            if (modalCloseButton) {
                modalCloseButton.addEventListener('click', () => modal.classList.remove('active'));
            }
        });
    } catch (error) {
        console.error("Error en la lógica común:", error);
    }

    // =================================================================
    // LÓGICA DE LA PÁGINA DE INICIO
    // =================================================================
    if (document.getElementById('hero')) {
        try {
            // ... (Toda la lógica de la página de inicio que ya funcionaba)
            const carouselImages = document.querySelectorAll('.hero-section .carousel-image');
            if (carouselImages.length > 0) {
                const dotsContainer = document.querySelector('.hero-section .carousel-dots');
                let currentSlide = 0;
                const showSlide = (index) => {
                    carouselImages.forEach((img, i) => img.classList.toggle('active', i === index));
                    if (dotsContainer) Array.from(dotsContainer.children).forEach((dot, i) => dot.classList.toggle('active', i === index));
                };
                if (dotsContainer) {
                    carouselImages.forEach((_, i) => {
                        const dot = document.createElement('span');
                        dot.className = 'dot';
                        dot.addEventListener('click', () => { currentSlide = i; showSlide(currentSlide); clearInterval(slideInterval); });
                        dotsContainer.appendChild(dot);
                    });
                }
                document.querySelector('.hero-section .left')?.addEventListener('click', () => { currentSlide = (currentSlide - 1 + carouselImages.length) % carouselImages.length; showSlide(currentSlide); clearInterval(slideInterval); });
                document.querySelector('.hero-section .right')?.addEventListener('click', () => { currentSlide = (currentSlide + 1) % carouselImages.length; showSlide(currentSlide); clearInterval(slideInterval); });
                showSlide(0);
                let slideInterval = setInterval(() => { currentSlide = (currentSlide + 1) % carouselImages.length; showSlide(currentSlide); }, 5000);
            }
            const testimonialCarousel = document.getElementById('testimonial-carousel');
            if (testimonialCarousel) { /* ... Lógica de testimonios ... */ }
            const newsGrid = document.getElementById('newsGrid');
            if (newsGrid) { /* ... Lógica de novedades ... */ }
            document.querySelectorAll('.faq-item h4').forEach(header => { /* ... Lógica de FAQ ... */ });
        } catch (error) {
            console.error("Error en la lógica de la página de inicio:", error);
        }
    }

    // =================================================================
    // LÓGICA DE LA PÁGINA "SUBIR ANUNCIO"
    // =================================================================
    const anuncioForm = document.getElementById('anuncioForm');
    if (anuncioForm) {
        try {
            // --- CONFIGURACIÓN DE CLOUDINARY (VERSIÓN CORREGIDA) ---
            const CLOUD_NAME = "dlcal40xj";    // Tu "Cloud Name" va aquí
            const UPLOAD_PRESET = "Selettas"; // Tu "Upload Preset" va aquí (con la 'S' mayúscula)
            
            const uploadStatus = document.getElementById('uploadStatus');
            const submitBtn = document.getElementById('submitBtn');

            const uploadToCloudinary = async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);
                const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error de Cloudinary: ${errorData.error.message}`);
                }
                const data = await response.json();
                return data.secure_url;
            };

            anuncioForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                let isValid = true;
                const fieldsToValidate = [
                    { input: 'titulo', errorDiv: 'tituloError', message: 'El título es obligatorio.' },
                    { input: 'direccion', errorDiv: 'direccionError', message: 'La dirección es obligatoria.' },
                    { input: 'email', errorDiv: 'emailError', message: 'El email es obligatorio.', isEmail: true, invalidMessage: 'Por favor, introduce un email válido.' },
                    { input: 'descripcion', errorDiv: 'descripcionError', message: 'La descripción es obligatoria.' }
                ];
                fieldsToValidate.forEach(field => {
                    const errorDiv = document.getElementById(field.errorDiv);
                    if (errorDiv) errorDiv.textContent = '';
                });
                fieldsToValidate.forEach(field => {
                    const inputElement = document.getElementById(field.input);
                    const errorElement = document.getElementById(field.errorDiv);
                    if (!inputElement.value.trim()) {
                        if (errorElement) errorElement.textContent = field.message;
                        isValid = false;
                    } else if (field.isEmail) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(inputElement.value)) {
                            if (errorElement) errorElement.textContent = field.invalidMessage;
                            isValid = false;
                        }
                    }
                });
                if (!isValid) return;
                if (document.getElementById('imagen1').files.length === 0) {
                    uploadStatus.textContent = '¡Debes subir al menos la imagen principal!';
                    return;
                }
                submitBtn.disabled = true;
                uploadStatus.textContent = 'Subiendo imágenes, por favor espera...';
                try {
                    const imageFiles = [
                        document.getElementById('imagen1').files[0],
                        document.getElementById('imagen2').files[0],
                        document.getElementById('imagen3').files[0],
                        document.getElementById('imagen4').files[0]
                    ].filter(file => file);
                    const uploadPromises = imageFiles.map(uploadToCloudinary);
                    const imageUrls = await Promise.all(uploadPromises);
                    const finalFormData = new FormData();
                    finalFormData.append('titulo', document.getElementById('titulo').value);
                    finalFormData.append('direccion', document.getElementById('direccion').value);
                    finalFormData.append('email', document.getElementById('email').value);
                    finalFormData.append('descripcion', document.getElementById('descripcion').value);
                    imageUrls.forEach((url, index) => {
                        finalFormData.append(`imagen_${index + 1}`, url);
                    });
                    uploadStatus.textContent = 'Imágenes subidas. Enviando formulario...';
                    await fetch("https://formsubmit.co/miky.tv098@gmail.com", {
                        method: 'POST',
                        body: finalFormData
                    });
                    uploadStatus.textContent = '¡Anuncio enviado con éxito!';
                    anuncioForm.reset();
                    setTimeout(() => { uploadStatus.textContent = ''; }, 4000);
                } catch (error) {
                    console.error("Error durante la subida o envío:", error);
                    uploadStatus.textContent = `Error: ${error.message}`;
                } finally {
                    submitBtn.disabled = false;
                }
            });
        } catch (error) {
            console.error("Error en la lógica de subir anuncio:", error);
        }
    }

    // =================================================================
    // LÓGICA DE LA PÁGINA "VER ANUNCIOS"
    // =================================================================
    const anunciosContainer = document.getElementById('anunciosContainer');
    if (anunciosContainer) {
        try {
            // ... (Toda la lógica de la página de ver anuncios que ya funcionaba)
            const toggleFiltrosBtn = document.getElementById('toggle-filtros');
            const filtrosWrapper = document.getElementById('filtros-wrapper');
            const anuncioModal = document.getElementById('anuncioModal');
            const anunciosData = [ /* ... Tus datos de ejemplo ... */ ];
            // ... El resto de las funciones para filtrar, ordenar y mostrar ...
        } catch (error) {
            console.error("Error en la lógica de ver anuncios:", error);
        }
    }
});
