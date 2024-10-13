export class Errores {
    constructor(error, line, col) {
        this.error = error;
        this.line = line;
        this.col = col;
    }
    toString() {
        return `Error: ${this.error} (Línea: ${this.line}, Columna: ${this.col})`;
    }
}