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
            const submitButton = signUpForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Verificando...';

            const username = signUpForm.querySelector('#username').value.trim();
            const email = signUpForm.querySelector('#email').value;
            const password = signUpForm.querySelector('#password').value;

            try {
                const { data: existingUser, error: checkError } = await supabaseClient
                    .from('profiles')
                    .select('username')
                    .eq('username', username)
                    .single();

                if (checkError && checkError.code !== 'PGRST116') {
                    throw checkError;
                }

                if (existingUser) {
                    alert('Error: El nombre de usuario "' + username + '" ya está en uso. Por favor, elige otro.');
                    return; 
                }

                submitButton.textContent = 'Registrando...';
                const { data, error: signUpError } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username 
                        }
                    }
                });

                if (signUpError) {
                    throw signUpError;
                }

                alert('¡Registro exitoso! Por favor, revisa tu email para confirmar la cuenta.');
                window.location.href = 'Index.html';

            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Registrarse';
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

        const existingUserMenu = document.querySelector('.user-menu-container');
        if (existingUserMenu) {
            existingUserMenu.remove();
        }
        
        navLinksContainer.innerHTML = '';

        navLinksContainer.innerHTML += `
            <li><a href="Index.html">Inicio</a></li>
            <li><a href="Ver-anuncios.html">Ver Anuncios</a></li>
            <li><a href="Anuncio.html">Publicar Anuncio</a></li>
        `;

        const userMenuContainer = document.createElement('div');
        userMenuContainer.className = 'user-menu-container';

        if (user) {
            const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single();
            if (profile && profile.role === 'admin') {
                navLinksContainer.innerHTML += `<li><a href="admin.html" style="color: yellow; font-weight: bold;">PANEL ADMIN</a></li>`;
            }
            navLinksContainer.innerHTML += `<li><a href="Index.html#contact">Contacto</a></li>`;
            
            const username = user.user_metadata.username || 'Usuario';
            userMenuContainer.innerHTML = `
                <button id="userMenuButton" class="user-menu-button">
                    <i class="fas fa-user"></i>
                </button>
                <div id="userDropdown" class="user-dropdown-menu">
                    <div class="dropdown-header">Hola, ${username}</div>
                    <a href="perfil.html">Mi Perfil</a>
                    <a href="mis-anuncios.html">Mis Anuncios</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" id="userLogoutBtn">Cerrar Sesión</a>
                </div>
            `;
            document.body.appendChild(userMenuContainer);

            document.getElementById('userLogoutBtn').addEventListener('click', async (e) => {
                e.preventDefault();
                await supabaseClient.auth.signOut();
                window.location.href = 'Index.html';
            });

        } else {
            navLinksContainer.innerHTML += `<li><a href="Index.html#contact">Contacto</a></li>`;
            
            userMenuContainer.innerHTML = `
                <button id="userMenuButton" class="user-menu-button">
                    <i class="fas fa-user"></i>
                </button>
                <div id="userDropdown" class="user-dropdown-menu">
                    <a href="login.html">Iniciar Sesión</a>
                    <a href="registro.html">Registrarse</a>
                </div>
            `;
            document.body.appendChild(userMenuContainer);
        }

        const userMenuButton = document.getElementById('userMenuButton');
        const userDropdown = document.getElementById('userDropdown');
        if (userMenuButton && userDropdown) {
             userMenuButton.addEventListener('click', (event) => {
                event.stopPropagation();
                userDropdown.classList.toggle('show');
            });
        }
    };
    checkUserStatus();

    window.addEventListener('click', (event) => {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown && userDropdown.classList.contains('show')) {
            const userMenuButton = document.getElementById('userMenuButton');
            if (userMenuButton && !userMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
                userDropdown.classList.remove('show');
            }
        }
    });

    (async () => {
        const currentPage = window.location.pathname.split('/').pop();
        const privatePages = ['Anuncio.html', 'mis-anuncios.html', 'perfil.html'];
        if (privatePages.includes(currentPage)) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) {
                alert('Debes iniciar sesión para acceder a esta página.');
                window.location.href = 'login.html';
            }
        }
        if (currentPage.startsWith('admin')) { // Protección mejorada para todas las páginas de admin
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) {
                alert('Acceso denegado.');
                window.location.href = 'Index.html';
                return;
            }
            const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', session.user.id).single();
            if (!profile || profile.role !== 'admin') {
                alert('No tienes permisos de administrador para acceder a esta página.');
                window.location.href = 'Index.html';
            }
        }
    })();
    
    // --- LÓGICA DE LA PÁGINA DE INICIO (DINÁMICA) ---
    const servicesContainer = document.querySelector('.services-container');
    if (servicesContainer) {
        async function loadServices() {
            const { data, error } = await supabaseClient
                .from('services')
                .select('*')
                .order('display_order', { ascending: true });

            if (error || !data || data.length === 0) {
                servicesContainer.innerHTML = '<p>De momento no hay servicios para mostrar.</p>';
                return;
            }

            servicesContainer.innerHTML = data.map(service => `
                <div class="service-item">
                    <i class="fas ${service.icon}"></i>
                    <h3>${service.title}</h3>
                    <p>${service.text}</p>
                </div>
            `).join('');
        }
        loadServices();
    }

    const newsContainer = document.getElementById('news-container');
    if(newsContainer) {
        const newsModal = document.getElementById('newsModal');
        async function loadPosts() {
            const { data, error } = await supabaseClient
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error || !data || data.length === 0) {
                newsContainer.innerHTML = '<p>No hay novedades recientes.</p>';
                return;
            }

            newsContainer.innerHTML = '';
            data.forEach(post => {
                const card = document.createElement('div');
                card.className = 'anuncio-card';
                card.innerHTML = `
                    <img src="${post.image_url || 'Images/Carrusel1.jpg'}" alt="${post.title}" loading="lazy">
                    <div class="anuncio-card-content">
                        <h3>${post.title}</h3>
                    </div>`;
                card.addEventListener('click', () => {
                    if(newsModal) {
                        newsModal.querySelector('#news-modal-img').src = post.image_url || 'Images/Carrusel1.jpg';
                        newsModal.querySelector('#news-modal-titulo').textContent = post.title;
                        newsModal.querySelector('#news-modal-descripcion').textContent = post.description;
                        newsModal.classList.add('active');
                    }
                });
                newsContainer.appendChild(card);
            });
        }
        loadPosts();
    }

    const faqContainer = document.querySelector('.faq-container');
    if (faqContainer) {
        async function loadFaqs() {
            const { data, error } = await supabaseClient
                .from('faqs')
                .select('*')
                .order('display_order', { ascending: true });

            if (error || !data || data.length === 0) {
                faqContainer.innerHTML = '<p>No hay preguntas frecuentes para mostrar.</p>';
                return;
            }

            faqContainer.innerHTML = data.map(faq => `
                <div class="faq-item">
                    <h3>${faq.question}</h3>
                    <p>${faq.answer}</p>
                </div>
            `).join('');

            document.querySelectorAll('.faq-item h3').forEach(item => {
                item.addEventListener('click', () => item.parentElement.classList.toggle('open'));
            });
        }
        loadFaqs();
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
                        <p class="anuncio-card-author"><i class="fas fa-user-tie"></i> Publicado por ${anuncio.username || 'Propietario'}</p>
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
                        
                        const existingAuthor = modal.querySelector('.modal-author');
                        if (existingAuthor) existingAuthor.remove();
                        
                        const authorElement = document.createElement('p');
                        authorElement.className = 'modal-author';
                        authorElement.innerHTML = `<i class="fas fa-user-tie"></i> Publicado por <strong>${anuncio.username || 'Propietario'}</strong>`;
                        modal.querySelector('#modal-descripcion').after(authorElement);

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
                const { data, error } = await supabaseClient.from('anuncios_con_usuario').select('*').order('created_at', { ascending: false });
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
    
    // --- LÓGICA PARA LA PÁGINA DE ADMINISTRADOR (CENTRAL Y SUBPÁGINAS) ---
    const adminPage = document.querySelector('body#admin-page');
    if(adminPage) {
        
        // --- GESTIÓN DE ANUNCIOS (admin-anuncios.html) ---
        const adminAnunciosContainer = document.getElementById('adminAnunciosList');
        if (adminAnunciosContainer) {
            const editModal = document.getElementById('editModal');
            const editAnuncioForm = document.getElementById('editAnuncioForm');
            
            const cargarTodosLosAnuncios = async () => {
                const { data, error } = await supabaseClient.from('anuncios_con_usuario').select('*').order('created_at', { ascending: false });
                if (error) { adminAnunciosContainer.innerHTML = '<p>Error cargando anuncios.</p>'; return; }
                if (data.length === 0) { adminAnunciosContainer.innerHTML = '<p>No hay ningún anuncio en la plataforma.</p>'; return; }

                adminAnunciosContainer.innerHTML = data.map(anuncio => `
                    <div class="admin-item-card">
                        <div>
                            <p>${anuncio.titulo}</p>
                            <small>Por: ${anuncio.username || 'N/A'} | Precio: ${anuncio.precio.toLocaleString('es-ES')} €</small>
                        </div>
                        <div class="actions">
                             <button class="btn-secondary btn-edit" data-id="${anuncio.id}">Editar</button>
                             <button class="btn-delete" data-id="${anuncio.id}">Borrar</button>
                        </div>
                    </div>
                `).join('');
            };

            adminAnunciosContainer.addEventListener('click', async (e) => {
                const anuncioId = e.target.dataset.id;
                if (!anuncioId) return;

                if (e.target.classList.contains('btn-delete')) {
                    if (confirm('ADMIN: ¿Seguro que quieres borrar este anuncio? Esta acción es irreversible.')) {
                        const { error } = await supabaseClient.from('anuncios').delete().eq('id', anuncioId);
                        if (error) alert('Error al borrar el anuncio: ' + error.message);
                        else cargarTodosLosAnuncios();
                    }
                }
                if (e.target.classList.contains('btn-edit')) {
                    const { data, error } = await supabaseClient.from('anuncios').select('*').eq('id', anuncioId).single();
                    if (error) { alert('Error al cargar los datos del anuncio: ' + error.message); return; }
                    
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
                        const { error } = await supabaseClient.from('anuncios').update(updatedData).eq('id', anuncioId);
                        if (error) throw error;
                        editModal.classList.remove('active');
                        cargarTodosLosAnuncios();
                    } catch (error) {
                        alert('Error al guardar los cambios: ' + error.message);
                    } finally {
                        submitButton.textContent = 'Guardar Cambios';
                        submitButton.disabled = false;
                    }
                });
            }
            
            cargarTodosLosAnuncios();
        }
        
        // --- LÓGICA DE GESTIÓN DE SERVICIOS ---
        const adminServiceList = document.getElementById('adminServiceList');
        if (adminServiceList) {
            const serviceModal = document.getElementById('serviceModal');
            const serviceForm = document.getElementById('serviceForm');
            const addServiceBtn = document.getElementById('addServiceBtn');
            const serviceModalTitle = document.getElementById('serviceModalTitle');
            const saveServiceBtn = document.getElementById('saveServiceBtn');

            const loadAdminServices = async () => {
                const { data, error } = await supabaseClient.from('services').select('*').order('display_order');
                if (error) { adminServiceList.innerHTML = "<p>Error al cargar los servicios.</p>"; return; }
                if (data.length === 0) { adminServiceList.innerHTML = "<p>No hay servicios creados. ¡Añade el primero!</p>"; return; }
                
                adminServiceList.innerHTML = data.map(service => `
                    <div class="admin-item-card">
                        <p>${service.display_order}. ${service.title}</p>
                        <div class="actions">
                            <button class="btn-secondary btn-edit-service" data-id="${service.id}">Editar</button>
                            <button class="btn-delete btn-delete-service" data-id="${service.id}">Borrar</button>
                        </div>
                    </div>
                `).join('');
            };

            addServiceBtn.addEventListener('click', () => {
                serviceModalTitle.textContent = "Añadir Nuevo Servicio";
                serviceForm.reset();
                document.getElementById('editServiceId').value = '';
                serviceModal.classList.add('active');
            });

            serviceForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                saveServiceBtn.disabled = true;
                saveServiceBtn.textContent = 'Guardando...';
                const serviceData = {
                    title: document.getElementById('serviceTitle').value,
                    icon: document.getElementById('serviceIcon').value,
                    text: document.getElementById('serviceText').value,
                    display_order: parseInt(document.getElementById('serviceOrder').value)
                };
                const serviceId = document.getElementById('editServiceId').value;
                let error;
                if (serviceId) {
                    const { error: updateError } = await supabaseClient.from('services').update(serviceData).eq('id', serviceId);
                    error = updateError;
                } else {
                    const { error: insertError } = await supabaseClient.from('services').insert([serviceData]);
                    error = insertError;
                }
                if(error){
                    alert("Error al guardar el servicio: " + error.message);
                } else {
                    serviceModal.classList.remove('active');
                    loadAdminServices();
                }
                saveServiceBtn.disabled = false;
                saveServiceBtn.textContent = 'Guardar';
            });

            adminServiceList.addEventListener('click', async (e) => {
                const target = e.target;
                const serviceId = target.dataset.id;
                if (!serviceId) return;

                if(target.classList.contains('btn-delete-service')){
                    if(confirm('¿Estás seguro de que quieres borrar este servicio?')){
                        const { error } = await supabaseClient.from('services').delete().eq('id', serviceId);
                        if(error) alert("Error al borrar: " + error.message);
                        else loadAdminServices();
                    }
                }

                if(target.classList.contains('btn-edit-service')){
                    const { data, error } = await supabaseClient.from('services').select('*').eq('id', serviceId).single();
                    if(error) { alert("No se pudo cargar el servicio para editar."); return; }
                    
                    serviceModalTitle.textContent = "Editar Servicio";
                    document.getElementById('editServiceId').value = data.id;
                    document.getElementById('serviceTitle').value = data.title;
                    document.getElementById('serviceIcon').value = data.icon;
                    document.getElementById('serviceText').value = data.text;
                    document.getElementById('serviceOrder').value = data.display_order;
                    serviceModal.classList.add('active');
                }
            });
            loadAdminServices();
        }
    }


    const toggleFiltrosBtn = document.getElementById('toggle-filtros');
    if (toggleFiltrosBtn) { /* ... */ }

    const heroSection = document.getElementById('hero');
    if (heroSection) { /* ... */ }

    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner) { /* ... */ }

    const anuncioForm = document.getElementById('anuncioForm');
    if (anuncioForm) { /* ... */ }

    const installBtn = document.getElementById('installBtn');
    if (installBtn) { /* ... */ }

    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) { /* ... */ }
});
