import { Entorno } from "../utils/entorno.js";
import { Errores } from "../utils/errores.js";
import { DatoPrimitivo } from "../visitor/nodos.js";
import { BaseVisitor } from "../visitor/visitor.js";
import nodos, { Expresion } from '../visitor/nodos.js'
import { Invocable } from "./invocable.js";
import { embebidas } from "./embebidas.js";
import { FuncionForanea } from "./foreanea.js";
import { BreakException, ContinueException, ReturnException } from "./transferencia.js";



export class InterpreterVisitor extends BaseVisitor {

  constructor() {
    super();
    this.entornoActual = new Entorno();

    // funciones embebidas
    Object.entries(embebidas).forEach(([nombre, funcion]) => {
      this.entornoActual.set(nombre, funcion);
    });

    this.salida = '';
    /**
     * @type {Expresion | null}
    */
    this.prevContinue = null;


    this.entornosGG = [];
  }

  interpretar(nodo) {
    return nodo.accept(this);
  }

  /**
    * @type {BaseVisitor['visitAritmetica']}
  */
  visitAritmetica(node) {
    const num_left = node.exp_left.accept(this);
    const num_right = node.exp_right.accept(this);

    switch (node.operacion) {
      case '+':
        if (num_left.tipo == "int" && num_right.tipo == "int") {
          const nodoS = new DatoPrimitivo({ valor: num_left.valor + num_right.valor, tipo: "int" })
          nodoS.location = node.location
          return nodoS;
        }

        if ((num_left.tipo == "float" && num_right.tipo === "float") || (num_left.tipo == "int" && num_right.tipo == "float") || (num_left.tipo == "float" && num_right.tipo == "int")) {
          const nodoS = new DatoPrimitivo({ valor: num_left.valor + num_right.valor, tipo: "float" })
          nodoS.location = node.location
          return nodoS;
        }

        if (num_left.tipo == "string" && num_right.tipo == "string") {
          const nodoS = new DatoPrimitivo({ valor: num_left.valor + num_right.valor, tipo: "string" })
          nodoS.location = node.location
          return nodoS;
        }
        throw new Errores("La suma entre estos tipos de datos no esta permitida", node.location.start.line, node.location.start.column)
      case '-':
        if (num_left.tipo == "int" && num_right.tipo == "int") {
          const nodoR = new DatoPrimitivo({ valor: num_left.valor - num_right.valor, tipo: "int" })
          nodoR.location = node.location
          return nodoR;
        }

        if ((num_left.tipo == "float" && num_right.tipo == "float") || (num_left.tipo == "int" && num_right.tipo == "float") || (num_left.tipo == "float" && num_right.tipo == "int")) {
          const nodoR = new DatoPrimitivo({ valor: num_left.valor - num_right.valor, tipo: "float" })
          nodoR.location = node.location
          return nodoR;
        }
        throw new Errores("La resta entre estos tipos de datos no esta permitida", node.location.start.line, node.location.start.column)

      case '*':
        if (num_left.tipo == "int" && num_right.tipo == "int") {
          const nodoM = new DatoPrimitivo({ valor: num_left.valor * num_right.valor, tipo: "int" })
          nodoM.location = node.location
          return nodoM;
        }

        if ((num_left.tipo == "float" && num_right.tipo == "float") || (num_left.tipo == "int" && num_right.tipo == "float") || (num_left.tipo == "float" && num_right.tipo == "int")) {
          const nodoM = new DatoPrimitivo({ valor: num_left.valor * num_right.valor, tipo: "float" })
          nodoM.location = node.location
          return nodoM;
        }
        throw new Errores("La multiplicacion entre estos tipos de datos no esta permitida", node.location.start.line, node.location.start.column)

      case '/':
        if (num_right.valor == 0) {
          throw new Errores("La division entre cero no esta permitida", node.location.start.line, node.location.start.column)
        }

        if (num_left.tipo == "int" && num_right.tipo == "int") {
          const nodoD = new DatoPrimitivo({ valor: Math.floor(num_left.valor / num_right.valor), tipo: "int" })
          nodoD.location = node.location
          return nodoD;
        }

        if ((num_left.tipo == "float" && num_right.tipo == "float") || (num_left.tipo == "int" && num_right.tipo == "float") || (num_left.tipo == "float" && num_right.tipo == "int")) {
          const nodoD = new DatoPrimitivo({ valor: num_left.valor / num_right.valor, tipo: "float" })
          nodoD.location = node.location
          return nodoD;
        }

        throw new Errores("La division entre estos tipos de datos no esta permitida", node.location.start.line, node.location.start.column)
      case '%':
        if (!(num_left.tipo == "int" && num_right.tipo == "int")) {
          throw new Errores("El modulo entre estos tipos de datos no esta permitida", node.location.start.line, node.location.start.column)
        }
        const nodoMo = new DatoPrimitivo({ valor: num_left.valor % num_right.valor, tipo: "int" })
        nodoMo.location = node.location
        return nodoMo;
      default:
        throw new Error(`Operador no soportado: ${node.op}.`);
    }
  }


  /**
    * @type {BaseVisitor['visitOperacion_Unaria']}
  */
  visitOperacion_Unaria(node) {
    const exp_unica = node.exp_unica.accept(this);

    switch (node.operacion) {
      case '-':
        if (exp_unica.tipo == "int") {
          const nodoR = new DatoPrimitivo({ valor: -exp_unica.valor, tipo: "int" })
          nodoR.location = node.location
          return nodoR;
        }
        if (exp_unica.tipo == "float") {
          const nodoR = new DatoPrimitivo({ valor: -exp_unica.valor, tipo: "float" })
          nodoR.location = node.location
          return nodoR;
        }
        throw new Errores("La negacion unaria solo permite numeros", node.location.start.line, node.location.start.column)
      case '!':
        if (!(exp_unica.tipo == "boolean")) {
          throw new Errores("La negacion unaria solo permite booleanos", node.location.start.line, node.location.start.column)
        }
        const nodoN = new DatoPrimitivo({ valor: !exp_unica.valor, tipo: "boolean" })
        nodoN.location = node.location
        return nodoN;
      default:
        throw new Errores("Operacion unaria no soportada", node.location.start.line, node.location.start.column)

    }
  }

  /**
    * @type {BaseVisitor['visitComparacion']}
  */
  visitComparacion(node) {
    const num_left = node.exp_left.accept(this);
    const num_right = node.exp_right.accept(this);

    // Validar los tipos de los operandos. 
    var mismoTipo = false;

    if ((num_left.tipo == "int" && num_right.tipo == "int") || (num_left.tipo == "float" && num_right.tipo == "float") || (num_left.tipo == "int" && num_right.tipo == "float") || (num_left.tipo == "float" && num_right.tipo == "int")) {
      mismoTipo = true;
    }

    if (num_left.tipo == "string" && num_right.tipo == "string") {
      mismoTipo = true;
    }

    if (num_left.tipo == "boolean" && num_right.tipo == "boolean") {
      mismoTipo = true;
    }

    if (num_left.tipo == "char" && num_right.tipo == "char") {
      mismoTipo = true;
    }

    if (mismoTipo) {
      switch (node.operacion) {
        case '==':
          const nodoI = new DatoPrimitivo({ valor: num_left.valor == num_right.valor, tipo: "boolean" })
          nodoI.location = node.location
          return nodoI;
        case '!=':
          const nodoD = new DatoPrimitivo({ valor: !(num_left.valor === num_right.valor), tipo: "boolean" })
          nodoD.location = node.location
          return nodoD;
        default:
          throw new Errores("Operacion comparativa no soportada", node.location.start.line, node.location.start.column)
      }
    } else {
      throw new Errores("Tipos de datos en comparacion no soportado", node.location.start.line, node.location.start.column)
    }


  }

  /**
    * @type {BaseVisitor['visitRelacional']}
  */
  visitRelacional(node) {
    var num_left = node.exp_left.accept(this);
    var num_right = node.exp_right.accept(this);

    // Validar los tipos de los operandos. 
    var mismoTipo = false;

    if ((num_left.tipo == "int" && num_right.tipo == "int") || (num_left.tipo == "float" && num_right.tipo == "float") || (num_left.tipo == "int" && num_right.tipo == "float") || (num_left.tipo == "float" && num_right.tipo == "int")) {
      mismoTipo = true;
    }

    if (num_left.tipo == "char" && num_right.tipo == "char") {
      num_left.valor = num_left.valor.charCodeAt(0);
      num_right.valor = num_right.valor.charCodeAt(0);
      mismoTipo = true;
    }
    if (mismoTipo) {
      switch (node.operacion) {
        case '<':
          const nodoMe = new DatoPrimitivo({ valor: num_left.valor < num_right.valor, tipo: "boolean" })
          nodoMe.location = node.location
          return nodoMe;
        case '<=':
          const nodoMeI = new DatoPrimitivo({ valor: num_left.valor <= num_right.valor, tipo: "boolean" })
          nodoMeI.location = node.location
          return nodoMeI;
        case '>':
          const nodoMa = new DatoPrimitivo({ valor: num_left.valor > num_right.valor, tipo: "boolean" })
          nodoMa.location = node.location
          return nodoMa;
        case '>=':
          const nodoMaI = new DatoPrimitivo({ valor: num_left.valor >= num_right.valor, tipo: "boolean" })
          nodoMaI.location = node.location
          return nodoMaI;
        default:
          throw new Errores("Operacion relacion no soportada", node.location.start.line, node.location.start.column)
      }
    } else {
      throw new Errores("Tipos de datos en relacion no soportado", node.location.start.line, node.location.start.column)
    }
  }

  /**
    * @type {BaseVisitor['visitLogico']}
  */
  visitLogico(node) {
    var num_left = node.exp_left.accept(this);
    var num_right = node.exp_right.accept(this);

    // Validar los tipos de los operandos. 
    var mismoTipo = false;

    if (num_left.tipo == "boolean" && num_right.tipo == "boolean") {
      mismoTipo = true;
    }

    if (mismoTipo) {
      switch (node.operacion) {
        case '&&':
          const nodoAnd = new DatoPrimitivo({ valor: num_left.valor && num_right.valor, tipo: "boolean" })
          nodoAnd.location = node.location
          return nodoAnd;
        case '||':
          const nodoOr = new DatoPrimitivo({ valor: num_left.valor || num_right.valor, tipo: "boolean" })
          nodoOr.location = node.location
          return nodoOr;
        default:
          throw new Errores("Operacion logica no soportada", node.location.start.line, node.location.start.column)
      }
    } else {
      throw new Errores("Tipos de datos en logica no soportado", node.location.start.line, node.location.start.column)
    }
  }

  /**
    * @type {BaseVisitor['visitAgrupacion']}
  */
  visitAgrupacion(node) {
    return node.exp.accept(this);
  }

  /**
    * @type {BaseVisitor['visitDatoPrimitivo']}
  */
  visitDatoPrimitivo(node) {
    return node
  }

  /**
    * @type {BaseVisitor['visitDeclaracionVariable']}
  */
  visitDeclaracionVariable(node) {

    const tipoVaribale = node.tipo;
    const nombreVariable = node.id;
    var valorVariable
    if (node.exp != null) {
      valorVariable = node.exp.accept(this);
    }

    switch (tipoVaribale) {
      case 'int':

        if (!valorVariable) {
          const nodoR = new DatoPrimitivo({ valor: 0, tipo: "int" })
          nodoR.location = node.location
          this.entornoActual.set(nombreVariable, nodoR);
        } else {
          if (!(valorVariable.tipo == "int")) {
            const nodoN = new DatoPrimitivo({ valor: "null", tipo: "null" })
            nodoN.location = node.location
            this.entornoActual.set(nombreVariable, nodoN);
            throw new Errores("El tipo de la varibale y de la expresion no son la misma", node.location.start.line, node.location.start.column)
          }
          valorVariable.location = node.location
          var error = this.entornoActual.set(nombreVariable, valorVariable);
        }
        return null
      case 'float':
        if (!valorVariable) {
          const nodoR = new DatoPrimitivo({ valor: 0, tipo: "float" })
          nodoR.location = node.location
          var error = this.entornoActual.set(nombreVariable, nodoR);
        } else {
          if (!(valorVariable.tipo == "float")) {
            const nodoN = new DatoPrimitivo({ valor: "null", tipo: "null" })
            nodoN.location = node.location
            this.entornoActual.set(nombreVariable, nodoN);
            throw new Errores("El tipo de la varibale y de la expresion no son la misma", node.location.start.line, node.location.start.column)
          }
          valorVariable.location = node.location
          this.entornoActual.set(nombreVariable, valorVariable);
        }
        return null
      case 'string':
        if (!valorVariable) {
          const nodoR = new DatoPrimitivo({ valor: "", tipo: "string" })
          nodoR.location = node.location
          this.entornoActual.set(nombreVariable, nodoR);
        } else {
          if (!(valorVariable.tipo == "string")) {
            const nodoN = new DatoPrimitivo({ valor: "null", tipo: "null" })
            nodoN.location = node.location
            this.entornoActual.set(nombreVariable, nodoN);
            throw new Errores("El tipo de la varibale y de la expresion no son la misma", node.location.start.line, node.location.start.column)
          }
          valorVariable.location = node.location
          this.entornoActual.set(nombreVariable, valorVariable);
        }
        return null
      case 'boolean':
        if (!valorVariable) {
          const nodoR = new DatoPrimitivo({ valor: true, tipo: "boolean" })
          nodoR.location = node.location
          this.entornoActual.set(nombreVariable, nodoR);
        } else {
          if (!(valorVariable.tipo == "boolean")) {
            const nodoN = new DatoPrimitivo({ valor: "null", tipo: "null" })
            nodoN.location = node.location
            this.entornoActual.set(nombreVariable, nodoN);
            throw new Errores("El tipo de la varibale y de la expresion no son la misma", node.location.start.line, node.location.start.column)
          }
          valorVariable.location = node.location
          this.entornoActual.set(nombreVariable, valorVariable);
          return null
        }
        return null
      case 'char':
        if (!valorVariable) {
          const nodoR = new DatoPrimitivo({ valor: '', tipo: "char" })
          nodoR.location = node.location
          this.entornoActual.set(nombreVariable, nodoR);
        } else {
          if (!(valorVariable.tipo == "char")) {
            const nodoN = new DatoPrimitivo({ valor: "null", tipo: "null" })
            nodoN.location = node.location
            this.entornoActual.set(nombreVariable, nodoN);
            throw new Errores("El tipo de la varibale y de la expresion no son la misma", node.location.start.line, node.location.start.column)
          }
          valorVariable.location = node.location
          this.entornoActual.set(nombreVariable, valorVariable);
        }
        return null
      case 'var':
        if (!valorVariable) {
          throw new Errores("Una variable tipo var debe de estar inicializa", node.location.start.line, node.location.start.column)
        } else {
          valorVariable.location = node.location
          this.entornoActual.set(nombreVariable, valorVariable);
        }
        return null
      default:
        throw new Errores("Tipo de variable no identificada", node.location.start.line, node.location.start.column)
    }
  }

  /**
    * @type {BaseVisitor['visitReferenciaVariable']}
  */
  visitReferenciaVariable(node) {
    const nombreVariable = node.id;
    return this.entornoActual.get(nombreVariable, node.location.start);
  }

  /**
 * @type {BaseVisitor['visitAsignacion']}
 */
  visitAsignacion(node) {
    const valor = node.asgn.accept(this);
    this.entornoActual.assign(node.id, valor);
    return valor;
  }

  /**
 * @type {BaseVisitor['visitIncremento']}
 */
  visitIncremento(node) {
    const valor = node.valor.accept(this);
    this.entornoActual.incremento(node.id, valor);
    return valor;
  }

  /**
 * @type {BaseVisitor['visitDecremento']}
 */
  visitDecremento(node) {
    const valor = node.valor.accept(this);
    this.entornoActual.decremento(node.id, valor);
    return valor;
  }

  /**
    * @type {BaseVisitor['visitDeclaracionVectores']}
  */
  visitDeclaracionVectores(node) {
    const nombreVariable = node.id
    let valorVariable = []


    if (node.listExp) {
      node.listExp.forEach((value) => {
        let valor = value.accept(this)
        valorVariable.push(valor)
      });
    } else if (node.size) {
      const tam = node.size.accept(this)
      if (tam.tipo == 'int') {
        const tamano = tam.valor
        for (let i = 0; i < tamano; i++) {
          valorVariable.push(0)
        }
      } else {
        throw new Errores("El tamño debe ser un numero entero", node.location.start.line, node.location.start.column)
      }

    } else if (node.idRef) {
      valorVariable = node.idRef.accept(this)
    }

    const nodo = new DatoPrimitivo({ valor: valorVariable, tipo: 'vector' })
    nodo.location = node.location


    this.entornoActual.set(nombreVariable, nodo);
  }


  /**
    * @type {BaseVisitor['visitReferenciaVector']}
  */
  visitReferenciaVector(node) {
    const valorV = node.id.accept(this)
    const vec = valorV.valor
    const index = node.index.accept(this)

    if (index.tipo !== 'int') {
      throw new Errores("El tamño debe ser un numero entero", node.location.start.line, node.location.start.column)
    }


    if (vec.length - 1 < index.valor) {
      throw new Errores("El indice sobrepasa el limite", node.location.start.line, node.location.start.column)
    }

    const nodo = new DatoPrimitivo({ valor: vec[index.valor], tipo: valorV.tipo })
    nodo.location = node.location

    return nodo

  }


  /**
   * @type {BaseVisitor['visitAsignacionVector']}
  */
  visitAsignacionVector(node) {
    console.log(node)

    //valor a guardar
    const valor = node.asgn.accept(this)
    //index
    const index = node.index.accept(this)
    //Referecicin a variable
    let valorV = node.id.accept(this)
    const vec = valorV.valor


    if (index.tipo !== 'int') {
      throw new Errores("El tamño debe ser un numero entero", node.location.start.line, node.location.start.column)
    }

    if (vec.length - 1 < index.valor) {
      throw new Errores("El indice sobrepasa el limite", node.location.start.line, node.location.start.column)
    }

    vec[index.valor] = valor.valor;


    this.entornoActual.assign(node.id, vec)

    return vec;

  }

  /**
    * @type {BaseVisitor['visitIndexOf']}
  */
  visitIndexOf(node) {
    const areglo = node.id.accept(this).valor
    const exp = node.exp.accept(this).valor

    for (let i = 0; i < areglo.length; i++) {
      if (areglo[i].valor === exp) {
        const nodo = new DatoPrimitivo({ valor: i, tipo: "int" })
        nodo.location = node.location

        console.log(nodo)
        return nodo
      }

    }
    const nodo = new DatoPrimitivo({ valor: -1, tipo: "int" })
    nodo.location = node.location
    return nodo


  }

  /**
    * @type {BaseVisitor['visitJoin']}
  */
  visitJoin(node) {
    const areglo = node.id.accept(this).valor
    let valor = [];
    for (let i = 0; i < areglo.length; i++) {
      valor.push(areglo[i].valor)
    }
    const concatenado = valor.join(',');
    const nodo = new DatoPrimitivo({ valor: concatenado, tipo: "string" })
    nodo.location = node.location
    return nodo
  }

  /**
    * @type {BaseVisitor['visitLength']}
  */
  visitLength(node) {
    const areglo = node.id.accept(this).valor

    const nodo = new DatoPrimitivo({ valor: areglo.length, tipo: "int" })
    nodo.location = node.location
    return nodo

  }



  /**
    * @type {BaseVisitor['visitPrintln']}
  */
  visitPrintln(node) {
    const valor = node.exp.accept(this);
    this.salida += valor.valor + '\n';
  }

  /**
    * @type {BaseVisitor['visitPrintln']}
  */

  visitExpresionPrintln(node) {
    const num_left = node.exp_left.accept(this);
    const num_right = node.exp_right.accept(this);
    const nodoS = new DatoPrimitivo({ valor: String(num_left.valor) + String(num_right.valor), tipo: "string" })
    nodoS.location = node.location
    return nodoS;
  }

  /**
    * @type {BaseVisitor['visitExpresionStmt']}
  */
  visitExpresionStmt(node) {
    node.exp.accept(this);
  }

  /**
 * @type {BaseVisitor['visitBloque']}
 */
  visitBloque(node) {
    const entornoAnterior = this.entornoActual;
    this.entornoActual = new Entorno(entornoAnterior);

    for (let i = 0; i < node.dcls.length; i++) {
      node.dcls[i].accept(this);
    }
    this.entornosGG.push(this.entornoActual);
    this.entornoActual = entornoAnterior;
    return
  }

  /**
   * @type {BaseVisitor['visitTernario']}
   */
  visitTernario(node) {
    const cond = node.cond.accept(this)

    if (!(cond instanceof DatoPrimitivo) && cond.tipo != "boolean") {
      throw new Errores("La condicion del ", node.location.start.line, node.location.start.column)
    }

    if (cond.dato == "true") {
      const expTrue = node.expTrue.accept(this)
      return expTrue
    } else {
      const expFalse = node.expFalse.accept(this)
      return expFalse
    }
  }

  /**
   * @type {BaseVisitor['visitIf']}
   */
  visitIf(node) {
    const cond = node.cond.accept(this);
    if (cond.tipo != "boolean") {
      throw new Errores("La condicion del if no es un booleano", node.location.start.line, node.location.start.column)

    }

    if (cond.valor) {
      node.stmtTrue.accept(this);
      return;
    }

    if (node.stmtFalse) {
      node.stmtFalse.accept(this);
    }

  }

  /**
   * @type {BaseVisitor['visitSwitch']}
   */
  visitSwitch(node) {
    const cond = node.exp.accept(this)

    try {
      for (let i = 0; i < node.casos.length; i++) {
        if (cond.valor === node.casos[i].exp.accept(this).valor) {
          node.casos[i].accept(this);
        }
      }

      if (node.stmtDefault) {
        node.stmtDefault.accept(this);
      }
    } catch (error) {

      if (error instanceof BreakException) {
        return
      }

      throw error;

    }

  }

  /**
   * @type {BaseVisitor['visitCaso']}
   */
  visitCaso(node) {
    node.stmt.accept(this)
  }

  /**
   * @type {BaseVisitor['visitWhile']}
   */
  visitWhile(node) {
    const cond = node.cond.accept(this);

    if (cond.tipo != "boolean") {
      throw new Errores("La condicion del while no es un booleano", node.location.start.line, node.location.start.column)
    }

    const entornoConElQueEmpezo = this.entornoActual;
    try {
      while (node.cond.accept(this).valor) {
        node.stmt.accept(this);
      }
    } catch (error) {
      this.entornoActual = entornoConElQueEmpezo;

      if (error instanceof BreakException) {
        return
      }

      if (error instanceof ContinueException) {
        return this.visitWhile(node);
      }

      throw error;

    }
  }

  /**
   * @type {BaseVisitor['visitFor']}
   */
  visitFor(node) {
    // this.prevContinue = node.inc;
    const incrementoAnterior = this.prevContinue;
    this.prevContinue = node.inc;

    const forTraducido = new nodos.Bloque({
      dcls: [
        node.init,
        new nodos.While({
          cond: node.cond,
          stmt: new nodos.Bloque({
            dcls: [
              node.stmt,
              node.inc
            ]
          })
        })
      ]
    })

    forTraducido.accept(this);

    this.prevContinue = incrementoAnterior;
  }

  /**
   * @type {BaseVisitor['visitBreak']}
   */
  visitBreak(node) {
    throw new BreakException();
  }

  /**
   * @type {BaseVisitor['visitContinue']}
   */
  visitContinue(node) {
    if (this.prevContinue) {
      this.prevContinue.accept(this);
    }

    throw new ContinueException();
  }


  /**
   * @type {BaseVisitor['visitReturn']}
   */
  visitReturn(node) {
    let valor = null
    if (node.exp) {
      valor = node.exp.accept(this);
    }
    throw new ReturnException(valor);
  }

  /**
  * @type {BaseVisitor['visitLlamada']}
  */
  visitLlamada(node) {
    const funcion = node.callee.accept(this);
    const argumentos = [];
    for (let i = 0; i < node.args.length; i++) {
      const arg = node.args[i].accept(this);
      argumentos.push(arg);
    }

    if (!(funcion instanceof Invocable)) {
      throw new Errores("La llamada No es invocable", node.location.start.line, node.location.start.column)
    }

    funcion.aridad(argumentos)
    return funcion.invocar(this, argumentos);
  }

  /**
  * @type {BaseVisitor['visitFuncDcl']}
  */
  visitFuncDcl(node) {
    const funcion = new FuncionForanea(node, this.entornoActual);
    this.entornoActual.set(node.id, funcion);
  }

  /**
  * @type {BaseVisitor['visitParametro']}
  */
  visitParametro(node) {
    throw node
  }


}


