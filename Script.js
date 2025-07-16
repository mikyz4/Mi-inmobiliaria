document.addEventListener('DOMContentLoaded', () => {

    // Lógica Común (Menú, Modales, ScrollTop)
    try {
        const sidebar = document.querySelector('.sidebar');
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

    // Lógica de la Página de Inicio (index.html)
    if (document.getElementById('hero')) {
        try {
            // Carrusel Hero
            const carouselImages = document.querySelectorAll('.hero-section .carousel-image');
            if (carouselImages.length > 0) {
                const dotsContainer = document.querySelector('.hero-section .carousel-dots');
                let currentSlide = 0;

                const showSlide = (index) => {
                    carouselImages.forEach((img, i) => img.classList.toggle('active', i === index));
                    if (dotsContainer) {
                        Array.from(dotsContainer.children).forEach((dot, i) => dot.classList.toggle('active', i === index));
                    }
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
            
            // Carrusel Testimonios
            const testimonialCarousel = document.getElementById('testimonial-carousel');
            if (testimonialCarousel) {
                const testimonials = [
                    { name: 'Ana y Carlos', quote: 'El proceso fue transparente y muy profesional. Encontramos la casa de nuestros sueños gracias a Selettas.' },
                    { name: 'Laura G.', quote: 'Como primera compradora, tenía muchas dudas. El equipo me guió en cada paso. ¡Totalmente recomendados!' },
                    { name: 'Inversiones Roca S.L.', quote: 'Su análisis de mercado es impecable. Nos ayudaron a realizar una inversión muy rentable en Gerona.' }
                ];
                testimonialCarousel.innerHTML = testimonials.map(t => `<div class="testimonial-card"><p>"${t.quote}"</p><h4>- ${t.name}</h4></div>`).join('');
            }

            // Novedades y Modal
            const newsGrid = document.getElementById('newsGrid');
            const newsModal = document.getElementById('newsModal');
            if (newsGrid && newsModal) {
                const newsArticles = [
                    { id: 1, title: 'Tendencias del Mercado', image: 'Images/Noticia1.jpg', excerpt: 'Descubre qué zonas están en auge.', content: 'El mercado inmobiliario de Gerona muestra un dinamismo particular en el último trimestre, con un creciente interés en propiedades en las afueras de la ciudad.' },
                    { id: 2, title: 'Consejos para Vender', image: 'Images/Noticia2.jpg', excerpt: 'Pequeños cambios que hacen una gran diferencia.', content: 'Vender una propiedad rápidamente y al mejor precio requiere estrategia. Pequeñas reformas como pintar con colores neutros y el home staging pueden aumentar el valor percibido.' },
                    { id: 3, title: 'Guía para Compradores', image: 'Images/Noticia3.jpg', excerpt: 'Todo lo que necesitas saber antes de comprar.', content: 'Comprar tu primera vivienda es un gran paso. Es fundamental tener claro tu presupuesto, incluyendo los gastos de notaría e impuestos (aproximadamente un 10-12% adicional).' }
                ];
                newsGrid.innerHTML = newsArticles.map(article => `<div class="news-card" data-id="${article.id}"><img src="${article.image}" alt="${article.title}"><div class="news-card-content"><h3>${article.title}</h3><p>${article.excerpt}</p></div></div>`).join('');
                newsGrid.addEventListener('click', e => {
                    const card = e.target.closest('.news-card');
                    if (!card) return;
                    const article = newsArticles.find(a => a.id == card.dataset.id);
                    if (article) {
                        newsModal.querySelector('#newsModalTitle').textContent = article.title;
                        newsModal.querySelector('#newsModalImage').src = article.image;
                        newsModal.querySelector('#newsModalContent').textContent = article.content;
                        newsModal.classList.add('active');
                    }
                });
            }
        } catch (error) {
            console.error("Error en la lógica de la página de inicio:", error);
        }
    }

    // Lógica del Formulario para Subir Anuncio (anuncio.html)
    const anuncioForm = document.getElementById('anuncioForm');
    if (anuncioForm) {
        try {
            const CLOUD_NAME = "djcal40xx";
            const UPLOAD_PRESET = "Selettas";
            
            const uploadStatus = document.getElementById('uploadStatus');
            const submitBtn = document.getElementById('submitBtn');

            const uploadToCloudinary = async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);
                const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
                if (!response.ok) throw new Error(`Error de Cloudinary: ${response.statusText}`);
                const data = await response.json();
                return data.secure_url;
            };

            anuncioForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                // (Validación de campos omitida por simplicidad, se puede añadir después)
                submitBtn.disabled = true;
                uploadStatus.textContent = 'Subiendo imágenes, por favor espera...';
                try {
                    const imageFiles = [
                        document.getElementById('imagen1').files[0],
                        document.getElementById('imagen2').files[0],
                        document.getElementById('imagen3').files[0],
                        document.getElementById('imagen4').files[0]
                    ].filter(file => file);

                    if(imageFiles.length === 0) {
                         uploadStatus.textContent = '¡Debes subir al menos la imagen principal!';
                         submitBtn.disabled = false;
                         return;
                    }

                    const imageUrls = await Promise.all(imageFiles.map(uploadToCloudinary));
                    
                    const finalFormData = new FormData(anuncioForm);
                    imageUrls.forEach((url, index) => {
                        finalFormData.append(`imagen_${index + 1}_url`, url);
                    });
                     // Limpiar campos de file para que no se envíen
                    finalFormData.delete('imagen1');
                    finalFormData.delete('imagen2');
                    finalFormData.delete('imagen3');
                    finalFormData.delete('imagen4');

                    uploadStatus.textContent = 'Imágenes subidas. Enviando formulario...';
                    await fetch("https://formsubmit.co/miky.tv098@gmail.com", { method: 'POST', body: finalFormData });
                    
                    uploadStatus.textContent = '¡Anuncio enviado con éxito!';
                    anuncioForm.reset();
                    setTimeout(() => { uploadStatus.textContent = ''; }, 4000);
                } catch (error) {
                    console.error("Error durante la subida o envío:", error);
                    uploadStatus.textContent = 'Hubo un error. Por favor, inténtalo de nuevo.';
                } finally {
                    submitBtn.disabled = false;
                }
            });
        } catch (error) {
            console.error("Error en la lógica de subir anuncio:", error);
        }
    }

    // Lógica de la Página de Ver Anuncios (ver-anuncios.html)
    const anunciosContainer = document.getElementById('anunciosContainer');
    if (anunciosContainer) {
        try {
            const toggleFiltrosBtn = document.getElementById('toggle-filtros');
            const filtrosWrapper = document.getElementById('filtros-wrapper');
            const anuncioModal = document.getElementById('anuncioModal');
            const anunciosData = [
                { id: 1, titulo: 'Piso céntrico con vistas al río', tipo: 'Piso', ubicacion: 'Calle Mayor 12, Gerona', precio: 250000, habitaciones: 3, banos: 2, superficie: 90, descripcion: 'Espectacular piso reformado con materiales de alta calidad...', contacto: 'contacto@selettas.com', imagenes: ['Images/Anuncio1-1.jpg', 'Images/Anuncio1-2.jpg', 'Images/Carrusel1.jpg'] },
                { id: 2, titulo: 'Casa unifamiliar con amplio jardín', tipo: 'Casa', ubicacion: 'Urbanización El Sol, Quart', precio: 450000, habitaciones: 4, banos: 3, superficie: 180, descripcion: 'Magnífica casa unifamiliar en una zona residencial tranquila...', contacto: 'contacto@selettas.com', imagenes: ['Images/Anuncio2-1.jpg', 'Images/Anuncio2-2.jpg', 'Images/Carrusel-2.jpg'] },
                { id: 3, titulo: 'Terreno rústico con vistas', tipo: 'Terreno', ubicacion: 'Carretera a Vilablareix', precio: 85000, habitaciones: 0, banos: 0, superficie: 1200, descripcion: 'Gran terreno rústico en una ubicación privilegiada...', contacto: 'contacto@selettas.com', imagenes: ['Images/Anuncio3-1.jpg', 'Images/Anuncio3-2.jpg'] },
                { id: 4, titulo: 'Ático de lujo con vistas 360', tipo: 'Ático', ubicacion: 'Passeig de la Devesa 2', precio: 750000, habitaciones: 3, banos: 3, superficie: 150, descripcion: 'Exclusivo ático en el corazón de Gerona...', contacto: 'contacto@selettas.com', imagenes: ['Images/Anuncio4-1.jpg', 'Images/Carrusel-3.png']}
            ];
            
            toggleFiltrosBtn?.addEventListener('click', () => {
                filtrosWrapper.classList.toggle('open');
                toggleFiltrosBtn.innerHTML = filtrosWrapper.classList.contains('open') ? '<i class="fas fa-times"></i> Ocultar Filtros' : '<i class="fas fa-filter"></i> Mostrar Filtros';
            });

            const mostrarAnuncios = (anuncios) => {
                anunciosContainer.innerHTML = '';
                if (anuncios.length === 0) {
                    anunciosContainer.innerHTML = '<p>No se han encontrado anuncios que coincidan con tu búsqueda.</p>';
                    return;
                }
                anuncios.forEach(anuncio => {
                    const card = document.createElement('div');
                    card.className = 'anuncio-card';
                    card.innerHTML = `<img src="${anuncio.imagenes[0]}" alt="${anuncio.titulo}"><div class="anuncio-card-content"><h3>${anuncio.titulo}</h3><p class="anuncio-card-price">${anuncio.precio.toLocaleString('es-ES')} €</p><p>${anuncio.habitaciones} hab | ${anuncio.banos} baños | ${anuncio.superficie} m²</p></div>`;
                    card.addEventListener('click', () => {
                         if(!anuncioModal) return;
                        // Rellenar y mostrar modal... (código existente)
                        anuncioModal.classList.add('active');
                    });
                    anunciosContainer.appendChild(card);
                });
            };
            
            const aplicarFiltrosYOrdenar = () => {
                let anunciosFiltrados = [...anunciosData]; // Copiar para no modificar el original
                // Lógica de filtros... (código existente)
                mostrarAnuncios(anunciosFiltrados);
            };

            document.querySelectorAll('#filtros-wrapper select, #filtros-wrapper input').forEach(filtro => filtro.addEventListener('change', aplicarFiltrosYOrdenar));
            document.getElementById('reset-filtros')?.addEventListener('click', () => {
                document.querySelector('#filtros-wrapper').querySelectorAll('select, input').forEach(el => el.tagName === 'SELECT' ? el.selectedIndex = 0 : el.value = '');
                aplicarFiltrosYOrdenar();
            });
            
            aplicarFiltrosYOrdenar(); // Carga inicial
        } catch (error) {
            console.error("Error en la lógica de ver anuncios:", error);
        }
    }
    
    /* ======================= LÓGICA DEL BANNER DE COOKIES ======================= */
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies-btn');

    if (cookieBanner && acceptBtn) {
        if (!localStorage.getItem('cookiesAccepted')) {
            cookieBanner.classList.remove('hidden');
        }

        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieBanner.classList.add('hidden');
        });
    }
});
