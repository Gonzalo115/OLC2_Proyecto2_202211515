const dropbtn = document.querySelector('.dropbtn');
const dropdown = document.querySelector('.dropdown');

const dropbtn2 = document.querySelector('.dropbtn2');
const dropdown2 = document.querySelector('.dropdown2');

const abrirBtn = document.querySelector('#abrir');
const copyBtn  = document.querySelector('#copy')
const fileInput = document.querySelector('#fileInput');
const textAreaEditor = document.querySelector('#textAreaEditor');
const textAreaConsola = document.querySelector('#textAreaConsola');


// Cuando se hace clic en el botón "Copy" se copiara el texto del textAreaConsola
copyBtn.addEventListener('click', () => {
        // Selecciona el texto dentro del textarea
        textAreaConsola.select();

        // Copia el texto al portapapeles
        document.execCommand('copy');
});


// Prevenir el comportamiento por defecto del formulario
document.getElementById('mainForm').addEventListener('submit', (event) => {
    event.preventDefault();
});

// Cuando se hace clic en el botón del archivo, se alterna la clase 'show' en el contenedor del menú desplegable
dropbtn.addEventListener('click', () => {
    dropdown.classList.toggle('show');
});

// Cuando se hace clic en el botón del reporte, se alterna la clase 'show' en el contenedor del menú desplegable
dropbtn2.addEventListener('click', () => {
    dropdown2.classList.toggle('show');
});

// Cuando se hace clic en el botón "Abrir", se activa el input file
abrirBtn.addEventListener('click', () => {
    fileInput.click();
});

// Cuando se selecciona un archivo, se lee y se muestra su contenido en el textarea
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            textAreaEditor.value = e.target.result;
        };
        reader.readAsText(file);
    }
});

// Cierra el menú si se hace clic fuera de él
window.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target) && !dropbtn.contains(event.target)) {
        dropdown.classList.remove('show');
    }
    if (!dropdown2.contains(event.target) && !dropbtn2.contains(event.target)) {
        dropdown2.classList.remove('show');
    }
});
