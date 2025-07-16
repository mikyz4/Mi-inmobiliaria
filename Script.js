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
        // --- LÓGICA DEL CARRUSEL HERO ---
        const slides = document.querySelectorAll('.carousel-slide');
        const dotsContainer = document.querySelector('.carousel-dots');
        let currentSlide = 0;
        let slideInterval;
        if (slides.length > 0) {
            const dots = [];
            slides.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.classList.add('carousel-dot');
                dot.addEventListener('click', () => { goToSlide(i); resetInterval(); });
                dotsContainer.appendChild(dot);
                dots.push(dot);
            });
            const goToSlide = (n) => {
                slides[currentSlide].classList.remove('active');
                dots[currentSlide].classList.remove('active');
                currentSlide = (n + slides.length) % slides.length;
                slides[currentSlide].classList.add('active');
                dots[currentSlide].classList.add('active');
            };
            const nextSlide = () => goToSlide(currentSlide + 1);
            const prevSlide = () => goToSlide(currentSlide - 1);
            const resetInterval = () => { clearInterval(slideInterval); slideInterval = setInterval(nextSlide, 5000); };
            document.getElementById('next-slide').addEventListener('click', () => { nextSlide(); resetInterval(); });
            document.getElementById('prev-slide').addEventListener('click', () => { prevSlide(); resetInterval(); });
            goToSlide(0); // Inicia en el primer slide
            resetInterval();
        }

        // --- LÓGICA DE SERVICIOS, FAQ, NOTICIAS ---
        // (código existente para servicios, faq y noticias)
        
        // --- LÓGICA DE TESTIMONIOS ---
        const testimonialsData = [
            { quote: "Encontraron la casa de mis sueños en tiempo récord. Un servicio excepcional y muy profesional. ¡Totalmente recomendados!", author: "Ana García, Compradora" },
            { quote: "Vendieron mi piso en menos de un mes y por un precio superior al que esperaba. La mejor asesoría inmobiliaria de Gerona, sin duda.", author: "Javier Soler, Vendedor" },
            { quote: "Como inversor, valoro la transparencia y el conocimiento del mercado. Selettas me ha guiado a la perfección en cada paso.", author: "Carlos Puig, Inversor" }
        ];
        const testimonialCarousel = document.querySelector('.testimonial-carousel');
        const testimonialDotsContainer = document.querySelector('.testimonial-dots');
        if (testimonialCarousel) {
            testimonialCarousel.innerHTML = testimonialsData.map(t => `<div class="testimonial-card"><p>"${t.quote}"</p><span class="author">${t.author}</span></div>`).join('');
            
            const testimonialSlides = document.querySelectorAll('.testimonial-card');
            const testimonialDots = [];
            let currentTestimonial = 0;
            let testimonialInterval;

            testimonialSlides.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.classList.add('testimonial-dot');
                dot.addEventListener('click', () => { goToTestimonial(i); resetTestimonialInterval(); });
                testimonialDotsContainer.appendChild(dot);
                testimonialDots.push(dot);
            });

            const goToTestimonial = (n) => {
                testimonialCarousel.style.transform = `translateX(-${n * 100}%)`;
                testimonialDots[currentTestimonial].classList.remove('active');
                currentTestimonial = n;
                testimonialDots[currentTestimonial].classList.add('active');
            };

            const nextTestimonial = () => {
                let next = currentTestimonial + 1;
                if (next >= testimonialSlides.length) {
                    next = 0;
                }
                goToTestimonial(next);
            };

            const resetTestimonialInterval = () => {
                clearInterval(testimonialInterval);
                testimonialInterval = setInterval(nextTestimonial, 7000); // Rotan cada 7 segundos
            };
            
            goToTestimonial(0);
            resetTestimonialInterval();
        }
    }

    // --- LÓGICA PÁGINA VER ANUNCIOS ---
    if (document.body.id === 'anuncios-page') {
        // (código existente de la página de anuncios)
    }

    // --- LÓGICA PARA CERRAR MODALES ---
    // (código existente para cerrar modales)
});
