import { Invocable } from "./invocable.js";
import { DatoPrimitivo } from "./nodos.js";
import { Errores } from "../utils/errores.js";

class FuncionNativa extends Invocable {
    constructor(aridad, func) {
        super();
        this.aridad = aridad;
        this.invocar = func;
    }
}

export const embebidas = {
    'time': new FuncionNativa(
        () => 0,
        () => new DatoPrimitivo({ valor: new Date().toISOString(), tipo: "string" })
    ),
    'parseInt': new FuncionNativa(
        (arg) => {
            if (1 !== arg.length) {
                throw new Errores("La cantidad de argumentos no coincide con la cantidad de parámetros necesarios", 0, 0);
            }
            if ("string" !== arg[0].tipo) {
                throw new Errores("Un argumento no coincide con el tipo de un parámetro de la función", 0, 0);
            }
            return;
        },
        (entorno, dato) => {
            const value = parseInt(dato[0].valor);

            if (isNaN(value)) {
                throw new Errores(`El valor '${dato[0].valor}' no puede ser convertido a entero`, 0, 0);
            }

            return new DatoPrimitivo({ valor: value, tipo: "int" });
        }
    ),
    'parsefloat': new FuncionNativa(
        (arg) => {
            if (1 !== arg.length) {
                throw new Errores("La cantidad de argumentos no coincide con la cantidad de parámetros necesarios", 0, 0);
            }
            if ("string" !== arg[0].tipo) {
                throw new Errores("Un argumento no coincide con el tipo de un parámetro de la función", 0, 0);
            }
            return;
        },
        (entorno, dato) => {
            const value = parseFloat(dato[0].valor);

            if (isNaN(value)) {
                throw new Errores(`El valor '${dato[0].valor}' no puede ser convertido a flotante`, 0, 0);
            }
            
            return new DatoPrimitivo({ valor: value, tipo: "float" });
        }
    ),
    'toString': new FuncionNativa(
        (arg) => {
            if (1 !== arg.length) {
                throw new Errores("La cantidad de argumentos no coincide con la cantidad de parámetros necesarios", 0, 0);
            }
            const tipoDato = arg[0].tipo;
            if (!["int", "float", "boolean"].includes(tipoDato)) {
                throw new Errores("Un argumento no coincide con el tipo de un parámetro de la función", 0, 0);
            }
            return;
        },
        (entorno, dato) => {
            const value = String(dato[0].valor);             
            return new DatoPrimitivo({ valor: value, tipo: "string" });
        }
    ),
    'toLowerCase': new FuncionNativa(
        (arg) => {
            if (1 !== arg.length) {
                throw new Errores("La cantidad de argumentos no coincide con la cantidad de parámetros necesarios", 0, 0);
            }
            if ("string" !== arg[0].tipo) {
                throw new Errores("Un argumento no coincide con el tipo de un parámetro de la función", 0, 0);
            }
            return;
        },
        (entorno, dato) => {
            const value = String(dato[0].valor).toLowerCase();           
            return new DatoPrimitivo({ valor: value, tipo: "string" });
        }
    ),
    'toUpperCase': new FuncionNativa(
        (arg) => {
            if (1 !== arg.length) {
                throw new Errores("La cantidad de argumentos no coincide con la cantidad de parámetros necesarios", 0, 0);
            }
            if ("string" !== arg[0].tipo) {
                throw new Errores("Un argumento no coincide con el tipo de un parámetro de la función", 0, 0);
            }
            return;
        },
        (entorno, dato) => {
            const value = String(dato[0].valor).toUpperCase();           
            return new DatoPrimitivo({ valor: value, tipo: "string" });
        }
    ),
    'typeof': new FuncionNativa(
        (arg) => {
            if (1 !== arg.length) {
                throw new Errores("La cantidad de argumentos no coincide con la cantidad de parámetros necesarios", 0, 0);
            }
            return;
        },
        (entorno, dato) => {
            const value = dato[0].tipo;           
            return new DatoPrimitivo({ valor: value, tipo: "string" });
        }
    ),
};

export { FuncionNativa };
