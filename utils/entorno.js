import { Errores } from "./errores.js";
//import { DatoPrimitivo } from './nodos.js'

export class Entorno {

    /**
        * @param {Entorno} entornoAnterior
     */
    constructor(entornoAnterior = undefined) {
        this.valores = {};
        this.entornoAnterior = entornoAnterior;
    }

    /**
     * @param {string} nombre
     * @param {any} valor
     */
    set(nombre, valor) {
        const exist = this.valores[nombre];
        if (valor.hasOwnProperty(exist)) {
            throw new Errores(`La variable "${nombre}" ya existe`, valor.location.start.line, valor.location.start.column)
        }

        this.valores[nombre] = valor;
    }

    /**
     * @param {string} nombre
     */
    get(nombre, start) {
        const valorActual = this.valores[nombre];

        if (valorActual) return valorActual;

        if (!valorActual && this.entornoAnterior) {
            return this.entornoAnterior.get(nombre, start);
        }
        throw new Errores(`La variable "${nombre}" no definida `, start.line, start.column)

    }

    /**
   * @param {string} nombre
   * @param {any} valor
   */
    assign(nombre, valor) {
        const valorActual = this.valores[nombre];
        if (valorActual) {
            if (this.valores[nombre].tipo != valor.tipo) {
                valor.tipo = "null"
                valor.valor = "null"
                this.valores[nombre] = valor;
                throw new Errores(`A la variable "${nombre}" no se le puede asinar otro tipo de dato que no sea ${this.valores[nombre].tipo}`, valor.location.start.line, valor.location.start.column)
            }

            this.valores[nombre] = valor;
            return;
        }

        if (!valorActual && this.entornoAnterior) {
            this.entornoAnterior.assign(nombre, valor);
            return;
        }
        throw new Errores(`La variable "${nombre}" no definida `, valor.location.start.line, valor.location.start.column)
    }


    incremento(nombre, valor) {
        const valorActual = this.valores[nombre];
        if (valorActual) {
            if (this.valores[nombre].tipo == "int") {
                if (valor.tipo == "int") {
                    valorActual.valor = valorActual.valor + valor.valor
                    return this.valores[nombre] = valorActual
                }
                throw new Errores(`A la variable "${nombre}" no se le puede incrementar con un valor ${valor.tipo}`, valor.location.start.line, valor.location.start.column)

            }
            if (this.valores[nombre].tipo == "float") {
                if (valor.tipo == "int" || valor.tipo == "float") {
                    valorActual.valor = valorActual.valor + valor.valor
                    return this.valores[nombre] = valorActual
                }
                throw new Errores(`A la variable "${nombre}" no se le puede incrementar con un valor ${valor.tipo}`, valor.location.start.line, valor.location.start.column)
            }
            if (this.valores[nombre].tipo == "string") {
                if (valor.tipo == "string") {
                    valorActual.valor = valorActual.valor + valor.valor
                    return this.valores[nombre] = valorActual
                }
                throw new Errores(`A la variable "${nombre}" no se le puede incrementar con un valor ${valor.tipo}`, valor.location.start.line, valor.location.start.column)
            }

            throw new Errores(`A la variable "${nombre}" no se le puede incrementar`, valor.location.start.line, valor.location.start.column)

        }

        if (!valorActual && this.entornoAnterior) {
            this.entornoAnterior.incremento(nombre, valor);
            return;
        }
        throw new Errores(`La variable "${nombre}" no definida `, valor.location.start.line, valor.location.start.column)
    }

    decremento(nombre, valor) {
        const valorActual = this.valores[nombre];
        if (valorActual) {
            if (this.valores[nombre].tipo == "int") {
                if (valor.tipo == "int") {
                    valorActual.valor = valorActual.valor - valor.valor
                    return this.valores[nombre] = valorActual
                }
                throw new Errores(`A la variable "${nombre}" no se le puede incrementar con un valor ${valor.tipo}`, valor.location.start.line, valor.location.start.column)

            }
            if (this.valores[nombre].tipo == "float") {
                if (valor.tipo == "int" || valor.tipo == "float") {
                    valorActual.valor = valorActual.valor - valor.valor
                    return this.valores[nombre] = valorActual
                }
                throw new Errores(`A la variable "${nombre}" no se le puede incrementar con un valor ${valor.tipo}`, valor.location.start.line, valor.location.start.column)
            }

            throw new Errores(`A la variable "${nombre}" no se le puede incrementar`, valor.location.start.line, valor.location.start.column)

        }

        if (!valorActual && this.entornoAnterior) {
            this.entornoAnterior.decremento(nombre, valor);
            return;
        }
        throw new Errores(`La variable "${nombre}" no definida `, valor.location.start.line, valor.location.start.column)
    }
}