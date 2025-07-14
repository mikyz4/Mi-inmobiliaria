document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // MÓDULO 1: LÓGICA COMÚN (MENÚS, MODALES, SCROLL)
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
    // MÓDULO 2: LÓGICA DE LA PÁGINA DE INICIO
    // =================================================================
    if (document.getElementById('hero')) {
        try {
            // Lógica del Carrusel Principal
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
            
            // Lógica de Testimonios
            const testimonialCarousel = document.getElementById('testimonial-carousel');
            if (testimonialCarousel) {
                const testimonials = [
                    { name: 'Ana y Carlos', quote: 'El proceso fue transparente y muy profesional. Encontramos la casa de nuestros sueños gracias a Selettas.' },
                    { name: 'Laura G.', quote: 'Como primera compradora, tenía muchas dudas. El equipo me guió en cada paso. ¡Totalmente recomendados!' },
                    { name: 'Inversiones Roca S.L.', quote: 'Su análisis de mercado es impecable. Nos ayudaron a realizar una inversión muy rentable en Gerona.' }
                ];
                testimonialCarousel.innerHTML = testimonials.map(t => `<div class="testimonial-card"><p>"${t.quote}"</p><h4>- ${t.name}</h4></div>`).join('');
            }

            // Lógica de Novedades y su Modal
            const newsGrid = document.getElementById('newsGrid');
            const newsModal = document.getElementById('newsModal');
            if (newsGrid && newsModal) {
                const newsArticles = [
                    { id: 1, title: 'Tendencias del Mercado', image: 'Images/Noticia1.jpg', excerpt: 'Descubre qué zonas están en auge.', content: 'El mercado inmobiliario de Gerona muestra un dinamismo particular en el último trimestre, con un creciente interés en propiedades en las afueras de la ciudad, buscando mayor espacio y zonas verdes. Los precios en estas áreas han visto un incremento moderado, consolidándose como una excelente oportunidad de inversión a largo plazo.' },
                    { id: 2, title: 'Consejos para Vender', image: 'Images/Noticia2.jpg', excerpt: 'Pequeños cambios que hacen una gran diferencia.', content: 'Vender una propiedad rápidamente y al mejor precio requiere estrategia. Pequeñas reformas como pintar con colores neutros, mejorar la iluminación y despejar los espacios (home staging) pueden aumentar el valor percibido de tu vivienda hasta en un 15%. No subestimes el poder de unas buenas fotografías profesionales.' },
                    { id: 3, title: 'Guía para Compradores Primerizos', image: 'Images/Noticia3.jpg', excerpt: 'Todo lo que necesitas saber antes de comprar.', content: 'Comprar tu primera vivienda es un gran paso. Es fundamental tener claro tu presupuesto, incluyendo los gastos de notaría e impuestos (aproximadamente un 10-12% adicional al precio de venta). Te recomendamos obtener una pre-aprobación hipotecaria para saber con certeza tu capacidad de compra y poder negociar con confianza.' }
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

            // Lógica de Preguntas Frecuentes (FAQ)
            document.querySelectorAll('.faq-item h4').forEach(header => {
                header.addEventListener('click', () => {
                    const activeItem = document.querySelector('.faq-item.active');
                    if(activeItem && activeItem !== header.parentElement) {
                        activeItem.classList.remove('active');
                    }
                    header.parentElement.classList.toggle('active');
                });
            });
        } catch (error) {
            console.error("Error en la lógica de la página de inicio:", error);
        }
    }

    // =================================================================
    // MÓDULO 3: LÓGICA DE LA PÁGINA "SUBIR ANUNCIO"
    // =================================================================
    const anuncioForm = document.getElementById('anuncioForm');
    if (anuncioForm) {
        try {
            // --- CONFIGURACIÓN DE CLOUDINARY (VERSIÓN CORREGIDA) ---
            const CLOUD_NAME = "dlcal40xj";    // Tu "Cloud Name"
            const UPLOAD_PRESET = "Selettas"; // Tu "Upload Preset" con la 'S' mayúscula
            
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
    // MÓDULO 4: LÓGICA DE LA PÁGINA "VER ANUNCIOS"
    // =================================================================
    const anunciosContainer = document.getElementById('anunciosContainer');
    if (anunciosContainer) {
        try {
            const toggleFiltrosBtn = document.getElementById('toggle-filtros');
            const filtrosWrapper = document.getElementById('filtros-wrapper');
            const anuncioModal = document.getElementById('anuncioModal');
            const anunciosData = [
                { id: 1, titulo: 'Piso céntrico con vistas al río', tipo: 'Piso', ubicacion: 'Calle Mayor 12, Gerona', precio: 250000, habitaciones: 3, banos: 2, superficie: 90, descripcion: 'Espectacular piso reformado con materiales de alta calidad. Muy luminoso, con un gran salón-comedor con balcón y vistas despejadas al río Onyar. Cocina totalmente equipada y tres habitaciones dobles. Plaza de parking opcional en el mismo edificio.', contacto: 'contacto@selettas.com', imagenes: ['Images/Anuncio1-1.jpg', 'Images/Anuncio1-2.jpg', 'Images/Carrusel1.jpg'] },
                { id: 2, titulo: 'Casa unifamiliar con amplio jardín', tipo: 'Casa', ubicacion: 'Urbanización El Sol, Quart', precio: 450000, habitaciones: 4, banos: 3, superficie: 180, descripcion: 'Magnífica casa unifamiliar en una zona residencial tranquila. Dispone de un gran jardín privado con piscina y zona de barbacoa. La vivienda se distribuye en dos plantas, con 4 habitaciones, 3 baños y un garaje para dos coches.', contacto: 'contacto@selettas.com', imagenes: ['Images/Anuncio2-1.jpg', 'Images/Anuncio2-2.jpg', 'Images/Carrusel-2.jpg'] },
                { id: 3, titulo: 'Terreno rústico con vistas', tipo: 'Terreno', ubicacion: 'Carretera a Vilablareix, Gerona', precio: 85000, habitaciones: 0, banos: 0, superficie: 1200, descripcion: 'Gran terreno rústico en una ubicación privilegiada con vistas panorámicas. Ideal para cultivo o para disfrutar de la naturaleza. Buen acceso desde la carretera principal. No urbanizable.', contacto: 'contacto@selettas.com', imagenes: ['Images/Anuncio3-1.jpg', 'Images/Anuncio3-2.jpg'] },
                { id: 4, titulo: 'Ático de lujo con vistas 360', tipo: 'Ático', ubicacion: 'Passeig de la Devesa 2, Gerona', precio: 750000, habitaciones: 3, banos: 3, superficie: 150, descripcion: 'Exclusivo ático en el corazón de Gerona con una terraza de 100 m² que rodea toda la vivienda, ofreciendo vistas espectaculares de la ciudad y la catedral. Acabados de lujo y diseño moderno.', contacto: 'contacto@selettas.com', imagenes: ['Images/Anuncio4-1.jpg', 'Images/Carrusel-3.png']}
            ];
            toggleFiltrosBtn?.addEventListener('click', () => {
                filtrosWrapper.classList.toggle('open');
                const isOpen = filtrosWrapper.classList.contains('open');
                toggleFiltrosBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i> Ocultar Filtros' : '<i class="fas fa-filter"></i> Mostrar Filtros';
            });
            const mostrarAnuncios = (anuncios) => {
                anunciosContainer.innerHTML = '';
                if (anuncios.length === 0) {
                    anunciosContainer.innerHTML = '<p style="text-align:center;width:100%;">No se han encontrado anuncios que coincidan con tu búsqueda.</p>';
                    return;
                }
                anuncios.forEach(anuncio => {
                    const card = document.createElement('div');
                    card.className = 'anuncio-card';
                    card.innerHTML = `<img src="${anuncio.imagenes[0]}" alt="${anuncio.titulo}"><div class="anuncio-card-content"><h3>${anuncio.titulo}</h3><p class="anuncio-card-price">${anuncio.precio.toLocaleString('es-ES')} €</p><p class="anuncio-card-details">${anuncio.habitaciones} hab | ${anuncio.banos} baños | ${anuncio.superficie} m²</p></div>`;
                    card.addEventListener('click', () => {
                        if(!anuncioModal) return;
                        anuncioModal.querySelector('#modalTitle').textContent = anuncio.titulo;
                        anuncioModal.querySelector('#modalTipo').textContent = anuncio.tipo;
                        anuncioModal.querySelector('#modalUbicacion').textContent = anuncio.ubicacion;
                        anuncioModal.querySelector('#modalPrecio').textContent = anuncio.precio.toLocaleString('es-ES') + ' €';
                        anuncioModal.querySelector('#modalHabitaciones').textContent = anuncio.habitaciones;
                        anuncioModal.querySelector('#modalBanos').textContent = anuncio.banos;
                        anuncioModal.querySelector('#modalSuperficie').textContent = anuncio.superficie + ' m²';
                        anuncioModal.querySelector('#modalDescripcion').textContent = anuncio.descripcion;
                        anuncioModal.querySelector('#modalContacto').textContent = anuncio.contacto;
                        const mainImage = anuncioModal.querySelector('#mainImage');
                        const thumbnailContainer = anuncioModal.querySelector('#thumbnailContainer');
                        const prevBtn = anuncioModal.querySelector('#prevBtn');
                        const nextBtn = anuncioModal.querySelector('#nextBtn');
                        let currentImageIndex = 0;
                        const updateGallery = () => {
                            mainImage.src = anuncio.imagenes[currentImageIndex];
                            thumbnailContainer.innerHTML = '';
                            anuncio.imagenes.forEach((img, index) => {
                                const thumb = document.createElement('img');
                                thumb.src = img;
                                thumb.className = index === currentImageIndex ? 'thumbnail active' : 'thumbnail';
                                thumb.addEventListener('click', () => {
                                    currentImageIndex = index;
                                    updateGallery();
                                });
                                thumbnailContainer.appendChild(thumb);
                            });
                        }
                        prevBtn.onclick = () => {
                            currentImageIndex = (currentImageIndex - 1 + anuncio.imagenes.length) % anuncio.imagenes.length;
                            updateGallery();
                        };
                        nextBtn.onclick = () => {
                            currentImageIndex = (currentImageIndex + 1) % anuncio.imagenes.length;
                            updateGallery();
                        };
                        updateGallery();
                        anuncioModal.classList.add('active');
                    });
                    anunciosContainer.appendChild(card);
                });
            };
            const aplicarFiltrosYOrdenar = () => {
                const tipo = document.getElementById('filtro-tipo').value;
                const habMin = parseInt(document.getElementById('filtro-habitaciones-min').value) || 0;
                const habMax = parseInt(document.getElementById('filtro-habitaciones-max').value) || 99;
                const banosMin = parseInt(document.getElementById('filtro-banos-min').value) || 0;
                const banosMax = parseInt(document.getElementById('filtro-banos-max').value) || 99;
                const superficieMin = parseInt(document.getElementById('filtro-superficie').value) || 0;
                const precioMax = parseInt(document.getElementById('filtro-precio').value) || 999999999;
                const orden = document.getElementById('ordenar-por').value;
                // Corrección de un error de tipeo: 'anuncion' a 'anuncio'
                let anunciosFiltrados = anunciosData.filter(anuncio => (tipo === 'todos' || anuncio.tipo === tipo) && (anuncio.habitaciones >= habMin && anuncio.habitaciones <= habMax) && (anuncio.banos >= banosMin && anuncio.banos <= banosMax) && (anuncio.superficie >= superficieMin) && (anuncio.precio <= precioMax));
                if (orden === 'precio-asc') anunciosFiltrados.sort((a, b) => a.precio - b.precio);
                if (orden === 'precio-desc') anunciosFiltrados.sort((a, b) => b.precio - a.precio);
                mostrarAnuncios(anunciosFiltrados);
            };
            document.querySelectorAll('#filtros-wrapper select, #filtros-wrapper input').forEach(filtro => filtro.addEventListener('change', aplicarFiltrosYOrdenar));
            document.getElementById('reset-filtros')?.addEventListener('click', () => {
                const form = document.querySelector('#filtros-wrapper');
                if (form) {
                    form.querySelectorAll('select, input').forEach(el => {
                        if (el.tagName === 'SELECT') el.selectedIndex = 0;
                        else el.value = '';
                    });
                }
                aplicarFiltrosYOrdenar();
            });
            aplicarFiltrosYOrdenar();
        } catch (error) {
            console.error("Error en la lógica de ver anuncios:", error);
        }
    }
});
