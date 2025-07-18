document.addEventListener('DOMContentLoaded', function() {

    // --- CONEXIÓN CON SUPABASE (VERSIÓN CORREGIDA) ---
    const SUPABASE_URL = 'https://qbxckejkiuvhltvkojbt.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGNrZWpraXV2aGx0dmtvamJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzQ0NTksImV4cCI6MjA2ODQxMDQ1OX0.BreLPlFz61GPHshBAMtb03qU8WDBtHwBedl16SK2avg';
    // La variable global se llama 'supabase' y creamos un cliente a partir de ella
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- LÓGICA COMÚN (MENÚ, BOTONES FLOTANTES, MODALES) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const closeBtn = document.querySelector('.close-btn');
    const scrollTopBtn = document.querySelector('.scroll-to-top');
    const whatsappBtn = document.querySelector('.whatsapp-button');
    const modals = document.querySelectorAll('.modal');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
    }
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));
    }
    
    window.addEventListener('scroll', () => {
        if (scrollTopBtn && whatsappBtn) {
            const shouldShow = window.scrollY > 200;
            scrollTopBtn.classList.toggle('show', shouldShow);
            whatsappBtn.classList.toggle('show', shouldShow);
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    modals.forEach(modal => {
        const closeButton = modal.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => modal.classList.remove('active'));
        }
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                 modal.classList.remove('active');
            }
        });
    });

    // --- LÓGICA DE LA PÁGINA DE INICIO ---
    const servicesContainer = document.querySelector('.services-container');
    if (servicesContainer) {
        const services = [
            { icon: 'fa-search-dollar', title: 'Valoración de Inmuebles', text: 'Obtén una valoración precisa y de mercado para tu propiedad.' },
            { icon: 'fa-camera', title: 'Fotografía Profesional', text: 'Destacamos tu inmueble con imágenes de alta calidad que atraen compradores.' },
            { icon: 'fa-file-signature', title: 'Gestión de Contratos', text: 'Nos encargamos de todo el papeleo para una transacción segura.' }
        ];
        servicesContainer.innerHTML = services.map(service => `
            <div class="service-item">
                <i class="fas ${service.icon}"></i>
                <h3>${service.title}</h3>
                <p>${service.text}</p>
            </div>
        `).join('');
    }

    const newsContainer = document.getElementById('news-container');
    if(newsContainer) {
        const newsData = [
            { id: 1, titulo: 'Tendencias del Mercado', imagen: 'Images/Noticia1.jpg', descripcion: 'Descubre qué zonas de Gerona están en auge y qué tipo de propiedades son las más demandadas este año.'},
            { id: 2, titulo: 'Consejos para Vender', imagen: 'Images/Noticia2.jpg', descripcion: 'Pequeños cambios pueden hacer una gran diferencia. Prepara tu casa para el éxito en el mercado.'},
            { id: 3, titulo: 'Guía para Compradores', imagen: 'Images/Noticia3.jpg', descripcion: 'Desde la financiación hasta la firma, todo lo que necesitas saber para tu primera compra.'}
        ];
        const newsModal = document.getElementById('newsModal');

        newsData.forEach(news => {
            const card = document.createElement('div');
            card.className = 'anuncio-card';
            card.innerHTML = `
                <img src="${news.imagen}" alt="${news.titulo}" loading="lazy">
                <div class="anuncio-card-content">
                    <h3>${news.titulo}</h3>
                </div>
            `;
            card.addEventListener('click', () => {
                if(newsModal) {
                    newsModal.querySelector('#news-modal-img').src = news.imagen;
                    newsModal.querySelector('#news-modal-titulo').textContent = news.titulo;
                    newsModal.querySelector('#news-modal-descripcion').textContent = news.descripcion;
                    newsModal.classList.add('active');
                }
            });
            newsContainer.appendChild(card);
        });
    }

    const faqContainer = document.querySelector('.faq-container');
    if (faqContainer) {
        const faqs = [
            { question: '¿Cómo subo un anuncio?', answer: 'Ve a la sección "Publicar Anuncio", rellena todos los campos y adjunta tus imágenes. ¡Tu anuncio aparecerá al instante!' },
            { question: '¿Cuánto cuesta publicar?', answer: 'Publicar tu anuncio es completamente gratuito. Solo cobramos una comisión si la venta se realiza a través de nuestros servicios.' },
            { question: '¿Cuánto dura el anuncio?', answer: 'Los anuncios permanecen activos durante 90 días. Pasado ese tiempo, puedes renovarlo contactándonos.' },
            { question: '¿Asesoran a compradores primerizos?', answer: '¡Por supuesto! Te acompañamos en todo el proceso, desde la búsqueda de financiación hasta la firma.' }
        ];
        faqContainer.innerHTML = faqs.map(faq => `
            <div class="faq-item">
                <h3>${faq.question}</h3>
                <p>${faq.answer}</p>
            </div>
        `).join('');
        document.querySelectorAll('.faq-item h3').forEach(item => {
            item.addEventListener('click', () => item.parentElement.classList.toggle('open'));
        });
    }
    
    // --- LÓGICA PARA VER ANUNCIOS Y FILTROS ---
    const anunciosContainer = document.getElementById('anunciosContainer');
    if (anunciosContainer) {
        let todosLosAnuncios = []; 
        const modal = document.getElementById('anuncioModal');
        const filtroTipo = document.getElementById('filtro-tipo');
        const filtroHabitaciones = document.getElementById('filtro-habitaciones');
        const filtroPrecio = document.getElementById('filtro-precio');
        const filtroUbicacion = document.getElementById('filtro-ubicacion');
        const filtroBanos = document.getElementById('filtro-banos');
        const filtroSuperficie = document.getElementById('filtro-superficie');
        const resetFiltrosBtn = document.getElementById('reset-filtros');

        const renderAnuncios = (anuncios) => {
            anunciosContainer.innerHTML = '';
            if (anuncios.length === 0) {
                anunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">No se encontraron anuncios con estos criterios.</p>';
                return;
            }
            anuncios.forEach(anuncio => {
                const card = document.createElement('div');
                card.className = 'anuncio-card';
                card.innerHTML = `
                    <img src="${anuncio.imagen_principal_url}" alt="${anuncio.titulo}" loading="lazy">
                    <div class="anuncio-card-content">
                        <h3>${anuncio.titulo}</h3>
                        <p class="anuncio-card-price">${(anuncio.precio || 0).toLocaleString('es-ES')} €</p>
                        <p class="anuncio-card-details">${anuncio.habitaciones || 0} hab | ${anuncio.banos || 0} baños | ${anuncio.superficie || 0} m²</p>
                        <p class="anuncio-card-location"><i class="fas fa-map-marker-alt"></i> ${anuncio.direccion || 'Ubicación no especificada'}</p>
                    </div>`;
                
                card.addEventListener('click', () => {
                    if (modal) {
                        modal.querySelector('#modal-img').src = anuncio.imagen_principal_url;
                        modal.querySelector('#modal-titulo').textContent = anuncio.titulo;
                        modal.querySelector('#modal-precio').textContent = `${(anuncio.precio || 0).toLocaleString('es-ES')} €`;
                        modal.querySelector('#modal-detalles').textContent = `${anuncio.habitaciones || 0} hab | ${anuncio.banos || 0} baños | ${anuncio.superficie || 0} m²`;
                        modal.querySelector('#modal-descripcion').textContent = anuncio.descripcion;
                        modal.classList.add('active');
                    }
                });
                anunciosContainer.appendChild(card);
            });
        };

        const aplicarFiltros = () => {
            let anunciosFiltrados = [...todosLosAnuncios];
            const tipo = filtroTipo.value;
            const habitaciones = parseInt(filtroHabitaciones.value) || 0;
            const precio = parseInt(filtroPrecio.value) || 999999999;
            const ubicacion = filtroUbicacion.value.toLowerCase();
            const banos = parseInt(filtroBanos.value) || 0;
            const superficie = parseInt(filtroSuperficie.value) || 0;

            if (tipo !== 'todos') anunciosFiltrados = anunciosFiltrados.filter(a => a.tipo === tipo);
            if (habitaciones > 0) anunciosFiltrados = anunciosFiltrados.filter(a => a.habitaciones >= habitaciones);
            if (ubicacion) anunciosFiltrados = anunciosFiltrados.filter(a => (a.direccion || '').toLowerCase().includes(ubicacion));
            if (banos > 0) anunciosFiltrados = anunciosFiltrados.filter(a => a.banos >= banos);
            if (superficie > 0) anunciosFiltrados = anunciosFiltrados.filter(a => a.superficie >= superficie);
            
            anunciosFiltrados = anunciosFiltrados.filter(a => (a.precio || 0) <= precio);
            renderAnuncios(anunciosFiltrados);
        };
        
        const cargarAnunciosDesdeSupabase = async () => {
            anunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">Cargando anuncios...</p>';
            try {
                const { data, error } = await supabaseClient
                    .from('anuncios')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                todosLosAnuncios = data;
                renderAnuncios(todosLosAnuncios);

            } catch (error) {
                console.error('Error al cargar anuncios desde Supabase:', error);
                anunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">No se pudieron cargar los anuncios. Inténtalo más tarde.</p>';
            }
        };

        [filtroTipo, filtroHabitaciones, filtroPrecio, filtroUbicacion, filtroBanos, filtroSuperficie].forEach(filtro => {
            if (filtro) filtro.addEventListener('input', aplicarFiltros);
        });

        if(resetFiltrosBtn) {
            resetFiltrosBtn.addEventListener('click', () => {
                if (filtroTipo) filtroTipo.value = 'todos';
                if (filtroHabitaciones) filtroHabitaciones.value = '';
                if (filtroPrecio) filtroPrecio.value = '';
                if (filtroUbicacion) filtroUbicacion.value = '';
                if (filtroBanos) filtroBanos.value = '';
                if (filtroSuperficie) filtroSuperficie.value = '';
                aplicarFiltros();
            });
        }
        
        cargarAnunciosDesdeSupabase();
    }
    
    // --- LÓGICA PARA EL BOTÓN "MOSTRAR FILTROS" ---
    const toggleFiltrosBtn = document.getElementById('toggle-filtros');
    const filtrosWrapper = document.getElementById('filtros-wrapper');
    if (toggleFiltrosBtn && filtrosWrapper) {
        toggleFiltrosBtn.addEventListener('click', () => {
            const isVisible = filtrosWrapper.style.display === 'grid';
            filtrosWrapper.style.display = isVisible ? 'none' : 'grid';
            toggleFiltrosBtn.innerHTML = isVisible ? '<i class="fas fa-filter"></i> Mostrar Filtros' : '<i class="fas fa-times"></i> Ocultar Filtros';
        });
    }

    // --- LÓGICA PARA EL CARRUSEL DE LA PÁGINA DE INICIO ---
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        const carouselImages = document.querySelectorAll('.carousel-image');
        let currentImageIndex = 0;
        if (carouselImages.length > 1) {
            setInterval(() => {
                if(carouselImages[currentImageIndex]) carouselImages[currentImageIndex].classList.remove('active');
                currentImageIndex = (currentImageIndex + 1) % carouselImages.length;
                if(carouselImages[currentImageIndex]) carouselImages[currentImageIndex].classList.add('active');
            }, 5000);
        }
    }

    // --- LÓGICA PARA EL BANNER DE COOKIES ---
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner) {
        const acceptCookiesBtn = document.getElementById('accept-cookies');
        if (!localStorage.getItem('cookies_accepted')) cookieBanner.style.display = 'flex';
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookies_accepted', 'true');
            cookieBanner.style.display = 'none';
        });
    }

    // --- LÓGICA PARA ENVIAR EL FORMULARIO DE NUEVO ANUNCIO ---
    const anuncioForm = document.getElementById('anuncioForm');
    if (anuncioForm) {
        // Añadimos el campo 'tipo' si no existe en el HTML
        if (!anuncioForm.querySelector('#tipo')) {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            formGroup.innerHTML = `
                <label for="tipo">Tipo de Propiedad</label>
                <select id="tipo" name="tipo" required>
                    <option value="" disabled selected>Selecciona un tipo</option>
                    <option value="Piso">Piso</option>
                    <option value="Casa">Casa</option>
                    <option value="Ático">Ático</option>
                    <option value="Local">Local</option>
                    <option value="Terreno">Terreno</option>
                </select>
            `;
            // Insertamos el campo 'tipo' después de la descripción
            const descripcionGroup = Array.from(anuncioForm.querySelectorAll('.form-group')).find(el => el.querySelector('#descripcion'));
            if(descripcionGroup) descripcionGroup.after(formGroup);
        }

        anuncioForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const submitButton = anuncioForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;

            try {
                const formData = new FormData(anuncioForm);
                const fileInputs = [
                    anuncioForm.querySelector('#imagen1'),
                    anuncioForm.querySelector('#imagen2'),
                    anuncioForm.querySelector('#imagen3'),
                    anuncioForm.querySelector('#imagen4')
                ];

                let imagenPrincipalUrl = '';
                const imagenesAdicionalesUrls = [];

                for (let i = 0; i < fileInputs.length; i++) {
                    const file = fileInputs[i]?.files[0];
                    if (file) {
                        const fileName = `${Date.now()}-${file.name}`;
                        const { error: uploadError } = await supabaseClient.storage
                            .from('imagenes-anuncios') // Nombre corregido con guion
                            .upload(fileName, file);
                        if (uploadError) throw uploadError;

                        const { data: publicUrlData } = supabaseClient.storage
                            .from('imagenes-anuncios')
                            .getPublicUrl(fileName);
                        
                        if (i === 0) imagenPrincipalUrl = publicUrlData.publicUrl;
                        else imagenesAdicionalesUrls.push(publicUrlData.publicUrl);
                    }
                }
                
                if (!imagenPrincipalUrl) throw new Error('La imagen principal es obligatoria.');

                const nuevoAnuncio = {
                    titulo: formData.get('titulo'),
                    direccion: formData.get('direccion'),
                    email_contacto: formData.get('email'),
                    descripcion: formData.get('descripcion'),
                    tipo: formData.get('tipo'),
                    precio: parseFloat(formData.get('precio')),
                    habitaciones: parseInt(formData.get('habitaciones')),
                    banos: parseInt(formData.get('banos')),
                    superficie: parseInt(formData.get('superficie')),
                    imagen_principal_url: imagenPrincipalUrl,
                    imagenes_adicionales_urls: imagenesAdicionalesUrls
                };

                const { error: insertError } = await supabaseClient.from('anuncios').insert([nuevoAnuncio]);
                if (insertError) throw insertError;

                window.location.href = 'Gracias.html';

            } catch (error) {
                console.error('Error al enviar el anuncio:', error);
                alert('Hubo un error al enviar tu anuncio: ' + error.message);
                submitButton.textContent = 'Enviar Anuncio';
                submitButton.disabled = false;
            }
        });
    }
});
