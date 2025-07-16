document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA COMÚN (MENÚ, BOTONES FLOTANTES) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const closeBtn = document.querySelector('.close-btn');
    const scrollTopBtn = document.querySelector('.scroll-to-top');
    const whatsappBtn = document.querySelector('.whatsapp-button');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
    }
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));
    }
    
    window.addEventListener('scroll', () => {
        if (scrollTopBtn && whatsappBtn) {
            if (window.scrollY > 200) {
                scrollTopBtn.classList.add('show');
                whatsappBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
                whatsappBtn.classList.remove('show');
            }
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

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

    const faqContainer = document.querySelector('.faq-container');
    if (faqContainer) {
        const faqs = [
            { question: '¿Cómo subo un anuncio?', answer: 'Ve a la sección "Publicar Anuncio", rellena todos los campos del formulario y adjunta tus imágenes. ¡Nosotros nos encargamos del resto!' },
            { question: '¿Cuánto cuesta publicar?', answer: 'Publicar tu anuncio es completamente gratuito. Solo cobramos una comisión si la venta o alquiler se realiza a través de nuestros servicios.' },
            { question: '¿Cuánto dura el anuncio?', answer: 'Los anuncios permanecen activos durante 90 días. Pasado ese tiempo, puedes renovarlo fácilmente contactándonos.' },
            { question: '¿Asesoran a compradores primerizos?', answer: '¡Por supuesto! Es una de nuestras especialidades. Te acompañamos en todo el proceso, desde la búsqueda de financiación hasta la firma.' }
        ];
        faqContainer.innerHTML = faqs.map(faq => `
            <div class="faq-item">
                <h3>${faq.question}</h3>
                <p>${faq.answer}</p>
            </div>
        `).join('');
        
        faqContainer.querySelectorAll('.faq-item h3').forEach(faqTitle => {
            faqTitle.addEventListener('click', () => {
                faqTitle.parentElement.classList.toggle('open');
            });
        });
    }

    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        const newsData = [
            { id: 1, titulo: 'Tendencias del Mercado Inmobiliario en Gerona', imagen: 'Images/Noticia1.jpg', descripcion: 'Análisis detallado de las zonas con mayor crecimiento y potencial de inversión para este año.' },
            { id: 2, titulo: '5 Consejos para Vender tu Casa Más Rápido', imagen: 'Images/Noticia2.jpg', descripcion: 'Descubre técnicas de home staging y marketing para acelerar la venta de tu propiedad al mejor precio.' },
            { id: 3, titulo: 'Guía para la Compra de tu Primera Vivienda', imagen: 'Images/Noticia3.jpg', descripcion: 'Desde la financiación hasta la firma: te guiamos en cada paso para que el proceso sea claro y sin sorpresas.' }
        ];
        newsContainer.innerHTML = newsData.map(news => `
            <div class="anuncio-card news-card" data-id="${news.id}">
                <img src="${news.imagen}" alt="${news.titulo}">
                <div class="anuncio-card-content">
                    <h3>${news.titulo}</h3>
                </div>
            </div>
        `).join('');

        const newsModal = document.getElementById('newsModal');
        const newsModalImg = document.getElementById('news-modal-img');
        const newsModalTitulo = document.getElementById('news-modal-titulo');
        const newsModalDescripcion = document.getElementById('news-modal-descripcion');
        const modalCloseButton = newsModal.querySelector('.close-button');

        newsContainer.querySelectorAll('.news-card').forEach(card => {
            card.addEventListener('click', () => {
                const newsId = parseInt(card.dataset.id);
                const newsItem = newsData.find(item => item.id === newsId);
                if (newsItem) {
                    newsModalImg.src = newsItem.imagen;
                    newsModalTitulo.textContent = newsItem.titulo;
                    newsModalDescripcion.textContent = newsItem.descripcion;
                    newsModal.classList.add('show-modal');
                }
            });
        });

        modalCloseButton.addEventListener('click', () => newsModal.classList.remove('show-modal'));
        newsModal.addEventListener('click', (e) => {
            if (e.target === newsModal) {
                newsModal.classList.remove('show-modal');
            }
        });
    }

    // --- LÓGICA PARA VER ANUNCIOS (FILTROS + MODAL) ---
    const anunciosContainer = document.getElementById('anunciosContainer');
    if (anunciosContainer) {
        const anunciosData = [
            { id: 1, titulo: 'Piso céntrico con gran terraza', tipo: 'Piso', precio: 250000, habitaciones: 3, descripcion: 'Espectacular piso reformado en el corazón de Gerona...', imagenes: ['Images/Anuncio1-1.jpg', 'Images/Anuncio1-2.jpg'] },
            { id: 2, titulo: 'Casa con jardín y piscina', tipo: 'Casa', precio: 450000, habitaciones: 4, descripcion: 'Magnífica casa unifamiliar en urbanización tranquila...', imagenes: ['Images/Anuncio2-1.jpg', 'Images/Anuncio2-2.jpg'] },
            { id: 3, titulo: 'Ático con vistas panorámicas', tipo: 'Ático', precio: 320000, habitaciones: 2, descripcion: 'Luminoso ático con vistas despejadas y acabados de lujo...', imagenes: ['Images/Anuncio3-1.jpg', 'Images/Anuncio3-2.jpg'] },
            { id: 4, titulo: 'Casa de obra nueva', tipo: 'Casa', precio: 510000, habitaciones: 5, descripcion: 'Moderna casa de obra nueva con la máxima eficiencia energética...', imagenes: ['Images/Anuncio4-1.jpg'] }
        ];

        const filtroTipo = document.getElementById('filtro-tipo');
        const filtroHabitaciones = document.getElementById('filtro-habitaciones');
        const filtroPrecio = document.getElementById('filtro-precio');
        const resetFiltrosBtn = document.getElementById('reset-filtros');
        const toggleFiltrosBtn = document.getElementById('toggle-filtros');
        const filtrosWrapper = document.getElementById('filtros-wrapper');

        const renderAnuncios = (anuncios) => {
            anunciosContainer.innerHTML = '';
            if (anuncios.length === 0) {
                anunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">No se encontraron anuncios con estos criterios.</p>';
                return;
            }
            anuncios.forEach(anuncio => {
                const card = document.createElement('div');
                card.className = 'anuncio-card';
                // Añadimos un data-id para identificar el anuncio al hacer clic
                card.dataset.id = anuncio.id;
                card.innerHTML = `
                    <img src="${anuncio.imagenes[0]}" alt="${anuncio.titulo}" loading="lazy">
                    <div class="anuncio-card-content">
                        <h3>${anuncio.titulo}</h3>
                        <p class="anuncio-card-price">${anuncio.precio.toLocaleString('es-ES')} €</p>
                        <p class="anuncio-card-details">${anuncio.habitaciones} hab. | ${anuncio.tipo}</p>
                    </div>`;
                
                // **AÑADIMOS EL EVENTO CLICK PARA ABRIR EL MODAL**
                card.addEventListener('click', () => {
                    const anuncioId = parseInt(card.dataset.id);
                    const anuncioSeleccionado = anunciosData.find(a => a.id === anuncioId);
                    if (anuncioSeleccionado) {
                        // Aquí iría la lógica para abrir el modal con los detalles
                        // Por ahora, un simple alert para confirmar que funciona:
                        alert(`Has hecho clic en: ${anuncioSeleccionado.titulo}`);
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

            if (tipo !== 'todos') {
                anunciosFiltrados = anunciosFiltrados.filter(a => a.tipo === tipo);
            }
            if (habitaciones > 0) {
                anunciosFiltrados = anunciosFiltrados.filter(a => a.habitaciones >= habitaciones);
            }
            anunciosFiltrados = anunciosFiltrados.filter(a => a.precio <= precio);

            renderAnuncios(anunciosFiltrados);
        };

        filtroTipo.addEventListener('change', aplicarFiltros);
        filtroHabitaciones.addEventListener('input', aplicarFiltros);
        filtroPrecio.addEventListener('input', aplicarFiltros);

        resetFiltrosBtn.addEventListener('click', () => {
            filtroTipo.value = 'todos';
            filtroHabitaciones.value = '';
            filtroPrecio.value = '';
            aplicarFiltros();
        });

        toggleFiltrosBtn.addEventListener('click', () => {
            const isVisible = filtrosWrapper.style.display === 'grid';
            filtrosWrapper.style.display = isVisible ? 'none' : 'grid';
            toggleFiltrosBtn.innerHTML = isVisible ? '<i class="fas fa-filter"></i> Mostrar Filtros' : '<i class="fas fa-times"></i> Ocultar Filtros';
        });
        
        renderAnuncios(anunciosData);
    }
});
