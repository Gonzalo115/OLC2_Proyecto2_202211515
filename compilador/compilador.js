import { registers as r, floatRegisters as f } from "../risc/constantes.js";
import { Generador } from "../risc/generador.js";
import { BaseVisitor } from "./visitor.js";
import { numberToF32 } from "../risc/utils.js";

export class CompilerVisitor extends BaseVisitor {

    constructor() {
        super();
        this.code = new Generador();
    }


    /**
      * @type {BaseVisitor['visitExpresionStmt']}
    */
    visitExpresionStmt(node) {
        node.exp.accept(this);
        

        var reg = r.T0;

        if (this.code.getTopObject().type === 'float'){
            reg = f.FT0;
        }

        this.code.popObject(reg);
    }

    /**
     * @type {BaseVisitor['visitDatoPrimitivo']}
    */
    visitDatoPrimitivo(node) {
        this.code.comment(`Primitivo: ${node.valor}`);
        this.code.pushConstant({ type: node.tipo, valor: node.valor });
        this.code.comment(`Fin Primitivo: ${node.valor}`);
    }


    /**
      * @type {BaseVisitor['visitAritmetica']}
    */
    visitAritmetica(node) {
        this.code.comment(`Operacion: ${node.op}`);

        node.exp_left.accept(this); // izq |
        node.exp_right.accept(this); // izq | der

        const isDerFloat = this.code.getTopObject().type === 'float';
        const der = this.code.popObject(isDerFloat ? f.FT0 : r.T0); // der
        const isIzqFloat = this.code.getTopObject().type === 'float';
        const izq = this.code.popObject(isIzqFloat ? f.FT1 : r.T1); // izq

        if ((izq.type === 'float' && der.type === 'float') || (izq.type === 'int' && der.type === 'float') || (izq.type === 'float' && der.type === 'int')) {
            if (!isIzqFloat) this.code.fcvtsw(f.FT1, r.T1);
            if (!isDerFloat) this.code.fcvtsw(f.FT0, r.T0);
            switch (node.operacion) {
                case '+':
                    this.code.fadd(f.FT0, f.FT1, f.FT0);
                    break;
                case '-':
                    this.code.fsub(f.FT0, f.FT1, f.FT0);
                    break;
                case '*':
                    this.code.fmul(f.FT0, f.FT1, f.FT0);
                    break;
                case '/':
                    this.code.fdiv(f.FT0, f.FT1, f.FT0);
                    break;
            }
            this.code.pushFloat(f.FT0);
            this.code.pushObject({ type: 'float', length: 4 });
            return;
        }

        if (izq.type === 'int' && der.type === 'int') {
            switch (node.operacion) {
                case '+':
                    this.code.add(r.T0, r.T0, r.T1);
                    break;
                case '-':
                    this.code.sub(r.T0, r.T1, r.T0);
                    break;
                case '*':
                    this.code.mul(r.T0, r.T0, r.T1);
                    break;
                case '/':
                    this.code.div(r.T0, r.T1, r.T0);
                    break;
                case '%':
                    this.code.rem(r.T0, r.T1, r.T0);
                    break;
            }
            this.code.push(r.T0);
            this.code.pushObject({ type: 'int', length: 4 });
            return;
        }

        if (izq.type === 'string' && der.type === 'string' && node.operacion === "+") {
            this.code.add(r.A0, r.ZERO, r.T1);
            this.code.add(r.A1, r.ZERO, r.T0);
            this.code.callBuiltin('concatString');
            this.code.pushObject({ type: 'string', length: 4 });
            return;
        }

    }

    /**
      * @type {BaseVisitor['visitOperacion_Unaria']}
    */
    visitOperacion_Unaria(node) {
        node.exp_unica.accept(this);

        const isDerFloat = this.code.getTopObject().type === 'float';
        const unica = this.code.popObject(isDerFloat ? f.FT0 : r.T0); // der

        switch (node.operacion) {
            case '-':
                if (unica.type === 'int') {
                    this.code.li(r.T1, 0);
                    this.code.sub(r.T0, r.T1, r.T0);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'int', length: 4 });
                }

                if (unica.type === 'float') {
                    const ieee754 = numberToF32(0);
                    this.code.flw(f.FT1, ieee754);
                    this.code.fsub(f.FT0, f.FT1, f.FT0);
                    this.code.push(f.FT0);
                    this.code.pushObject({ type: 'float', length: 4 });
                }

                break;
            case '!':
                if (unica.type === 'boolean') {
                    //Crear el correlativo de las labels
                    const labelCambio = this.code.getLabel();
                    const labelEnd = this.code.getLabel();

                    //Si t0 es igual ha 0 saltar el labelCambio para cambiarlo a 1
                    this.code.beq(r.T0, r.ZERO, labelCambio)

                    //Si lo anterio era falso entonces llego aqui y aqui cambiaremos t0 de 1 a 0
                    this.code.li(r.T0, 0)
                    this.code.push(r.T0)

                    //Saltar a el label de finalizacion
                    this.code.j(labelEnd)

                    //Agrear el label de cambio
                    this.code.addLabel(labelCambio)

                    //Cambiar el el valor de t0 de 0 a 1
                    this.code.li(r.T0, 1)
                    this.code.push(r.T0)

                    //Agregar el label de finalizacion
                    this.code.addLabel(labelEnd)
                    this.code.pushObject({ type: 'boolean', length: 4 });
                }
        }
    }


    /**
      * @type {BaseVisitor['visitComparacion']}
    */
    visitComparacion(node) {
        this.code.comment(`Operacion: ${node.operacion}`);

        node.exp_right.accept(this);
        node.exp_left.accept(this);

        const isIzqFloat = this.code.getTopObject().type === 'float';
        const izq = this.code.popObject(isIzqFloat ? f.FT0 : r.T0); // izq
        const isDerFloat = this.code.getTopObject().type === 'float';
        const der = this.code.popObject(isDerFloat ? f.FT1 : r.T1); // der

        if ((izq.type === 'float' && der.type === 'float') || (izq.type === 'int' && der.type === 'float') || (izq.type === 'float' && der.type === 'int')) {
            if (!isIzqFloat) this.code.fcvtsw(f.FT0, r.T0);
            if (!isDerFloat) this.code.fcvtsw(f.FT1, r.T1);
            switch (node.operacion) {
                case '==':
                    this.code.callBuiltin('equalFloat');
                    break;
                case '!=':
                    this.code.callBuiltin('notEqualFloat');
                    break;
            }
            this.code.pushObject({ type: 'boolean', length: 4 });
            return;
        }

        if (izq.type === 'int' && der.type === 'int') {
            switch (node.operacion) {
                case '==':
                    this.code.callBuiltin('equalInt');
                    break;
                case '!=':
                    this.code.callBuiltin('notEqualInt');
                    break;
            }
            this.code.pushObject({ type: 'boolean', length: 4 });
            return;
        }

        if (izq.type === 'char' && der.type === 'char') {
            this.code.add(r.A0, r.ZERO, r.T0);
            this.code.add(r.A1, r.ZERO, r.T1);
            switch (node.operacion) {
                case '==':
                    this.code.callBuiltin('equalString');
                    break
                case '!=':
                    this.code.callBuiltin('notEqualString');
                    break
            }
            this.code.pushObject({ type: 'boolean', length: 4 });
            return;
        }

        if (izq.type === 'string' && der.type === 'string') {
            this.code.add(r.A0, r.ZERO, r.T0);
            this.code.add(r.A1, r.ZERO, r.T1);
            switch (node.operacion) {
                case '==':
                    this.code.callBuiltin('equalString');
                    break
                case '!=':
                    this.code.callBuiltin('notEqualString');
                    break
            }
            this.code.pushObject({ type: 'boolean', length: 4 });
            return;
        }

    }


    /**
      * @type {BaseVisitor['visitRelacional']}
    */
    visitRelacional(node) {
        this.code.comment(`Operacion: ${node.operacion}`);

        node.exp_right.accept(this); //derecha
        node.exp_left.accept(this); //izquierda

        const IzqTipo = this.code.getTopObjectP(1).type;
        const DerTipo = this.code.getTopObjectP(2).type;

        if ((IzqTipo === 'float' && DerTipo === 'float') || (IzqTipo === 'int' && DerTipo === 'float') || (IzqTipo === 'float' && DerTipo === 'int')) {
            this.code.popObject((IzqTipo === 'float') ? f.FT0 : r.T0);
            this.code.popObject((DerTipo === 'float') ? f.FT1 : r.T1);
            if (IzqTipo !== 'float') this.code.fcvtsw(f.FT0, r.T0);
            if (DerTipo !== 'float') this.code.fcvtsw(f.FT1, r.T1);
            switch (node.operacion) {
                case '<':
                    this.code.flt(r.T0, f.FT0, f.FT1);
                    break;
                case '>':
                    this.code.flt(r.T0, f.FT1, f.FT0);
                    break;
                case '<=':
                    this.code.fle(r.T0, f.FT0, f.FT1);
                    break;
                case '>=':
                    this.code.fle(r.T0, f.FT1, f.FT0);
                    break;
            }
            this.code.push(r.T0);
            this.code.pushObject({ type: 'boolean', length: 4 });
            return;
        }

        if (IzqTipo === 'int' && DerTipo === 'int') {
            switch (node.operacion) {
                case '<':
                    this.code.popObject(r.T0);
                    this.code.popObject(r.T1);
                    this.code.callBuiltin('minMayI');
                    break;
                case '>':
                    this.code.popObject(r.T1);
                    this.code.popObject(r.T0);
                    this.code.callBuiltin('minMayI');
                    break;
                case '<=':
                    this.code.popObject(r.T1);
                    this.code.popObject(r.T0);
                    this.code.callBuiltin('minMaEqI');
                    break;
                case '>=':
                    this.code.popObject(r.T0);
                    this.code.popObject(r.T1);
                    this.code.callBuiltin('minMaEqI');
                    break;
            }
            this.code.pushObject({ type: 'boolean', length: 4 });
            return;
        }

        if (IzqTipo === 'char' && DerTipo === 'char') {
            switch (node.operacion) {
                case '<':
                    this.code.popObject(r.T0);
                    this.code.popObject(r.T1);
                    this.code.callBuiltin('minMayC');
                    break;
                case '>':
                    this.code.popObject(r.T1);
                    this.code.popObject(r.T0);
                    this.code.callBuiltin('minMayC');
                    break;
                case '<=':
                    this.code.popObject(r.T1);
                    this.code.popObject(r.T0);
                    this.code.callBuiltin('minMaEqC');
                    break;
                case '>=':
                    this.code.popObject(r.T0);
                    this.code.popObject(r.T1);
                    this.code.callBuiltin('minMaEqC');
                    break;
            }
            this.code.pushObject({ type: 'boolean', length: 4 });
            return;
        }

    }


    /**
      * @type {BaseVisitor['visitLogico']}
    */
    visitLogico(node) {
        this.code.comment(`Operacion: ${node.operacion}`);

        if (node.operacion === '&&') {
            node.exp_left.accept(this); // izq
            this.code.popObject(r.T0); // izq

            const labelFalse = this.code.getLabel();
            const labelEnd = this.code.getLabel();

            this.code.beq(r.T0, r.ZERO, labelFalse); // if (!izq) goto labelFalse

            node.exp_right.accept(this); // der
            this.code.popObject(r.T0); // der
            this.code.beq(r.T0, r.ZERO, labelFalse); // if (!der) goto labelFalse

            this.code.li(r.T0, 1);
            this.code.push(r.T0);
            this.code.j(labelEnd);


            this.code.addLabel(labelFalse);
            this.code.li(r.T0, 0);
            this.code.push(r.T0);

            this.code.addLabel(labelEnd);
            this.code.pushObject({ type: 'boolean', length: 4 });
            return
        }

        if (node.operacion === '||') {
            node.exp_left.accept(this); // izq
            this.code.popObject(r.T0); // izq

            const labelTrue = this.code.getLabel();
            const labelEnd = this.code.getLabel();

            this.code.bne(r.T0, r.ZERO, labelTrue); // if (izq) goto labelTrue
            node.exp_right.accept(this); // der
            this.code.popObject(r.T0); // der
            this.code.bne(r.T0, r.ZERO, labelTrue); // if (der) goto labelTrue

            this.code.li(r.T0, 0);
            this.code.push(r.T0);

            this.code.j(labelEnd);
            this.code.addLabel(labelTrue);
            this.code.li(r.T0, 1);
            this.code.push(r.T0);

            this.code.addLabel(labelEnd);
            this.code.pushObject({ type: 'boolean', length: 4 });
            return
        }

    }


    /**
      * @type {BaseVisitor['visitAgrupacion']}
    */
    visitAgrupacion(node) {
        return node.exp.accept(this);
    }

    /**
      * @type {BaseVisitor['visitDeclaracionVariable']}
    */
    visitDeclaracionVariable(node) {
        this.code.comment(`Declaracion Variable: ${node.id}`);

        if (node.exp != null) {
            node.exp.accept(this);
        } else {

            switch (node.tipo) {
                case 'int':
                    this.code.pushConstant({ type: node.tipo, valor: 0 });
                    break
                case 'float':
                    this.code.pushConstant({ type: node.tipo, valor: 0 });
                    break
                case 'char':
                    this.code.pushConstant({ type: node.tipo, valor: '' });
                    break
                case 'string':
                    this.code.pushConstant({ type: node.tipo, valor: "" });
                case 'boolean':
                    this.code.pushConstant({ type: node.tipo, valor: true });
                    break
            }
        }

        this.code.tagObject(node.id);
        this.code.comment(`Fin declaracion Variable: ${node.id}`);
    }

    /**
      * @type {BaseVisitor['visitAsignacion']}
    */
    visitAsignacion(node) {
        this.code.comment(`Asignacion Variable: ${node.id}`);

        node.asgn.accept(this);

        const [_, variableObjectAux] = this.code.getObject(node.id);

        var reg = r.T0;

        if (variableObjectAux.type === "float"){
            reg = f.FT0;
        }

        const valueObject = this.code.popObject(reg);

        const [offset, variableObject] = this.code.getObject(node.id);

        this.code.addi(r.T1, r.SP, offset);
        this.code.sw(r.T0, r.T1);

        variableObject.type = valueObject.type;

        this.code.push(r.T0);
        this.code.pushObject(valueObject);

        this.code.comment(`Fin Asignacion Variable: ${node.id}`);
    }

    /**
      * @type {BaseVisitor['visitReferenciaVariable']}
    */
    visitReferenciaVariable(node) {
        this.code.comment(`Referencia Variable: ${node.id}`);

        const [offset, variableObject] = this.code.getObject(node.id);
        this.code.addi(r.T0, r.SP, offset);
        this.code.lw(r.T1, r.T0);
        this.code.push(r.T1);
        this.code.pushObject({ ...variableObject, id: undefined });

        this.code.comment(`Fin Referencia Variable: ${node.id}`);
    }

    /**
      * @type {BaseVisitor['visitIncremento']}
    */
    visitIncremento(node) {
        this.code.comment(`Incremente Variable: ${node.id}`);

        node.valor.accept(this);

        const [offsetAux, variableObjectAux] = this.code.getObject(node.id);

        var valueObject;

        if (variableObjectAux.type === 'int'){
            this.code.addi(r.T0, r.SP, offsetAux);
            this.code.lw(r.T1, r.T0);
            this.code.push(r.T1);
            this.code.pushObject({ type: 'int', length: 4 });
            this.code.popObject(r.T1);
            this.code.popObject(r.T0);
            this.code.add(r.T0, r.T1, r.T0);
            this.code.push(r.T0);
            this.code.pushObject({ type: 'int', length: 4 });
            valueObject = this.code.popObject(r.T0)
        }else if (variableObjectAux.type === 'float'){
            this.code.addi(r.T0, r.SP, offsetAux);
            this.code.lw(r.T1, r.T0);
            this.code.push(r.T1);
            this.code.pushObject({ type: 'float', length: 4 });
            this.code.popObject(f.FT1);

            var ObjAux = this.code.getTopObject().type === 'float';
            this.code.popObject(ObjAux ? f.FT0 : r.T0);     
            if (!ObjAux) this.code.fcvtsw(f.FT0, r.T0);
            
            this.code.fadd(f.FT0, f.FT1, f.FT0);
            this.code.pushFloat(f.FT0);
            this.code.pushObject({ type: 'float', length: 4 });
            valueObject = this.code.popObject(f.FT0)
        }


        const [offset, variableObject] = this.code.getObject(node.id);

        this.code.addi(r.T1, r.SP, offset);
        this.code.sw(r.T0, r.T1);

        variableObject.type = valueObject.type;

        this.code.push(r.T0);
        this.code.pushObject(valueObject);

        this.code.comment(`Fin Incremento Variable: ${node.id}`);
    }


    /**
      * @type {BaseVisitor['visitDecremento']}
    */
    visitDecremento(node) {
        this.code.comment(`Decremento Variable: ${node.id}`);
        


        this.code.comment(`Fin Decremento Variable: ${node.id}`);
    }


    /**
      * @type {BaseVisitor['visitPrintln']}
    */
    visitPrintln(node) {
        this.code.comment('Print');
        node.exp.accept(this);

        const isFloat = this.code.getTopObject().type === 'float';
        const object = this.code.popObject(isFloat ? f.FA0 : r.A0);

        const tipoPrint = {
            'int': () => this.code.printInt(),
            'float': () => this.code.printFloat(),
            'boolean': () => this.code.printInt(),
            'string': () => this.code.printString(),
            'char': () => this.code.printString()
        }

        tipoPrint[object.type]();
        
        this.code.li(r.A0, 10)
        this.code.li(r.A7, 11)
        this.code.ecall()
    }


    /**
      * @type {BaseVisitor['visitExpresionPrintln']}
    */
    visitExpresionPrintln(node) {
        throw new Error('Metodo visitExpresionPrintln no implementado');
    }

    /**
      * @type {BaseVisitor['visitBloque']}
    */
    visitBloque(node) {
        this.code.comment('Inicio de bloque');

        this.code.newScope();

        node.dcls.forEach(d => d.accept(this));

        this.code.comment('Reduciendo la pila');
        const bytesToRemove = this.code.endScope();

        if (bytesToRemove > 0) {
            this.code.addi(r.SP, r.SP, bytesToRemove);
        }

        this.code.comment('Fin de bloque');
    }


    /**
      * @type {BaseVisitor['visitTernario']}
    */
    visitTernario(node) {
        throw new Error('Metodo visitTernario no implementado');
    }


    /**
      * @type {BaseVisitor['visitIf']}
    */
    visitIf(node) {
        throw new Error('Metodo visitIf no implementado');
    }


    /**
      * @type {BaseVisitor['visitSwitch']}
    */
    visitSwitch(node) {
        throw new Error('Metodo visitSwitch no implementado');
    }


    /**
      * @type {BaseVisitor['visitCaso']}
    */
    visitCaso(node) {
        throw new Error('Metodo visitCaso no implementado');
    }


    /**
      * @type {BaseVisitor['visitWhile']}
    */
    visitWhile(node) {
        throw new Error('Metodo visitWhile no implementado');
    }


    /**
      * @type {BaseVisitor['visitFor']}
    */
    visitFor(node) {
        throw new Error('Metodo visitFor no implementado');
    }


    /**
      * @type {BaseVisitor['visitBreak']}
    */
    visitBreak(node) {
        throw new Error('Metodo visitBreak no implementado');
    }


    /**
      * @type {BaseVisitor['visitContinue']}
    */
    visitContinue(node) {
        throw new Error('Metodo visitContinue no implementado');
    }


    /**
      * @type {BaseVisitor['visitReturn']}
    */
    visitReturn(node) {
        throw new Error('Metodo visitReturn no implementado');
    }


    /**
      * @type {BaseVisitor['visitLlamada']}
    */
    visitLlamada(node) {
        throw new Error('Metodo visitLlamada no implementado');
    }


    /**
      * @type {BaseVisitor['visitFuncDcl']}
    */
    visitFuncDcl(node) {
        throw new Error('Metodo visitFuncDcl no implementado');
    }


    /**
      * @type {BaseVisitor['visitParametro']}
    */
    visitParametro(node) {
        throw new Error('Metodo visitParametro no implementado');
    }



}