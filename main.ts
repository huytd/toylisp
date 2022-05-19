import { SyntaxError, parse } from './parser';
import fs from 'fs';

const source = fs.readFileSync('./examples/test.el', 'utf-8');
const tree = parse(source);

console.log(JSON.stringify(tree, null, "\t"));
