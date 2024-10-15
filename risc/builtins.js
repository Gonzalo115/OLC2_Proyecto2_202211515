import { registers as r, floatRegisters as f } from "./constantes.js"
import { Generador } from "./generador.js"

/**
 * @param {Generador} code
 */
export const concatString = (code) => {
    // A0 -> dirección en heap de la primera cadena
    // A1 -> dirección en heap de la segunda cadena
    // result -> push en el stack la dirección en heap de la cadena concatenada

    code.comment('Guardando en el stack la dirección en heap de la cadena concatenada')
    code.push(r.HP);

    code.comment('Copiando la 1er cadena en el heap')
    const end1 = code.getLabel()
    const loop1 = code.addLabel()

    code.lb(r.T1, r.A0)
    code.beq(r.T1, r.ZERO, end1)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A0, r.A0, 1)
    code.j(loop1)
    code.addLabel(end1)

    code.comment('Copiando la 2da cadena en el heap')
    const end2 = code.getLabel()
    const loop2 = code.addLabel()

    code.lb(r.T1, r.A1)
    code.beq(r.T1, r.ZERO, end2)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A1, r.A1, 1)
    code.j(loop2)
    code.addLabel(end2)

    code.comment('Agregando el caracter nulo al final')
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)
}

/**
 * @param {Generador} code
 */
export const equalString = (code) => {

    code.comment('Comparardo Strings')

    //Agregar las etiquetas
    const end1 = code.getLabel()
    const true1 = code.getLabel()
    const loop1 = code.addLabel()

    //Copiando el caracter a t1 y t2
    code.lb(r.T1, r.A0)
    code.lb(r.T2, r.A1)

    //Comparar el caracter
    code.beq(r.T1, r.T2, true1)

    //Si llego aqui es que no son iguales
    code.li(r.T0, 0);
    code.push(r.T0);
    code.j(end1)

    //Etiqueta es verdadera
    code.addLabel(true1)

    code.li(r.T0, 1);
    code.push(r.T0);

    //Si uno es fin de cadena y como son iguales aun entonces esque se termino la comparacion
    code.beq(r.T1, r.ZERO, end1)


    //Mover el puntero al siguiente caracter
    code.addi(r.A0, r.A0, 1)
    code.addi(r.A1, r.A1, 1)



    code.j(loop1)
    code.addLabel(end1)

}

/**
 * @param {Generador} code
 */
export const notEqualString = (code) => {

    code.comment('Comparardo Strings no iguales')

    //Agregar las etiquetas
    const end1 = code.getLabel()
    const false1 = code.getLabel()
    const loop1 = code.addLabel()

    //Copiando el caracter a t1 y t2
    code.lb(r.T1, r.A0)
    code.lb(r.T2, r.A1)

    //Comparar el caracter
    code.beq(r.T1, r.T2, false1)

    //Si llego aqui es que no son iguales los caracteres
    code.li(r.T0, 1);
    code.push(r.T0);
    code.j(end1)

    //Etiqueta es verdadera
    code.addLabel(false1)

    code.li(r.T0, 0);
    code.push(r.T0);

    //Si uno es fin de cadena y como son iguales aun entonces esque se termino la comparacion
    code.beq(r.T1, r.ZERO, end1)


    //Mover el puntero al siguiente caracter
    code.addi(r.A0, r.A0, 1)
    code.addi(r.A1, r.A1, 1)



    code.j(loop1)
    code.addLabel(end1)

}

/**
 * @param {Generador} code
 */
export const equalInt = (code) => {
    //Crear el correlativo de las labels
    const labelTrue = code.getLabel();
    const labelEnd = code.getLabel();

    //Realizar la == para evaluar si se salta hasta la laabel si es verdadeera
    code.beq(r.T1, r.T2, labelTrue);

    //Si ha llegado hasta aui significa que era falso lo anterior y guardar en t0 false
    code.li(r.T0, 0);
    code.push(r.T0);

    //salto hasta etiqueta de finalizacion
    code.j(labelEnd);

    //label true
    code.addLabel(labelTrue);
    code.li(r.T0, 1);
    code.push(r.T0);

    //label finalizacion
    code.addLabel(labelEnd);
    code.fadd(f.FT0, f.FT1, f.FT0);
}

/**
 * @param {Generador} code
 */
export const notEqualInt = (code) => {
    //Crear el correlativo de las labels
    const labelTrue = code.getLabel();
    const labelEnd = code.getLabel();

    //Realizar la != para evaluar si se salta hasta la laabel si es verdadeera
    code.bne(r.T1, r.T2, labelTrue);

    //Si ha llegado hasta aqui significa que era falso lo anterior y guardar en t0 false
    code.li(r.T0, 0);
    code.push(r.T0);

    //salto hasta etiqueta de finalizacion
    code.j(labelEnd);

    //label true
    code.addLabel(labelTrue);
    code.li(r.T0, 1);
    code.push(r.T0);

    //label finalizacion
    code.addLabel(labelEnd);
}

/**
 * @param {Generador} code
 */
export const equalFloat = (code) => {
    code.feq(r.T0, f.FT1, f.FT2);
    code.push(r.T0);
}

/**
 * @param {Generador} code
 */
export const notEqualFloat = (code) => {
    code.feq(r.T0, f.FT1, f.FT2);
    code.xori(r.T0, r.T0)
    code.push(r.T0);
}

/**
 * @param {Generador} code
 */
export const minMayI = (code) => {
    //Crear el correlativo de las labels
    const labelTrue = code.getLabel();
    const labelEnd = code.getLabel();

    //Realizar la < para evaluar si se salta hasta la laabel si es verdadeera
    code.blt(r.T0, r.T1, labelTrue);

    //Si ha llegado hasta aui significa que era falso lo anterior y guardar en t0 false
    code.li(r.T0, 0);
    code.push(r.T0);

    //salto hasta etiqueta de finalizacion
    code.j(labelEnd);

    //label true
    code.addLabel(labelTrue);
    code.li(r.T0, 1);
    code.push(r.T0);

    //label finalizacion
    code.addLabel(labelEnd);
}


/**
 * @param {Generador} code
 */
export const minMayC = (code) => {
    //Cuando se implemente datos float
    const labelTrue = code.getLabel();
    const labelEnd = code.getLabel();

    code.lb(r.T0, r.T0)
    code.lb(r.T1, r.T1)

    //Realizar la < para evaluar si se salta hasta la laabel si es verdadeera
    code.blt(r.T0, r.T1, labelTrue);

    //Si ha llegado hasta aui significa que era falso lo anterior y guardar en t0 false
    code.li(r.T0, 0);
    code.push(r.T0);

    //salto hasta etiqueta de finalizacion
    code.j(labelEnd);

    //label true
    code.addLabel(labelTrue);
    code.li(r.T0, 1);
    code.push(r.T0);

    //label finalizacion
    code.addLabel(labelEnd);
}


/**
 * @param {Generador} code
 */
export const minMaEqI = (code) => {
    //Crear el correlativo de las labels
    const labelTrue = code.getLabel();
    const labelEnd = code.getLabel();

    //Realizar la >= para evaluar si se salta hasta la laabel si es verdadeera
    code.bge(r.T0, r.T1, labelTrue);

    //Si ha llegado hasta aui significa que era falso lo anterior y guardar en t0 false
    code.li(r.T0, 0);
    code.push(r.T0);

    //salto hasta etiqueta de finalizacion
    code.j(labelEnd);

    //label true
    code.addLabel(labelTrue);
    code.li(r.T0, 1);
    code.push(r.T0);

    //label finalizacion
    code.addLabel(labelEnd);
}


/**
 * @param {Generador} code
 */
export const minMaEqC = (code) => {
    //Cuando se implemente datos float
    const labelTrue = code.getLabel();
    const labelEnd = code.getLabel();

    code.lb(r.T0, r.T0)
    code.lb(r.T1, r.T1)

    //Realizar la >= para evaluar si se salta hasta la laabel si es verdadeera
    code.bge(r.T0, r.T1, labelTrue);

    //Si ha llegado hasta aui significa que era falso lo anterior y guardar en t0 false
    code.li(r.T0, 0);
    code.push(r.T0);

    //salto hasta etiqueta de finalizacion
    code.j(labelEnd);

    //label true
    code.addLabel(labelTrue);
    code.li(r.T0, 1);
    code.push(r.T0);

    //label finalizacion
    code.addLabel(labelEnd);
}



export const builtins = {
    concatString: concatString,
    equalString: equalString,
    notEqualString: notEqualString,
    equalInt: equalInt,
    notEqualInt: notEqualInt,
    equalFloat: equalFloat,
    notEqualFloat: notEqualFloat,
    minMayI: minMayI,
    minMayC: minMayC,
    minMaEqI: minMaEqI,
    minMaEqC: minMaEqC
}