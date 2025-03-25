const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth * 0.8;
canvas.height = 500;

const gato = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 100,
    width: 100,
    height: 100,
    image: new Image()
};
gato.image.src = "assets/gato.png"; // Imagen del gato

const fantasmas = [];
const maxFantasmas = 30; // Cambiado a 30 fantasmas
let puntos = 0;
let gameOver = false;

const sonidoFantasma = new Audio("assets/fantasma.wav");
const sonidoGameOver = new Audio("assets/gameover.mp3");
const sonidoGano = new Audio("assets/gano.wav");

// Cargar imágenes y esperar a que se carguen
gato.image.onload = () => {
    // Al cargar la imagen del gato, comenzamos el juego
    setInterval(crearFantasmas, 500);  // Crear múltiples fantasmas cada 0.5 segundos
    actualizarJuego();
};

const fantasmaImg = new Image();
fantasmaImg.src = "assets/fantasma.png"; // Imagen del fantasma
fantasmaImg.onload = () => {
    // Aquí se cargan los fantasmas
};

function verificarSuperposicion(nuevoFantasma) {
    for (let i = 0; i < fantasmas.length; i++) {
        const fantasmaExistente = fantasmas[i];
        const distancia = Math.sqrt(Math.pow(fantasmaExistente.x - nuevoFantasma.x, 2) + Math.pow(fantasmaExistente.y - nuevoFantasma.y, 2));
        const umbralDeDistancia = fantasmaExistente.width + nuevoFantasma.width;
        if (distancia < umbralDeDistancia) {
            return true; // Hay superposición
        }
    }
    return false; // No hay superposición
}

function crearFantasmas() {
    if (fantasmas.length < maxFantasmas) {
        const cantidadFantasmas = Math.floor(Math.random() * 3) + 1; // Genera entre 1 y 3 fantasmas a la vez

        for (let i = 0; i < cantidadFantasmas; i++) {
            const nuevoFantasma = {
                x: Math.random() * (canvas.width - 50),
                y: -50,
                width: 50 + Math.random() * 50,
                height: 50 + Math.random() * 50,
                velocidad: 1 + Math.random() * 2,  // Velocidad reducida
                image: fantasmaImg
            };
            // Verificar si el nuevo fantasma se superpone con los existentes
            if (!verificarSuperposicion(nuevoFantasma)) {
                fantasmas.push(nuevoFantasma);
            }
        }
    }
}

function actualizarJuego() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(gato.image, gato.x, gato.y, gato.width, gato.height);

    for (let i = 0; i < fantasmas.length; i++) {
        const fantasma = fantasmas[i];

        // Calcular la dirección hacia el gato
        const dx = gato.x + gato.width / 2 - (fantasma.x + fantasma.width / 2);
        const dy = gato.y + gato.height / 2 - (fantasma.y + fantasma.height / 2);
        const distancia = Math.sqrt(dx * dx + dy * dy);

        // Normalizar el movimiento
        const velX = dx / distancia * fantasma.velocidad;
        const velY = dy / distancia * fantasma.velocidad;

        // Mover el fantasma hacia el gato
        fantasma.x += velX;
        fantasma.y += velY;

        // Comprobar si el fantasma llegó al gato con una mejor condición de colisión
        if (
            fantasma.x + fantasma.width > gato.x &&
            fantasma.x < gato.x + gato.width &&
            fantasma.y + fantasma.height > gato.y &&
            fantasma.y < gato.y + gato.height
        ) {
            gameOver = true;
            mostrarGameOver(); // Mostrar mensaje de game over
        }

        ctx.drawImage(fantasma.image, fantasma.x, fantasma.y, fantasma.width, fantasma.height);
    }

    // Si se han eliminado todos los fantasmas, mostrar victoria
    if (puntos >= maxFantasmas) {
        mostrarVictoria();
    } else {
        requestAnimationFrame(actualizarJuego);
    }
}

function eliminarFantasma(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    for (let i = 0; i < fantasmas.length; i++) {
        const fantasma = fantasmas[i];

        if (mouseX > fantasma.x && mouseX < fantasma.x + fantasma.width &&
            mouseY > fantasma.y && mouseY < fantasma.y + fantasma.height) {
            fantasmas.splice(i, 1);
            puntos++;
            document.getElementById("contador").textContent = "Puntos: " + puntos;

            sonidoFantasma.play();
            break;
        }
    }
}

function mostrarVictoria() {
    gameOver = true;
    ctx.fillStyle = "green";
    ctx.font = "50px Arial";
    ctx.fillText("¡Ganaste!", canvas.width / 2 - 150, canvas.height / 2);
    sonidoGano.play();
}

function mostrarGameOver() {
    ctx.fillStyle = "red";
    ctx.font = "50px Arial";
    ctx.fillText("¡Perdiste!", canvas.width / 2 - 150, canvas.height / 2);
    sonidoGameOver.play();
}

canvas.addEventListener("click", eliminarFantasma);
