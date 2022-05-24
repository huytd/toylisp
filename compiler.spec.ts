import { describe, test, expect } from '@jest/globals';
import { parse } from './parser';
import { Compiler } from './main';

describe('Compiler Test: "let" statement', () => {
    test('simple variable declaration', () => {
        const source = "(let x 50)";
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_CONST 1', 'STORE_NAME 1']
        ]);

        const constants = compiler.getConstants();
        expect(constants.read(50)).toBe(1);

        const symbols = compiler.getSymbols();
        expect(symbols.read("x")).toBe(1);
    });

    test('variable declaration with ADD expression', () => {
        const source = "(let x (+ 10 20))";
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            [[ 'LOAD_CONST 1', 'LOAD_CONST 2', 'ADD' ], 'STORE_NAME 1']
        ]);

        const constants = compiler.getConstants();
        expect(constants.read(10)).toBe(1);
        expect(constants.read(20)).toBe(2);

        const symbols = compiler.getSymbols();
        expect(symbols.read("x")).toBe(1);
    });

    test('variable declaration with multiple level expression', () => {
        const source = "(let x (* a (+ 10 20)))";
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            [[ 'LOAD_NAME 2', [ 'LOAD_CONST 1', 'LOAD_CONST 2', 'ADD' ], 'MUL'], 'STORE_NAME 1']
        ]);

        const constants = compiler.getConstants();
        expect(constants.read(10)).toBe(1);
        expect(constants.read(20)).toBe(2);

        const symbols = compiler.getSymbols();
        expect(symbols.read("x")).toBe(1);
        expect(symbols.read("a")).toBe(2);
    });
});

describe('Compiler Test: "print" statement', () => {
    test('print string', () => {
        const source = `(print "Hello, World!")`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_CONST 1', 'PRINT']
        ]);

        const constants = compiler.getConstants();
        expect(constants.read("Hello, World!")).toBe(1);
    });

    test('print variable', () => {
        const source = `(print x)`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_NAME 1', 'PRINT']
        ]);

        const symbols = compiler.getSymbols();
        expect(symbols.read("x")).toBe(1);
    });

    test('print expression', () => {
        const source = `(print (* 1 4))`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            [[ 'LOAD_CONST 1', 'LOAD_CONST 2', 'MUL'], 'PRINT']
        ]);

        const constants = compiler.getConstants();
        expect(constants.read(1)).toBe(1);
        expect(constants.read(4)).toBe(2);
    });
});

describe('Compiler Test: arithmetic statement', () => {
    test('ADD statement', () => {
        const source = `(+ a b)`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_NAME 1', 'LOAD_NAME 2', 'ADD']
        ]);

        const symbols = compiler.getSymbols();
        expect(symbols.read("a")).toBe(1);
        expect(symbols.read("b")).toBe(2);
    });

    test('ADD statement with consts', () => {
        const source = `(+ 5 10)`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_CONST 1', 'LOAD_CONST 2', 'ADD']
        ]);

        const constants = compiler.getConstants();
        expect(constants.read(5)).toBe(1);
        expect(constants.read(10)).toBe(2);
    });

    test('SUB statement', () => {
        const source = `(- a b)`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_NAME 1', 'LOAD_NAME 2', 'SUB']
        ]);

        const symbols = compiler.getSymbols();
        expect(symbols.read("a")).toBe(1);
        expect(symbols.read("b")).toBe(2);
    });

    test('SUB statement with consts', () => {
        const source = `(- 5 10)`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_CONST 1', 'LOAD_CONST 2', 'SUB']
        ]);

        const constants = compiler.getConstants();
        expect(constants.read(5)).toBe(1);
        expect(constants.read(10)).toBe(2);
    });

    test('MUL statement', () => {
        const source = `(* a b)`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_NAME 1', 'LOAD_NAME 2', 'MUL']
        ]);

        const symbols = compiler.getSymbols();
        expect(symbols.read("a")).toBe(1);
        expect(symbols.read("b")).toBe(2);
    });

    test('MUL statement with consts', () => {
        const source = `(* 5 10)`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_CONST 1', 'LOAD_CONST 2', 'MUL']
        ]);

        const constants = compiler.getConstants();
        expect(constants.read(5)).toBe(1);
        expect(constants.read(10)).toBe(2);
    });

    test('DIV statement', () => {
        const source = `(/ a b)`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_NAME 1', 'LOAD_NAME 2', 'DIV']
        ]);

        const symbols = compiler.getSymbols();
        expect(symbols.read("a")).toBe(1);
        expect(symbols.read("b")).toBe(2);
    });

    test('DIV statement with consts', () => {
        const source = `(/ 5 10)`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_CONST 1', 'LOAD_CONST 2', 'DIV']
        ]);

        const constants = compiler.getConstants();
        expect(constants.read(5)).toBe(1);
        expect(constants.read(10)).toBe(2);
    });

    test('MOD statement', () => {
        const source = `(% a b)`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_NAME 1', 'LOAD_NAME 2', 'MOD']
        ]);

        const symbols = compiler.getSymbols();
        expect(symbols.read("a")).toBe(1);
        expect(symbols.read("b")).toBe(2);
    });

    test('MOD statement with consts', () => {
        const source = `(% 5 10)`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            ['LOAD_CONST 1', 'LOAD_CONST 2', 'MOD']
        ]);

        const constants = compiler.getConstants();
        expect(constants.read(5)).toBe(1);
        expect(constants.read(10)).toBe(2);
    });

    test('Multiple expressions', () => {
        const source = `(* (/ 4 2) (+ 5 a))`;
        const program = parse(source);
        const compiler = new Compiler(program);

        const result = compiler.compile();
        expect(result).toStrictEqual([
            [['LOAD_CONST 1', 'LOAD_CONST 2', 'DIV'], ['LOAD_CONST 3', 'LOAD_NAME 1', 'ADD'], 'MUL']
        ]);

        const constants = compiler.getConstants();
        expect(constants.read(4)).toBe(1);
        expect(constants.read(2)).toBe(2);
        expect(constants.read(5)).toBe(3);

        const symbols = compiler.getSymbols();
        expect(symbols.read("a")).toBe(1);
    });
});