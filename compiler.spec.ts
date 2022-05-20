import { describe, test, expect } from '@jest/globals';
import { parse } from './parser';
import { Compiler } from './main';

describe('Compiler test', () => {
    test('"let" statement', () => {
        const source = "(let x 50)";
        const program = parse(source);
        const compiler = Compiler(program);
        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_CONST 1', 'STORE_NAME x']
        ]);
        const constants = compiler.getConstants();
        expect(constants.read(50)).toBe(1);
    });

    test('"let" statement with ADD expression', () => {
        const source = "(let x (+ 10 20))";
        const program = parse(source);
        const compiler = Compiler(program);
        const result = compiler.compile();
        expect(result).toStrictEqual([
            [[ 'LOAD_CONST 1', 'LOAD_CONST 2', 'ADD' ], 'STORE_NAME x']
        ]);
        const constants = compiler.getConstants();
        expect(constants.read(10)).toBe(1);
        expect(constants.read(20)).toBe(2);
    });
});
