import { SyntaxError, parse } from './parser';
import fs from 'fs';
import { BaseNode, SeqNode } from './parser/types';

const source = fs.readFileSync('./examples/test.el', 'utf-8');
const program: SeqNode[] = parse(source);

const printNode = (node: BaseNode) => {

};

for (const node of program) {
    console.log("DBG::NODE", node.value);
}
