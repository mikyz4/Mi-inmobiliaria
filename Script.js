document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DEL MENÚ LATERAL (SIDEBAR) ---
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
    } catch (error) {
        console.error("Error en la lógica del menú:", error);
    }

    // --- BOTÓN DE SCROLL HACIA ARRIBA ---
    try {
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        if (scrollToTopBtn) {
            window.addEventListener('scroll', () => {
                scrollToTopBtn.classList.toggle('show', window.scrollY > 300);
            });
            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    } catch (error) {
        console.error("Error en el botón de scroll:", error);
    }

    // --- LÓGICA PARA CERRAR MODALES ---
    try {
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
        console.error("Error en la lógica de modales:", error);
    }

    // --- LÓGICA DE LA PÁGINA DE INICIO (index.html) ---
    if (document.getElementById('hero')) {
        try {
            // Carrusel Hero
            const carouselImages = document.querySelectorAll('.hero-section .carousel-image');
            if (carouselImages.length > 0) {
                const dotsContainer = document.querySelector('.hero-section .carousel-dots');
                let currentSlide = 0;
                let slideInterval = null;

                const showSlide = (index) => {
                    currentSlide = index;
                    carouselImages.forEach((img, i) => img.classList.toggle('active', i === index));
                    if (dotsContainer) {
                        Array.from(dotsContainer.children).forEach((dot, i) => dot.classList.toggle('active', i === index));
                    }
                };
                
                const nextSlide = () => {
                    const newIndex = (currentSlide + 1) % carouselImages.length;
                    showSlide(newIndex);
                };

                const prevSlide = () => {
                    const newIndex = (currentSlide - 1 + carouselImages.length) % carouselImages.length;
                    showSlide(newIndex);
                };

                const startInterval = () => {
                    clearInterval(slideInterval);
                    slideInterval = setInterval(nextSlide, 5000);
                };
                
                if (dotsContainer) {
                    carouselImages.forEach((_, i) => {
                        const dot = document.createElement('span');
                        dot.className = 'dot';
                        dot.addEventListener('click', () => { showSlide(i); startInterval(); });
                        dotsContainer.appendChild(dot);
                    });
                }
                document.querySelector('.hero-section .left')?.addEventListener('click', () => { prevSlide(); startInterval(); });
                document.querySelector('.hero-section .right')?.addEventListener('click', () => { nextSlide(); startInterval(); });
                
                showSlide(0);
                startInterval();
            }
        } catch(e) { console.error('Error en carrusel hero:', e); }

        try {
            // Testimonios (Simulado, se puede ampliar)
            const testimonialCarousel = document.getElementById('testimonial-carousel');
            if (testimonialCarousel) {
                const testimonials = [
                    { name: 'Ana y Carlos', quote: 'El proceso fue transparente y muy profesional. Encontramos la casa de nuestros sueños gracias a Selettas.' },
                    { name: 'Laura G.', quote: 'Como primera compradora, tenía muchas dudas. El equipo me guió en cada paso. ¡Totalmente recomendados!' },
                ];
                testimonialCarousel.innerHTML = testimonials.map(t => `<div class="testimonial-card"><p>"${t.quote}"</p><h4>- ${t.name}</h4></div>`).join('');
            }
        } catch(e) { console.error('Error en testimonios:', e); }

        try {
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
        } catch(e) { console.error('Error en novedades:', e); }
    }


    // --- LÓGICA DEL BANNER DE COOKIES ---
    try {
        const cookieBanner = document.getElementById('cookie-banner');
        const acceptBtn = document.getElementById('accept-cookies-btn');

        if (cookieBanner && acceptBtn) {
            if (!localStorage.getItem('cookiesAccepted')) {
                cookieBanner.classList.remove('hidden');
            } else {
                cookieBanner.classList.add('hidden');
            }

            acceptBtn.addEventListener('click', () => {
                localStorage.setItem('cookiesAccepted', 'true');
                cookieBanner.style.display = 'none'; // Oculta inmediatamente
            });
        }
    } catch (e) {
        console.error("Error en banner de cookies:", e);
    }
});
