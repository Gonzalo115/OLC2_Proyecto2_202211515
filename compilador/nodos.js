
/**
 * @typedef {Object} Location
 * @property {Object} start
 * @property {number} start.offset
 * @property {number} start.line
 * @property {number} start.column
 * @property {Object} end
 * @property {number} end.offset
 * @property {number} end.line
 * @property {number} end.column
*/
    

/**
 * @typedef {import('./visitor').BaseVisitor} BaseVisitor
 */

export class Expresion  {

    /**
    * @param {Object} options
    * @param {Location|null} options.location Ubicacion del nodo en el codigo fuente
    */
    constructor() {
        
        
        /**
         * Ubicacion del nodo en el codigo fuente
         * @type {Location|null}
        */
        this.location = null;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitExpresion(this);
    }
}
    
export class Aritmetica extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp_left Expresion izquierda de la operacion
 * @param {Expresion} options.exp_right Expresion derecha de la operacion
 * @param {string} options.operacion Operador de la operacion
    */
    constructor({ exp_left, exp_right, operacion }) {
        super();
        
        /**
         * Expresion izquierda de la operacion
         * @type {Expresion}
        */
        this.exp_left = exp_left;


        /**
         * Expresion derecha de la operacion
         * @type {Expresion}
        */
        this.exp_right = exp_right;


        /**
         * Operador de la operacion
         * @type {string}
        */
        this.operacion = operacion;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitAritmetica(this);
    }
}
    
export class Operacion_Unaria extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp_unica Expresion de la operacion
 * @param {string} options.operacion Operador de la operacion
    */
    constructor({ exp_unica, operacion }) {
        super();
        
        /**
         * Expresion de la operacion
         * @type {Expresion}
        */
        this.exp_unica = exp_unica;


        /**
         * Operador de la operacion
         * @type {string}
        */
        this.operacion = operacion;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitOperacion_Unaria(this);
    }
}
    
export class Comparacion extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp_left Expresion izquierda de la operacion
 * @param {Expresion} options.exp_right Expresion derecha de la operacion
 * @param {string} options.operacion Operador de la operacion
    */
    constructor({ exp_left, exp_right, operacion }) {
        super();
        
        /**
         * Expresion izquierda de la operacion
         * @type {Expresion}
        */
        this.exp_left = exp_left;


        /**
         * Expresion derecha de la operacion
         * @type {Expresion}
        */
        this.exp_right = exp_right;


        /**
         * Operador de la operacion
         * @type {string}
        */
        this.operacion = operacion;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitComparacion(this);
    }
}
    
export class Relacional extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp_left Expresion izquierda de la operacion
 * @param {Expresion} options.exp_right Expresion derecha de la operacion
 * @param {string} options.operacion Operador de la operacion
    */
    constructor({ exp_left, exp_right, operacion }) {
        super();
        
        /**
         * Expresion izquierda de la operacion
         * @type {Expresion}
        */
        this.exp_left = exp_left;


        /**
         * Expresion derecha de la operacion
         * @type {Expresion}
        */
        this.exp_right = exp_right;


        /**
         * Operador de la operacion
         * @type {string}
        */
        this.operacion = operacion;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitRelacional(this);
    }
}
    
export class Logico extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp_left Expresion izquierda de la operacion
 * @param {Expresion} options.exp_right Expresion derecha de la operacion
 * @param {string} options.operacion Operador de la operacion
    */
    constructor({ exp_left, exp_right, operacion }) {
        super();
        
        /**
         * Expresion izquierda de la operacion
         * @type {Expresion}
        */
        this.exp_left = exp_left;


        /**
         * Expresion derecha de la operacion
         * @type {Expresion}
        */
        this.exp_right = exp_right;


        /**
         * Operador de la operacion
         * @type {string}
        */
        this.operacion = operacion;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitLogico(this);
    }
}
    
export class Agrupacion extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion agrupada
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion agrupada
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitAgrupacion(this);
    }
}
    
export class DatoPrimitivo extends Expresion {

    /**
    * @param {Object} options
    * @param {any} options.valor Valor del numero
 * @param {string} options.tipo Expresion derecha de la operacion
    */
    constructor({ valor, tipo }) {
        super();
        
        /**
         * Valor del numero
         * @type {any}
        */
        this.valor = valor;


        /**
         * Expresion derecha de la operacion
         * @type {string}
        */
        this.tipo = tipo;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitDatoPrimitivo(this);
    }
}
    
export class DeclaracionVariable extends Expresion {

    /**
    * @param {Object} options
    * @param {any} options.tipo Tipo de la variable
 * @param {string} options.id Identificador de la variable
 * @param {Expresion|undefined} options.exp Expresion de la variable
    */
    constructor({ tipo, id, exp }) {
        super();
        
        /**
         * Tipo de la variable
         * @type {any}
        */
        this.tipo = tipo;


        /**
         * Identificador de la variable
         * @type {string}
        */
        this.id = id;


        /**
         * Expresion de la variable
         * @type {Expresion|undefined}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitDeclaracionVariable(this);
    }
}
    
export class ReferenciaVariable extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la variable
    */
    constructor({ id }) {
        super();
        
        /**
         * Identificador de la variable
         * @type {string}
        */
        this.id = id;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitReferenciaVariable(this);
    }
}
    
export class Asignacion extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la variable
 * @param {Expresion} options.asgn Expresion a asignar
    */
    constructor({ id, asgn }) {
        super();
        
        /**
         * Identificador de la variable
         * @type {string}
        */
        this.id = id;


        /**
         * Expresion a asignar
         * @type {Expresion}
        */
        this.asgn = asgn;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitAsignacion(this);
    }
}
    
export class Incremento extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la variable
 * @param {Expresion} options.valor Expresion a asignar
    */
    constructor({ id, valor }) {
        super();
        
        /**
         * Identificador de la variable
         * @type {string}
        */
        this.id = id;


        /**
         * Expresion a asignar
         * @type {Expresion}
        */
        this.valor = valor;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitIncremento(this);
    }
}
    
export class Decremento extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la variable
 * @param {Expresion} options.valor Expresion a asignar
    */
    constructor({ id, valor }) {
        super();
        
        /**
         * Identificador de la variable
         * @type {string}
        */
        this.id = id;


        /**
         * Expresion a asignar
         * @type {Expresion}
        */
        this.valor = valor;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitDecremento(this);
    }
}
    
export class Println extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a imprimir
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a imprimir
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitPrintln(this);
    }
}
    
export class ExpresionPrintln extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp_left Expresion izquierda de la concatenacion
 * @param {Expresion} options.exp_right Expresion derecha de la concatenacion
    */
    constructor({ exp_left, exp_right }) {
        super();
        
        /**
         * Expresion izquierda de la concatenacion
         * @type {Expresion}
        */
        this.exp_left = exp_left;


        /**
         * Expresion derecha de la concatenacion
         * @type {Expresion}
        */
        this.exp_right = exp_right;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitExpresionPrintln(this);
    }
}
    
export class ExpresionStmt extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a evaluar
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a evaluar
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitExpresionStmt(this);
    }
}
    
export class Bloque extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion[]} options.dcls Sentencias del bloque
    */
    constructor({ dcls }) {
        super();
        
        /**
         * Sentencias del bloque
         * @type {Expresion[]}
        */
        this.dcls = dcls;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitBloque(this);
    }
}
    
export class Ternario extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.cond Condicion del if
 * @param {Expresion} options.expTrue Si la condicion es verdadera
 * @param {Expresion} options.expFalse Si la condicion es falsa
    */
    constructor({ cond, expTrue, expFalse }) {
        super();
        
        /**
         * Condicion del if
         * @type {Expresion}
        */
        this.cond = cond;


        /**
         * Si la condicion es verdadera
         * @type {Expresion}
        */
        this.expTrue = expTrue;


        /**
         * Si la condicion es falsa
         * @type {Expresion}
        */
        this.expFalse = expFalse;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitTernario(this);
    }
}
    
export class If extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.cond Condicion del if
 * @param {Expresion} options.stmtTrue Cuerpo del if
 * @param {Expresion|undefined} options.stmtFalse Cuerpo del else
    */
    constructor({ cond, stmtTrue, stmtFalse }) {
        super();
        
        /**
         * Condicion del if
         * @type {Expresion}
        */
        this.cond = cond;


        /**
         * Cuerpo del if
         * @type {Expresion}
        */
        this.stmtTrue = stmtTrue;


        /**
         * Cuerpo del else
         * @type {Expresion|undefined}
        */
        this.stmtFalse = stmtFalse;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitIf(this);
    }
}
    
export class Switch extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a comparar
 * @param {Casos[]} options.casos Listado de Casos a evaluar
 * @param {Expresion|undefined} options.stmtDefault Instruciones a evaluar
    */
    constructor({ exp, casos, stmtDefault }) {
        super();
        
        /**
         * Expresion a comparar
         * @type {Expresion}
        */
        this.exp = exp;


        /**
         * Listado de Casos a evaluar
         * @type {Casos[]}
        */
        this.casos = casos;


        /**
         * Instruciones a evaluar
         * @type {Expresion|undefined}
        */
        this.stmtDefault = stmtDefault;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitSwitch(this);
    }
}
    
export class Caso extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a comparar
 * @param {Expresion} options.stmt Cuerpo del Caso
    */
    constructor({ exp, stmt }) {
        super();
        
        /**
         * Expresion a comparar
         * @type {Expresion}
        */
        this.exp = exp;


        /**
         * Cuerpo del Caso
         * @type {Expresion}
        */
        this.stmt = stmt;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitCaso(this);
    }
}
    
export class While extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.cond Condicion del while
 * @param {Expresion} options.stmt Cuerpo del while
    */
    constructor({ cond, stmt }) {
        super();
        
        /**
         * Condicion del while
         * @type {Expresion}
        */
        this.cond = cond;


        /**
         * Cuerpo del while
         * @type {Expresion}
        */
        this.stmt = stmt;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitWhile(this);
    }
}
    
export class For extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.init Inicializacion del for
 * @param {Expresion} options.cond Condicion del for
 * @param {Expresion} options.inc Incremento del for
 * @param {Expresion} options.stmt Cuerpo del for
    */
    constructor({ init, cond, inc, stmt }) {
        super();
        
        /**
         * Inicializacion del for
         * @type {Expresion}
        */
        this.init = init;


        /**
         * Condicion del for
         * @type {Expresion}
        */
        this.cond = cond;


        /**
         * Incremento del for
         * @type {Expresion}
        */
        this.inc = inc;


        /**
         * Cuerpo del for
         * @type {Expresion}
        */
        this.stmt = stmt;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitFor(this);
    }
}
    
export class Break extends Expresion {

    /**
    * @param {Object} options
    * 
    */
    constructor() {
        super();
        
    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitBreak(this);
    }
}
    
export class Continue extends Expresion {

    /**
    * @param {Object} options
    * 
    */
    constructor() {
        super();
        
    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitContinue(this);
    }
}
    
export class Return extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion|undefined} options.exp Expresion a retornar
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a retornar
         * @type {Expresion|undefined}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitReturn(this);
    }
}
    
export class Llamada extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.callee Expresion a llamar
 * @param {Expresion[]} options.args Argumentos de la llamada
    */
    constructor({ callee, args }) {
        super();
        
        /**
         * Expresion a llamar
         * @type {Expresion}
        */
        this.callee = callee;


        /**
         * Argumentos de la llamada
         * @type {Expresion[]}
        */
        this.args = args;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitLlamada(this);
    }
}
    
export class FuncDcl extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.tipo Tipo que puede devolver la funcion
 * @param {string} options.id Identificador de la funcion
 * @param {string[]} options.params Parametros de la funcion
 * @param {Bloque} options.bloque Cuerpo de la funcion
    */
    constructor({ tipo, id, params, bloque }) {
        super();
        
        /**
         * Tipo que puede devolver la funcion
         * @type {string}
        */
        this.tipo = tipo;


        /**
         * Identificador de la funcion
         * @type {string}
        */
        this.id = id;


        /**
         * Parametros de la funcion
         * @type {string[]}
        */
        this.params = params;


        /**
         * Cuerpo de la funcion
         * @type {Bloque}
        */
        this.bloque = bloque;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitFuncDcl(this);
    }
}
    
export class Parametro extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.tipo Tipo del parametro
 * @param {string} options.id Identificador de la funcion
    */
    constructor({ tipo, id }) {
        super();
        
        /**
         * Tipo del parametro
         * @type {string}
        */
        this.tipo = tipo;


        /**
         * Identificador de la funcion
         * @type {string}
        */
        this.id = id;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitParametro(this);
    }
}
    
export default { Expresion, Aritmetica, Operacion_Unaria, Comparacion, Relacional, Logico, Agrupacion, DatoPrimitivo, DeclaracionVariable, ReferenciaVariable, Asignacion, Incremento, Decremento, Println, ExpresionPrintln, ExpresionStmt, Bloque, Ternario, If, Switch, Caso, While, For, Break, Continue, Return, Llamada, FuncDcl, Parametro }
