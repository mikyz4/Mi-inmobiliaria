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
        services.forEach(service => {
            const item = document.createElement('div');
            item.className = 'service-item';
            item.innerHTML = `<i class="fas ${service.icon}"></i><h3>${service.title}</h3><p>${service.text}</p>`;
            servicesContainer.appendChild(item);
        });
    }

    const faqContainer = document.querySelector('.faq-container');
    if (faqContainer) {
        const faqs = [
            { question: '¿Cómo subo un anuncio?', answer: 'Ve a la sección "Publicar Anuncio", rellena todos los campos del formulario y adjunta tus imágenes. ¡Nosotros nos encargamos del resto!' },
            { question: '¿Cuánto cuesta publicar?', answer: 'Publicar tu anuncio es completamente gratuito. Solo cobramos una comisión si la venta o alquiler se realiza a través de nuestros servicios.' },
            { question: '¿Cuánto dura el anuncio?', answer: 'Los anuncios permanecen activos durante 90 días. Pasado ese tiempo, puedes renovarlo fácilmente o contactándonos.' },
            { question: '¿Asesoran a compradores primerizos?', answer: '¡Por supuesto! Es una de nuestras especialidades. Te acompañamos en todo el proceso, desde la búsqueda de financiación hasta la firma.' }
        ];
        faqs.forEach(faq => {
            const item = document.createElement('div');
            item.className = 'faq-item';
            item.innerHTML = `<h3>${faq.question}</h3><p>${faq.answer}</p>`;
            item.addEventListener('click', () => item.classList.toggle('open'));
            faqContainer.appendChild(item);
        });
    }
    
    // --- LÓGICA PARA VER ANUNCIOS Y FILTROS ---
    const anunciosContainer = document.getElementById('anunciosContainer');
    if (anunciosContainer) {
        const anunciosData = [
            { id: 1, titulo: 'Piso céntrico con gran terraza', tipo: 'Piso', precio: 250000, habitaciones: 3, imagen: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800' },
            { id: 2, titulo: 'Casa con jardín y piscina', tipo: 'Casa', precio: 450000, habitaciones: 4, imagen: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800' },
            { id: 3, titulo: 'Ático con vistas panorámicas', tipo: 'Ático', precio: 320000, habitaciones: 2, imagen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' },
            { id: 4, titulo: 'Casa de obra nueva', tipo: 'Casa', precio: 510000, habitaciones: 5, imagen: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800' }
        ];

        const filtroTipo = document.getElementById('filtro-tipo');
        const filtroHabitaciones = document.getElementById('filtro-habitaciones');
        const filtroPrecio = document.getElementById('filtro-precio');
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
                    <img src="${anuncio.imagen}" alt="${anuncio.titulo}">
                    <div class="anuncio-card-content">
                        <h3>${anuncio.titulo}</h3>
                        <p class="anuncio-card-price">${anuncio.precio.toLocaleString('es-ES')} €</p>
                        <p class="anuncio-card-details">${anuncio.habitaciones} hab.</p>
                    </div>`;
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
        
        // Carga inicial
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
});
