import { test, isEqual, isLabel } from './utils';

test('isLabel function', () => {
    return isEqual(isLabel(".hello:"), true) &&
           isEqual(isLabel(".hoho"), false)  &&
           isEqual(isLabel("hoho:"), false)  &&
           isEqual(isLabel("hoho"), false);
});

type LabelMap = { [name: string]: number };
type VariableMap = { [name: string]: number };
type Code = string[];

type Frame = {
    data: number[];
    locals: VariableMap;
    returns: number[];
};

export const VM = (code: Code) => {
    const callstack: Frame[] = [{
        data: [],
        locals: {},
        returns: []
    }];
    let fp = 0;
    let pc = 0;
    const labels: LabelMap = {};
    for (let line = 0; line < code.length; line++) {
        if (isLabel(code[line])) {
            labels[code[line]] = line + 1;
        }
    }

    return {
        run: (debug: boolean = false): string[] => {
            let output: string[] = [];
            pc = labels['.main:'];
            if (pc === undefined) {
                throw "No entry point found, did you define the main function yet?";
            }
            while (code[pc] !== 'halt') {
                let [op, param] = code[pc].split(' ');
                if (debug) {
                    console.log(`[${op}] params: ${param} stack: ${callstack[fp].data.toString()}`)
                }
                if (!isLabel(op[0])) {
                    switch (op) {
                        case 'push':
                            callstack[fp].data.push(+param);
                        break;
                        case 'add': {
                            const a = callstack[fp].data.pop()!;
                            const b = callstack[fp].data.pop()!;
                            callstack[fp].data.push(a+b);
                        } break;
                        case 'sub': {
                            const a = callstack[fp].data.pop()!;
                            const b = callstack[fp].data.pop()!;
                            callstack[fp].data.push(a-b);
                        } break;
                        case 'mul': {
                            const a = callstack[fp].data.pop()!;
                            const b = callstack[fp].data.pop()!;
                            callstack[fp].data.push(a*b);
                        } break;
                        case 'div': {
                            const a = callstack[fp].data.pop()!;
                            const b = callstack[fp].data.pop()!;
                            callstack[fp].data.push(a/b);
                        } break;
                        case 'print': {
                            const out = callstack[fp].data.pop();
                            console.log(">", out);
                            output.push(`${out}`);
                        } break;
                        case 'cmp': {
                            const a = callstack[fp].data.pop()!;
                            const b = callstack[fp].data.pop()!;
                            callstack[fp].data.push(a === b ? 1 : 0);
                        } break;
                        case 'call': {
                            const [label, args_count] = param.split(" ");
                            const dest = labels[`.${label}:`];
                            if (dest === undefined) {
                                throw `Trying to call an undefined function: "${param}"`;
                            }
                            callstack[fp].returns.push(pc);
                            fp++;
                            if (!callstack[fp]) {
                                callstack.push({
                                    data: callstack[fp-1].data.splice(-args_count),
                                    returns: [],
                                    locals: {}
                                });
                            }
                            pc = dest;
                        } continue;
                        case 'je': {
                            const dest = labels[`.${param}:`];
                            if (dest === undefined) {
                                throw `Trying to jump to an undefined label: "${param}"`;
                            }
                            const flag = callstack[fp].data.pop()!;
                            if (flag === 1) {
                                pc = dest;
                                continue;
                            }
                        } break;
                        case 'ret': {
                            if (!callstack[fp].returns.length) {
                                let lastFrame = callstack.pop()!;
                                fp--;
                                callstack[fp].data = callstack[fp].data.concat(lastFrame.data);
                            }
                            const returnPos = callstack[fp].returns.pop();
                            if (returnPos === undefined) {
                                throw "Invalid return position";
                            }
                            pc = returnPos;
                        } break;
                        case 'store_name': {
                            const value = callstack[fp].data.pop()!;
                            callstack[fp].locals[param] = value;
                        } break;
                        case 'load_name': {
                            const value = callstack[fp].locals[param];
                            if (value === undefined) {
                                throw "Trying to read undeclared variable " + param;
                            }
                            callstack[fp].data.push(value);
                        } break;
                        default:
                            throw "Unknown instruction: " + op;
                    }
                }
                if (debug) console.log("-> stack:", callstack[fp].data.toString());
                pc++;
            }
            return output;
        }
    }
};

test('simple program', () => {
    const code: Code = [
        '.main:',
            'push 5',
            'push 6',
            'add',
            'print',
            'halt'
    ];

    const vm = VM(code);
    const stdout = vm.run();
    return isEqual(stdout, [ '11' ]);
});

test('simple function call', () => {
    const code: Code = [
        '.sum:',
            'add',
            'ret',
        '.main:',
            'push 5',
            'push 6',
            'call sum 2',
            'print',
            'halt'
    ];

    const vm = VM(code);
    const stdout = vm.run();
    return isEqual(stdout, [ '11' ]);
});

test('function with multiple statements', () => {
    const code: Code = [
        '.calc:',
            'add',
            'push 2',
            'mul',
            'ret',
        '.main:',
            'push 5',
            'push 6',
            'call calc 2',
            'print',
            'halt'
    ];

    const vm = VM(code);
    const stdout = vm.run();
    return isEqual(stdout, [ '22' ]);
});

test('value comparison', () => {
    const code: Code = [
        '.main:',
            'push 5',
            'push 6',
            'cmp',
            'print',
            'halt'
    ];

    const vm = VM(code);
    const stdout = vm.run();
    return isEqual(stdout, [ '0' ]);
});

test('jump if equals', () => {
    const code: Code = [
        '.main:',
            'push 5',
            'push 5',
            'cmp',
            'je eqcase',
            'push 0',
            'print',
            'halt',
        '.eqcase:',
            'push 1',
            'print',
            'halt'
    ];

    const vm = VM(code);
    const stdout = vm.run();
    return isEqual(stdout, [ '1' ]);
});

test('variable definition', () => {
    const code: Code = [
        '.main:',
            'push 5',
            'store_name a',
            'push 6',
            'store_name b',
            'load_name a',
            'print',
            'load_name b',
            'print',
            'load_name a',
            'load_name b',
            'mul',
            'print',
            'halt'
    ];

    const vm = VM(code);
    const stdout = vm.run();
    return isEqual(stdout, [
        '5',
        '6',
        '30'
    ]);
});

test('local variables and function calls', () => {
    const code: Code = [
        '.inner_fn:',
            'push 8',
            'store_name a',
            'load_name a',
            'print',
            'ret',
        '.main:',
            'push 5',
            'store_name a',
            'load_name a',
            'print',
            'call inner_fn 0',
            'load_name a',
            'print',
            'halt'
    ];

    const vm = VM(code);
    const stdout = vm.run();
    return isEqual(stdout, [
        '5',
        '8',
        '5'
    ]);
});
