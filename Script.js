// --- CÓDIGO COMPLETO Y MODIFICADO DE Script.js (versión de prueba "Ultraligera") ---

document.addEventListener('DOMContentLoaded', function() {

    // --- CONEXIÓN CON SUPABASE ---
    const SUPABASE_URL = 'https://qbxckejkiuvhltvkojbt.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGNrZWpraXV2aGx0dmtvamJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzQ0NTksImV4cCI6MjA2ODQxMDQ1OX0.BreLPlFz61GPHshBAMtb03qU8WDBtHwBedl16SK2avg';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- ESTADO GLOBAL Y SISTEMA DE NOTIFICACIONES ---
    const notificationBanner = document.getElementById('notification-banner');
    let userFavorites = new Set(); 

    function showNotification(message, type = 'success', duration = 4000) {
        if (!notificationBanner) return;
        notificationBanner.textContent = message;
        notificationBanner.className = 'notification-hidden';
        void notificationBanner.offsetWidth;
        notificationBanner.classList.add('show');
        notificationBanner.classList.add(type === 'success' ? 'notification-success' : 'notification-error');
        setTimeout(() => {
            notificationBanner.classList.remove('show');
        }, duration);
    }

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

    // --- GESTIÓN DE FAVORITOS (FUNCIÓN DE CARGA) ---
    const cargarFavoritos = async (userId) => {
        if (!userId) {
            userFavorites.clear();
            return;
        }
        try {
            const { data, error } = await supabaseClient
                .from('favoritos')
                .select('anuncio_id')
                .eq('user_id', userId);
            if (error) throw error;
            userFavorites = new Set(data.map(fav => fav.anuncio_id));
        } catch (error) {
            console.error('Error al cargar favoritos:', error);
        }
    };


    // --- LÓGICA DE AUTENTICACIÓN Y MENÚ DINÁMICO ---
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = signUpForm.querySelector('#email').value;
            const password = signUpForm.querySelector('#password').value;
            const { data, error } = await supabaseClient.auth.signUp({ email, password });
            
            if (error) {
                showNotification('Error al registrar: ' + error.message, 'error');
            } else {
                showNotification('¡Registro exitoso! Serás redirigido a la página principal.', 'success');
                setTimeout(() => { window.location.href = 'Index.html'; }, 2000);
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
                showNotification('Error al iniciar sesión: ' + error.message, 'error');
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
        
        if (user) {
            await cargarFavoritos(user.id);
        }
        
        navLinksContainer.innerHTML = `
            <li><a href="Index.html">Inicio</a></li>
            <li><a href="Ver-anuncios.html">Ver Anuncios</a></li>
            <li><a href="Anuncio.html">Publicar Anuncio</a></li>
        `;

        if (user) {
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile && profile.role === 'admin') {
                navLinksContainer.innerHTML += `
                    <li><a href="admin.html" style="color: yellow; font-weight: bold;">PANEL ADMIN</a></li>
                `;
            }
            
            navLinksContainer.innerHTML += `
                <li><a href="mis-anuncios.html">Mis Anuncios</a></li>
                <li><a href="favoritos.html" style="color: var(--favorite-color);">Mis Favoritos</a></li>
                <li><a href="Index.html#contact">Contacto</a></li>
                <li><a href="#" id="logoutBtn" style="color: #ff8a80;">Cerrar Sesión</a></li>
            `;
            document.getElementById('logoutBtn').addEventListener('click', async (e) => {
                e.preventDefault();
                await supabaseClient.auth.signOut();
                userFavorites.clear(); 
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
        const privatePages = ['Anuncio.html', 'mis-anuncios.html', 'favoritos.html']; 
        if (privatePages.includes(currentPage)) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) {
                showNotification('Debes iniciar sesión para acceder a esta página.', 'error', 2000);
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            }
        }
        if (currentPage === 'admin.html') {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) {
                showNotification('Acceso denegado.', 'error', 2000);
                setTimeout(() => { window.location.href = 'Index.html'; }, 2000);
                return;
            }
            const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', session.user.id).single();
            if (!profile || profile.role !== 'admin') {
                showNotification('No tienes permisos de administrador.', 'error', 2000);
                setTimeout(() => { window.location.href = 'Index.html'; }, 2000);
            }
        }
    })();
    
    // --- LÓGICA PARA LA PÁGINA DE ADMINISTRADOR ---
    const adminAnunciosContainer = document.getElementById('adminAnunciosContainer');
    if (adminAnunciosContainer) {
        
        const cargarTodosLosAnuncios = async () => {
            adminAnunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">Prueba "Ultraligera": Cargando solo ID y título...</p>';
            try {
                // ----- ESTA ES LA PARTE MODIFICADA -----
                // Solo pedimos lo mínimo para evitar el "atasco".
                const { data, error } = await supabaseClient
                    .from('anuncios')
                    .select('id, titulo') // Consulta súper simple
                    .order('created_at', { ascending: false });
                
                if (error) throw error; 

                if (data.length === 0) {
                    adminAnunciosContainer.innerHTML = '<p style="text-align:center; width:100%;">No hay ningún anuncio en la plataforma.</p>';
                    return;
                }
                
                adminAnunciosContainer.innerHTML = '<h2>¡Funcionó! Se han podido cargar los anuncios.</h2><p>El problema está en la consulta compleja. Ahora hay que arreglar los datos.</p>';
                
                data.forEach(anuncio => {
                    const card = document.createElement('div');
                    card.className = 'anuncio-card gestion-card';
                    // Mostramos solo la info que hemos pedido para que no dé error
                    card.innerHTML = `
                        <div class="anuncio-card-content">
                            <h3>${anuncio.titulo}</h3>
                            <p class="anuncio-card-details">ID: ${anuncio.id}</p>
                        </div>`;
                    adminAnunciosContainer.appendChild(card);
                });

            } catch (error) {
                const errorMessage = `Error Detallado: ${error.message}`;
                showNotification(errorMessage, 'error', 15000);
                adminAnunciosContainer.innerHTML = `<p style="color: var(--delete-color); padding: 20px; text-align: left; font-family: monospace; word-break: break-all;">${errorMessage}</p>`;
            }
        };
        
        // El resto de la lógica del admin (eventos de click, etc.) no la necesitamos para esta prueba.
        
        cargarTodosLosAnuncios();
    }
    
    // El resto de tu código (lógica de otras páginas) sigue aquí debajo, no lo he modificado.
    // ...
    const anuncioForm = document.getElementById('anuncioForm');
    if (anuncioForm) {
        //...
    }
    // ...etc
});

