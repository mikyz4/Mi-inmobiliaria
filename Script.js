document.addEventListener('DOMContentLoaded', function() {

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
            { question: '¿Cómo subo un anuncio?', answer: 'Ve a la sección "Publicar Anuncio", rellena todos los campos y adjunta tus imágenes. ¡Nosotros nos encargamos del resto!' },
            { question: '¿Cuánto cuesta publicar?', answer: 'Publicar tu anuncio es completamente gratuito. Solo cobramos una comisión si la venta se realiza a través de nuestros servicios.' },
            { question: '¿Cuánto dura el anuncio?', answer: 'Los anuncios permanecen activos durante 90 días. Pasado ese tiempo, puedes renovarlo o contactándonos.' },
            { question: '¿Asesoran a compradores primerizos?', answer: '¡Por supuesto! Te acompañamos en todo el proceso, desde la búsqueda de financiación hasta la firma.' }
        ];
        faqContainer.innerHTML = faqs.map(faq => `
            <div class="faq-item">
                <h3>${faq.question}</h3>
                <p>${faq.answer}</p>
            </div>
        `).join('');
        document.querySelectorAll('.faq-item').forEach(item => {
            item.addEventListener('click', () => item.classList.toggle('open'));
        });
    }
    
    // --- LÓGICA PARA VER ANUNCIOS Y FILTROS (BLOQUE ACTUALIZADO) ---
    const anunciosContainer = document.getElementById('anunciosContainer');
    if (anunciosContainer) {
        const anunciosData = [
            { id: 1, titulo: 'Piso céntrico con gran terraza', tipo: 'Piso', ubicacion: 'Gerona Centro', precio: 250000, habitaciones: 3, banos: 2, superficie: 90, imagen: 'Images/Anuncio1-1.jpg', descripcion: 'Fantástico piso en el centro de la ciudad, con una terraza de 30m² perfecta para disfrutar del aire libre. Totalmente reformado y listo para entrar a vivir.' },
            { id: 2, titulo: 'Casa con jardín y piscina', tipo: 'Casa', ubicacion: 'Palau, Gerona', precio: 450000, habitaciones: 4, banos: 3, superficie: 180, imagen: 'Images/Anuncio2-1.jpg', descripcion: 'Chalet independiente en zona residencial tranquila. Dispone de un amplio jardín, piscina privada y garaje para dos coches. Ideal para familias.' },
            { id: 3, titulo: 'Ático con vistas panorámicas', tipo: 'Ático', ubicacion: 'Vila-roja', precio: 320000, habitaciones: 2, banos: 2, superficie: 110, imagen: 'Images/Anuncio3-1.jpg', descripcion: 'Luminoso ático con impresionantes vistas a toda la ciudad. Cuenta con acabados de lujo y una gran terraza solárium.' },
            { id: 4, titulo: 'Casa de obra nueva', tipo: 'Casa', ubicacion: 'Montjuïc, Gerona', precio: 510000, habitaciones: 5, banos: 3, superficie: 220, imagen: 'Images/Anuncio4-1.jpg', descripcion: 'Moderna casa de obra nueva con alta eficiencia energética. Espacios abiertos y diseño minimalista. Entrega inmediata.' }
        ];

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
                    <img src="${anuncio.imagen}" alt="${anuncio.titulo}" loading="lazy">
                    <div class="anuncio-card-content">
                        <h3>${anuncio.titulo}</h3>
                        <p class="anuncio-card-price">${anuncio.precio.toLocaleString('es-ES')} €</p>
                        <p class="anuncio-card-details">${anuncio.habitaciones} hab | ${anuncio.banos} baños | ${anuncio.superficie} m²</p>
                        <p class="anuncio-card-location"><i class="fas fa-map-marker-alt"></i> ${anuncio.ubicacion}</p>
                    </div>`;
                
                card.addEventListener('click', () => {
                    if (modal) {
                        modal.querySelector('#modal-img').src = anuncio.imagen;
                        modal.querySelector('#modal-titulo').textContent = anuncio.titulo;
                        modal.querySelector('#modal-precio').textContent = `${anuncio.precio.toLocaleString('es-ES')} €`;
                        modal.querySelector('#modal-detalles').textContent = `${anuncio.habitaciones} hab | ${anuncio.banos} baños | ${anuncio.superficie} m²`;
                        modal.querySelector('#modal-descripcion').textContent = anuncio.descripcion;
                        modal.classList.add('active');
                    }
                });
                anunciosContainer.appendChild(card);
            });
        };

        const aplicarFiltros = () => {
            let anunciosFiltrados = [...anunciosData];
            const tipo = filtroTipo.value;
            const habitaciones = parseInt(filtroHabitaciones.value) || 0;
            const precio = parseInt(filtroPrecio.value) || 999999999;
            const ubicacion = filtroUbicacion.value.toLowerCase();
            const banos = parseInt(filtroBanos.value) || 0;
            const superficie = parseInt(filtroSuperficie.value) || 0;

            if (tipo !== 'todos') {
                anunciosFiltrados = anunciosFiltrados.filter(a => a.tipo === tipo);
            }
            if (habitaciones > 0) {
                anunciosFiltrados = anunciosFiltrados.filter(a => a.habitaciones >= habitaciones);
            }
            if (ubicacion) {
                anunciosFiltrados = anunciosFiltrados.filter(a => a.ubicacion.toLowerCase().includes(ubicacion));
            }
            if (banos > 0) {
                anunciosFiltrados = anunciosFiltrados.filter(a => a.banos >= banos);
            }
            if (superficie > 0) {
                anunciosFiltrados = anunciosFiltrados.filter(a => a.superficie >= superficie);
            }
            
            anunciosFiltrados = anunciosFiltrados.filter(a => a.precio <= precio);

            renderAnuncios(anunciosFiltrados);
        };
        
        if(filtroTipo) filtroTipo.addEventListener('change', aplicarFiltros);
        if(filtroHabitaciones) filtroHabitaciones.addEventListener('input', aplicarFiltros);
        if(filtroPrecio) filtroPrecio.addEventListener('input', aplicarFiltros);
        if(filtroUbicacion) filtroUbicacion.addEventListener('input', aplicarFiltros);
        if(filtroBanos) filtroBanos.addEventListener('input', aplicarFiltros);
        if(filtroSuperficie) filtroSuperficie.addEventListener('input', aplicarFiltros);

        if(resetFiltrosBtn) {
            resetFiltrosBtn.addEventListener('click', () => {
                filtroTipo.value = 'todos';
                filtroHabitaciones.value = '';
                filtroPrecio.value = '';
                filtroUbicacion.value = '';
                filtroBanos.value = '';
                filtroSuperficie.value = '';
                aplicarFiltros();
            });
        }
        
        renderAnuncios(anunciosData);
    }
    
    // --- LÓGICA PARA EL BOTÓN "MOSTRAR FILTROS" ---
    const toggleFiltrosBtn = document.getElementById('toggle-filtros');
    const filtrosWrapper = document.getElementById('filtros-wrapper');
    if (toggleFiltrosBtn && filtrosWrapper) {
        toggleFiltrosBtn.addEventListener('click', () => {
            const isVisible = filtrosWrapper.style.display === 'grid';
            filtrosWrapper.style.display = isVisible ? 'none' : 'grid';
        });
    }

    // --- LÓGICA PARA EL CARRUSEL DE LA PÁGINA DE INICIO ---
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        const carouselImages = document.querySelectorAll('.carousel-image');
        let currentImageIndex = 0;

        if (carouselImages.length > 1) {
            setInterval(() => {
                if(carouselImages[currentImageIndex]) {
                    carouselImages[currentImageIndex].classList.remove('active');
                }
                currentImageIndex = (currentImageIndex + 1) % carouselImages.length;
                if(carouselImages[currentImageIndex]) {
                    carouselImages[currentImageIndex].classList.add('active');
                }
            }, 5000); // Cambia de imagen cada 5 segundos
        }
    }
});
