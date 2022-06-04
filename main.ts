import { parse } from './parser';
import fs from 'fs';
import { IntegerNode, SeqNode, StringNode, SyntaxNode } from './parser/types';

const ARITHMETIC = {
    '+': 'ADD',
    '-': 'SUB',
    '%': 'MOD',
    '*': 'MUL',
    '/': 'DIV'
};

const SourcePrinter = (node: SyntaxNode) => {
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
    labelCount = 0;

    constructor(program: SeqNode[]) {
        this.program = program;
    }

    compileNode(node: SyntaxNode, storing?: boolean) {
        if (node.type === "SEQ") {
            const command = node.value[0].value;
            switch (command) {
                case 'let': {
                    const store_name = this.compileNode(node.value[1], true);
                    const load_const = this.compileNode(node.value[2]);
                    return [ load_const, store_name];
                }
                case 'print': {
                    const load_const = this.compileNode(node.value[1]);
                    return [ load_const, "PRINT" ];
                }
                case '+': case '-': case '*': case '/': case '%': {
                    const load_const_a = this.compileNode(node.value[1]);
                    const load_const_b = this.compileNode(node.value[2]);
                    const operator = ARITHMETIC[command];
                    return [load_const_a, load_const_b, operator];
                }
                case '=': case '>': case '<': case '<=':
                    case '>=': case '!=': case 'eq': case 'neq': {
                    const load_const_a = this.compileNode(node.value[1]);
                    const load_const_b = this.compileNode(node.value[2]);
                    return [load_const_a, load_const_b, "CMP"];
                }
                case 'if':
                    this.labelCount++;
                    const label = `.lbl_${this.labelCount}`;
                    const condition_stmt = this.compileNode(node.value[1]);
                    const then_stmt = this.compileNode(node.value[2]);
                    const else_stmt = node.value[3] ? this.compileNode(node.value[3]) : [];
                    return [condition_stmt, `JMP_FALSE ${label}_else`, then_stmt, 'JMP .lbl_1_end', `${label}_else:`, else_stmt, `${label}_end:`];
            }
        }
        if (node.type === "SYMBOL") {
            let symbol_id = this.symbols.read(node.value);
            if (storing) {
                return "STORE_NAME " + symbol_id;
            } else {
                return "LOAD_NAME " + symbol_id;
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
