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
            <li><a href="asesoria.html">Asesoría</a></li>
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
                    <a href="mensajes.html">Mis Mensajes</a>
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
        const privatePages = ['Anuncio.html', 'mis-anuncios.html', 'perfil.html', 'mensajes.html'];
        if (privatePages.includes(currentPage)) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) {
                alert('Debes iniciar sesión para acceder a esta página.');
                window.location.href = 'login.html';
            }
        }
        if (currentPage.startsWith('admin')) {
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
            const asesoriaCardHTML = `
                <a href="asesoria.html" class="service-item-link">
                    <div class="service-item">
                        <i class="fas fa-handshake"></i>
                        <h3>Asesoría Inmobiliaria</h3>
                        <p>Planes flexibles para comprar, vender o invertir con un experto a tu lado. Pulsa aquí para ver los planes.</p>
                    </div>
                </a>
            `;

            const { data, error } = await supabaseClient
                .from('services')
                .select('*')
                .order('display_order', { ascending: true });

            let supabaseServicesHTML = '';
            if (error) {
                console.error("Error cargando servicios desde Supabase:", error);
                supabaseServicesHTML = '<p>No se pudieron cargar los demás servicios.</p>';
            } else if (!data || data.length === 0) {
                 supabaseServicesHTML = '';
            } else {
                 supabaseServicesHTML = data.map(service => `
                    <div class="service-item">
                        <i class="fas ${service.icon}"></i>
                        <h3>${service.title}</h3>
                        <p>${service.text}</p>
                    </div>
                `).join('');
            }
            
            servicesContainer.innerHTML = asesoriaCardHTML + supabaseServicesHTML;
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

    // --- LÓGICA PARA PÁGINAS DE ADMINISTRADOR ---
    const adminPage = document.querySelector('body#admin-page');
    if (adminPage) {
        
        // --- GESTIÓN DE ANUNCIOS (admin-anuncios.html) ---
        const adminAnunciosList = document.getElementById('adminAnunciosList');
        if (adminAnunciosList) {
            const editModal = document.getElementById('editModal');
            const editAnuncioForm = document.getElementById('editAnuncioForm');
            
            const cargarTodosLosAnuncios = async () => {
                const { data, error } = await supabaseClient.from('anuncios_con_usuario').select('*').order('created_at', { ascending: false });
                if (error) { adminAnunciosList.innerHTML = '<p>Error cargando anuncios.</p>'; return; }
                if (data.length === 0) { adminAnunciosList.innerHTML = '<p>No hay ningún anuncio en la plataforma.</p>'; return; }

                adminAnunciosList.innerHTML = data.map(anuncio => `
                    <div class="admin-item-card">
                        <div class="admin-item-info">
                            <p>${anuncio.titulo}</p>
                            <small>Por: ${anuncio.username || 'N/A'} | Precio: ${(anuncio.precio || 0).toLocaleString('es-ES')} €</small>
                            <div class="actions">
                                 <button class="btn-secondary btn-edit-anuncio" data-id="${anuncio.id}">Editar</button>
                                 <button class="btn-delete btn-delete-anuncio" data-id="${anuncio.id}">Borrar</button>
                            </div>
                        </div>
                        <img src="${anuncio.imagen_principal_url}" alt="Miniatura" class="admin-item-thumbnail">
                    </div>
                `).join('');
            };

            adminAnunciosList.addEventListener('click', async (e) => {
                const anuncioId = e.target.dataset.id;
                if (!anuncioId) return;

                if (e.target.classList.contains('btn-delete-anuncio')) {
                    if (confirm('ADMIN: ¿Seguro que quieres borrar este anuncio? Esta acción es irreversible.')) {
                        const { error } = await supabaseClient.from('anuncios').delete().eq('id', anuncioId);
                        if (error) alert('Error al borrar el anuncio: ' + error.message);
                        else cargarTodosLosAnuncios();
                    }
                }
                if (e.target.classList.contains('btn-edit-anuncio')) {
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

        // --- LÓGICA DE GESTIÓN DE NOVEDADES ---
        const adminPostList = document.getElementById('adminPostList');
        if (adminPostList) {
            const postModal = document.getElementById('postModal');
            const postForm = document.getElementById('postForm');
            const addPostBtn = document.getElementById('addPostBtn');
            const postModalTitle = document.getElementById('postModalTitle');
            const savePostBtn = document.getElementById('savePostBtn');

            const loadAdminPosts = async () => {
                const { data, error } = await supabaseClient.from('posts').select('*').order('created_at', { ascending: false });
                if (error) { adminPostList.innerHTML = "<p>Error al cargar las novedades.</p>"; return; }
                if (data.length === 0) { adminPostList.innerHTML = "<p>No hay novedades creadas. ¡Añade la primera!</p>"; return; }
                adminPostList.innerHTML = data.map(post => `
                    <div class="admin-item-card">
                        <p>${post.title}</p>
                        <div class="actions">
                            <button class="btn-secondary btn-edit-post" data-id="${post.id}">Editar</button>
                            <button class="btn-delete btn-delete-post" data-id="${post.id}">Borrar</button>
                        </div>
                    </div>
                `).join('');
            };

            addPostBtn.addEventListener('click', () => {
                postModalTitle.textContent = "Añadir Nueva Novedad";
                postForm.reset();
                document.getElementById('editPostId').value = '';
                postModal.classList.add('active');
            });

            postForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                savePostBtn.disabled = true;
                savePostBtn.textContent = 'Guardando...';
                const postId = document.getElementById('editPostId').value;
                const title = document.getElementById('postTitle').value;
                const description = document.getElementById('postDescription').value;
                const imageFile = document.getElementById('postImage').files[0];
                let imageUrl = null;
                try {
                    if (imageFile) {
                        const { data: { user } } = await supabaseClient.auth.getUser();
                        const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
                        const { error: uploadError } = await supabaseClient.storage.from('imagenes-posts').upload(fileName, imageFile);
                        if (uploadError) throw uploadError;
                        const { data: publicUrlData } = supabaseClient.storage.from('imagenes-posts').getPublicUrl(fileName);
                        imageUrl = publicUrlData.publicUrl;
                    }
                    const postData = { title, description };
                    if (imageUrl) postData.image_url = imageUrl;
                    let error;
                    if (postId) {
                        const { error: updateError } = await supabaseClient.from('posts').update(postData).eq('id', postId);
                        error = updateError;
                    } else {
                        if (!imageUrl) throw new Error("La imagen de portada es obligatoria al crear una nueva novedad.");
                        const { error: insertError } = await supabaseClient.from('posts').insert([postData]);
                        error = insertError;
                    }
                    if (error) throw error;
                    postModal.classList.remove('active');
                    loadAdminPosts();
                } catch (error) {
                    alert("Error al guardar la novedad: " + error.message);
                } finally {
                    savePostBtn.disabled = false;
                    savePostBtn.textContent = 'Guardar';
                }
            });

            adminPostList.addEventListener('click', async (e) => {
                const target = e.target;
                const postId = target.dataset.id;
                if (!postId) return;
                if (target.classList.contains('btn-delete-post')) {
                    if (confirm('¿Estás seguro de que quieres borrar esta novedad?')) {
                        const { error } = await supabaseClient.from('posts').delete().eq('id', postId);
                        if (error) alert("Error al borrar: " + error.message);
                        else loadAdminPosts();
                    }
                }
                if (target.classList.contains('btn-edit-post')) {
                    const { data, error } = await supabaseClient.from('posts').select('*').eq('id', postId).single();
                    if (error) { alert("No se pudo cargar la novedad para editar."); return; }
                    
                    postModalTitle.textContent = "Editar Novedad";
                    document.getElementById('editPostId').value = data.id;
                    document.getElementById('postTitle').value = data.title;
                    document.getElementById('postDescription').value = data.description;
                    postForm.querySelector('small').style.display = 'block';
                    postModal.classList.add('active');
                }
            });
            loadAdminPosts();
        }

        // --- LÓGICA DE GESTIÓN DE FAQS ---
        const adminFaqList = document.getElementById('adminFaqList');
        if(adminFaqList) {
            const faqModal = document.getElementById('faqModal');
            const faqForm = document.getElementById('faqForm');
            const addFaqBtn = document.getElementById('addFaqBtn');
            const faqModalTitle = document.getElementById('faqModalTitle');
            const saveFaqBtn = document.getElementById('saveFaqBtn');
            
            const loadAdminFaqs = async () => {
                const { data, error } = await supabaseClient.from('faqs').select('*').order('display_order');
                if (error) { adminFaqList.innerHTML = "<p>Error al cargar las preguntas.</p>"; return; }
                if (data.length === 0) { adminFaqList.innerHTML = "<p>No hay preguntas creadas. ¡Añade la primera!</p>"; return; }
                adminFaqList.innerHTML = data.map(faq => `
                    <div class="admin-item-card">
                        <p>${faq.display_order}. ${faq.question}</p>
                        <div class="actions">
                            <button class="btn-secondary btn-edit-faq" data-id="${faq.id}">Editar</button>
                            <button class="btn-delete btn-delete-faq" data-id="${faq.id}">Borrar</button>
                        </div>
                    </div>
                `).join('');
            };

            addFaqBtn.addEventListener('click', () => {
                faqModalTitle.textContent = "Añadir Nueva Pregunta";
                faqForm.reset();
                document.getElementById('editFaqId').value = '';
                faqModal.classList.add('active');
            });

            faqForm.addEventListener('submit', async(e) => {
                e.preventDefault();
                saveFaqBtn.disabled = true;
                saveFaqBtn.textContent = 'Guardando...';
                const faqData = {
                    question: document.getElementById('faqQuestion').value,
                    answer: document.getElementById('faqAnswer').value,
                    display_order: parseInt(document.getElementById('faqOrder').value)
                };
                const faqId = document.getElementById('editFaqId').value;
                let error;
                if(faqId){
                    const { error: updateError } = await supabaseClient.from('faqs').update(faqData).eq('id', faqId);
                    error = updateError;
                } else {
                    const { error: insertError } = await supabaseClient.from('faqs').insert([faqData]);
                    error = insertError;
                }

                if(error) {
                    alert('Error al guardar la pregunta: ' + error.message);
                } else {
                    faqModal.classList.remove('active');
                    loadAdminFaqs();
                }
                saveFaqBtn.disabled = false;
                saveFaqBtn.textContent = 'Guardar';
            });

            adminFaqList.addEventListener('click', async(e) => {
                const target = e.target;
                const faqId = target.dataset.id;
                if (!faqId) return;

                if(target.classList.contains('btn-delete-faq')){
                    if(confirm('¿Seguro de que quieres borrar esta pregunta?')){
                        const { error } = await supabaseClient.from('faqs').delete().eq('id', faqId);
                        if(error) alert("Error al borrar: " + error.message);
                        else loadAdminFaqs();
                    }
                }
                if(target.classList.contains('btn-edit-faq')){
                    const { data, error } = await supabaseClient.from('faqs').select('*').eq('id', faqId).single();
                    if(error) { alert('No se pudo cargar la pregunta para editar.'); return; }
                    
                    faqModalTitle.textContent = 'Editar Pregunta';
                    document.getElementById('editFaqId').value = data.id;
                    document.getElementById('faqQuestion').value = data.question;
                    document.getElementById('faqAnswer').value = data.answer;
                    document.getElementById('faqOrder').value = data.display_order;
                    faqModal.classList.add('active');
                }
            });
            loadAdminFaqs();
        }

        // --- LÓGICA DE GESTIÓN DE USUARIOS ---
        const adminUserList = document.getElementById('adminUserList');
        if(adminUserList){
            const userModal = document.getElementById('userModal');
            const userForm = document.getElementById('userForm');
            const saveUserBtn = document.getElementById('saveUserBtn');

            const loadAdminUsers = async () => {
                const { data, error } = await supabaseClient.from('user_profiles_view').select('*').order('username');
                if(error) { adminUserList.innerHTML = '<p>Error al cargar usuarios.</p>'; return; }
                if(data.length === 0) { adminUserList.innerHTML = '<p>No hay usuarios registrados.</p>'; return; }

                adminUserList.innerHTML = data.map(user => `
                    <div class="admin-item-card">
                        <div>
                            <p>${user.username || '<em>Usuario sin nombre</em>'}</p>
                            <small>Rol: ${user.role} | Email: ${user.email}</small>
                        </div>
                        <div class="actions">
                            <button class="btn-secondary btn-edit-user" data-id="${user.id}">Editar Rol</button>
                        </div>
                    </div>
                `).join('');
            };

            adminUserList.addEventListener('click', async (e) => {
                const target = e.target;
                const userId = target.dataset.id;
                if(!userId || !target.classList.contains('btn-edit-user')) return;

                const { data, error } = await supabaseClient.from('user_profiles_view').select('*').eq('id', userId).single();
                if(error){ alert('No se pudo cargar el usuario.'); return; }
                
                document.getElementById('editUserId').value = data.id;
                document.getElementById('userModalUsername').textContent = data.username;
                document.getElementById('userModalEmail').textContent = data.email;
                document.getElementById('userRole').value = data.role;
                userModal.classList.add('active');
            });
            
            userForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                saveUserBtn.disabled = true;
                saveUserBtn.textContent = 'Guardando...';

                const userId = document.getElementById('editUserId').value;
                const newRole = document.getElementById('userRole').value;

                const { error } = await supabaseClient.from('profiles').update({ role: newRole }).eq('id', userId);
                if(error){
                    alert('Error al actualizar el rol: ' + error.message);
                } else {
                    userModal.classList.remove('active');
                    loadAdminUsers();
                }
                saveUserBtn.disabled = false;
                saveUserBtn.textContent = 'Guardar Rol';
            });

            loadAdminUsers();
        }
    }

    const toggleFiltrosBtn = document.getElementById('toggle-filtros');
    if (toggleFiltrosBtn) {
        const filtrosWrapper = document.getElementById('filtros-wrapper');
        toggleFiltrosBtn.addEventListener('click', () => {
            const isVisible = filtrosWrapper.style.display === 'grid';
            filtrosWrapper.style.display = isVisible ? 'none' : 'grid';
            toggleFiltrosBtn.innerHTML = isVisible ? '<i class="fas fa-filter"></i> Mostrar Filtros' : '<i class="fas fa-times"></i> Ocultar Filtros';
        });
    }

    const heroSection = document.getElementById('hero');
    if (heroSection) {
        let currentImage = 0;
        const images = heroSection.querySelectorAll('.carousel-image');
        setInterval(() => {
            if (images.length === 0) return;
            images[currentImage].classList.remove('active');
            currentImage = (currentImage + 1) % images.length;
            images[currentImage].classList.add('active');
        }, 5000);
    }

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

    let deferredPrompt; 
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          deferredPrompt = e;
          if (installBtn) {
            installBtn.style.display = 'block';
            console.log('La aplicación se puede instalar. Mostrando botón.');
          }
        });
        installBtn.addEventListener('click', async () => {
            installBtn.style.display = 'none';
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`Respuesta del usuario: ${outcome}`);
            deferredPrompt = null;
        });
        window.addEventListener('appinstalled', () => {
          if (installBtn) {
            installBtn.style.display = 'none';
          }
          deferredPrompt = null;
          console.log('PWA fue instalada');
        });
    }

    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
        const profileForm = document.getElementById('profileForm');
        const passwordForm = document.getElementById('passwordForm');
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const subscriptionInfoDiv = document.getElementById('subscription-info');

        const showNotification = (message, type = 'success') => {
            const banner = document.getElementById('notification-banner');
            banner.textContent = message;
            banner.className = `notification-${type}`;
            banner.classList.add('show');
            setTimeout(() => {
                banner.classList.remove('show');
            }, 4000);
        };

        const loadUserData = async () => {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) {
                emailInput.value = user.email;
                usernameInput.value = user.user_metadata.username || '';

                // --- CÓDIGO PARA CARGAR DATOS DE SUSCRIPCIÓN ---
                const { data: profile, error } = await supabaseClient
                    .from('profiles')
                    .select('subscription_plan, subscription_status, subscription_end_date')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    subscriptionInfoDiv.innerHTML = '<p>No se pudo cargar la información de tu suscripción.</p>';
                } else if (profile && profile.subscription_plan && profile.subscription_status === 'active') {
                    const endDate = new Date(profile.subscription_end_date).toLocaleDateString('es-ES');
                    subscriptionInfoDiv.innerHTML = `
                        <p>Tu plan actual es: <span class="plan-name">${profile.subscription_plan}</span></p>
                        <p>Estado: <span class="status-active">Activo</span></p>
                        <p>Tu suscripción se renueva el: ${endDate}</p>
                    `;
                } else {
                    subscriptionInfoDiv.innerHTML = '<p>Actualmente no tienes ninguna suscripción activa.</p>';
                }

            } else {
                window.location.href = 'login.html';
            }
        };

        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newUsername = usernameInput.value.trim();
            if (!newUsername) {
                showNotification('El nombre de usuario no puede estar vacío.', 'error');
                return;
            }
            const { error } = await supabaseClient.auth.updateUser({
                data: { username: newUsername }
            });
            if (error) {
                showNotification('Error al actualizar el nombre: ' + error.message, 'error');
            } else {
                showNotification('Nombre de usuario actualizado con éxito.');
            }
        });

        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            const { error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });
            if (error) {
                showNotification('Error al actualizar la contraseña: ' + error.message, 'error');
            } else {
                showNotification('Contraseña actualizada con éxito.');
                passwordForm.reset();
            }
        });

        deleteAccountBtn.addEventListener('click', async () => {
            const confirmation = prompt("Esta acción es irreversible. Para confirmar, escribe 'BORRAR CUENTA' en el siguiente campo:");
            if (confirmation === 'BORRAR CUENTA') {
                try {
                    const { error } = await supabaseClient.functions.invoke('delete-user-account');
                    if (error) {
                        throw error;
                    }
                    showNotification('Tu cuenta ha sido eliminada. Serás redirigido.');
                    await supabaseClient.auth.signOut();
                    setTimeout(() => {
                        window.location.href = 'Index.html';
                    }, 3000);
                } catch (error) {
                    showNotification('Error al eliminar la cuenta: ' + error.message, 'error');
                }
            } else {
                showNotification('La confirmación no es correcta. Acción cancelada.', 'error');
            }
        });
        loadUserData();
    }
    
    // --- LÓGICA DE CONSENTIMIENTO DE COOKIES (RGPD) ---
    const banner = document.getElementById('cookie-consent-banner');
    const modal = document.getElementById('cookie-settings-modal');
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const rejectAllBtn = document.getElementById('cookie-reject-all');
    const settingsBtn = document.getElementById('cookie-settings-btn');
    const savePrefsBtn = document.getElementById('cookie-save-prefs');
    if (modal) {
        const closeModalBtn = modal.querySelector('.close-button');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
    }


    const consentCookie = {
        necesarias: true,
        analiticas: false,
    };

    function loadAnalyticsScripts() {
        console.log("Cargando scripts de ANÁLISIS");
    }

    function executeScripts() {
        const currentConsent = JSON.parse(localStorage.getItem('cookie_consent'));
        if (!currentConsent) return;

        if (currentConsent.analiticas) {
            loadAnalyticsScripts();
        }
    }
    
    function showBanner() {
        if (banner) {
            banner.classList.remove('cookie-banner-hidden');
            banner.classList.add('cookie-banner-show');
        }
    }

    function hideBanner() {
        if (banner) {
            banner.classList.remove('cookie-banner-show');
            banner.classList.add('cookie-banner-hidden');
        }
    }

    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', () => {
            consentCookie.analiticas = true;
            localStorage.setItem('cookie_consent', JSON.stringify(consentCookie));
            hideBanner();
            executeScripts();
        });
    }

    if (rejectAllBtn) {
        rejectAllBtn.addEventListener('click', () => {
            consentCookie.analiticas = false;
            localStorage.setItem('cookie_consent', JSON.stringify(consentCookie));
            hideBanner();
        });
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (modal) {
                hideBanner();
                modal.classList.add('active');
            }
        });
    }

    if (savePrefsBtn) {
        savePrefsBtn.addEventListener('click', () => {
            const analiticasCheckbox = document.getElementById('cookie-analiticas');
            if (analiticasCheckbox) {
                consentCookie.analiticas = analiticasCheckbox.checked;
            }
            localStorage.setItem('cookie_consent', JSON.stringify(consentCookie));
            if (modal) {
                modal.classList.remove('active');
            }
            executeScripts();
        });
    }
    
    const userConsent = localStorage.getItem('cookie_consent');
    if (!userConsent) {
        showBanner();
    } else {
        executeScripts();
    }

    // --- LÓGICA PARA EL MODAL DE 'MÁS INFORMACIÓN' EN ASESORIA.HTML ---
    const infoModal = document.getElementById('info-modal');
    if (infoModal) {
        const infoButtons = document.querySelectorAll('.btn-mas-info');
        const modalTitle = document.getElementById('info-modal-title');
        const modalDetails = document.getElementById('info-modal-details');
        const modalContactBtn = document.getElementById('info-modal-contact-btn');

        infoButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); 
                const title = button.dataset.title;
                const details = button.dataset.details;
                modalTitle.textContent = title;
                modalDetails.textContent = details;

                modalContactBtn.onclick = () => { // Usamos onclick para sobreescribir
                    infoModal.classList.remove('active');
                };

                infoModal.classList.add('active');
            });
        });
    }
        // --- LÓGICA DE MENSAJERÍA ---
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        const messageHistory = document.getElementById('message-history');
        const messageForm = document.getElementById('message-form');
        const messageInput = document.getElementById('message-input');
        let currentUser = null;
        let conversationId = null;
        let messagesSubscription = null;

        const displayMessage = (message) => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            
            const messageClass = message.sender_id === currentUser.id ? 'sent' : 'received';
            messageDiv.classList.add(messageClass);

            const time = new Date(message.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            
            const p = document.createElement('p');
            p.textContent = message.content; // Seguro contra inyección de HTML

            const meta = document.createElement('div');
            meta.className = 'message-meta';
            meta.textContent = time;

            messageDiv.appendChild(p);
            messageDiv.appendChild(meta);
            
            const infoMessage = messageHistory.querySelector('.chat-info');
            if (infoMessage) {
                infoMessage.remove();
            }
            
            messageHistory.appendChild(messageDiv);
            messageHistory.scrollTop = messageHistory.scrollHeight;
        };
        
        const loadMessages = async () => {
            if (!conversationId) return;

            const { data: messages, error } = await supabaseClient
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error cargando mensajes:', error);
                messageHistory.innerHTML = '<p class="chat-info">No se pudo cargar el historial.</p>';
                return;
            }

            messageHistory.innerHTML = ''; 
            if (messages.length === 0) {
                messageHistory.innerHTML = '<p class="chat-info">Aún no hay mensajes. ¡Envía el primero!</p>';
            } else {
                messages.forEach(displayMessage);
            }
        };

        const subscribeToMessages = () => {
            if (messagesSubscription) {
                supabaseClient.removeChannel(messagesSubscription);
            }

            messagesSubscription = supabaseClient.channel(`messages_for_${conversationId}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                }, payload => {
                    if (payload.new.sender_id !== currentUser.id) {
                       displayMessage(payload.new);
                    }
                })
                .subscribe();
        };

        messageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = messageInput.value.trim();
            if (!content || !currentUser || !conversationId) return;

            const messageData = {
                conversation_id: conversationId,
                sender_id: currentUser.id,
                content: content
            };
            
            displayMessage({
                ...messageData,
                created_at: new Date().toISOString()
            });
            messageInput.value = '';

            const { error } = await supabaseClient.from('messages').insert(messageData);

            if (error) {
                console.error('Error enviando mensaje:', error);
                alert('No se pudo enviar tu mensaje. Inténtalo de nuevo.');
                messageHistory.lastChild.remove(); // Elimina el mensaje que se mostró si falla el envío
            }
        });

        const initChat = async () => {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) {
                messageHistory.innerHTML = '<p class="chat-info">Debes iniciar sesión para usar el chat.</p>';
                messageInput.disabled = true;
                return;
            }
            currentUser = user;

            let { data: conversation, error: convError } = await supabaseClient
                .from('conversations')
                .select('id')
                .eq('user_id', currentUser.id)
                .single();

            if (convError && convError.code !== 'PGRST116') {
                console.error('Error buscando conversación:', convError);
                messageHistory.innerHTML = '<p class="chat-info">Error al iniciar el chat.</p>';
                return;
            }

            if (!conversation) {
                const { data: newConversation, error: newConvError } = await supabaseClient
                    .from('conversations')
                    .insert({ user_id: currentUser.id })
                    .select('id')
                    .single();
                
                if (newConvError) {
                    console.error('Error creando conversación:', newConvError);
                    messageHistory.innerHTML = '<p class="chat-info">Error al crear tu sala de chat.</p>';
                    return;
                }
                conversation = newConversation;
            }
            
            conversationId = conversation.id;
            
            await loadMessages();
            subscribeToMessages();
        };

        initChat();
    }
// --- LÓGICA DE MENSAJERÍA PARA EL PANEL DE ADMINISTRADOR ---
const adminChatContainer = document.getElementById('admin-chat-container');
if (adminChatContainer) {
    const conversationsList = document.getElementById('conversations-list');
    const chatWindow = document.getElementById('chat-window');
    const messageHistory = document.getElementById('message-history');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const chatWithUsername = document.getElementById('chat-with-username');

    let currentUser = null; // El admin logueado
    let selectedConversationId = null;
    let messagesSubscription = null;

    // Función para mostrar un mensaje en la ventana de chat
    const displayAdminChatMessage = (message) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        
        // Si el sender_id es el del admin, es 'sent'. Si no, es 'received'.
        const messageClass = message.sender_id === currentUser.id ? 'sent' : 'received';
        messageDiv.classList.add(messageClass);

        const time = new Date(message.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        const p = document.createElement('p');
        p.textContent = message.content;

        const meta = document.createElement('div');
        meta.className = 'message-meta';
        meta.textContent = time;

        messageDiv.appendChild(p);
        messageDiv.appendChild(meta);
        
        const infoMessage = messageHistory.querySelector('.chat-info');
        if (infoMessage) {
            infoMessage.remove();
        }
        
        messageHistory.appendChild(messageDiv);
        messageHistory.scrollTop = messageHistory.scrollHeight;
    };

    // Suscribirse a los mensajes de la conversación seleccionada
    const subscribeToConversation = (conversationId) => {
        if (messagesSubscription) {
            supabaseClient.removeChannel(messagesSubscription);
        }
        messagesSubscription = supabaseClient.channel(`admin_chat_${conversationId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, payload => {
                // Solo mostrar si el mensaje no lo ha enviado el propio admin
                if (payload.new.sender_id !== currentUser.id) {
                    displayAdminChatMessage(payload.new);
                }
            })
            .subscribe();
    };

    // Función que se ejecuta al hacer clic en una conversación
    const selectConversation = async (conversationId, username) => {
        selectedConversationId = conversationId;

        // Resalta la conversación activa en la lista
        document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-conversation-id="${conversationId}"]`).classList.add('active');

        // Limpia y prepara la ventana de chat
        messageHistory.innerHTML = '<p class="chat-info">Cargando mensajes...</p>';
        chatWithUsername.textContent = `Chat con ${username}`;
        messageForm.style.display = 'flex'; // Muestra el formulario para responder
        messageInput.value = '';

        // Carga el historial de mensajes de la BBDD
        const { data: messages, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            messageHistory.innerHTML = '<p class="chat-info">Error al cargar mensajes.</p>';
            return;
        }

        messageHistory.innerHTML = '';
        if(messages.length === 0) {
            messageHistory.innerHTML = '<p class="chat-info">No hay mensajes en esta conversación.</p>';
        } else {
            messages.forEach(displayAdminChatMessage);
        }
        
        // Empieza a escuchar por nuevos mensajes en esta conversación
        subscribeToConversation(conversationId);
    };

    // Cargar la lista de todas las conversaciones de usuarios
    const loadConversations = async () => {
        // Para esto, es ideal tener una vista en Supabase que una 'conversations' con 'profiles'
        // SQL para la vista (ejecutar en el SQL Editor de Supabase):
        // create or replace view conversations_with_user as
        // select c.id, c.user_id, c.created_at, p.username from conversations c
        // join profiles p on c.user_id = p.id;
        const { data, error } = await supabaseClient
            .from('conversations_with_user') // Usamos la vista
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            conversationsList.innerHTML = '<p class="chat-info">Error al cargar conversaciones.</p>';
            console.error(error);
            return;
        }
        
        if (data.length === 0) {
            conversationsList.innerHTML = '<p class="chat-info">No hay conversaciones iniciadas.</p>';
            return;
        }

        conversationsList.innerHTML = '';
        data.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'conversation-item';
            item.setAttribute('data-conversation-id', conv.id);
            
            const time = new Date(conv.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short' });

            item.innerHTML = `
                <span class="conversation-user">${conv.username || 'Usuario sin nombre'}</span>
                <span class="conversation-time">Iniciada: ${time}</span>
            `;

            item.addEventListener('click', () => selectConversation(conv.id, conv.username));
            conversationsList.appendChild(item);
        });
    };

    // Enviar un mensaje como admin
    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (!content || !selectedConversationId || !currentUser) return;

        const messageData = {
            conversation_id: selectedConversationId,
            sender_id: currentUser.id, // El ID del admin
            content: content
        };

        // Muestra el mensaje enviado inmediatamente
        displayAdminChatMessage({
            ...messageData,
            created_at: new Date().toISOString()
        });
        messageInput.value = '';

        // Inserta el mensaje en la base de datos
        const { error } = await supabaseClient.from('messages').insert(messageData);
        if (error) {
            alert('Error al enviar el mensaje.');
            console.error(error);
            // Opcional: podrías eliminar el mensaje que se mostró si falla el envío
            messageHistory.lastChild.remove();
        }
    });

    // Función inicial para arrancar todo
    const initAdminChat = async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            alert('Acceso denegado. Debes ser administrador.');
            window.location.href = 'Index.html';
            return;
        }
        currentUser = user;
        loadConversations();
    };

    initAdminChat();
}

});
// --- LÓGICA DE MENSAJERÍA PARA EL PANEL DE ADMINISTRADOR ---
const adminChatContainer = document.getElementById('admin-chat-container');
if (adminChatContainer) {
    const conversationsList = document.getElementById('conversations-list');
    const chatWindow = document.getElementById('chat-window');
    const messageHistory = document.getElementById('message-history');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const chatWithUsername = document.getElementById('chat-with-username');

    let currentUser = null; // El admin logueado
    let selectedConversationId = null;
    let messagesSubscription = null;

    const displayAdminChatMessage = (message) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        const messageClass = message.sender_id === currentUser.id ? 'sent' : 'received';
        messageDiv.classList.add(messageClass);
        const time = new Date(message.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        const p = document.createElement('p');
        p.textContent = message.content;

        const meta = document.createElement('div');
        meta.className = 'message-meta';
        meta.textContent = time;

        messageDiv.appendChild(p);
        messageDiv.appendChild(meta);
        
        const infoMessage = messageHistory.querySelector('.chat-info');
        if (infoMessage) {
            infoMessage.remove();
        }
        
        messageHistory.appendChild(messageDiv);
        messageHistory.scrollTop = messageHistory.scrollHeight;
    };

    const subscribeToConversation = (conversationId) => {
        if (messagesSubscription) {
            supabaseClient.removeChannel(messagesSubscription);
        }
        messagesSubscription = supabaseClient.channel(`admin_chat_${conversationId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, payload => {
                if (payload.new.sender_id !== currentUser.id) {
                    displayAdminChatMessage(payload.new);
                }
                loadConversations(); // Recarga la lista para actualizar la vista previa y el contador
            })
            .subscribe();
    };

    const selectConversation = async (conversationId, username) => {
        selectedConversationId = conversationId;

        // Marcar mensajes como leídos
        const { error: updateError } = await supabaseClient
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .eq('is_read', false);
        
        if (updateError) console.error("Error al marcar mensajes como leídos:", updateError);

        // Recargar la lista de conversaciones para que el contador de no leídos se actualice a 0
        loadConversations();

        messageHistory.innerHTML = '<p class="chat-info">Cargando mensajes...</p>';
        chatWithUsername.textContent = `Chat con ${username}`;
        messageForm.style.display = 'flex';
        messageInput.value = '';
        messageInput.focus();

        const { data: messages, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            messageHistory.innerHTML = '<p class="chat-info">Error al cargar mensajes.</p>';
            return;
        }

        messageHistory.innerHTML = '';
        if(messages.length === 0) {
            messageHistory.innerHTML = '<p class="chat-info">No hay mensajes en esta conversación. ¡Envía el primero!</p>';
        } else {
            messages.forEach(displayAdminChatMessage);
        }
        
        subscribeToConversation(conversationId);
    };

    const loadConversations = async () => {
        if (!currentUser) return;

        // Llama a la función RPC que creaste
        const { data, error } = await supabaseClient.rpc('get_conversations_with_details', {
            admin_id: currentUser.id
        });

        if (error) {
            conversationsList.innerHTML = '<p class="chat-info">Error al cargar conversaciones. Revisa la función en Supabase.</p>';
            console.error(error);
            return;
        }
        
        if (data.length === 0) {
            conversationsList.innerHTML = '<p class="chat-info">No hay conversaciones iniciadas.</p>';
            return;
        }

        conversationsList.innerHTML = '';
        data.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'conversation-item';
            item.setAttribute('data-conversation-id', conv.id);
            if (conv.id === selectedConversationId) {
                item.classList.add('active');
            }
            
            const userInitial = (conv.username || 'U').charAt(0).toUpperCase();

            const lastMessageTime = conv.last_message_at 
                ? new Date(conv.last_message_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                : '';
                
            const unreadCount = conv.unread_count || 0;
            const lastMessagePreview = conv.last_message_content || 'Conversación iniciada.';

            item.innerHTML = `
                <div class="avatar">${userInitial}</div>
                <div class="conversation-details">
                    <div class="conversation-header">
                        <span class="conversation-user">${conv.username || 'Usuario sin nombre'}</span>
                        <span class="conversation-time">${lastMessageTime}</span>
                    </div>
                    <p class="last-message-preview">${lastMessagePreview}</p>
                </div>
                <div class="conversation-meta">
                    ${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
                </div>
            `;

            item.addEventListener('click', () => selectConversation(conv.id, conv.username));
            conversationsList.appendChild(item);
        });
    };

    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (!content || !selectedConversationId || !currentUser) return;

        const messageData = {
            conversation_id: selectedConversationId,
            sender_id: currentUser.id,
            content: content
        };

        displayAdminChatMessage({
            ...messageData,
            created_at: new Date().toISOString()
        });
        messageInput.value = '';

        const { error } = await supabaseClient.from('messages').insert(messageData);
        if (error) {
            alert('Error al enviar el mensaje.');
            console.error(error);
            messageHistory.lastChild.remove();
        } else {
            loadConversations();
        }
    });

    const initAdminChat = async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            alert('Acceso denegado. Debes ser administrador.');
            window.location.href = 'Index.html';
            return;
        }
        currentUser = user;
        loadConversations();

        supabaseClient.channel('new_conversations_and_messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, payload => {
                loadConversations();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                 if (payload.new.conversation_id !== selectedConversationId) {
                    loadConversations();
                }
            })
            .subscribe();
    };

    initAdminChat();
}
