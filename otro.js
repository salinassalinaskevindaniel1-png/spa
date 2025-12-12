// ==========================================================
// app.js - Lógica Principal del Spa de Mascotas
// Creado por: [Nombre del Estudiante]
// Objetivo: Usar JS vanilla, arrays y objetos.
// ==========================================================

// --- 1. SIMULACIÓN DE DATOS (NUESTROS ARRAYS DE OBJETOS) ---

// Intentamos cargar lo que ya tenemos en el navegador, si no hay nada, inicializamos vacíos.
let owners = JSON.parse(localStorage.getItem('owners')) || [];
let pets = JSON.parse(localStorage.getItem('pets')) || [];
let agenda = JSON.parse(localStorage.getItem('agenda')) || [];
let cart = JSON.parse(sessionStorage.getItem('cart')) || []; // El carrito solo dura la sesión

// Catálogo Fijo para la tienda (RF-C01)
const CATALOGO = [
    { id: 1, name: "Comida Seca Pro (3kg)", price: 35.00, type: "Producto" },
    { id: 2, name: "Cama Suave para Gato", price: 28.50, type: "Producto" },
    { id: 3, name: "Servicio de Baño y Cepillado", price: 20.00, type: "Servicio" },
    { id: 4, name: "Juguete de Pelota Flotante", price: 10.00, type: "Producto" },
    { id: 5, name: "Corte de Uñas Express", price: 8.00, type: "Servicio" }
];

// Credenciales Simples para Login (RF-L02)
const CREDENCIALES = { username: "admin", password: "123" };
let isLogged = sessionStorage.getItem('isLogged') === 'true'; // Estado de la sesión

const IVA = 0.19; // 19% de impuestos

// Función para guardar los 3 arrays principales en localStorage
function guardarDatos() {
    localStorage.setItem('owners', JSON.stringify(owners));
    localStorage.setItem('pets', JSON.stringify(pets));
    localStorage.setItem('agenda', JSON.stringify(agenda));
    console.log("Datos de registro y agenda guardados en localStorage.");
}

// Función para guardar el carrito en sessionStorage
function guardarCarrito() {
    sessionStorage.setItem('cart', JSON.stringify(cart));
}


// --- 2. GESTIÓN DE SESIÓN (MÓDULO 0) ---

// Referencias de elementos clave (DOM)
const loginView = document.getElementById('login-view');
const systemContainer = document.getElementById('system-container');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const logoutBtn = document.getElementById('logout-btn');
const navLinks = document.querySelectorAll('.nav-link');

// Función para cambiar entre la vista de Login y el Sistema
function actualizarVista(logueado) {
    if (logueado) {
        // Entrar
        loginView.classList.add('hidden');
        systemContainer.classList.remove('hidden');
        sessionStorage.setItem('isLogged', 'true');
        mostrarModulo('dashboard'); 
        renderizarCatalogo();
        renderizarAgenda();
    } else {
        // Salir
        loginView.classList.remove('hidden');
        systemContainer.classList.add('hidden');
        sessionStorage.removeItem('isLogged');
    }
}

// Evento de Login (RF-L01, RF-L02)
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === CREDENCIALES.username && pass === CREDENCIALES.password) {
        loginMessage.textContent = "";
        actualizarVista(true);
        alert("¡Bienvenido al sistema!"); // Feedback simple
    } else {
        loginMessage.textContent = "Usuario o Contraseña incorrectos. Intenta con 'admin' / '123'.";
    }
});

// Evento de Cerrar Sesión (RF-L03)
logoutBtn.addEventListener('click', function() {
    // Se resetea el carrito al salir (por seguridad de la sesión)
    cart = [];
    guardarCarrito(); 
    alert("Sesión cerrada correctamente.");
    actualizarVista(false);
});

// Manejo de la navegación entre módulos
function mostrarModulo(moduleId) {
    // Ocultar todos los módulos primero
    document.querySelectorAll('.module').forEach(m => {
        m.classList.add('hidden');
    });

    // Mostrar el módulo solicitado
    document.getElementById(moduleId).classList.remove('hidden');
    
    // Marcar el enlace activo
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-module') === moduleId) {
            link.classList.add('active');
        }
    });

    // Si entramos al carrito o agenda, refrescar los datos
    if (moduleId === 'carrito') renderizarCarrito();
    if (moduleId === 'agenda') renderizarAgenda();
}

// Eventos de la barra de navegación
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        mostrarModulo(this.getAttribute('data-module'));
    });
});


// --- 3. MÓDULO DE REGISTRO ---

const ownerForm = document.getElementById('owner-form');
const petForm = document.getElementById('pet-form');

// 3.1 Registrar Dueño (RF-R01)
ownerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newOwner = {
        id: owners.length + 1,
        name: document.getElementById('owner-name').value,
        phone: document.getElementById('owner-phone').value,
        email: document.getElementById('owner-email').value
    };

    if (owners.some(o => o.email === newOwner.email)) {
        alert('Error: Este email ya está registrado para otro dueño.');
        return;
    }

    owners.push(newOwner);
    guardarDatos();
    ownerForm.reset();
    alert(`Dueño ${newOwner.name} registrado! ID: ${newOwner.id}`);
});

// 3.2 Registrar Mascota (RF-R02)
petForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const ownerEmail = document.getElementById('pet-owner').value;
    const owner = owners.find(o => o.email === ownerEmail); // Buscar el objeto dueño

    if (!owner) {
        alert('Error: No se encontró un dueño con ese email. ¡Regístrelo primero!');
        return;
    }

    const newPet = {
        id: pets.length + 1,
        name: document.getElementById('pet-name').value,
        species: document.getElementById('pet-species').value,
        breed: document.getElementById('pet-breed').value,
        ownerEmail: owner.email // Usamos el email como referencia
    };

    pets.push(newPet);
    guardarDatos();
    petForm.reset();
    alert(`Mascota ${newPet.name} de ${owner.name} registrada!`);
});


// --- 4. MÓDULO DE AGENDA ---

const agendaForm = document.getElementById('agenda-form');
const agendadosList = document.getElementById('agendados-list');
const agendaMessage = document.getElementById('agenda-message');

// 4.1 Agendar Servicio (RF-A01, RF-A02)
agendaForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const cita = {
        id: agenda.length + 1,
        date: document.getElementById('agenda-date').value,
        time: document.getElementById('agenda-time').value,
        petName: document.getElementById('agenda-pet').value,
        service: document.getElementById('agenda-service').value
    };

    // Validación simple de mascota (comprobar si existe, aunque no es estricto)
    const petExists = pets.some(p => p.name.toLowerCase() === cita.petName.toLowerCase());
    
    if (!petExists) {
        agendaMessage.textContent = `AVISO: La mascota '${cita.petName}' no está registrada, pero la cita se guardó.`;
    } else {
        agendaMessage.textContent = `Cita para ${cita.petName} agendada con éxito!`;
    }

    agenda.push(cita);
    guardarDatos(); 
    agendaForm.reset();
    renderizarAgenda();
});

// 4.2 Mostrar Citas
function renderizarAgenda() {
    if (agenda.length === 0) {
        agendadosList.innerHTML = '<p>No hay citas programadas.</p>';
        return;
    }

    // Usamos map y join para construir el HTML de la lista
    const listaHTML = agenda.map(item => {
        return `
            <li>
                [ID: ${item.id}] El **${item.date}** a las **${item.time}**: 
                Servicio de **${item.service}** para la mascota **${item.petName}**.
            </li>
        `;
    }).join(''); // Unir todos los elementos del array en un solo string

    agendadosList.innerHTML = `<ul>${listaHTML}</ul>`;
}


// --- 5. MÓDULO DE CARRITO DE COMPRAS ---

const catalogoContainer = document.getElementById('catalogo-container');
const cartItemsBody = document.getElementById('cart-items-body');
const cartSubtotalSpan = document.getElementById('cart-subtotal');
const cartTaxSpan = document.getElementById('cart-tax');
const cartTotalSpan = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');


// 5.1 Renderizar Catálogo (RF-C01)
function renderizarCatalogo() {
    catalogoContainer.innerHTML = ''; 

    CATALOGO.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('catalogo-item');
        itemDiv.innerHTML = `
            <h4>${item.name} (${item.type})</h4>
            <p class="price">$${item.price.toFixed(2)}</p>
            <button class="btn success" data-id="${item.id}">
                ¡Añadir al Carrito! (RF-C02)
            </button>
        `;
        
        // Agregar evento al botón (RF-C02)
        itemDiv.querySelector('button').addEventListener('click', () => {
            agregarAlCarrito(item.id);
        });
        catalogoContainer.appendChild(itemDiv);
    });
}

// 5.2 Agregar al Carrito (RF-C02)
function agregarAlCarrito(itemId) {
    const itemToAdd = CATALOGO.find(item => item.id === itemId);

    const existingItem = cart.find(cartItem => cartItem.id === itemId);

    if (existingItem) {
        existingItem.quantity += 1; // Si existe, solo aumentar la cantidad
    } else {
        // Si no existe, agregar el objeto completo con quantity: 1
        cart.push({ ...itemToAdd, quantity: 1 });
    }

    guardarCarrito();
    renderizarCarrito(); // Actualizar la vista
    console.log("Item agregado. Carrito actual:", cart);
}

// 5.3 Renderizar el Carrito (RF-C03)
function renderizarCarrito() {
    cartItemsBody.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">El carrito está vacío. ¡A comprar!</td></tr>';
        actualizarTotales();
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        
        const row = cartItemsBody.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
                <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="cart-quantity-input" style="width: 50px;">
            </td>
            <td>$${itemTotal.toFixed(2)}</td>
            <td><button class="btn danger remove-item-btn" data-id="${item.id}">X</button></td>
        `;
    });

    // Añadir eventos a los botones de quitar y a los inputs de cantidad
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.dataset.id);
            quitarDelCarrito(itemId);
        });
    });

    document.querySelectorAll('.cart-quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const itemId = parseInt(e.target.dataset.id);
            const newQuantity = parseInt(e.target.value);
            // Si la cantidad es 0 o menos, lo quitamos
            if (newQuantity < 1) {
                quitarDelCarrito(itemId);
            } else {
                actualizarCantidad(itemId, newQuantity);
            }
        });
    });

    actualizarTotales();
}

// 5.4 Funciones de apoyo para el Carrito
function actualizarCantidad(itemId, newQuantity) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity = newQuantity;
        guardarCarrito();
        renderizarCarrito();
    }
}

function quitarDelCarrito(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    guardarCarrito();
    renderizarCarrito();
    alert(`Item con ID ${itemId} quitado del carrito.`);
}

// 5.5 Calcular y Mostrar Totales (RF-C04)
function actualizarTotales() {
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const tax = subtotal * IVA;
    const total = subtotal + tax;

    // Actualizar los elementos en el DOM
    cartSubtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
    cartTaxSpan.textContent = `$${tax.toFixed(2)}`;
    cartTotalSpan.textContent = `$${total.toFixed(2)}`;
}

// Evento de "Pagar Ahora"
checkoutBtn.addEventListener('click', function() {
    if (cart.length === 0) {
        alert('El carrito está vacío. ¡No hay nada que pagar!');
        return;
    }
    
    alert(`¡Gracias por su compra! Se procesó un pago de ${cartTotalSpan.textContent}.`);
    
    // Limpiar el carrito después del checkout
    cart = [];
    guardarCarrito();
    renderizarCarrito();
});


// --- 6. INICIALIZACIÓN AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    // Si ya estamos logueados de una sesión anterior, entramos directo
    if (isLogged) {
        actualizarVista(true);
    } 
    // Si no, la vista de login es visible por defecto (RF-L01)
});