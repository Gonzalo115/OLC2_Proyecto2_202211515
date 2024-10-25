import { registers as r, floatRegisters as f } from "./constantes.js"
import { Generador } from "./generador.js"
import { stringTo1ByteArray, numberToF32 } from "./utils.js";

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
    const end2 = code.getLabel()
    const true1 = code.getLabel()
    const loop1 = code.addLabel()

    //Copiando el caracter a t1 y t2
    code.lb(r.T1, r.A0)
    code.lb(r.T2, r.A1)

    //Comparar el caracter
    code.beq(r.T1, r.T2, true1)

    //Si llego aqui es que no son iguales
    code.li(r.T0, 0);

    code.j(end1)

    //Etiqueta es verdadera
    code.addLabel(true1)
    

    //Si uno es fin de cadena y como son iguales aun entonces esque se termino la comparacion
    code.beq(r.T1, r.ZERO, end2)


    //Mover el puntero al siguiente caracter
    code.addi(r.A0, r.A0, 1)
    code.addi(r.A1, r.A1, 1)

    code.j(loop1)
    code.addLabel(end2)
    code.li(r.T0, 1);
    code.addLabel(end1)
    code.push(r.T0);
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
    code.j(end1)

    //Etiqueta es verdadera
    code.addLabel(false1)

    code.li(r.T0, 0);

    //Si uno es fin de cadena y como son iguales aun entonces esque se termino la comparacion
    code.beq(r.T1, r.ZERO, end1)


    //Mover el puntero al siguiente caracter
    code.addi(r.A0, r.A0, 1)
    code.addi(r.A1, r.A1, 1)



    code.j(loop1)
    code.addLabel(end1)
    code.push(r.T0);

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
    

    //salto hasta etiqueta de finalizacion
    code.j(labelEnd);

    //label true
    code.addLabel(labelTrue);
    code.li(r.T0, 1);

    //label finalizacion
    code.addLabel(labelEnd);
    code.fadd(f.FT0, f.FT1, f.FT0);
    code.push(r.T0);
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
    

    //salto hasta etiqueta de finalizacion
    code.j(labelEnd);

    //label true
    code.addLabel(labelTrue);
    code.li(r.T0, 1);
    

    //label finalizacion
    code.addLabel(labelEnd);
    code.push(r.T0);
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
    

    //salto hasta etiqueta de finalizacion
    code.j(labelEnd);

    //label true
    code.addLabel(labelTrue);
    code.li(r.T0, 1);


    //label finalizacion
    code.addLabel(labelEnd);
    code.push(r.T0);
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

    //salto hasta etiqueta de finalizacion
    code.j(labelEnd);

    //label true
    code.addLabel(labelTrue);
    code.li(r.T0, 1);

    //label finalizacion
    code.addLabel(labelEnd);
    code.push(r.T0);
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

    //salto hasta etiqueta de finalizacion
    code.j(labelEnd);

    //label true
    code.addLabel(labelTrue);
    code.li(r.T0, 1);

    //label finalizacion
    code.addLabel(labelEnd);
    code.push(r.T0);
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

    //salto hasta etiqueta de finalizacion
    code.j(labelEnd);

    //label true
    code.addLabel(labelTrue);
    code.li(r.T0, 1);

    //label finalizacion
    code.addLabel(labelEnd);
    code.push(r.T0);
}

/**
 * @param {Generador} code
 */
export const FparseInt = (code) => {

    // A0 -> dirección en heap de la cadena a transformar
    // result -> push en el stack la dirección en heap de la cadena concatenada

    code.comment('Parsenado a entero la cadena')

    code.li(r.T0, 0) //Aqui se estara guardando el numero
    code.li(r.T1, 1) //Aqui se estara diciendo si es negativo o positivo

    code.comment('Leendo la cadena')

    //Creando las etiquetas de salto
    const end1 = code.getLabel()
    const end2 = code.getLabel()
    const fueraRango = code.getLabel()
    const loop1 = code.getLabel()

    //Validar si es negativo el numero
    code.lb(r.T2, r.A0)
    code.li(r.T3, 45)
    code.bne(r.T2, r.T3, loop1)
    code.li(r.T1, -1)
    //Aumentado los apuntadores
    code.addi(r.A0, r.A0, 1)

    //Aqui comienza el ciclo
    code.addLabel(loop1)

    //Copiando el contenido de A0 a T2
    code.lb(r.T2, r.A0)

    //Si es cero entonces sigfica que ha llegado a el final de la cadena
    code.beq(r.T2, r.ZERO, end1)

    //Validar si el careacter corresponde a el '.'
    code.li(r.T3, 46)
    code.beq(r.T2, r.T3, end1)

    //En teoria la cadena que estamos convirtiendo a entero no tiene caracteres que no sean numeros al final si puede venir :)))

    code.li(r.T3, 48)
    code.blt(r.T2, r.T3, fueraRango)
    code.li(r.T3, 57)
    code.blt(r.T3, r.T2, fueraRango)

    //Le restamos 48 ya que haremos que el ascci que van del 48 - 57 se convierta en el numero literal que reprsenta su ascii
    code.li(r.T3, 48)
    code.sub(r.T2, r.T2, r.T3)

    //Aumentando nuestro numero que se encuentra en T0
    code.li(r.T3, 10)
    code.mul(r.T0, r.T0, r.T3)
    code.add(r.T0, r.T0, r.T2)

    //Aumentado los apuntadores
    code.addi(r.A0, r.A0, 1)

    //Regregas al inicio
    code.j(loop1)

    //Agregar etiqueta de finalizacion
    code.addLabel(end1)
    code.mul(r.T0, r.T0, r.T1)
    code.push(r.T0)
    code.j(end2)
    code.addLabel(fueraRango)
    code.push(r.HP)
    const stringArrayError = stringTo1ByteArray("error de conversion");
    stringArrayError.forEach((charCode) => {
        code.li(r.T0, charCode);
        code.sb(r.T0, r.HP);
        code.addi(r.HP, r.HP, 1);
    });
    code.pop(r.A0)
    code.li(r.A7, 4)
    code.ecall()
    code.li(r.A0, 10)
    code.li(r.A7, 11)
    code.ecall()
    code.li(r.T0, 0)
    code.push(r.T0)
    code.addLabel(end2)
}

/**
 * @param {Generador} code
 */
export const Fparsefloat = (code) => {
    // A0 -> dirección en heap de la cadena a transformar
    // result -> push en el stack la dirección en heap de la cadena concatenada

    code.comment('Parsenado a entero la cadena')

    //INICIALIZACION
    const ieeee754 = numberToF32(0);
    code.li(r.T0, ieeee754)
    code.fmvWX(f.FT0, r.T0) // Aqui cargaremos inicialmente la parte decimal del numero y lugo lo retornaremos

    const ieee754 = numberToF32(0.1);
    code.li(r.T0, ieee754)
    code.fmvWX(f.FT1, r.T0) // Constante de el valor 0.1
    code.fmvWX(f.FT2, r.T0) // En el registro FT2 lo iremos aumentado la farccionaria para ir multiplicando

    code.li(r.T1, 1)    //Aqui se estara diciendo si es negativo o positivo
    code.li(r.T0, 0)    //Aqui se estara guardando el numero la parte entera

    code.comment('Leendo la cadena')

    //Creando las etiquetas de salto
    const end1 = code.getLabel()
    const end2 = code.getLabel()
    const end3 = code.getLabel()
    const loop1 = code.getLabel()
    const loop2 = code.getLabel()

    const fueraRango = code.getLabel()

    //EVALUAR SI ES NEGATIVO
    code.lb(r.T2, r.A0)
    code.li(r.T3, 45)
    code.bne(r.T2, r.T3, loop1)
    code.li(r.T1, -1)
    //Aumentado los apuntadores
    code.addi(r.A0, r.A0, 1)

    //LOOP ENTERA
    code.addLabel(loop1)

    //Copiando el contenido de A0 a T2
    code.lb(r.T2, r.A0)

    //Si es cero entonces sigfica que ha llegado a el final de la cadena
    code.beq(r.T2, r.ZERO, end1)

    //Validar si el careacter corresponde a el '.'
    code.li(r.T3, 46)
    code.beq(r.T2, r.T3, loop2)

    //En teoria la cadena que estamos convirtiendo a entero no tiene caracteres que no sean numeros
    code.li(r.T3, 48)
    code.blt(r.T2, r.T3, fueraRango)
    code.li(r.T3, 57)
    code.blt(r.T3, r.T2, fueraRango)

    //Le restamos 48 ya que haremos que el ascci que van del 48 - 57 se convierta en el numero literal que reprsenta su ascii
    code.li(r.T3, 48)
    code.sub(r.T2, r.T2, r.T3)

    //Aumentando nuestro numero que se encuentra en T0
    code.li(r.T3, 10)
    code.mul(r.T0, r.T0, r.T3)
    code.add(r.T0, r.T0, r.T2)

    //Aumentado los apuntadores
    code.addi(r.A0, r.A0, 1)

    //Regregas al inicio
    code.j(loop1)

    //FINALIZACION ENTERA
    code.addLabel(end1)
    code.mul(r.T0, r.T0, r.T1)
    code.fcvtsw(f.FT0, r.T0)
    code.pushFloat(f.FT0)
    code.j(end3)


    //LOOP DECIMAL
    code.addLabel(loop2)

    //Aumentado los apuntadores
    code.addi(r.A0, r.A0, 1)

    //Copiando el contenido de A0 a T2
    code.lb(r.T2, r.A0)

    //Si es cero entonces sigfica que ha llegado a el final de la cadena
    code.beq(r.T2, r.ZERO, end2)

    //En teoria la cadena que estamos convirtiendo a entero no tiene caracteres que no sean numeros
    code.li(r.T3, 48)
    code.blt(r.T2, r.T3, fueraRango)
    code.li(r.T3, 57)
    code.blt(r.T3, r.T2, fueraRango)


    //Le restamos 48 ya que haremos que el ascci que van del 48 - 57 se convierta en el numero literal que reprsenta su ascii
    code.li(r.T3, 48)
    code.sub(r.T2, r.T2, r.T3)

    code.fcvtsw(f.FT3, r.T2)

    code.fmul(f.FT3, f.FT3, f.FT2) // Pasaremos a el numero decimal correspondiente
    code.fmul(f.FT2, f.FT2, f.FT1) // Aumentaremos nuestra constante acumulada
    code.fadd(f.FT0, f.FT0, f.FT3) // Sumaremos a lo acumulado decimal

    code.j(loop2)

    code.addLabel(end2)

    //CONCATENAR LA PARTE ENTERA Y DECIMAL Y EVALUAR SI ES POSITIVO O NEGATIVO
    code.mul(r.T0, r.T0, r.T1)
    code.fcvtsw(f.FT1, r.T0)
    code.fcvtsw(f.FT2, r.T1)
    code.fmul(f.FT0, f.FT0, f.FT2)
    code.fadd(f.FT0, f.FT0, f.FT1)
    code.pushFloat(f.FT0)
    code.j(end3)

    //Si exitiera un error.....
    code.addLabel(fueraRango)
    code.push(r.HP)
    const stringArrayError = stringTo1ByteArray("error de conversion");
    stringArrayError.forEach((charCode) => {
        code.li(r.T0, charCode);
        code.sb(r.T0, r.HP);
        code.addi(r.HP, r.HP, 1);
    });
    code.pop(r.A0)
    code.li(r.A7, 4)
    code.ecall()
    code.li(r.A0, 10)
    code.li(r.A7, 11)
    code.ecall()
    code.li(r.T0, 0)
    code.push(r.T0)

    //REGRESAR
    code.addLabel(end3)
}


/**
 * @param {Generador} code
 */
export const FtoLowerCase = (code) => {

    // A0 -> dirección en heap de la cadena a transformar
    // result -> push en el stack la dirección en heap de la cadena concatenada

    code.comment('Guardando en el stack la dirección en heap de la cadena a Cambiada')
    code.push(r.HP);

    code.comment('Leendo la cadena')

    //Creando las etiquetas de salto
    const end1 = code.getLabel()
    const ignorar = code.getLabel()
    const loop1 = code.addLabel()

    //Copiando el contenido de A0 a T1 
    code.lb(r.T0, r.A0)

    //Si es cero entonces sigfica que ha llegado a el final de la cadena
    code.beq(r.T0, r.ZERO, end1)

    //Calcular si el ascii de esto esta en el rango de las letras Mayusculas 65 - 90
    code.li(r.T1, 64)
    code.bge(r.T1, r.T0, ignorar)
    code.li(r.T1, 91)
    code.bge(r.T0, r.T1, ignorar)

    //Sumarle 32 para que se convierta en su contraparte minuscula
    code.li(r.T1, 32)
    code.add(r.T0, r.T0, r.T1)

    //Agregar etiqueta para ignorar en dondo caso que no este en dicho rango
    code.addLabel(ignorar)

    //Almacenar el lo que tenga el T1 en el apuntador de HP
    code.sb(r.T0, r.HP)

    //Aumentado los apuntadores
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A0, r.A0, 1)

    //Regregas al inicio
    code.j(loop1)

    //Agregar etiqueta de finalizacion
    code.addLabel(end1)


    //Agregar el caracter nulo para identificar que es la finalizacion de la cadena.
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)

}


/**
 * @param {Generador} code
 */
export const FtoUpperCase = (code) => {
    // A0 -> dirección en heap de la cadena a transformar
    // result -> push en el stack la dirección en heap de la cadena concatenada

    code.comment('Guardando en el stack la dirección en heap de la cadena a Cambiada')
    code.push(r.HP);

    code.comment('Leendo la cadena')

    //Creando las etiquetas de salto
    const end1 = code.getLabel()
    const ignorar = code.getLabel()
    const loop1 = code.addLabel()

    //Copiando el contenido de A0 a T1 
    code.lb(r.T0, r.A0)

    //Si es cero entonces sigfica que ha llegado a el final de la cadena
    code.beq(r.T0, r.ZERO, end1)

    //Calcular si el ascii de esto esta en el rango de las letras Minusculas 97 - 122
    code.li(r.T1, 96)
    code.bge(r.T1, r.T0, ignorar)
    code.li(r.T1, 123)
    code.bge(r.T0, r.T1, ignorar)

    //Restarle 32 para que se convierta en su contraparte en Mayuscula
    code.li(r.T1, 32)
    code.sub(r.T0, r.T0, r.T1)

    //Agregar etiqueta para ignorar en dondo caso que no este en dicho rango
    code.addLabel(ignorar)

    //Almacenar el lo que tenga el T1 en el apuntador de HP
    code.sb(r.T0, r.HP)

    //Aumentado los apuntadores
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A0, r.A0, 1)

    //Regregas al inicio
    code.j(loop1)

    //Agregar etiqueta de finalizacion
    code.addLabel(end1)


    //Agregar el caracter nulo para identificar que es la finalizacion de la cadena.
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)
}

export const Ftypeof = (code) => {

}

/**
 * @param {Generador} code
 */
export const FtoStringI = (code) => {

    //Aqui evaluaremos si es que era negativo el numero 

    //Guardaremos la direcion de Ra

    code.mv(r.T5, r.RA)


    const end1 = code.getLabel()
    const negativoLabel = code.getLabel()

    code.blt(r.T0, r.ZERO, negativoLabel)
    //Aqui transformaremos el entero en stirng
    code.jal('AuxtoStringI')
    code.j(end1)

    code.addLabel(negativoLabel)
    code.li(r.T1, -1)
    code.mul(r.T0, r.T0, r.T1)
    //Aqui transformaremos el entero en stirng
    code.jal('AuxtoStringI')
    code.pop(r.A1)

    //Agregaremos el signo menos a A0
    code.push(r.HP)
    code.li(r.T1, 45)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.pop(r.A0)

    code.jal('concatString')


    code.addLabel(end1)


    //Regresaremos la direcion de memoria de RA
    code.mv(r.RA, r.T5)


}

/**
 * @param {Generador} code
 */
export const FtoStringF = (code) => {

    //Ejemplo de cadena 1236.23

    code.fcvtws(r.T0, f.FT0) // Aqui tenermos la parte entera 1236


    // Lugar en donde estaremos almacenando el ra para el retorno de la llamada
    code.mv(r.T5, r.RA)      


    const end1 = code.getLabel()
    const negativoLabel = code.getLabel()

    code.blt(r.T0, r.ZERO, negativoLabel)
    //Aqui transformaremos el entero en stirng

    //Separaremos optendremos la parte decimal y la colocaremos en el registro FT0 cuando sea positivo
    code.fcvtsw(f.FT1, r.T0)    //Copiaremos el numero entero 1236 en FT1

    code.fsub(f.FT0, f.FT0, f.FT1) // sacremos la diferencia osea los decimales restantes 0.26

    code.li(r.T1, 1000)      // Constante que nos sirve para multiplicar el resudio y pasar entero una parete 0.236 -> 23.6
    code.fcvtsw(f.FT1, r.T1)
    code.fmul(f.FT0, f.FT0, f.FT1)
    code.fadd(f.FT0, f.FT0, f.FT1)     // Sumaremos un numero un posicon mas ya que los caso que sean 0.0235 no se contaria como 02.35 sino que 2.35
    

    code.jal('AuxtoStringI')
    code.j(end1)

    code.addLabel(negativoLabel)
    code.li(r.T1, -1)
    code.mul(r.T0, r.T0, r.T1)

    code.fcvtsw(f.FT1, r.T1)
    code.fmul(f.FT0, f.FT0, f.FT1)

    //Separaremos optendremos la parte decimal y la colocaremos en el registro FT0
    code.fcvtsw(f.FT1, r.T0)    //Copiaremos el numero entero 1236 en FT1

    code.fsub(f.FT0, f.FT0, f.FT1) // sacremos la diferencia osea los decimales restantes 0.26

    code.li(r.T1, 1000)      // Constante que nos sirve para multiplicar el resudio y pasar entero una parete 0.236 -> 23.6
    code.fcvtsw(f.FT1, r.T1)
    code.fmul(f.FT0, f.FT0, f.FT1)
    code.fadd(f.FT0, f.FT0, f.FT1)     // Sumaremos un numero un posicon mas ya que los caso que sean 0.0235 no se contaria como 02.35 sino que 2.35



    //Aqui transformaremos el entero en stirng
    code.jal('AuxtoStringI')
    code.pop(r.A1)

    //Agregaremos el signo menos a A0
    code.push(r.HP)
    code.li(r.T1, 45)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.pop(r.A0)
    code.jal('concatString')

    code.addLabel(end1)

    //Concatenar y calcular la parte Decimal

    code.pop(r.A0)

    //Agregaremos el signo . a A1
    code.push(r.HP)
    code.li(r.T1, 46)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.pop(r.A1)

    code.jal('concatString') //Concatenando lo que queda de la cadena 1236.
    

    code.fcvtws(r.T0, f.FT0) // Aqui tenermos la parte entera 1230 donde luego el 1 descartaremos
    //Aqui transformaremos el entero en stirng
    code.jal('AuxtoStringI')
    code.pop(r.A1)
    code.addi(r.A1, r.A1, 1) //Nos moveremos una poscicion para dejar 230
    code.pop(r.A0) //Sacaremos el contedino de 1236.
    code.jal('concatString') //Concatenando lo que queda de la cadena 1236.230



    //Regresaremos la direcion de memoria de RA
    code.mv(r.RA, r.T5)


}

/**
 * @param {Generador} code
 */
export const FtoStringB = (code) => {

    code.push(r.HP);

    const falseLabel = code.getLabel();
    const endLabel = code.getLabel();

    code.beq(r.T0, r.ZERO, falseLabel);
    const stringArrayTrue = stringTo1ByteArray("true");
    stringArrayTrue.forEach((charCode) => {
        code.li(r.T0, charCode);
        code.sb(r.T0, r.HP);
        code.addi(r.HP, r.HP, 1);
    });
    code.j(endLabel);
    code.addLabel(falseLabel);
    const stringArrayFalse = stringTo1ByteArray("false");
    stringArrayFalse.forEach((charCode) => {
        code.li(r.T0, charCode);
        code.sb(r.T0, r.HP);
        code.addi(r.HP, r.HP, 1);
    });

    code.addLabel(endLabel);

}

/**
 * @param {Generador} code
 */
export const FtoStringC = (code) => {
    code.push(r.HP);

    const end1 = code.getLabel()
    const loop1 = code.addLabel()

    code.lb(r.T1, r.A0)
    code.beq(r.T1, r.ZERO, end1)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A0, r.A0, 1)
    code.j(loop1)
    code.addLabel(end1)

    code.comment('Agregando el caracter nulo al final')
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)
}

/**
 * @param {Generador} code
 */
export const AuxtoStringI = (code) => {

    //Aqui solo tendremos numeros positivos guardados en T0 y lo regresaremos como un string

    code.push(r.HP);

    //Agregar etiquetas
    const end1 = code.getLabel()
    const loop = code.getLabel()

    //Constantes
    code.li(r.T1, 10)
    code.li(r.T2, 48)

    //Para facilidad aremos que la cadena este encerrada entre dos caracteres nulos
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)

    code.addLabel(loop)


    code.rem(r.T3, r.T0, r.T1)  //Sacamos el modulo osea el nuemro a guardar en la pila
    code.div(r.T0, r.T0, r.T1)  //En esta parte reduciremos el numero desde la parte derecha 754 -> 75 

    code.add(r.T3, r.T3, r.T2) //Convertir el numero literal en su represetnacion ascii

    code.sb(r.T3, r.HP)        //Guardaremos el numero
    code.addi(r.HP, r.HP, 1)   //Incementar el puntero

    code.beq(r.ZERO, r.T0, end1)//Si el resultado de la division es 0 significa que ya se termino el numero valido

    code.j(loop) //Saloto a la etiqueta loop para continuar el calculo

    code.addLabel(end1)

    //Agregar manualmente el caracter nulo de finalizacion

    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)

    code.pop(r.A0)

    //Invertimos la cadena osea aterior metne el numero 236 lo guardamos como la cedena 632 

    //Agregar etiquetas
    const end2 = code.getLabel()
    const end3 = code.getLabel()
    const loopInv = code.getLabel()
    const loopMv = code.getLabel()

    //Moveremos el puntero de A0 hasta el final
    code.addLabel(loopMv)
    code.addi(r.A0, r.A0, 1)     //movemos el puntero
    code.lb(r.T0, r.A0)
    code.beq(r.ZERO, r.T0, end2) //Si es cero hemos llegado al final de la cadena
    code.j(loopMv)
    code.addLabel(end2)
    code.addi(r.A0, r.A0, -1)     //Regresamos el puntero en 1


    //Guardar a la cadena a invertir
    code.push(r.HP)

    code.addLabel(loopInv)
    code.lb(r.T1, r.A0)
    code.beq(r.T1, r.ZERO, end3)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A0, r.A0, -1)
    code.j(loopInv)
    code.addLabel(end3)

    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)
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
    minMaEqC: minMaEqC,
    FparseInt: FparseInt,
    Fparsefloat: Fparsefloat,
    FtoStringI: FtoStringI,
    FtoStringF: FtoStringF,
    FtoStringB: FtoStringB,
    FtoStringC: FtoStringC,
    FtoLowerCase: FtoLowerCase,
    FtoUpperCase: FtoUpperCase,
    Ftypeof: Ftypeof,
    AuxtoStringI: AuxtoStringI
}