import { parse } from './analizador/analizador.js'
import { CompilerVisitor } from './compilador/compilador.js'
import { InterpreterVisitor } from './interprete/interprete.js'
import { Errores } from './utils/errores.js'
import { FuncionForanea } from './interprete/foreanea.js'
import { FuncionNativa } from './interprete/embebidas.js'
import { DatoPrimitivo } from "./visitor/nodos.js";


const editor = document.getElementById('textAreaEditor')
const consola = document.getElementById('textAreaConsola')
const btnAnalizar = document.getElementById('analizar')
const btnErrores = document.querySelector('.errores')
const btnTabla   = document.querySelector('.simbolos')


let i =    0;
var erroresSemanticos = [];
var erroresLexiSintac = [];
var entornosG = [];


//Definición de la función de análisis semántico
function analisisSemantico(sentencias, interprete) {
    try {
        while (i < sentencias.length) {
            sentencias[i].accept(interprete);
            i++;
        }
        //consola.value = interprete.salida;
    } catch (error) {
        if (error instanceof Errores) {
            erroresSemanticos.push(error);
            analisisSemantico(sentencias, interprete, i++)
        }
        return error
    }

}



btnAnalizar.addEventListener('click', () => {

    const codigoFuente = editor.value


    // Interprete


    //Area de inicializacion
    i = 0;
    erroresSemanticos = [];
    erroresLexiSintac = [];
    entornosG         = [];


    try {
        const sentencias = parse(codigoFuente)
        const interprete = new InterpreterVisitor()
        console.log({ sentencias })
        analisisSemantico(sentencias, interprete, i)
        entornosG.push(interprete.entornoActual);
    } catch (error) {
        try {
            var errorSintactico = new Errores(error.message, error.location.start.line, error.location.start.column)
            erroresLexiSintac.push(errorSintactico);
        } catch (errorr) {
            console.log(error.message)
        }
    }


    // Compilador

    
    try {


        const sentencias = parse(codigoFuente)
        // ast.innerHTML = JSON.stringify(sentencias, null, 2)

        const compilador = new CompilerVisitor()

        console.log({ sentencias })
        sentencias.forEach(sentencia => sentencia.accept(compilador))

        consola.value = compilador.code.toString()

    } catch (error) {
        console.log(error)
        // console.log(JSON.stringify(error, null, 2))
        consola.value = error.message + ' at line ' + error.location.start.line + ' column ' + error.location.start.column
    }


})


// Evento para el botón de errores
btnErrores.addEventListener('click', () => {
    // Crear el contenido HTML con estilos para la tabla
    var no = 0;
    let html = `
        <style>
            table {
                width: 80%;
                margin: 0 auto;
                border-collapse: collapse;
            }
            thead {
                background-color: #000;
                color: #fff;
                font-weight: bold;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center;
            }
            tbody tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            tbody tr:hover {
                background-color: #ddd;
            }
        </style>
        <table>
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Línea</th>
                    <th>Columna</th>
                </tr>
            </thead>
            <tbody>
    `;

    erroresSemanticos.forEach(error => {
        html += `
            <tr>
                <td>${no}</td>
                <td>Semántico</td>
                <td>${error.error}</td>
                <td>${error.line}</td>
                <td>${error.col}</td>
            </tr>
        `;
        no++;
    });

    erroresLexiSintac.forEach(error => {
        html += `
            <tr>
                <td>${no}</td>
                <td>Sintáctico/Léxico</td>
                <td>${error.error}</td>
                <td>${error.line}</td>
                <td>${error.col}</td>
            </tr>
        `;
        no++;
    });

    html += `
            </tbody>
        </table>
    `;

    // Crear un blob con el contenido HTML
    const blob = new Blob([html], { type: 'text/html' });

    // Crear una URL para el blob
    const url = URL.createObjectURL(blob);

    // Crear un enlace de descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ReporteErrores.html';

    // Simular el clic en el enlace para iniciar la descarga
    a.click();

    // Liberar la URL del blob
    URL.revokeObjectURL(url);
});


// Evento para el botón de errores
btnTabla.addEventListener('click', () => {
    // Crear el contenido HTML con estilos para la tabla
    var no = 0;
    let html = `
        <style>
            table {
                width: 80%;
                margin: 0 auto;
                border-collapse: collapse;
            }
            thead {
                background-color: #000;
                color: #fff;
                font-weight: bold;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center;
            }
            tbody tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            tbody tr:hover {
                background-color: #ddd;
            }
        </style>
        <table>
            <thead>
                <tr>
                    <th>No.</th>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Tipo Simbolo</th>
                    <th>Línea</th>
                    <th>Columna</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Utilizar un bucle for en lugar de forEach para erroresSemanticos
    for (let i = 0; i < erroresSemanticos.length; i++) {
        if (i >= entornosG.length) {
            break;
        }
        const entorno = entornosG[i].valores;
        for (const clave in entorno) {
            if (entorno.hasOwnProperty(clave)) {
                const valor = entorno[clave];
                var tipo = "";
                var tipoDato = "";
                var linea = 0;
                var columna = 0;

                if ( valor instanceof FuncionForanea){
                    tipo = "FuncionForanea"
                    tipoDato = valor.nodo.tipo
                    linea = valor.nodo.location.start.line
                    columna = valor.nodo.location.start.column
                    
                }
                if (valor instanceof FuncionNativa){
                    tipo = "FuncionNativa"
                    tipoDato = "nativa"
                    linea = 0
                    columna = 0
                }

                if ( valor instanceof DatoPrimitivo){
                    tipo = "DatoPrimitivo"
                    tipoDato = valor.tipo
                    linea = valor.location.start.line
                    columna = valor.location.start.column
                }


                html += `
                <tr>
                    <td>${no}</td>
                    <td>${clave}</td>
                    <td>${tipo}</td>
                    <td>${tipoDato}</td>
                    <td>${linea}</td>
                    <td>${columna}</td>
                </tr>
            `;
                no++;
            }
        }
    }


    html += `
            </tbody>
        </table>
    `;

    // Crear un blob con el contenido HTML
    const blob = new Blob([html], { type: 'text/html' });

    // Crear una URL para el blob
    const url = URL.createObjectURL(blob);

    // Crear un enlace de descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TablaSimbolos.html';

    // Simular el clic en el enlace para iniciar la descarga
    a.click();

    // Liberar la URL del blob
    URL.revokeObjectURL(url);
});


