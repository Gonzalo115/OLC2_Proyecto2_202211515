
{
  const crearNodo = (tipoNodo, props) =>{
    const tipos = {
      'aritmetica':           nodos.Aritmetica,
      'OperacionU':           nodos.Operacion_Unaria,
      'comparacion':          nodos.Comparacion,
      'relacion':             nodos.Relacional,
      'logico':               nodos.Logico,
      'agrupacion':           nodos.Agrupacion,
      'dato':                 nodos.DatoPrimitivo,
      'declaracionVariable':  nodos.DeclaracionVariable,
      'referenciaVariable':   nodos.ReferenciaVariable,
      'asignacion':           nodos.Asignacion,
      'incremento':           nodos.Incremento,
      'decremento':           nodos.Decremento,
      'println':              nodos.Println,
      'expresionPrintln':     nodos.ExpresionPrintln,
      'expresionStmt':        nodos.ExpresionStmt,
      'bloque':               nodos.Bloque,
      'ternario':             nodos.Ternario,
      'if':                   nodos.If,
      'switch':               nodos.Switch,
      'casos':                nodos.Caso,
      'while':                nodos.While,
      'for':                  nodos.For,
      'break':                nodos.Break,
      'continue':             nodos.Continue,
      'return':               nodos.Return,
      'llamada':              nodos.Llamada,
      'dclFunc':              nodos.FuncDcl,
      'parametro':            nodos.Parametro
    }

    const nodo = new tipos[tipoNodo](props)
    nodo.location = location()
    return nodo
  }
}

programa = _ dcl:Declaracion* _ { return dcl }

Declaracion = _ dcl:DeclaracionVar _ { return dcl }
            / _ dcF:FuncDcl _ { return dcF }
            / _ stmt:Stmt _ { return stmt }

DeclaracionVar =  tipo:Tipo _ id:Identificador _
                exp:(
                  _"=" _ exp:Expresion _  { return exp } 
                )? ";" { return crearNodo('declaracionVariable', { tipo, id, exp }) } 

FuncDcl = tipo:TipoFuc _ id:Identificador _ "(" _ params:Parametros? _ ")" _ bloque:Bloque { return crearNodo('dclFunc', { tipo, id, params: params || [], bloque }) }

Parametros = id:Parametro _ params:("," _ ids:Parametro { return ids })* { return [id, ...params] }

Parametro  = _ tipo:TipoFuc _ id:Identificador _ { return crearNodo('parametro', { tipo, id }) }

Stmt = "System.out.println" _ "(" _ exp:ExpresionPrintln _ ")" _ ";" { return crearNodo('println', { exp }) }
    / Bloque:Bloque { return Bloque }
    / "if" _ "(" _ cond:Expresion _ ")" _ stmtTrue:Stmt 
      stmtFalse:(
        _ "else" _ stmtFalse:Stmt { return stmtFalse } 
      )? { return crearNodo('if', { cond, stmtTrue, stmtFalse }) }
    / "switch" _ "(" _ exp:Expresion _ ")" _ "{" _ casos:Casos* _ 
      stmtDefault:(
        _ "default" _ ":" _ stmtDefault:BloqueAux { return stmtDefault}
      )? _ "}" _ { return crearNodo('switch', { exp, casos, stmtDefault  }) }
    / "while" _ "(" _ cond:Expresion _ ")" _ stmt:Stmt { return crearNodo('while', { cond, stmt }) }
    / "for" _ "(" _ init:ForInit _ cond:Expresion _ ";" _ inc:Expresion _ ")" _ stmt:Stmt {
      return crearNodo('for', { init, cond, inc, stmt })
    }
    / "break" _ ";" { return crearNodo('break') }
    / "continue" _ ";" { return crearNodo('continue') }
    / "return" _ exp:Expresion? _ ";" { return crearNodo('return', { exp }) }
    / exp:Expresion _ ";" { return crearNodo('expresionStmt', { exp }) }

Bloque = "{" _ dcls:Declaracion* _ "}" { return crearNodo('bloque', { dcls }) }

Casos = _ "case" _ exp:Expresion _ ":" _ stmt:BloqueAux _ { return crearNodo('casos', {exp, stmt}) }

BloqueAux = _ dcls:Declaracion* _ { return crearNodo('bloque', { dcls }) }

ForInit = dcl:DeclaracionVar { return dcl }
        / exp:Expresion _ ";" { return exp }
        / ";" { return null }

ExpresionPrintln = exp_left:Expresion _ "," _ exp_right:ExpresionPrintln { return crearNodo('expresionPrintln', { exp_left, exp_right }) }
                / Expresion

Expresion = Ternario

Ternario = _ cond:Asignacion _ "?" _ expTrue:Asignacion _ ":" _ expFalse:Asignacion _ { return crearNodo('ternario', { cond, expTrue, expFalse } ) }
          /Asignacion

Asignacion = id:Identificador _ "=" _ asgn:Asignacion { return crearNodo('asignacion', { id, asgn }) }
          / AsignacionOp

AsignacionOp = id:Identificador _ "+=" _ valor:Asignacion { return crearNodo('incremento', { id, valor }) }
            /  id:Identificador _ "-=" _ valor:Asignacion { return crearNodo('decremento', { id, valor }) }
            /  id:Identificador _ "++" _ 
             valor:(
              _ { return crearNodo('dato', { valor: 1, tipo: "int"}) } 
             ) _ { return crearNodo('incremento', { id, valor }) }       
            /  id:Identificador _ "--" _ 
             valor:(
              _ { return crearNodo('dato', { valor: -1, tipo: "int"}) } 
             ) _ { return crearNodo('incremento', { id, valor }) }              
            / Or

Or = exp_left:And expansion:(
  _ operacion:("||") _ exp_right:And { return { tipo: operacion, exp_right } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, exp_right } = operacionActual
      return crearNodo('logico', { operacion:tipo, exp_left: operacionAnterior, exp_right })
    },
    exp_left
  )
}

And = exp_left:Comparacion expansion:(
  _ operacion:("&&") _ exp_right:Comparacion { return { tipo: operacion, exp_right } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, exp_right } = operacionActual
      return crearNodo('logico', { operacion:tipo, exp_left: operacionAnterior, exp_right })
    },
    exp_left
  )
}

Comparacion = exp_left:Relacional expansion:(
  _ operacion:("==" / "!=") _ exp_right:Relacional { return { tipo: operacion, exp_right } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, exp_right } = operacionActual
      return crearNodo('comparacion', { operacion:tipo, exp_left: operacionAnterior, exp_right })
    },
    exp_left
  )
}

Relacional = exp_left:Suma expansion:(
  _ operacion:("<="/">="/">"/"<") _ exp_right:Suma { return { tipo: operacion, exp_right } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, exp_right } = operacionActual
      return crearNodo('relacion', { operacion:tipo, exp_left: operacionAnterior, exp_right })
    },
    exp_left
  )
}

Suma = exp_left:Multiplicacion expansion:(
  _ operacion:("+" / "-") _ exp_right:Multiplicacion { return { tipo: operacion, exp_right } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, exp_right } = operacionActual
      return crearNodo('aritmetica', { operacion:tipo, exp_left: operacionAnterior, exp_right })
    },
    exp_left
  )
}

Multiplicacion = exp_left:Unaria expansion:(
  _ operacion:("*" / "/"/ "%") _ exp_right:Unaria { return { tipo: operacion, exp_right } }
)* {
    return expansion.reduce(
      (operacionAnterior, operacionActual) => {
        const { tipo, exp_right } = operacionActual
        return crearNodo('aritmetica', { operacion:tipo, exp_left: operacionAnterior, exp_right })
      },
      exp_left
    )
}

Unaria =_ operacion:("-" / "!") _ num:Unaria _ { return crearNodo('OperacionU', { operacion: operacion, exp_unica: num }) }
/ LlamadaEs
/ Llamada


Llamada = callee:Nativo _ params:("(" args:Argumentos? ")" { return args })* {
  return params.reduce(
    (callee, args) => {
      return crearNodo('llamada', { callee, args: args || [] })
    },
    callee
  )
}

Argumentos = arg:Expresion _ args:("," _ exp:Expresion { return exp })* { return [arg, ...args] }

LlamadaEs = _ callee:idtypeof _ args:Expresion* _ { return crearNodo('llamada', { callee, args: args}) }

idtypeof = id:"typeof" { return crearNodo('referenciaVariable',  { id }) }


Nativo = [0-9]+("." [0-9]+)                           { return crearNodo('dato', { valor: parseFloat(text()), tipo: "float"}) }
      /[0-9]+                                         { return crearNodo('dato', { valor: parseInt(text(), 10), tipo: "int"}) } 
      /("true"/"false")                               { return crearNodo('dato',    { valor: text() === "true", tipo:"boolean"})}
      /'"' chars:( [^\\"\n\r] / escapeSequence)* '"'  { return crearNodo('dato',  { valor: chars.join(''), tipo: "string"});}
      /"'" chars:[\x00-\uffff] "'"                    { return crearNodo('dato',    { valor: chars, tipo: "char"}); }
      / "(" _ exp:Expresion _ ")"                     { return crearNodo('agrupacion', { exp }) }
      / id:Identificador                              { return crearNodo('referenciaVariable',  { id }) }



// Secuencias de escape
escapeSequence=  '\\"'  { return '"'; }       // Comilla doble escapada
    / "\\\\" { return "\\"; }      // Barra invertida escapada
    / "\\n"  { return "\n"; }      // Salto de línea
    / "\\r"  { return "\r"; }      // Retorno de carro
    / "\\t"  { return "\t"; }      // Tabulación


// Tipos de datos
Tipo  = "int"     { return text(); }
      / "float"   { return text(); }
      / "string"  { return text(); }
      / "boolean" { return text(); }
      / "char"    { return text(); }
      / "var"     { return text(); }

TipoFuc = "int"     { return text(); }
        / "float"   { return text(); }
        / "string"  { return text(); }
        / "boolean" { return text(); }
        / "char"    { return text(); }
        / "void"    { return text(); }    
        / Identificador { return text(); }


// Identificador
Identificador = [a-zA-Z][a-zA-Z0-9]* { return text() }

_ = ([ \t\n\r] / Comentarios)* 


Comentarios = "//" (![\n] .)*
            / "/*" (!("*/") .)* "*/"