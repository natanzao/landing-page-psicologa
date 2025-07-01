// --- Carrossel de Imagens ---
let slideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;

function showSlides(n) {
    slideIndex = (n + totalSlides) % totalSlides; // Garante que o índice esteja dentro dos limites
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.style.transform = `translateX(${-slideIndex * 100}%)`;
}

function plusSlides(n) {
    showSlides(slideIndex + n);
}

// Auto-play do carrossel
let autoPlayInterval = setInterval(() => {
    plusSlides(1);
}, 5000); // Muda a imagem a cada 5 segundos

// Pausar auto-play ao interagir com os botões (opcional, para melhor UX)
document.querySelector('.prev').addEventListener('click', () => {
    clearInterval(autoPlayInterval);
    plusSlides(-1);
    autoPlayInterval = setInterval(() => { plusSlides(1); }, 5000); // Reinicia o auto-play
});

document.querySelector('.next').addEventListener('click', () => {
    clearInterval(autoPlayInterval);
    plusSlides(1);
    autoPlayInterval = setInterval(() => { plusSlides(1); }, 5000); // Reinicia o auto-play
});

showSlides(slideIndex); // Mostra o primeiro slide ao carregar

// --- Rolagem Suave para o Menu ---
document.querySelectorAll('header nav ul.nav-links li a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Fecha o menu sanduíche ao clicar em um link
        const navLinks = document.querySelector('.nav-links');
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// --- Funcionalidade do Formulário de Contato e Pop-up com Validações ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica do Menu Sanduíche ---
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    const contactForm = document.getElementById('contactForm');
    const popup = document.getElementById('popup');
    const closeBtn = document.querySelector('.popup .close-btn');

    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    const emailError = document.getElementById('emailError');
    const phoneError = document.getElementById('phoneError');
    const messageError = document.getElementById('messageError');

    // Limpa o formulário e as mensagens de erro ao carregar a página
    if (contactForm) {
        contactForm.reset();
        emailError.textContent = '';
        phoneError.textContent = '';
        messageError.textContent = '';
        emailInput.classList.remove('invalid');
        phoneInput.classList.remove('invalid');
        messageInput.classList.remove('invalid');
    }

    // --- Máscara de Telefone ---
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
            let formattedValue = '';

            if (value.length > 0) {
                formattedValue += '(' + value.substring(0, 2);
            }
            if (value.length > 2) {
                formattedValue += ') ' + value.substring(2, 7);
            }
            if (value.length > 7) {
                formattedValue += '-' + value.substring(7, 11);
            }
            e.target.value = formattedValue;

            // Limita o número de caracteres para evitar mais de 11 dígitos no formato final
            if (value.length > 11) {
                e.target.value = e.target.value.substring(0, 15); // (XX) XXXXX-XXXX
            }
        });
    }

    // Função de validação de e-mail
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // Função de validação de telefone (formato opcional para (XX) XXXXX-XXXX ou XXXXXXXXXXX)
    function validatePhone(phone) {
        if (phone === "") return true; // Telefone é opcional, então string vazia é válida
        // Regex mais específica para o formato com a máscara: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
        const re = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
        // Remove não-dígitos para a validação (permitindo tanto 10 quanto 11 dígitos p/ celular)
        const digitsOnly = phone.replace(/\D/g, '');
        return (digitsOnly.length === 10 || digitsOnly.length === 11) && re.test(phone);
    }

    // Função de validação da mensagem (mínimo de palavras)
    function validateMessage(message) {
        const words = message.trim().split(/\s+/); // Divide por espaços e remove vazios
        return words.length >= 4;
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            let isValid = true;

            // Validação do Email
            if (!validateEmail(emailInput.value)) {
                emailError.textContent = 'Por favor, insira um e-mail válido.';
                emailInput.classList.add('invalid'); // Adiciona classe para estilo de erro
                isValid = false;
            } else {
                emailError.textContent = '';
                emailInput.classList.remove('invalid');
            }

            // Validação do Telefone (opcional, só valida se preenchido)
            if (phoneInput.value !== "" && !validatePhone(phoneInput.value)) {
                phoneError.textContent = 'Por favor, insira um telefone válido no formato (XX) XXXXX-XXXX.';
                phoneInput.classList.add('invalid');
                isValid = false;
            } else {
                phoneError.textContent = '';
                phoneInput.classList.remove('invalid');
            }

            // Validação da Mensagem
            if (!validateMessage(messageInput.value)) {
                messageError.textContent = 'A descrição deve ter pelo menos 4 palavras.';
                messageInput.classList.add('invalid'); // Adiciona classe para estilo de erro
                isValid = false;
            } else {
                messageError.textContent = '';
                messageInput.classList.remove('invalid');
            }

            if (!isValid) {
                return; // Impede o envio se a validação falhar
            }

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Envia os dados usando Formspree
            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: JSON.stringify(data),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    popup.style.display = 'flex'; // Exibe o pop-up
                    contactForm.reset(); // Limpa o formulário
                    // Limpa quaisquer mensagens de erro que possam ter ficado
                    emailError.textContent = '';
                    phoneError.textContent = '';
                    messageError.textContent = '';
                    emailInput.classList.remove('invalid');
                    phoneInput.classList.remove('invalid');
                    messageInput.classList.remove('invalid');

                } else {
                    // Se a resposta não for OK, tenta pegar a mensagem de erro do Formspree
                    const errorData = await response.json();
                    let errorMessage = 'Houve um erro ao enviar a mensagem. Por favor, tente novamente.';
                    if (errorData && errorData.error) {
                        errorMessage += ' Erro: ' + errorData.error;
                    }
                    alert(errorMessage);
                    console.error('Erro no envio:', errorData);
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                alert('Houve um erro de conexão. Por favor, tente novamente.');
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            popup.style.display = 'none'; // Esconde o pop-up
        });
    }

    // Fecha o pop-up ao clicar fora dele
    if (popup) {
        window.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.display = 'none';
            }
        });
    }
});