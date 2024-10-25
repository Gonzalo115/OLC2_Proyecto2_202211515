import { BaseVisitor } from "../visitor/visitor.js";


export class FrameVisitor extends BaseVisitor {

    constructor(baseOffset) {
        super();
        this.frame = [];
        this.localSize = 0;
        this.baseOffset = baseOffset;
    }

    visitExpresion(node) { }
    visitAritmetica(node) { }
    visitOperacion_Unaria(node) { }
    visitComparacion(node) { }
    visitRelacional(node) { }
    visitLogico(node) { }
    visitAgrupacion(node) { }
    visitDatoPrimitivo(node) { }
    visitReferenciaVariable(node) { }
    visitAsignacion(node) { }
    visitIncremento(node) { }
    visitDecremento(node) { }
    visitPrintln(node) { }
    visitExpresionPrintln(node) { }
    visitCaso(node) { }
    visitExpresionStmt(node) { }
    visitTernario(node) { }
    visitBreak(node) { }
    visitContinue(node) { }
    visitReturn(node) { }
    visitLlamada(node) { }
    visitFuncDcl(node) { }
    visitParametro(node) { }
    visitLlamadaEmbebidas(node) { }


    /**
     * 
     * @type {BaseVisitor['visitDeclaracionVariable']}
    */
    visitDeclaracionVariable(node) {
        this.frame.push({
            id: node.id,
            offset: this.baseOffset + this.localSize,
        });
        this.localSize += 1;
    }

    /**
     * 
     * @type {BaseVisitor['visitBloque']}
     */
    visitBloque(node) {
        node.dcls.forEach(dcl => dcl.accept(this));
    }

    /**
     * 
     * @type {BaseVisitor['visitIf']}
    */
    visitIf(node) {
        node.stmtTrue.accept(this);
        if (node.stmtFalse) node.stmtFalse.accept(this);
    }

    /**
     * 
     * @type {BaseVisitor['visitWhile']}
    */
    visitWhile(node) {
        node.stmt.accept(this);
    }

    /**
     * 
     * @type {BaseVisitor['visitFor']}
    */
    visitFor(node) {
        node.stmt.accept(this);
    }

    /**
     * 
     * @type {BaseVisitor['visitSwitch']}
    */
    visitSwitch(node) {
        for (let i = 0; i < node.casos.length; i++) {
            node.casos[i].stmt.accept(this);
        }
    }

}
