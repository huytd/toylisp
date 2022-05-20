export interface BaseNode {
    type: "INTEGER" | "SYMBOL" | "STRING" | "SEQ" | "VEC";
    value: string | number | SyntaxNode[];
    line?: number;
    pos?: number;
}

export interface IntegerNode extends BaseNode {
    type: "INTEGER";
    value: number;
}

export interface SymbolNode extends BaseNode {
    type: "SYMBOL";
    value: string;
}

export interface StringNode extends BaseNode {
    type: "STRING";
    value: string;
}

export interface SeqNode extends BaseNode {
    type: "SEQ";
    value: SyntaxNode[];
}

export interface VecNode extends BaseNode {
    type: "VEC";
    value: SyntaxNode[];
}

export type SyntaxNode = IntegerNode | SymbolNode | StringNode | SeqNode | VecNode;