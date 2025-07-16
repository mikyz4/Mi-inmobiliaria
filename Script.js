document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA DEL MENÚ LATERAL ---
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const closeBtn = document.querySelector('.close-btn');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
        });
    }
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // --- LÓGICA DE LAS PREGUNTAS FRECUENTES (FAQ) ---
    const faqContainer = document.querySelector('.faq-container');
    if (faqContainer) {
        const faqs = [
            { question: '¿Cómo subo un anuncio?', answer: 'Ve a la sección "Publicar Anuncio", rellena todos los campos del formulario y adjunta una imagen. ¡Nosotros nos encargamos del resto!' },
            { question: '¿Cuánto cuesta publicar?', answer: 'Publicar tu anuncio es completamente gratuito. Solo cobramos una comisión si la venta o alquiler se realiza a través de nuestros servicios.' },
            { question: '¿Cuánto dura el anuncio?', answer: 'Los anuncios permanecen activos durante 90 días. Pasado ese tiempo, puedes renovarlo fácilmente desde tu panel de usuario o contactándonos.' },
            { question: '¿Asesoran a compradores primerizos?', answer: '¡Por supuesto! Es una de nuestras especialidades. Te acompañamos en todo el proceso, desde la búsqueda de financiación hasta la firma.' }
        ];

        faqs.forEach(faq => {
            const faqItem = document.createElement('div');
            faqItem.classList.add('faq-item');
            faqItem.innerHTML = `
                <h3>${faq.question}</h3>
                <p>${faq.answer}</p>
            `;
            faqItem.addEventListener('click', () => {
                faqItem.classList.toggle('open');
            });
            faqContainer.appendChild(faqItem);
        });
    }
    
    // --- LÓGICA PARA VER ANUNCIOS ---
    const anunciosContainer = document.getElementById('anunciosContainer');
    if (anunciosContainer) {
        const anuncios = [
            { titulo: 'Piso céntrico...', precio: '250.000 €', detalles: '3 hab | 2 baños | 90 m²', imagen: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800' },
            { titulo: 'Casa con jardín...', precio: '450.000 €', detalles: '4 hab | 3 baños | 180 m²', imagen: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800' },
            { titulo: 'Ático con vistas...', precio: '320.000 €', detalles: '2 hab | 2 baños | 110 m²', imagen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' }
        ];

        anuncios.forEach(anuncio => {
            const card = document.createElement('div');
            card.className = 'anuncio-card';
            card.innerHTML = `
                <img src="${anuncio.imagen}" alt="${anuncio.titulo}">
                <div class="anuncio-card-content">
                    <h3>${anuncio.titulo}</h3>
                    <p class="anuncio-card-price">${anuncio.precio}</p>
                    <p class="anuncio-card-details">${anuncio.detalles}</p>
                </div>
            `;
            anunciosContainer.appendChild(card);
        });
    }

    // --- LÓGICA PARA EL BOTÓN "MOSTRAR FILTROS" ---
    const toggleFiltrosBtn = document.getElementById('toggle-filtros');
    const filtrosWrapper = document.getElementById('filtros-wrapper');
    if (toggleFiltrosBtn && filtrosWrapper) {
        toggleFiltrosBtn.addEventListener('click', () => {
            const isVisible = filtrosWrapper.style.display === 'block';
            filtrosWrapper.style.display = isVisible ? 'none' : 'block';
        });
    }
});

