import { parse } from './parser';
import fs from 'fs';
import { BaseNode, IntegerNode, SeqNode, StringNode, SymbolNode } from './parser/types';

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


export const ConstantTable = function() {
    this.pointer = 0;
    this.data = {};

    this.write = (value: string | number) => {
        this.pointer++;
        this.data[value] = this.pointer;
        return this.pointer;
    };

    this.read = (value: string | number) => {
        const found = this.data[value];
        if (found) return found;
        else return this.write(value);
    };

    this.debug = () => {
        console.table(this.data);
    }

    return { read: this.read, write: this.write, debug: this.debug };
};

export const Compiler = (program: SeqNode[]) => {
    const constants = ConstantTable();

    const compileNode = (node: BaseNode, storing?: boolean) => {
        if (node.type === "SEQ") {
            const currentNode: SeqNode = node as SeqNode;
            const command = currentNode.value[0].value;
            switch (command) {
                case 'let': {
                    const store_name = compileNode(currentNode.value[1], true);
                    const load_const = compileNode(currentNode.value[2]);
                    return [ load_const, store_name];
                }
                case 'print': {
                    const load_const = compileNode(currentNode.value[1]);
                    return [ load_const, "PRINT" ];
                }
                case '+': case '-': case '*': case '/': case '%': {
                    const load_const_a = compileNode(currentNode.value[1]);
                    const load_const_b = compileNode(currentNode.value[2]);
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
                return "STORE_NAME " + node.value;
            } else {
                return "LOAD_NAME " + node.value;
            }
        }
        // if (node.type === "VEC") {
        //     return "[" + node.value.map(n => compileNode(n)).join(" ") + "]";
        // }
        if (node.type === "INTEGER") {
            const id = constants.read((node as IntegerNode).value);
            return "LOAD_CONST " + id;
        }
        if (node.type === "STRING") {
            const id = constants.read((node as StringNode).value);
            return "LOAD_CONST " + id;
        }
        return [ "unknown" ];
    };

    return {
        compile: () => program.map(seq => compileNode(seq)),
        getConstants: () => constants
    };
};

const debugRun = () => {
    const source = fs.readFileSync('./examples/test.el', 'utf-8');
    const program: SeqNode[] = parse(source);
    const compiler = Compiler(program);
    console.table(program.map(line => SourcePrinter(line)));
    const result = compiler.compile().map(line => line.flat().join(","));
    console.table(result);
    compiler.getConstants().debug();
};

if (process.env.NODE_ENV !== "test") {
    debugRun();
}
