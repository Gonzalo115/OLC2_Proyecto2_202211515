
/**

 * @typedef {import('./nodos.js').Expresion} Expresion


 * @typedef {import('./nodos.js').Aritmetica} Aritmetica


 * @typedef {import('./nodos.js').Operacion_Unaria} Operacion_Unaria


 * @typedef {import('./nodos.js').Comparacion} Comparacion


 * @typedef {import('./nodos.js').Relacional} Relacional


 * @typedef {import('./nodos.js').Logico} Logico


 * @typedef {import('./nodos.js').Agrupacion} Agrupacion


 * @typedef {import('./nodos.js').DatoPrimitivo} DatoPrimitivo


 * @typedef {import('./nodos.js').DeclaracionVariable} DeclaracionVariable


 * @typedef {import('./nodos.js').ReferenciaVariable} ReferenciaVariable


 * @typedef {import('./nodos.js').Asignacion} Asignacion


 * @typedef {import('./nodos.js').Incremento} Incremento


 * @typedef {import('./nodos.js').Decremento} Decremento


 * @typedef {import('./nodos.js').DeclaracionVectores} DeclaracionVectores


 * @typedef {import('./nodos.js').ReferenciaVector} ReferenciaVector


 * @typedef {import('./nodos.js').AsignacionVector} AsignacionVector


 * @typedef {import('./nodos.js').IndexOf} IndexOf


 * @typedef {import('./nodos.js').Join} Join


 * @typedef {import('./nodos.js').Length} Length


 * @typedef {import('./nodos.js').Println} Println


 * @typedef {import('./nodos.js').ExpresionPrintln} ExpresionPrintln


 * @typedef {import('./nodos.js').ExpresionStmt} ExpresionStmt


 * @typedef {import('./nodos.js').Bloque} Bloque


 * @typedef {import('./nodos.js').Ternario} Ternario


 * @typedef {import('./nodos.js').If} If


 * @typedef {import('./nodos.js').Switch} Switch


 * @typedef {import('./nodos.js').Caso} Caso


 * @typedef {import('./nodos.js').While} While


 * @typedef {import('./nodos.js').For} For


 * @typedef {import('./nodos.js').Break} Break


 * @typedef {import('./nodos.js').Continue} Continue


 * @typedef {import('./nodos.js').Return} Return


 * @typedef {import('./nodos.js').Llamada} Llamada


 * @typedef {import('./nodos.js').FuncDcl} FuncDcl


 * @typedef {import('./nodos.js').Parametro} Parametro

 */


/**
 * Clase base para los visitantes
 * @abstract
 */
export class BaseVisitor {

    
    /**
     * @param {Expresion} node
     * @returns {any}
     */
    visitExpresion(node) {
        throw new Error('Metodo visitExpresion no implementado');
    }
    

    /**
     * @param {Aritmetica} node
     * @returns {any}
     */
    visitAritmetica(node) {
        throw new Error('Metodo visitAritmetica no implementado');
    }
    

    /**
     * @param {Operacion_Unaria} node
     * @returns {any}
     */
    visitOperacion_Unaria(node) {
        throw new Error('Metodo visitOperacion_Unaria no implementado');
    }
    

    /**
     * @param {Comparacion} node
     * @returns {any}
     */
    visitComparacion(node) {
        throw new Error('Metodo visitComparacion no implementado');
    }
    

    /**
     * @param {Relacional} node
     * @returns {any}
     */
    visitRelacional(node) {
        throw new Error('Metodo visitRelacional no implementado');
    }
    

    /**
     * @param {Logico} node
     * @returns {any}
     */
    visitLogico(node) {
        throw new Error('Metodo visitLogico no implementado');
    }
    

    /**
     * @param {Agrupacion} node
     * @returns {any}
     */
    visitAgrupacion(node) {
        throw new Error('Metodo visitAgrupacion no implementado');
    }
    

    /**
     * @param {DatoPrimitivo} node
     * @returns {any}
     */
    visitDatoPrimitivo(node) {
        throw new Error('Metodo visitDatoPrimitivo no implementado');
    }
    

    /**
     * @param {DeclaracionVariable} node
     * @returns {any}
     */
    visitDeclaracionVariable(node) {
        throw new Error('Metodo visitDeclaracionVariable no implementado');
    }
    

    /**
     * @param {ReferenciaVariable} node
     * @returns {any}
     */
    visitReferenciaVariable(node) {
        throw new Error('Metodo visitReferenciaVariable no implementado');
    }
    

    /**
     * @param {Asignacion} node
     * @returns {any}
     */
    visitAsignacion(node) {
        throw new Error('Metodo visitAsignacion no implementado');
    }
    

    /**
     * @param {Incremento} node
     * @returns {any}
     */
    visitIncremento(node) {
        throw new Error('Metodo visitIncremento no implementado');
    }
    

    /**
     * @param {Decremento} node
     * @returns {any}
     */
    visitDecremento(node) {
        throw new Error('Metodo visitDecremento no implementado');
    }
    

    /**
     * @param {DeclaracionVectores} node
     * @returns {any}
     */
    visitDeclaracionVectores(node) {
        throw new Error('Metodo visitDeclaracionVectores no implementado');
    }
    

    /**
     * @param {ReferenciaVector} node
     * @returns {any}
     */
    visitReferenciaVector(node) {
        throw new Error('Metodo visitReferenciaVector no implementado');
    }
    

    /**
     * @param {AsignacionVector} node
     * @returns {any}
     */
    visitAsignacionVector(node) {
        throw new Error('Metodo visitAsignacionVector no implementado');
    }
    

    /**
     * @param {IndexOf} node
     * @returns {any}
     */
    visitIndexOf(node) {
        throw new Error('Metodo visitIndexOf no implementado');
    }
    

    /**
     * @param {Join} node
     * @returns {any}
     */
    visitJoin(node) {
        throw new Error('Metodo visitJoin no implementado');
    }
    

    /**
     * @param {Length} node
     * @returns {any}
     */
    visitLength(node) {
        throw new Error('Metodo visitLength no implementado');
    }
    

    /**
     * @param {Println} node
     * @returns {any}
     */
    visitPrintln(node) {
        throw new Error('Metodo visitPrintln no implementado');
    }
    

    /**
     * @param {ExpresionPrintln} node
     * @returns {any}
     */
    visitExpresionPrintln(node) {
        throw new Error('Metodo visitExpresionPrintln no implementado');
    }
    

    /**
     * @param {ExpresionStmt} node
     * @returns {any}
     */
    visitExpresionStmt(node) {
        throw new Error('Metodo visitExpresionStmt no implementado');
    }
    

    /**
     * @param {Bloque} node
     * @returns {any}
     */
    visitBloque(node) {
        throw new Error('Metodo visitBloque no implementado');
    }
    

    /**
     * @param {Ternario} node
     * @returns {any}
     */
    visitTernario(node) {
        throw new Error('Metodo visitTernario no implementado');
    }
    

    /**
     * @param {If} node
     * @returns {any}
     */
    visitIf(node) {
        throw new Error('Metodo visitIf no implementado');
    }
    

    /**
     * @param {Switch} node
     * @returns {any}
     */
    visitSwitch(node) {
        throw new Error('Metodo visitSwitch no implementado');
    }
    

    /**
     * @param {Caso} node
     * @returns {any}
     */
    visitCaso(node) {
        throw new Error('Metodo visitCaso no implementado');
    }
    

    /**
     * @param {While} node
     * @returns {any}
     */
    visitWhile(node) {
        throw new Error('Metodo visitWhile no implementado');
    }
    

    /**
     * @param {For} node
     * @returns {any}
     */
    visitFor(node) {
        throw new Error('Metodo visitFor no implementado');
    }
    

    /**
     * @param {Break} node
     * @returns {any}
     */
    visitBreak(node) {
        throw new Error('Metodo visitBreak no implementado');
    }
    

    /**
     * @param {Continue} node
     * @returns {any}
     */
    visitContinue(node) {
        throw new Error('Metodo visitContinue no implementado');
    }
    

    /**
     * @param {Return} node
     * @returns {any}
     */
    visitReturn(node) {
        throw new Error('Metodo visitReturn no implementado');
    }
    

    /**
     * @param {Llamada} node
     * @returns {any}
     */
    visitLlamada(node) {
        throw new Error('Metodo visitLlamada no implementado');
    }
    

    /**
     * @param {FuncDcl} node
     * @returns {any}
     */
    visitFuncDcl(node) {
        throw new Error('Metodo visitFuncDcl no implementado');
    }
    

    /**
     * @param {Parametro} node
     * @returns {any}
     */
    visitParametro(node) {
        throw new Error('Metodo visitParametro no implementado');
    }
    
}
