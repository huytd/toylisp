import { parse } from './parser';
import fs from 'fs';
import { BaseNode, IntegerNode, SeqNode, StringNode } from './parser/types';

const ARITHMETIC = {
    '+': 'ADD',
    '-': 'SUB',
    '%': 'MOD',
    '*': 'MUL',
    '/': 'DIV'
};

const SourcePrinter = (node: BaseNode) => {
    if (node.type === "SEQ") {
        return "(" + node.value.map(n => SourcePrinter(n)).join(" ") + ")";
    }
    if (node.type === "SYMBOL") {
        return node.value;
    }
    if (node.type === "VEC") {
        return "[" + node.value.map(n => SourcePrinter(n)).join(" ") + "]";
    }
    if (node.type === "INTEGER") {
        return node.value;
    }
    if (node.type === "STRING") {
        return "\"" + node.value + "\"";
    }
    return "unknown";
};

export class LookupTable {
    pointer = 0;
    data = {};

    write(value: string | number) {
        this.pointer++;
        this.data[value] = this.pointer;
        return this.pointer;
    }

    read(value: string | number) {
        const found = this.data[value];
        if (found) return found;
        else return this.write(value);
    }

    debug() {
        console.table(this.data);
    }
}

export class Compiler {
    constants = new LookupTable();
    symbols = new LookupTable();
    program: SeqNode[];

    constructor(program: SeqNode[]) {
        this.program = program;
    }

    compileNode(node: BaseNode, storing?: boolean) {
        if (node.type === "SEQ") {
            const currentNode: SeqNode = node as SeqNode;
            const command = currentNode.value[0].value;
            switch (command) {
                case 'let': {
                    const store_name = this.compileNode(currentNode.value[1], true);
                    const load_const = this.compileNode(currentNode.value[2]);
                    return [ load_const, store_name];
                }
                case 'print': {
                    const load_const = this.compileNode(currentNode.value[1]);
                    return [ load_const, "PRINT" ];
                }
                case '+': case '-': case '*': case '/': case '%': {
                    const load_const_a = this.compileNode(currentNode.value[1]);
                    const load_const_b = this.compileNode(currentNode.value[2]);
                    const operator = ARITHMETIC[command];
                    return [load_const_a, load_const_b, operator];
                }
                case '=': case '>': case '<': case '<=':
                    case '>=': case '!=': case 'eq': case 'neq': {
                    // compare
                }
            }
        }
        if (node.type === "SYMBOL") {
            // TODO: Handle symbol name lookup
            if (storing) {
                let symbol_id = this.symbols.read(node.value);
                return "STORE_NAME " + symbol_id;
            } else {
                return "LOAD_NAME " + node.value;
            }
        }
        // if (node.type === "VEC") {
        //     return "[" + node.value.map(n => this.compileNode(n)).join(" ") + "]";
        // }
        if (node.type === "INTEGER") {
            const id = this.constants.read((node as IntegerNode).value);
            return "LOAD_CONST " + id;
        }
        if (node.type === "STRING") {
            const id = this.constants.read((node as StringNode).value);
            return "LOAD_CONST " + id;
        }
        return [ "unknown" ];
    };

    compile() {
        return this.program.map(seq => this.compileNode(seq));
    }

    getConstants() {
        return this.constants;
    }

    getSymbols() {
        return this.symbols;
    }
}

const debugRun = () => {
    const source = fs.readFileSync('./examples/test.el', 'utf-8');
    const program: SeqNode[] = parse(source);
    const compiler = new Compiler(program);
    console.table(program.map(line => SourcePrinter(line)));
    const result = compiler.compile().map(line => line.flat().join(","));
    console.table(result);
    compiler.getConstants().debug();
    compiler.getSymbols().debug();
};

if (process.env.NODE_ENV !== "test") {
    debugRun();
}
