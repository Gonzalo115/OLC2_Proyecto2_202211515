import { FrameVisitor } from "./frame.js";
import { ReferenciaVariable } from "./nodos.js";
import { registers as r, floatRegisters as f } from "../risc/constantes.js";
import { Generador } from "../risc/generador.js";
import { BaseVisitor } from "./visitor.js";
import { numberToF32 } from "../risc/utils.js";

export class CompilerVisitor extends BaseVisitor {

    constructor() {
        super();
        this.code = new Generador();

        this.continueLabel = null;
        this.breakLabel = null;

        this.functionMetada = {}
        this.insideFunction = false;
        this.frameDclIndex = 0;
        this.returnLabel = null;
    }


    /**
      * @type {BaseVisitor['visitExpresionStmt']}
    */
    visitExpresionStmt(node) {
        node.exp.accept(this);


        var reg = r.T0;

        if (this.code.getTopObject().type === 'float') {
            reg = f.FT0;
        }

        this.code.popObject(reg);
    }

    /**
     * @type {BaseVisitor['visitDatoPrimitivo']}
    */
    visitDatoPrimitivo(node) {
        this.code.comment(`Primitivo`);
        this.code.pushConstant({ type: node.tipo, valor: node.valor });
        this.code.comment(`Fin Primitivo`);
    }


    /**
      * @type {BaseVisitor['visitAritmetica']}
    */
    visitAritmetica(node) {
        this.code.comment(`Operacion: ${node.operacion}`);

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
                    this.code.li(r.T0, ieee754);
                    this.code.fcvtsw(f.FT1, r.T0);
                    this.code.fsub(f.FT0, f.FT1, f.FT0);
                    this.code.pushFloat(f.FT0);
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
        const izq = this.code.popObject(isIzqFloat ? f.FT1 : r.T1); // izq
        const isDerFloat = this.code.getTopObject().type === 'float';
        const der = this.code.popObject(isDerFloat ? f.FT2 : r.T2); // der

        if ((izq.type === 'float' && der.type === 'float') || (izq.type === 'int' && der.type === 'float') || (izq.type === 'float' && der.type === 'int')) {
            if (!isIzqFloat) this.code.fcvtsw(f.FT1, r.T1);
            if (!isDerFloat) this.code.fcvtsw(f.FT2, r.T2);
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

        if ((izq.type === 'int' && der.type === 'int') || (izq.type === 'boolean' && der.type === 'boolean')) {
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
            this.code.add(r.A0, r.ZERO, r.T1);
            this.code.add(r.A1, r.ZERO, r.T2);
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
            this.code.add(r.A0, r.ZERO, r.T1);
            this.code.add(r.A1, r.ZERO, r.T2);
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

            if (this.insideFunction) {
                const localObject = this.code.getFrameLocal(this.frameDclIndex);
                const valueObj = this.code.popObject(r.T0);

                this.code.addi(r.T1, r.FP, -localObject.offset * 4);
                this.code.sw(r.T0, r.T1);

                // ! inferir el tipo
                localObject.type = valueObj.type;
                this.frameDclIndex++;

                return
            }

        } else {
            //this.code.pushConstant({ type: node.tipo, valo: r.ZERO });
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

        if (variableObjectAux.type === "float") {
            reg = f.FT0;
        }

        const valueObject = this.code.popObject(reg);

        const [offset, variableObject] = this.code.getObject(node.id);


        if (this.insideFunction) {
            this.code.addi(r.T1, r.FP, -variableObject.offset * 4); // ! REVISAR
            this.code.sw(r.T0, r.T1); // ! revisar
            return
        }

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

        if (this.insideFunction) {
            this.code.addi(r.T1, r.FP, -variableObject.offset * 4);
            this.code.lw(r.T0, r.T1);
            this.code.push(r.T0);
            this.code.pushObject({ ...variableObject, id: undefined });
            return
        }

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

        // Obtener el valor de la variable
        this.code.addi(r.T0, r.SP, offsetAux);
        this.code.lw(r.T1, r.T0);
        this.code.push(r.T1);
        this.code.pushObject({ ...variableObjectAux, id: undefined });

        var valueObject;

        if (variableObjectAux.type === 'int') {
            this.code.comment(`Calculando el nuevo valor que se le asiganara a la variable`);
            this.code.popObject(r.T1);
            this.code.popObject(r.T0);
            this.code.add(r.T0, r.T1, r.T0);
            this.code.push(r.T0);
            this.code.pushObject({ type: 'int', length: 4 });
            valueObject = this.code.popObject(r.T0)

            this.code.comment(`Agregando el nuevo valor de la variable`);
            const [offset, variableObject] = this.code.getObject(node.id);
            this.code.addi(r.T1, r.SP, offset);
            this.code.sw(r.T0, r.T1);
            variableObject.type = valueObject.type;
            this.code.push(r.T0);

        } else if (variableObjectAux.type === 'float') {
            this.code.comment(`Calculando el nuevo valor que se le asiganara a la variable`);
            this.code.popObject(f.FT1);
            const isFloat = this.code.getTopObject().type === 'float';
            this.code.popObject(isFloat ? f.FT0 : r.T0);
            if (!isFloat) this.code.fcvtsw(f.FT0, r.T0);
            this.code.fadd(f.FT0, f.FT1, f.FT0);
            this.code.pushFloat(f.FT0);
            this.code.pushObject({ type: 'float', length: 4 });
            valueObject = this.code.popObject(f.FT0)


            this.code.comment(`Agregando el nuevo valor de la variable`);
            const [offset, variableObject] = this.code.getObject(node.id);
            this.code.addi(r.T1, r.SP, offset);
            this.code.fsw(f.FT0, r.T1);
            variableObject.type = valueObject.type;
            this.code.pushFloat(f.FT0);
        }


        this.code.pushObject(valueObject);
        this.code.comment(`Fin Incremento Variable: ${node.id}`);
    }


    /**
      * @type {BaseVisitor['visitDecremento']}
    */
    visitDecremento(node) {
        this.code.comment(`Incremente Variable: ${node.id}`);

        node.valor.accept(this);

        const [offsetAux, variableObjectAux] = this.code.getObject(node.id);

        // Obtener el valor de la variable
        this.code.addi(r.T0, r.SP, offsetAux);
        this.code.lw(r.T1, r.T0);
        this.code.push(r.T1);
        this.code.pushObject({ ...variableObjectAux, id: undefined });

        var valueObject;

        if (variableObjectAux.type === 'int') {
            this.code.comment(`Calculando el nuevo valor que se le asiganara a la variable`);
            this.code.popObject(r.T1);
            this.code.popObject(r.T0);
            this.code.sub(r.T0, r.T1, r.T0);
            this.code.push(r.T0);
            this.code.pushObject({ type: 'int', length: 4 });
            valueObject = this.code.popObject(r.T0)

            this.code.comment(`Agregando el nuevo valor de la variable`);
            const [offset, variableObject] = this.code.getObject(node.id);
            this.code.addi(r.T1, r.SP, offset);
            this.code.sw(r.T0, r.T1);
            variableObject.type = valueObject.type;
            this.code.push(r.T0);

        } else if (variableObjectAux.type === 'float') {
            this.code.comment(`Calculando el nuevo valor que se le asiganara a la variable`);
            this.code.popObject(f.FT1);
            const isFloat = this.code.getTopObject().type === 'float';
            this.code.popObject(isFloat ? f.FT0 : r.T0);
            if (!isFloat) this.code.fcvtsw(f.FT0, r.T0);
            this.code.fsub(f.FT0, f.FT1, f.FT0);
            this.code.pushFloat(f.FT0);
            this.code.pushObject({ type: 'float', length: 4 });
            valueObject = this.code.popObject(f.FT0)


            this.code.comment(`Agregando el nuevo valor de la variable`);
            const [offset, variableObject] = this.code.getObject(node.id);
            this.code.addi(r.T1, r.SP, offset);
            this.code.fsw(f.FT0, r.T1);
            variableObject.type = valueObject.type;
            this.code.pushFloat(f.FT0);
        }


        this.code.pushObject(valueObject);
        this.code.comment(`Fin Incremento Variable: ${node.id}`);
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
            'boolean': () => this.code.printBoolean(),
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
        node.exp_right.accept(this); // izq | der
        const isDerFloat = this.code.getTopObject().type === 'float';
        const der = this.code.popObject(isDerFloat ? f.FT0 : r.T0); // der


        switch (der.type) {
            case 'int':
                this.code.callBuiltin('FtoStringI');
                this.code.callBuiltinAux('AuxtoStringI');//Generalizar para transformar los enteros en cadenas
                this.code.callBuiltinAux('concatString');//Nos servira para concatener las cadenas
                break
            case 'float':
                this.code.callBuiltin('FtoStringF');
                this.code.callBuiltinAux('AuxtoStringI');//Generalizar para transformar los enteros en cadenas
                this.code.callBuiltinAux('concatString');//Nos servira para concatener las cadenas
                break
            case 'boolean':
                this.code.callBuiltin('FtoStringB');
                break
            case 'char':
                this.code.add(r.A0, r.ZERO, r.T0);
                this.code.callBuiltin('FtoStringC');
                break
            case 'string':
                this.code.push(r.T0);
                break
        }
        this.code.pushObject({ type: 'string', length: 4 });


        node.exp_left.accept(this); // izq |
        const isIzqFloat = this.code.getTopObject().type === 'float';
        const izq = this.code.popObject(isIzqFloat ? f.FT0 : r.T0); // izq

        switch (izq.type) {
            case 'int':
                this.code.callBuiltin('FtoStringI');
                this.code.callBuiltinAux('AuxtoStringI');//Generalizar para transformar los enteros en cadenas
                this.code.callBuiltinAux('concatString');//Nos servira para concatener las cadenas
                break
            case 'float':
                this.code.callBuiltin('FtoStringF');
                this.code.callBuiltinAux('AuxtoStringI');//Generalizar para transformar los enteros en cadenas
                this.code.callBuiltinAux('concatString');//Nos servira para concatener las cadenas
                break
            case 'boolean':
                this.code.callBuiltin('FtoStringB');
                break
            case 'char':
                this.code.add(r.A0, r.ZERO, r.T0);
                this.code.callBuiltin('FtoStringC');
                break
            case 'string':
                this.code.push(r.T0);
                break
        }
        this.code.pushObject({ type: 'string', length: 4 });


        this.code.pop(r.A0)
        this.code.pop(r.A1)

        this.code.callBuiltin('concatString');
        this.code.pushObject({ type: 'string', length: 4 });
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
        this.code.comment('Inicio de ternario');

        // Evaluar si la condicion es verdadera o falsa
        this.code.comment('Condicion');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('Fin de condicion');

        //Crear las etiquetas para los saltos 
        const condFalsaLabel = this.code.getLabel();
        const endTernarioLabel = this.code.getLabel();

        //Validar si es falsa o verdadra
        this.code.beq(r.T0, r.ZERO, condFalsaLabel);
        this.code.comment('Si la condicion es verdadera');
        node.expTrue.accept(this);
        this.code.j(endTernarioLabel);
        this.code.addLabel(condFalsaLabel);
        this.code.comment('Si la condicion es falsa');
        node.expTrue.accept(this);
        this.code.addLabel(endTernarioLabel);

        this.code.comment('Fin de ternario');
    }


    /**
      * @type {BaseVisitor['visitIf']}
    */
    visitIf(node) {
        this.code.comment('Inicio de If');

        this.code.comment('Condicion');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('Fin de condicion');

        const hasElse = node.stmtFalse

        if (hasElse) {
            const elseLabel = this.code.getLabel();
            const endIfLabel = this.code.getLabel();

            this.code.beq(r.T0, r.ZERO, elseLabel);
            this.code.comment('Rama verdadera');
            node.stmtTrue.accept(this);
            this.code.j(endIfLabel);
            this.code.addLabel(elseLabel);
            this.code.comment('Rama falsa');
            node.stmtFalse.accept(this);
            this.code.addLabel(endIfLabel);
        } else {
            const endIfLabel = this.code.getLabel();
            this.code.beq(r.T0, r.ZERO, endIfLabel);
            this.code.comment('Rama verdadera');
            node.stmtTrue.accept(this);
            this.code.addLabel(endIfLabel);
        }

        this.code.comment('Fin del If');
    }


    /**
      * @type {BaseVisitor['visitSwitch']}
    */
    visitSwitch(node) {
        this.code.comment('Inicio del Switch');

        // Evaluar la exp para el condicion
        node.exp.accept(this);

        const condFloat = this.code.getTopObject().type === 'float';
        const objCond = this.code.popObject(condFloat ? f.FT1 : r.T1);

        //Label de finalizacion junto a el break
        const labelEndSwitch = this.code.getLabel();
        const prevBreakLabel = this.breakLabel;
        this.breakLabel = labelEndSwitch;

        //Etiqueta para el salto a el sigueinte kcaso si no existiera un break
        let saltoCaso = this.code.getLabel();

        for (let i = 0; i < node.casos.length; i++) {

            node.casos[i].exp.accept(this)
            const casoFloat = this.code.getTopObject().type === 'float';
            const objCaso = this.code.popObject(casoFloat ? f.FT2 : r.T2);

            // Validar si el caso es verdadero
            if ((objCond.type === 'float' && objCaso.type === 'float') || (objCond.type === 'int' && objCaso.type === 'float') || (objCond.type === 'float' && objCaso.type === 'int')) {
                if (!condFloat) this.code.fcvtsw(f.FT1, r.T1);
                if (!casoFloat) this.code.fcvtsw(f.FT2, r.T2);
                this.code.callBuiltin('equalFloat');
            }

            if ((objCond.type === 'int' && objCaso.type === 'int') || (objCond.type === 'int' && objCaso.type === 'int')) {
                this.code.callBuiltin('equalInt');
            }

            if ((objCond.type === 'char' && objCaso.type === 'char') || (objCond.type === 'string' && objCaso.type === 'string')) {
                this.code.add(r.A0, r.ZERO, r.T1);
                this.code.add(r.A1, r.ZERO, r.T2);
                this.code.callBuiltin('equalString');
            }

            //Crear el correlativo de las labels
            const labelEnd = this.code.getLabel();

            //Si en T0 es falso '0' entonces se saltara el caso
            this.code.beq(r.T0, r.ZERO, labelEnd);

            this.code.addLabel(saltoCaso);


            //Evaluar el cuerpo del caso
            node.casos[i].stmt.accept(this)

            //Solo se podra saltar a el siguiente caso si no hay un caso mas 
            if (i + 1 < node.casos.length) {
                saltoCaso = this.code.getLabel();
                this.code.j(saltoCaso);
            }

            // Colocara el label que me indicara que se salta el caso
            this.code.addLabel(labelEnd);
        }

        if (node.stmtDefault) {
            node.stmtDefault.accept(this);
        }

        this.code.addLabel(labelEndSwitch);
        this.breakLabel = prevBreakLabel;

        this.code.comment('Fin del Switch');

    }


    /**
      * @type {BaseVisitor['visitCaso']}
    */
    visitCaso(node) {
        throw new Error('Metodo auxiliar');
    }


    /**
      * @type {BaseVisitor['visitWhile']}
    */
    visitWhile(node) {
        const startWhileLabel = this.code.getLabel();
        const prevContinueLabel = this.continueLabel;
        this.continueLabel = startWhileLabel;

        const endWhileLabel = this.code.getLabel();
        const prevBreakLabel = this.breakLabel;
        this.breakLabel = endWhileLabel;

        this.code.addLabel(startWhileLabel);
        this.code.comment('Condicion');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('Fin de condicion');
        this.code.beq(r.T0, r.ZERO, endWhileLabel);
        this.code.comment('Cuerpo del while');
        node.stmt.accept(this);
        this.code.j(startWhileLabel);
        this.code.addLabel(endWhileLabel);

        this.continueLabel = prevContinueLabel;
        this.breakLabel = prevBreakLabel;
    }


    /**
      * @type {BaseVisitor['visitFor']}
    */
    visitFor(node) {
        this.code.comment('For');

        const startForLabel = this.code.getLabel();

        const endForLabel = this.code.getLabel();
        const prevBreakLabel = this.breakLabel;
        this.breakLabel = endForLabel;

        const incrementLabel = this.code.getLabel();
        const prevContinueLabel = this.continueLabel;
        this.continueLabel = incrementLabel;

        this.code.newScope();

        node.init.accept(this);

        this.code.addLabel(startForLabel);
        this.code.comment('Condicion');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('Fin de condicion');
        this.code.beq(r.T0, r.ZERO, endForLabel);

        this.code.comment('Cuerpo del for');
        node.stmt.accept(this);

        this.code.addLabel(incrementLabel);
        node.inc.accept(this);
        this.code.popObject(r.T0);
        this.code.j(startForLabel);

        this.code.addLabel(endForLabel);

        this.code.comment('Reduciendo la pila');
        const bytesToRemove = this.code.endScope();

        if (bytesToRemove > 0) {
            this.code.addi(r.SP, r.SP, bytesToRemove);
        }

        this.continueLabel = prevContinueLabel;
        this.breakLabel = prevBreakLabel;

        this.code.comment('Fin de For');
    }


    /**
      * @type {BaseVisitor['visitBreak']}
    */
    visitBreak(node) {
        this.code.j(this.breakLabel);
    }


    /**
      * @type {BaseVisitor['visitContinue']}
    */
    visitContinue(node) {
        this.code.j(this.continueLabel);
    }


    /**
      * @type {BaseVisitor['visitReturn']}
    */
    visitReturn(node) {
        this.code.comment('Inicio Return');

        if (node.exp) {
            node.exp.accept(this);
            this.code.popObject(r.A0);

            const frameSize = this.functionMetada[this.insideFunction].frameSize
            const returnOffest = frameSize - 1;
            this.code.addi(r.T0, r.FP, -returnOffest * 4)
            this.code.sw(r.A0, r.T0)
        }

        this.code.j(this.returnLabel);
        this.code.comment('Final Return');
    }


    /**
      * @type {BaseVisitor['visitLlamada']}
    */
    visitLlamada(node) {
        if (!(node.callee instanceof ReferenciaVariable)) return

        const nombreFuncion = node.callee.id;

        if ((nombreFuncion === "parseInt") || (nombreFuncion === "parsefloat") || (nombreFuncion === "toString") || (nombreFuncion === "toLowerCase") || (nombreFuncion === "toUpperCase") || (nombreFuncion === "toUpperCase") || (nombreFuncion === "typeof")) {
            this.code.comment(` Llamada de la funcion Embebida`);

            node.args[0].accept(this)
            const isFloat = this.code.getTopObject().type === 'float';
            const param = this.code.popObject(isFloat ? f.FT0 : r.T0);

            switch (nombreFuncion) {
                case "parseInt":
                    this.code.add(r.A0, r.ZERO, r.T0);
                    this.code.callBuiltin('FparseInt');
                    this.code.pushObject({ type: 'int', length: 4 });
                    break;
                case "parsefloat":
                    this.code.add(r.A0, r.ZERO, r.T0);
                    this.code.callBuiltin('Fparsefloat');
                    this.code.pushObject({ type: 'float', length: 4 });
                    break;
                case "toString":
                    switch (param.type) {
                        case 'int':
                            this.code.callBuiltin('FtoStringI');
                            this.code.callBuiltinAux('AuxtoStringI');//Generalizar para transformar los enteros en cadenas
                            this.code.callBuiltinAux('concatString');//Nos servira para concatener las cadenas
                            break
                        case 'float':
                            this.code.callBuiltin('FtoStringF');
                            this.code.callBuiltinAux('AuxtoStringI');//Generalizar para transformar los enteros en cadenas
                            this.code.callBuiltinAux('concatString');//Nos servira para concatener las cadenas
                            break
                        case 'boolean':
                            this.code.callBuiltin('FtoStringB');
                            break
                        case 'char':
                            this.code.add(r.A0, r.ZERO, r.T0);
                            this.code.callBuiltin('FtoStringC');
                            break
                    }
                    this.code.pushObject({ type: 'string', length: 4 });
                    break;
                case "toLowerCase":
                    this.code.add(r.A0, r.ZERO, r.T0);
                    this.code.callBuiltin('FtoLowerCase');
                    this.code.pushObject({ type: 'string', length: 4 });
                    break;
                case "toUpperCase":
                    this.code.add(r.A0, r.ZERO, r.T0);
                    this.code.callBuiltin('FtoUpperCase');
                    this.code.pushObject({ type: 'string', length: 4 });
                    break;
                case "typeof":
                    this.code.pushConstant({ type: 'string', valor: param.type });
                    break;
            }

            this.code.comment(` Fin de la llamada de la funcion Embebida`);
            return;
        }

        this.code.comment(`Llamada a funcion ${nombreFuncion}`);

        const etiquetaRetornoLlamada = this.code.getLabel();

        // 1. Guardar los argumentos
        node.args.forEach((arg, index) => {
            arg.accept(this)
            this.code.popObject(r.T0)
            this.code.addi(r.T1, r.SP, -4 * (3 + index)) // ! REVISAR
            this.code.sw(r.T0, r.T1)
        });

        // Calcular la dirección del nuevo FP en T1
        this.code.addi(r.T1, r.SP, -4)

        // Guardar direccion de retorno
        this.code.la(r.T0, etiquetaRetornoLlamada)
        this.code.push(r.T0)

        // Guardar el FP
        this.code.push(r.FP)
        this.code.addi(r.FP, r.T1, 0)

        // colocar el SP al final del frame
        // this.code.addi(r.SP, r.SP, -(this.functionMetada[nombreFuncion].frameSize - 4))
        this.code.addi(r.SP, r.SP, -(node.args.length * 4)) // ! REVISAR


        // Saltar a la función
        this.code.j(nombreFuncion)
        this.code.addLabel(etiquetaRetornoLlamada)

        // Recuperar el valor de retorno
        const frameSize = this.functionMetada[nombreFuncion].frameSize
        const returnSize = frameSize - 1;
        this.code.addi(r.T0, r.FP, -returnSize * 4)
        this.code.lw(r.A0, r.T0)

        // Regresar el FP al contexto de ejecución anterior
        this.code.addi(r.T0, r.FP, -4)
        this.code.lw(r.FP, r.T0)

        // Regresar mi SP al contexto de ejecución anterior
        this.code.addi(r.SP, r.SP, (frameSize - 1) * 4)


        this.code.push(r.A0)
        this.code.pushObject({ type: this.functionMetada[nombreFuncion].returnType, length: 4 })

        this.code.comment(`Fin de llamada a funcion ${nombreFuncion}`);
    }


    /**
      * @type {BaseVisitor['visitFuncDcl']}
    */
    visitFuncDcl(node) {
        const baseSize = 2;
        //Reservar los espacion de memoria para los parametros
        const paramSize = node.params.length;
        //Reservar los escacios para las declaraciones en la funcion
        const frameVisitor = new FrameVisitor(baseSize + paramSize);
        node.bloque.accept(frameVisitor);
        const localFrame = frameVisitor.frame;
        const localSize = localFrame.length;

        const returnSize = 1;
        const totalSize = baseSize + paramSize + localSize + returnSize;
        this.functionMetada[node.id] = {
            frameSize: totalSize,
            returnType: node.tipo,
        }

        const instruccionesDeMain = this.code.instrucciones;
        const instruccionesDeDeclaracionDeFuncion = []
        this.code.instrucciones = instruccionesDeDeclaracionDeFuncion;

        node.params.forEach((param, index) => {
            this.code.pushObject({
                id: param.id,
                type: param.tipo,
                length: 4,
                offset: baseSize + index
            })
        });

        localFrame.forEach(variableLocal => {
            this.code.pushObject({
                ...variableLocal,
                length: 4,
                type: 'local',
            })
        });

        this.insideFunction = node.id;
        this.frameDclIndex = 0;
        this.returnLabel = this.code.getLabel();

        this.code.comment(`Declaracion de funcion ${node.id}`);
        this.code.addLabel(node.id);

        node.bloque.accept(this);

        this.code.addLabel(this.returnLabel);

        this.code.add(r.T0, r.ZERO, r.FP);
        this.code.lw(r.RA, r.T0);
        this.code.jalr(r.ZERO, r.RA, 0);
        this.code.comment(`Fin de declaracion de funcion ${node.id}`);


        // Limpiar metadatos
        for (let i = 0; i < paramSize + localSize; i++) {
            this.code.objectStack.pop();
        }

        this.code.instrucciones = instruccionesDeMain

        instruccionesDeDeclaracionDeFuncion.forEach(instruccion => {
            this.code.instrucionesDeFunciones.push(instruccion);
        });
    }

    /**
    * @type {BaseVisitor['visitParametro']}
    */
    visitParametro(node) {
        throw new Error('Metodo visitParametro no implementado');
    }


}