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

    // --- LÓGICA DE LA PÁGINA DE PERFIL ---
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

    // --- LÓGICA DE MENSAJERÍA (NUEVO Y CORREGIDO) ---
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
            
            messageDiv.innerHTML = `
                <p>${message.content.replace(/\n/g, '<br>')}</p>
                <div class="message-meta">${time}</div>
            `;
            
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

            if (messages.length === 0) {
                messageHistory.innerHTML = '<p class="chat-info">Aún no hay mensajes. ¡Envía el primero!</p>';
            } else {
                messageHistory.innerHTML = '';
                messages.forEach(displayMessage);
            }
        };

        const subscribeToMessages = () => {
            if (messagesSubscription) {
                supabaseClient.removeChannel(messagesSubscription);
            }

            messagesSubscription = supabaseClient.channel(`messages_${conversationId}`)
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
            
            // Optimistic UI update: show message immediately
            displayMessage({
                ...messageData,
                created_at: new Date().toISOString()
            });
            messageInput.value = '';

            const { error } = await supabaseClient.from('messages').insert(messageData);

            if (error) {
                console.error('Error enviando mensaje:', error);
                alert('No se pudo enviar tu mensaje. Inténtalo de nuevo.');
                // Opcional: eliminar el mensaje que se mostró de forma optimista
                messageHistory.lastChild.remove();
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
    
    // --- LÓGICA DE CONSENTIMIENTO DE COOKIES (RGPD) ---
    const banner = document.getElementById('cookie-consent-banner');
    const cookieModal = document.getElementById('cookie-settings-modal');
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const rejectAllBtn = document.getElementById('cookie-reject-all');
    const settingsBtn = document.getElementById('cookie-settings-btn');
    const savePrefsBtn = document.getElementById('cookie-save-prefs');
    if (cookieModal) {
        const closeModalBtn = cookieModal.querySelector('.close-button');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                cookieModal.classList.remove('active');
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
            if (cookieModal) {
                hideBanner();
                cookieModal.classList.add('active');
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
            if (cookieModal) {
                cookieModal.classList.remove('active');
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

                modalContactBtn.onclick = () => { 
                    infoModal.classList.remove('active');
                };

                infoModal.classList.add('active');
            });
        });
    }
});
