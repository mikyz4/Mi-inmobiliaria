document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA COMÚN ---
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (menuToggle) menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
    if (sidebar) sidebar.querySelector('.close-btn').addEventListener('click', () => sidebar.classList.remove('open'));

    const scrollTopBtn = document.querySelector('.scroll-to-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 200) scrollTopBtn.classList.add('show');
            else scrollTopBtn.classList.remove('show');
        });
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    const whatsappBtn = document.querySelector('.whatsapp-button');
    if(whatsappBtn) {
         window.addEventListener('scroll', () => {
            if (window.scrollY > 200) whatsappBtn.classList.add('show');
            else whatsappBtn.classList.remove('show');
        });
    }

    // --- LÓGICA PÁGINA DE INICIO ---
    if (document.body.id === 'home-page') {
        const services = [
            { icon: 'fa-search-dollar', title: 'Valoración de Inmuebles', text: 'Obtén una valoración precisa y de mercado para tu propiedad.' },
            { icon: 'fa-camera', title: 'Fotografía Profesional', text: 'Destacamos tu inmueble con imágenes de alta calidad.' },
            { icon: 'fa-file-signature', title: 'Gestión de Contratos', text: 'Nos encargamos de todo el papeleo para una transacción segura.' }
        ];
        document.querySelector('.services-container').innerHTML = services.map(s => `<div class="service-item"><i class="fas ${s.icon}"></i><h3>${s.title}</h3><p>${s.text}</p></div>`).join('');

        const faqs = [
            { q: '¿Cómo subo un anuncio?', a: 'Ve a "Publicar Anuncio", rellena los campos y adjunta tus imágenes. ¡Nosotros nos encargamos del resto!' },
            { q: '¿Cuánto cuesta publicar?', a: 'Publicar tu anuncio es gratuito. Solo cobramos una comisión si la venta se realiza a través de nuestros servicios.' },
            { q: '¿Cuánto dura el anuncio?', a: 'Los anuncios permanecen activos 90 días. Pasado ese tiempo, puedes renovarlo fácilmente contactándonos.' }
        ];
        const faqContainer = document.querySelector('.faq-container');
        faqContainer.innerHTML = faqs.map(f => `<div class="faq-item"><h3>${f.q}</h3><p>${f.a}</p></div>`).join('');
        faqContainer.querySelectorAll('.faq-item h3').forEach(el => el.addEventListener('click', () => el.parentElement.classList.toggle('open')));

        const newsData = [
            { id: 1, titulo: 'Tendencias del Mercado en Gerona', imagen: 'Images/Noticia1.jpg', desc: 'Análisis de las zonas con mayor crecimiento y potencial de inversión para este año.' },
            { id: 2, titulo: '5 Consejos para Vender Más Rápido', imagen: 'Images/Noticia2.jpg', desc: 'Descubre técnicas de home staging y marketing para acelerar la venta de tu propiedad al mejor precio.' },
            { id: 3, titulo: 'Guía para Comprar tu Primera Vivienda', imagen: 'Images/Noticia3.jpg', desc: 'Desde la financiación hasta la firma: te guiamos en cada paso para que el proceso sea claro y sin sorpresas.' }
        ];
        document.getElementById('news-container').innerHTML = newsData.map(n => `<div class="anuncio-card news-card" data-id="${n.id}"><img src="${n.imagen}" alt="${n.titulo}"><div class="anuncio-card-content"><h3>${n.titulo}</h3></div></div>`).join('');

        document.querySelectorAll('.news-card').forEach(card => card.addEventListener('click', () => {
            const newsId = parseInt(card.dataset.id);
            const newsItem = newsData.find(item => item.id === newsId);
            const newsModal = document.getElementById('newsModal');
            if (newsItem && newsModal) {
                newsModal.querySelector('#news-modal-img').src = newsItem.imagen;
                newsModal.querySelector('#news-modal-titulo').textContent = newsItem.titulo;
                newsModal.querySelector('#news-modal-descripcion').textContent = newsItem.desc;
                newsModal.classList.add('show-modal');
            }
        }));
    }

    // --- LÓGICA PÁGINA VER ANUNCIOS ---
    if (document.body.id === 'anuncios-page') {
        const anunciosData = [
            { id: 1, titulo: 'Piso céntrico con gran terraza', tipo: 'Piso', ubicacion: 'Centro', precio: 250000, hab: 3, baños: 2, metros: 110, desc: 'Espectacular piso reformado en el corazón de Gerona...', img: ['Images/Anuncio1-1.jpg', 'Images/Anuncio1-2.jpg'] },
            { id: 2, titulo: 'Casa con jardín y piscina', tipo: 'Casa', ubicacion: 'Montjuïc', precio: 450000, hab: 4, baños: 3, metros: 220, desc: 'Magnífica casa unifamiliar en urbanización tranquila...', img: ['Images/Anuncio2-1.jpg', 'Images/Anuncio2-2.jpg'] },
            { id: 3, titulo: 'Ático con vistas panorámicas', tipo: 'Ático', ubicacion: 'Eixample', precio: 320000, hab: 2, baños: 1, metros: 85, desc: 'Luminoso ático con vistas despejadas y acabados de lujo...', img: ['Images/Anuncio3-1.jpg', 'Images/Anuncio3-2.jpg'] },
            { id: 4, titulo: 'Casa de obra nueva', tipo: 'Casa', ubicacion: 'Eixample', precio: 510000, hab: 5, baños: 4, metros: 280, desc: 'Moderna casa de obra nueva con máxima eficiencia energética...', img: ['Images/Anuncio4-1.jpg'] }
        ];

        const anunciosContainer = document.getElementById('anunciosContainer');
        const filtroTipo = document.getElementById('filtro-tipo');
        const filtroUbicacion = document.getElementById('filtro-ubicacion');
        const filtroHabitaciones = document.getElementById('filtro-habitaciones');
        const filtroBanos = document.getElementById('filtro-banos');
        const filtroMetros = document.getElementById('filtro-metros');
        const filtroPrecio = document.getElementById('filtro-precio');
        const resetFiltrosBtn = document.getElementById('reset-filtros');
        const toggleFiltrosBtn = document.getElementById('toggle-filtros');
        const filtrosWrapper = document.getElementById('filtros-wrapper');
        const anuncioModal = document.getElementById('anuncioModal');

        const renderAnuncios = (anuncios) => {
            anunciosContainer.innerHTML = '';
            if (anuncios.length === 0) {
                anunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">No se encontraron anuncios.</p>';
                return;
            }
            anuncios.forEach(anuncio => {
                const card = document.createElement('div');
                card.className = 'anuncio-card';
                card.dataset.id = anuncio.id;
                card.innerHTML = `<img src="${anuncio.img[0]}" alt="${anuncio.titulo}" loading="lazy"><div class="anuncio-card-content"><h3>${anuncio.titulo}</h3><p class="anuncio-card-price">${anuncio.precio.toLocaleString('es-ES')} €</p><p class="anuncio-card-details">${anuncio.hab} hab | ${anuncio.baños} baños | ${anuncio.metros} m²</p></div>`;
                card.addEventListener('click', () => openAnuncioModal(anuncio.id));
                anunciosContainer.appendChild(card);
            });
        };

        const openAnuncioModal = (id) => {
            const anuncio = anunciosData.find(a => a.id === id);
            if (anuncio) {
                anuncioModal.querySelector('#modal-main-img').src = anuncio.img[0];
                anuncioModal.querySelector('#modal-titulo').textContent = anuncio.titulo;
                anuncioModal.querySelector('#modal-precio').textContent = `${anuncio.precio.toLocaleString('es-ES')} €`;
                anuncioModal.querySelector('#modal-descripcion').textContent = anuncio.desc;
                const thumbs = anuncioModal.querySelector('#modal-thumbnails');
                thumbs.innerHTML = '';
                anuncio.img.forEach(src => {
                    const thumb = document.createElement('img');
                    thumb.src = src;
                    thumb.addEventListener('click', () => anuncioModal.querySelector('#modal-main-img').src = src);
                    thumbs.appendChild(thumb);
                });
                anuncioModal.classList.add('show-modal');
            }
        };

        const aplicarFiltros = () => {
            const tipo = filtroTipo.value;
            const ubicacion = filtroUbicacion.value;
            const hab = parseInt(filtroHabitaciones.value) || 0;
            const baños = parseInt(filtroBanos.value) || 0;
            const metros = parseInt(filtroMetros.value) || 0;
            const precio = parseInt(filtroPrecio.value) || 999999999;
            
            const anunciosFiltrados = anunciosData.filter(a => 
                (tipo === 'todos' || a.tipo === tipo) &&
                (ubicacion === 'todas' || a.ubicacion === ubicacion) &&
                (a.hab >= hab) &&
                (a.baños >= baños) &&
                (a.metros >= metros) &&
                (a.precio <= precio)
            );
            renderAnuncios(anunciosFiltrados);
        };
        
        [filtroTipo, filtroUbicacion, filtroHabitaciones, filtroBanos, filtroMetros, filtroPrecio].forEach(el => el.addEventListener('input', aplicarFiltros));
        
        resetFiltrosBtn.addEventListener('click', () => {
            filtroTipo.value = 'todos';
            filtroUbicacion.value = 'todas';
            filtroHabitaciones.value = '';
            filtroBanos.value = '';
            filtroMetros.value = '';
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

    // --- LÓGICA PARA CERRAR MODALES ---
    document.querySelectorAll('.modal').forEach(modal => {
        const closeButton = modal.querySelector('.close-button');
        if(closeButton) closeButton.addEventListener('click', () => modal.classList.remove('show-modal'));
        modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show-modal'); });
    });
});
