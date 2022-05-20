import { describe, test, expect } from '@jest/globals';
import { parse } from './parser';
import { Compiler } from './main';

describe('Compiler test', () => {
    test('"let" statement', () => {
        const source = "(let x 50)";
        const program = parse(source);
        const compiler = new Compiler(program);
        // Check compiled result
        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_CONST 1', 'STORE_NAME 1']
        ]);
        // Check constant table
        const constants = compiler.getConstants();
        expect(constants.read(50)).toBe(1);
        // Check symbol table
        const symbols = compiler.getSymbols();
        expect(symbols.read("x")).toBe(1);
    });

    test('"let" statement with ADD expression', () => {
        const source = "(let x (+ 10 20))";
        const program = parse(source);
        const compiler = new Compiler(program);
        // Check compiled result
        const result = compiler.compile();
        expect(result).toStrictEqual([
            [[ 'LOAD_CONST 1', 'LOAD_CONST 2', 'ADD' ], 'STORE_NAME 1']
        ]);
        // Check constant table
        const constants = compiler.getConstants();
        expect(constants.read(10)).toBe(1);
        expect(constants.read(20)).toBe(2);
        // Check symbol table
        const symbols = compiler.getSymbols();
        expect(symbols.read("x")).toBe(1);
    });
});
