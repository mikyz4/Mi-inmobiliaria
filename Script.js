document.addEventListener('DOMContentLoaded', function() {

    // --- CONEXIÓN CON SUPABASE ---
    const SUPABASE_URL = 'https://qbxckejkiuvhltvkojbt.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGNrZWpraXV2aGx0dmtvamJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzQ0NTksImV4cCI6MjA2ODQxMDQ1OX0.BreLPlFz61GPHshBAMtb03qU8WDBtHwBedl16SK2avg';
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
        const shouldShow = window.scrollY > 200;
        if (scrollTopBtn) scrollTopBtn.classList.toggle('show', shouldShow);
        if (whatsappBtn) whatsappBtn.classList.toggle('show', shouldShow);
    });
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
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

    // --- LÓGICA DE AUTENTICACIÓN Y MENÚ DINÁMICO ---
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = signUpForm.querySelector('#email').value;
            const password = signUpForm.querySelector('#password').value;
            const { error } = await supabaseClient.auth.signUp({ email, password });
            if (error) {
                alert('Error al registrar: ' + error.message);
            } else {
                alert('¡Registro exitoso! Revisa tu email para confirmar la cuenta.');
                window.location.href = 'login.html';
            }
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('#email').value;
            const password = loginForm.querySelector('#password').value;
            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) {
                alert('Error al iniciar sesión: ' + error.message);
            } else {
                window.location.href = 'Index.html';
            }
        });
    }

    const checkUserStatus = async () => {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const user = session?.user;
        const navLinksContainer = document.querySelector('.sidebar ul');

        if (!navLinksContainer) return;
        
        navLinksContainer.innerHTML = '';

        navLinksContainer.innerHTML += `
            <li><a href="Index.html">Inicio</a></li>
            <li><a href="Ver-anuncios.html">Ver Anuncios</a></li>
            <li><a href="Anuncio.html">Publicar Anuncio</a></li>
        `;

        if (user) {
            // Si el usuario está logueado, buscamos su rol en la tabla 'profiles'
            const { data: profile, error } = await supabaseClient
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            // Si es admin, añadimos el enlace al panel de admin
            if (profile && profile.role === 'admin') {
                navLinksContainer.innerHTML += `
                    <li><a href="admin.html" style="color: yellow; font-weight: bold;">PANEL ADMIN</a></li>
                `;
            }

            navLinksContainer.innerHTML += `
                <li><a href="mis-anuncios.html" style="color: var(--accent-color);">Mis Anuncios</a></li>
                <li><a href="Index.html#contact">Contacto</a></li>
                <li><a href="#" id="logoutBtn" style="color: #ff8a80;">Cerrar Sesión</a></li>
            `;
            document.getElementById('logoutBtn').addEventListener('click', async (e) => {
                e.preventDefault();
                await supabaseClient.auth.signOut();
                window.location.href = 'Index.html';
            });
        } else {
            navLinksContainer.innerHTML += `
                <li><a href="Index.html#contact">Contacto</a></li>
                <li><a href="login.html">Iniciar Sesión</a></li>
                <li><a href="registro.html">Registrarse</a></li>
            `;
        }
    }
    checkUserStatus();

    // --- PROTEGER PÁGINAS PRIVADAS ---
    (async () => {
        const currentPage = window.location.pathname.split('/').pop();
        
        // Páginas que requieren solo estar logueado
        const privatePages = ['Anuncio.html', 'mis-anuncios.html'];
        if (privatePages.includes(currentPage)) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) {
                alert('Debes iniciar sesión para acceder a esta página.');
                window.location.href = 'login.html';
            }
        }

        // Página que requiere ser ADMIN
        if (currentPage === 'admin.html') {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) {
                alert('Acceso denegado.');
                window.location.href = 'Index.html';
                return;
            }
            const { data: profile, error } = await supabaseClient
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (error || !profile || profile.role !== 'admin') {
                alert('No tienes permisos de administrador para acceder a esta página.');
                window.location.href = 'Index.html';
            }
        }
    })();
    
    // --- LÓGICA DE LA PÁGINA DE INICIO ---
    const servicesContainer = document.querySelector('.services-container');
    if (servicesContainer) {
        const services = [
            { icon: 'fa-search-dollar', title: 'Valoración de Inmuebles', text: 'Obtén una valoración precisa y de mercado para tu propiedad.' },
            { icon: 'fa-camera', title: 'Fotografía Profesional', text: 'Destacamos tu inmueble con imágenes de alta calidad que atraen compradores.' },
            { icon: 'fa-file-signature', title: 'Gestión de Contratos', text: 'Nos encargamos de todo el papeleo para una transacción segura.' }
        ];
        servicesContainer.innerHTML = services.map(service => `<div class="service-item"><i class="fas ${service.icon}"></i><h3>${service.title}</h3><p>${service.text}</p></div>`).join('');
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
            card.innerHTML = `<img src="${news.imagen}" alt="${news.titulo}" loading="lazy"><div class="anuncio-card-content"><h3>${news.titulo}</h3></div>`;
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
            { question: '¿Cómo subo un anuncio?', answer: 'Inicia sesión, ve a "Publicar Anuncio", rellena todos los campos y adjunta tus imágenes.' },
            { question: '¿Cuánto cuesta publicar?', answer: 'Publicar tu anuncio es completamente gratuito.' },
            { question: '¿Cuánto dura el anuncio?', answer: 'Los anuncios no tienen fecha de caducidad por ahora.' },
        ];
        faqContainer.innerHTML = faqs.map(faq => `<div class="faq-item"><h3>${faq.question}</h3><p>${faq.answer}</p></div>`).join('');
        document.querySelectorAll('.faq-item h3').forEach(item => {
            item.addEventListener('click', () => item.parentElement.classList.toggle('open'));
        });
    }

    // --- LÓGICA PARA VER ANUNCIOS PÚBLICOS Y FILTROS ---
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
                        const imagenes = [anuncio.imagen_principal_url, ...(anuncio.imagenes_adicionales_urls || [])].filter(Boolean);
                        let imagenActual = 0;
                        if (imagenes.length === 0) return;
                        const mainImage = modal.querySelector('#modal-img');
                        const thumbnailContainer = modal.querySelector('#thumbnail-container');
                        const prevBtn = modal.querySelector('.gallery-nav.prev');
                        const nextBtn = modal.querySelector('.gallery-nav.next');
                        const mostrarImagen = (index) => {
                            if (index < 0 || index >= imagenes.length) return;
                            mainImage.src = imagenes[index];
                            imagenActual = index;
                            thumbnailContainer.querySelectorAll('img').forEach((img, i) => {
                                img.classList.toggle('active', i === index);
                            });
                        };
                        modal.querySelector('#modal-titulo').textContent = anuncio.titulo;
                        modal.querySelector('#modal-precio').textContent = `${(anuncio.precio || 0).toLocaleString('es-ES')} €`;
                        modal.querySelector('#modal-detalles').textContent = `${anuncio.habitaciones || 0} hab | ${anuncio.banos || 0} baños | ${anuncio.superficie || 0} m²`;
                        modal.querySelector('#modal-descripcion').textContent = anuncio.descripcion;
                        thumbnailContainer.innerHTML = '';
                        imagenes.forEach((url, index) => {
                            const thumb = document.createElement('img');
                            thumb.src = url;
                            thumb.alt = `Miniatura ${index + 1}`;
                            thumb.addEventListener('click', () => mostrarImagen(index));
                            thumbnailContainer.appendChild(thumb);
                        });
                        prevBtn.onclick = () => {
                            const nuevaPosicion = (imagenActual - 1 + imagenes.length) % imagenes.length;
                            mostrarImagen(nuevaPosicion);
                        };
                        nextBtn.onclick = () => {
                            const nuevaPosicion = (imagenActual + 1) % imagenes.length;
                            mostrarImagen(nuevaPosicion);
                        };
                        mostrarImagen(0);
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
                const { data, error } = await supabaseClient.from('anuncios').select('*').order('created_at', { ascending: false });
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
                filtroTipo.value = 'todos';
                filtroHabitaciones.value = '';
                filtroPrecio.value = '';
                filtroUbicacion.value = '';
                filtroBanos.value = '';
                filtroSuperficie.value = '';
                aplicarFiltros();
            });
        }
        cargarAnunciosDesdeSupabase();
    }
    
    // --- LÓGICA PARA LA PÁGINA "MIS ANUNCIOS" ---
    const misAnunciosContainer = document.getElementById('misAnunciosContainer');
    if (misAnunciosContainer) {
        const modal = document.getElementById('anuncioModal');
        const editModal = document.getElementById('editModal');
        const editAnuncioForm = document.getElementById('editAnuncioForm');
        
        const cargarMisAnuncios = async () => {
            misAnunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">Cargando tus anuncios...</p>';
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) {
                misAnunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">No se pudo identificar al usuario.</p>';
                return;
            }
            try {
                const { data, error } = await supabaseClient
                    .from('anuncios')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                if (data.length === 0) {
                    misAnunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">Aún no has publicado ningún anuncio. <a href="Anuncio.html" style="color: var(--accent-color);">¡Publica el primero!</a></p>';
                    return;
                }
                misAnunciosContainer.innerHTML = '';
                data.forEach(anuncio => {
                    const card = document.createElement('div');
                    card.className = 'anuncio-card gestion-card';
                    card.innerHTML = `
                        <img src="${anuncio.imagen_principal_url}" alt="${anuncio.titulo}" loading="lazy">
                        <div class="anuncio-card-content">
                            <h3>${anuncio.titulo}</h3>
                            <p class="anuncio-card-price">${(anuncio.precio || 0).toLocaleString('es-ES')} €</p>
                            <div class="gestion-buttons">
                                <button class="btn-edit" data-id="${anuncio.id}">Editar</button>
                                <button class="btn-delete" data-id="${anuncio.id}">Borrar</button>
                            </div>
                        </div>`;
                    
                    card.addEventListener('click', (e) => {
                        if (e.target.closest('.gestion-buttons')) return;
                        if (modal) {
                            const imagenes = [anuncio.imagen_principal_url, ...(anuncio.imagenes_adicionales_urls || [])].filter(Boolean);
                            let imagenActual = 0;
                            if (imagenes.length === 0) return;
                            const mainImage = modal.querySelector('#modal-img');
                            const thumbnailContainer = modal.querySelector('#thumbnail-container');
                            const prevBtn = modal.querySelector('.gallery-nav.prev');
                            const nextBtn = modal.querySelector('.gallery-nav.next');
                            const mostrarImagen = (index) => {
                                if (index < 0 || index >= imagenes.length) return;
                                mainImage.src = imagenes[index];
                                imagenActual = index;
                                thumbnailContainer.querySelectorAll('img').forEach((img, i) => {
                                    img.classList.toggle('active', i === index);
                                });
                            };
                            modal.querySelector('#modal-titulo').textContent = anuncio.titulo;
                            modal.querySelector('#modal-precio').textContent = `${(anuncio.precio || 0).toLocaleString('es-ES')} €`;
                            modal.querySelector('#modal-detalles').textContent = `${anuncio.habitaciones || 0} hab | ${anuncio.banos || 0} baños | ${anuncio.superficie || 0} m²`;
                            modal.querySelector('#modal-descripcion').textContent = anuncio.descripcion;
                            thumbnailContainer.innerHTML = '';
                            imagenes.forEach((url, index) => {
                                const thumb = document.createElement('img');
                                thumb.src = url;
                                thumb.alt = `Miniatura ${index + 1}`;
                                thumb.addEventListener('click', () => mostrarImagen(index));
                                thumbnailContainer.appendChild(thumb);
                            });
                            prevBtn.onclick = () => {
                                const nuevaPosicion = (imagenActual - 1 + imagenes.length) % imagenes.length;
                                mostrarImagen(nuevaPosicion);
                            };
                            nextBtn.onclick = () => {
                                const nuevaPosicion = (imagenActual + 1) % imagenes.length;
                                mostrarImagen(nuevaPosicion);
                            };
                            mostrarImagen(0);
                            modal.classList.add('active');
                        }
                    });
                    misAnunciosContainer.appendChild(card);
                });
            } catch (error) {
                console.error('Error al cargar mis anuncios:', error);
                misAnunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">Hubo un error al cargar tus propiedades.</p>';
            }
        };

        misAnunciosContainer.addEventListener('click', async (e) => {
            const anuncioId = e.target.dataset.id;
            if (e.target.classList.contains('btn-delete')) {
                if (confirm('¿Estás seguro de que quieres borrar este anuncio de forma permanente?')) {
                    try {
                        const { error } = await supabaseClient.from('anuncios').delete().eq('id', anuncioId);
                        if (error) throw error;
                        cargarMisAnuncios();
                    } catch (error) {
                        alert('Error al borrar el anuncio: ' + error.message);
                    }
                }
            }
            if (e.target.classList.contains('btn-edit')) {
                const { data, error } = await supabaseClient.from('anuncios').select('*').eq('id', anuncioId).single();
                if (error) {
                    alert('Error al cargar los datos del anuncio: ' + error.message);
                    return;
                }
                document.getElementById('edit-anuncio-id').value = data.id;
                document.getElementById('edit-titulo').value = data.titulo;
                document.getElementById('edit-direccion').value = data.direccion;
                document.getElementById('edit-descripcion').value = data.descripcion;
                document.getElementById('edit-precio').value = data.precio;
                document.getElementById('edit-habitaciones').value = data.habitaciones;
                document.getElementById('edit-banos').value = data.banos;
                document.getElementById('edit-superficie').value = data.superficie;
                editModal.classList.add('active');
            }
        });

        if (editAnuncioForm) {
            editAnuncioForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const anuncioId = document.getElementById('edit-anuncio-id').value;
                const submitButton = editAnuncioForm.querySelector('button[type="submit"]');
                submitButton.textContent = 'Guardando...';
                submitButton.disabled = true;

                const updatedData = {
                    titulo: document.getElementById('edit-titulo').value,
                    direccion: document.getElementById('edit-direccion').value,
                    descripcion: document.getElementById('edit-descripcion').value,
                    precio: parseFloat(document.getElementById('edit-precio').value),
                    habitaciones: parseInt(document.getElementById('edit-habitaciones').value),
                    banos: parseInt(document.getElementById('edit-banos').value),
                    superficie: parseInt(document.getElementById('edit-superficie').value),
                };

                try {
                    const { error } = await supabaseClient
                        .from('anuncios')
                        .update(updatedData)
                        .eq('id', anuncioId);

                    if (error) throw error;

                    editModal.classList.remove('active');
                    cargarMisAnuncios();

                } catch (error) {
                    alert('Error al guardar los cambios: ' + error.message);
                } finally {
                    submitButton.textContent = 'Guardar Cambios';
                    submitButton.disabled = false;
                }
            });
        }
        
        cargarMisAnuncios();
    }

    // === INICIO: NUEVA LÓGICA PARA LA PÁGINA DE ADMINISTRADOR ===
    const adminAnunciosContainer = document.getElementById('adminAnunciosContainer');
    if (adminAnunciosContainer) {
        
        const cargarTodosLosAnuncios = async () => {
            adminAnunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">Cargando todos los anuncios...</p>';
            
            try {
                // Pedimos a Supabase TODOS los anuncios, sin filtro .eq()
                const { data, error } = await supabaseClient
                    .from('anuncios')
                    .select('*') // Podríamos seleccionar email del perfil: '*, profiles(email)'
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data.length === 0) {
                    adminAnunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">No hay ningún anuncio en la plataforma.</p>';
                    return;
                }

                adminAnunciosContainer.innerHTML = '';
                data.forEach(anuncio => {
                    const card = document.createElement('div');
                    card.className = 'anuncio-card gestion-card';
                    card.innerHTML = `
                        <img src="${anuncio.imagen_principal_url}" alt="${anuncio.titulo}" loading="lazy">
                        <div class="anuncio-card-content">
                            <h3>${anuncio.titulo}</h3>
                            <p class="anuncio-card-price">${(anuncio.precio || 0).toLocaleString('es-ES')} €</p>
                            <p class="anuncio-card-details">Publicado por: ${anuncio.email_contacto || 'No especificado'}</p>
                            <div class="gestion-buttons">
                                <button class="btn-edit" data-id="${anuncio.id}">Editar</button>
                                <button class="btn-delete" data-id="${anuncio.id}">Borrar</button>
                            </div>
                        </div>`;
                    adminAnunciosContainer.appendChild(card);
                });

            } catch (error) {
                console.error('Error al cargar todos los anuncios:', error);
                adminAnunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">Hubo un error al cargar los anuncios.</p>';
            }
        };

        // La lógica para editar y borrar en el panel de admin sería muy similar
        // a la de "mis-anuncios", así que podemos reutilizarla en el futuro.
        // Por ahora, solo cargamos los datos.

        cargarTodosLosAnuncios();
    }
    // === FIN: NUEVA LÓGICA ===


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
        let currentImage = 0;
        const images = heroSection.querySelectorAll('.carousel-image');
        setInterval(() => {
            images[currentImage].classList.remove('active');
            currentImage = (currentImage + 1) % images.length;
            images[currentImage].classList.add('active');
        }, 5000);
    }

    // --- LÓGICA PARA EL BANNER DE COOKIES ---
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    if (cookieBanner && !localStorage.getItem('cookiesAccepted')) {
        cookieBanner.style.display = 'flex';
    }
    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', () => {
            cookieBanner.style.display = 'none';
            localStorage.setItem('cookiesAccepted', 'true');
        });
    }

    // --- LÓGICA PARA ENVIAR EL FORMULARIO DE NUEVO ANUNCIO ---
    const anuncioForm = document.getElementById('anuncioForm');
    if (anuncioForm) {
        if (!anuncioForm.querySelector('#tipo')) {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            formGroup.innerHTML = `
                <label for="tipo">Tipo de Propiedad</label>
                <select id="tipo" name="tipo" required>
                    <option value="">Selecciona un tipo</option>
                    <option value="Piso">Piso</option>
                    <option value="Casa">Casa</option>
                    <option value="Ático">Ático</option>
                </select>`;
            const descripcionGroup = Array.from(anuncioForm.querySelectorAll('.form-group')).find(el => el.querySelector('#descripcion'));
            if(descripcionGroup) descripcionGroup.after(formGroup);
        }

        anuncioForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const submitButton = anuncioForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;

            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error('Debes estar logueado para crear un anuncio.');

                const formData = new FormData(anuncioForm);
                let imagenPrincipalUrl = '';
                const imagenesAdicionalesUrls = [];
                const fileInputs = [
                    anuncioForm.querySelector('#imagen1'), 
                    anuncioForm.querySelector('#imagen2'), 
                    anuncioForm.querySelector('#imagen3'), 
                    anuncioForm.querySelector('#imagen4')
                ];

                for (let i = 0; i < fileInputs.length; i++) {
                    const file = fileInputs[i]?.files[0];
                    if (file) {
                        const fileName = `${user.id}/${Date.now()}-${file.name}`;
                        const { error: uploadError } = await supabaseClient.storage.from('imagenes-anuncios').upload(fileName, file);
                        if (uploadError) throw uploadError;

                        const { data: publicUrlData } = supabaseClient.storage.from('imagenes-anuncios').getPublicUrl(fileName);
                        
                        if (i === 0) {
                            imagenPrincipalUrl = publicUrlData.publicUrl;
                        } else {
                            imagenesAdicionalesUrls.push(publicUrlData.publicUrl);
                        }
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
                    imagenes_adicionales_urls: imagenesAdicionalesUrls,
                    user_id: user.id
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
