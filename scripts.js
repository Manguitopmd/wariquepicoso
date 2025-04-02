/* Funciones generales (usadas en todas las páginas) */
function loadSection(section) {
    const content = document.getElementById('content');
    let url = '';

    switch (section) {
        case 'inicio':
            url = 'inicio.html';
            break;
        case 'contacto':
            url = 'contacto.html';
            break;
        case 'carta':
            url = 'carta.html';
            break;
        default:
            content.innerHTML = `
                <div class="error-message">
                    <h3>¡Vaya!</h3>
                    <p>Parece que esta sección no está disponible ahora.</p>
                </div>
            `;
            updateActiveNav(section);
            return;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`No se pudo cargar ${url}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            content.innerHTML = data;
            updateActiveNav(section);
            // Guardar la sección activa en localStorage
            localStorage.setItem('activeSection', section);

            if (section === 'inicio') {
                initSlider();
            } else if (section === 'contacto') {
                initMap();
                initReserveForm();
                initDirections();
            } else if (section === 'carta') {
                initCarta();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            content.innerHTML = `
                <div class="error-message">
                    <h3>¡Oh no!</h3>
                    <p>No pudimos cargar esta sección, intenta de nuevo más tarde.</p>
                </div>
            `;
            updateActiveNav(section);
        });
}

function updateActiveNav(section) {
    document.querySelectorAll('.bottom-nav button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.onclick.toString().includes(`'${section}'`)) btn.classList.add('active');
    });
}

// Cargar la sección guardada al iniciar o actualizar la página
window.onload = function() {
    const activeSection = localStorage.getItem('activeSection') || 'inicio'; // Por defecto 'inicio' si no hay nada guardado
    loadSection(activeSection);
};

/* Funciones para index.html (inicio.html) */
function initSlider() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) slide.classList.add('active');
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    const slideInterval = setInterval(nextSlide, 5000);

    let touchStartX = 0;
    let touchEndX = 0;

    const slider = document.querySelector('.slider');
    if (slider) {
        slider.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        slider.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) {
                nextSlide();
            } else if (touchEndX - touchStartX > 50) {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                showSlide(currentSlide);
            }
        });
    }
}

/* Funciones para contacto.html */
function initMap() {
    const mapElement = document.getElementById('map');
    if (mapElement && !mapElement.hasAttribute('data-initialized')) {
        const map = L.map('map').setView([-4.586632, -81.266811], 17);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        L.marker([-4.586632, -81.266811]).addTo(map)
            .bindPopup('Warique Picoso')
            .openPopup();
        mapElement.setAttribute('data-initialized', 'true');
    }
}

function initReserveForm() {
    const form = document.getElementById('reserve-form');
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    const modalBack = document.getElementById('modal-back');
    const modalConfirm = document.getElementById('modal-confirm');

    if (form && modal && modalMessage && modalBack && modalConfirm) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const people = document.getElementById('people').value;

            if (!name) {
                alert('Por favor, ingresa tu nombre.');
                return;
            }
            if (!date) {
                alert('Por favor, selecciona una fecha.');
                return;
            }
            if (!time) {
                alert('Por favor, selecciona una hora.');
                return;
            }
            if (!people || people < 1) {
                alert('Por favor, ingresa la cantidad de personas (mínimo 1).');
                return;
            }

            modalMessage.innerHTML = `
                Revisa tu reserva:<br>
                <strong>Nombre:</strong> ${name}<br>
                <strong>Fecha:</strong> ${date}<br>
                <strong>Hora:</strong> ${time}<br>
                <strong>Personas:</strong> ${people}<br><br>
                Pronto confirmaremos tu solicitud de reserva.
            `;
            modal.style.display = 'flex';

            modalBack.onclick = () => {
                modal.style.display = 'none';
            };

            modalConfirm.onclick = () => {
                const message = `Nueva reserva:\nNombre: ${name}\nFecha: ${date}\nHora: ${time}\nPersonas: ${people}`;
                const whatsappUrl = `https://wa.me/51945285529?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                modal.style.display = 'none';
                form.reset();
            };
        });
    }
}

function initDirections() {
    const directionsBtn = document.getElementById('directions-btn');
    if (directionsBtn) {
        directionsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const destination = '-4.586632,-81.266811';
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
            window.open(googleMapsUrl, '_blank');
        });
    }
}

function scrollToReserve() {
    setTimeout(() => {
        const reserveSection = document.getElementById('reserve-section');
        if (reserveSection) {
            reserveSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

/* Funciones para carta.html */
function initCarta() {
    const categories = document.querySelectorAll('.category');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const detailsButtons = document.querySelectorAll('.details-btn');
    const modal = document.getElementById('details-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalDetails = document.getElementById('modal-details');
    const modalClose = document.getElementById('modal-close');

    // Llenar la categoría "Todos" dinámicamente
    const allItemsContainer = document.querySelector('.category[data-category="todos"] .items');
    categories.forEach(category => {
        if (category.getAttribute('data-category') !== 'todos') {
            const items = category.querySelectorAll('.item');
            items.forEach(item => {
                const clonedItem = item.cloneNode(true);
                allItemsContainer.appendChild(clonedItem);
            });
        }
    });

    // Manejo de pestañas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            categories.forEach(cat => {
                cat.classList.add('hidden');
                if (cat.getAttribute('data-category') === category) {
                    cat.classList.remove('hidden');
                }
            });
        });
    });

    // Modal de detalles
    document.querySelectorAll('.details-btn').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('.item');
            const imageSrc = item.querySelector('.item-image').src;
            const title = item.querySelector('h4').textContent;
            const price = item.querySelector('.price').textContent;
            const details = button.getAttribute('data-details');

            modalImage.src = imageSrc;
            modalTitle.textContent = title;
            modalPrice.textContent = price;
            modalDetails.textContent = details;
            modal.style.display = 'flex';
        });
    });

    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}