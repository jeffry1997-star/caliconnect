// Cali Connect - Frontend Application

const API_BASE_URL = window.location.hostname.includes('github.dev')
  ? window.location.origin.replace('8080', '5000') + '/api'
  : '/api';

// ==================== State ====================
let cart = [];
let products = [];
// ==================== Products ====================

// Esta función debe devolver un ARRAY de objetos
function getDemoProducts() {
    return [
        { id: 1, name: 'Web Basic', description: 'Sitio de 5 secciones', price: 150.00, icon: 'fa-globe' },
        { id: 2, name: 'Web Pro', description: 'CMS y Blog', price: 350.00, icon: 'fa-laptop-code' },
        { id: 3, name: 'Tienda Online', description: 'E-commerce completo', price: 400.00, icon: 'fa-shopping-bag' },
        { id: 4, name: 'Configuración Router', description: 'Router empresarial', price: 80.00, icon: 'fa-router' },
        { id: 5, name: 'Configuración Switch', description: 'VLANs y Gestión', price: 120.00, icon: 'fa-network-wired' },
        { id: 6, name: 'Mantenimiento', description: 'Soporte mensual', price: 50.00, icon: 'fa-tools' }
    ];
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('API no disponible');
        
        products = await response.json();
        console.log('Productos cargados desde API');
    } catch (error) {
        console.warn('Cargando productos de prueba...');
        products = getDemoProducts();
    } finally {
        renderProducts();
    }
    function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image_url || 'placeholder.png'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h5 class="product-title">${product.name}</h5>
                <p class="product-price">$${product.price.toFixed(2)}</p>
            </div>
            <button class="btn btn-primary product-btn" onclick="addToCart(${product.id})">Agregar al carrito</button>
        `;
        container.appendChild(card);
    });

    // Actualizamos scrollAmount después de renderizar
    initCarousel();
}
}
const container = document.getElementById('products-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const productCard = document.querySelector('.product-card');
const scrollAmount = productCard ? productCard.offsetWidth + 20 : 300; // ancho + gap

nextBtn.addEventListener('click', () => {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});

prevBtn.addEventListener('click', () => {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
});

// ==================== Cart ====================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartUI();
    showToast(`${product.name} agregado al carrito`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartUI();
    }
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartUI() {
    // Update cart count
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    // Update cart items
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="text-muted">El carrito está vacío</p>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h6>${item.name}</h6>
                        <div class="cart-item-controls">
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <i class="fas fa-times cart-item-remove" onclick="removeFromCart(${item.id})"></i>
                </div>
            `).join('');
        }
    }
    
    if (cartTotal) {
        cartTotal.textContent = getCartTotal().toFixed(2);
    }
    
    // Save cart to localStorage
    localStorage.setItem('caliconnect_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('caliconnect_cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartUI();
    }
}

// ==================== PayPal ====================
function initPayPal() {
    const container = document.getElementById('paypal-button-container');
    if (!container || typeof paypal === 'undefined') return;
    
    paypal.Buttons({
        createOrder: function(data, actions) {
            const total = getCartTotal();
            if (total <= 0) {
                showToast('El carrito está vacío', 'error');
                return;
            }
            
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: total.toFixed(2)
                    },
                    description: 'Cali Connect - Servicios'
                }]
            });
        },
        onApprove: async function(data, actions) {
            try {
                const order = await actions.order.capture();
                await processPayment(order);
                showToast('¡Pago exitoso! Gracias por tu compra', 'success');
                cart = [];
                updateCartUI();
                localStorage.removeItem('caliconnect_cart');
            } catch (error) {
                console.error('Payment error:', error);
                showToast('Error al procesar el pago', 'error');
            }
        },
        onError: function(err) {
            console.error('PayPal error:', err);
            showToast('Error en el pago PayPal', 'error');
        },
        onCancel: function() {
            showToast('Pago cancelado', 'error');
        }
    }).render('#paypal-button-container');
}

async function processPayment(order) {
    try {
        await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paypal_order_id: order.id,
                amount: order.purchase_units[0].amount.value,
                items: cart,
                status: 'completed'
            })
        });
    } catch (error) {
        console.error('Error saving order:', error);
    }
}

// ==================== Chat / Mensajería ====================
function initChat() {
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const messagesContainer = document.getElementById('chat-messages');
    
    if (!input || !input.value.trim()) return;
    
    const userMessage = input.value.trim();
    input.value = '';
    
    // Add user message
    addMessage(userMessage, 'user');
    
    // Simulate bot response
    setTimeout(() => {
        const botResponse = getBotResponse(userMessage);
        addMessage(botResponse, 'bot');
    }, 500);
}

function addMessage(text, sender) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('hello') || lowerMessage.includes('buenos')) {
        return '¡Hola! Bienvenido a Cali Connect. ¿En qué puedo ayudarte hoy?';
    } else if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('cuánto')) {
        return 'Tenemos diversos servicios. Puedes ver nuestra tienda en la sección correspondiente. ¿Te gustaría información sobre algún servicio específico?';
    } else if (lowerMessage.includes('web') || lowerMessage.includes('página') || lowerMessage.includes('sitio')) {
        return 'Ofrecemos servicios de desarrollo web desde $150 USD. Podemos crear tu página web profesional. ¿Te interesa?';
    } else if (lowerMessage.includes('red') || lowerMessage.includes('router') || lowerMessage.includes('switch')) {
        return 'Contamos con servicios de configuración de redes, routers y switches. Visita la sección de Redes para más información.';
    } else if (lowerMessage.includes('pago') || lowerMessage.includes('paypal')) {
        return 'Aceptamos pagos a través de PayPal de forma segura. ¿Necesitas ayuda con el proceso de pago?';
    } else if (lowerMessage.includes('contacto') || lowerMessage.includes('hablar')) {
        return 'Puedes contactarnos a través de info@caliconnect.com o llamado al +57 300 123 4567';
    } else {
        return 'Gracias por tu mensaje. Un asesor te responderá pronto. ¿Hay algo más en lo que pueda ayudarte?';
    }
}

// ==================== Network Services ====================
function showRouterQuote() {
    showToast('Por favor completa el formulario de contacto', 'success');
    document.getElementById('network-form').scrollIntoView({ behavior: 'smooth' });
}

function showSwitchQuote() {
    showToast('Por favor completa el formulario de contacto', 'success');
    document.getElementById('network-form').scrollIntoView({ behavior: 'smooth' });
}

function initNetworkForm() {
    const form = document.getElementById('network-form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await fetch(`${API_BASE_URL}/network-quotes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showToast('Solicitud enviada correctamente', 'success');
            form.reset();
        } catch (error) {
            console.error('Error sending quote request:', error);
            showToast('Error al enviar la solicitud', 'error');
        }
    });
}

// ==================== Toast Notifications ====================
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span class="ms-2">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    loadProducts();
    initChat();
    initNetworkForm();
    initCarousel();
    
    // Initialize PayPal after a short delay
    setTimeout(initPayPal, 1000);
});

// ==================== Carousel Logic ====================
function initCarousel() {
    const container = document.getElementById('products-container');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');

    if (!container || !nextBtn || !prevBtn) return;

    function getScrollAmount() {
        const card = container.querySelector('.product-card');
        if (card) {
            const gap = 20; // coincide con tu CSS #products-container gap
            return card.offsetWidth + gap;
        }
        return 300;
    }

    nextBtn.onclick = () => container.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    prevBtn.onclick = () => container.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
}
// ==================== Global Scope Export ====================
// Necesario para que los eventos 'onclick' del HTML funcionen correctamente
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.showRouterQuote = showRouterQuote;
window.showSwitchQuote = showSwitchQuote;

