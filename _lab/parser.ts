const source = `
(let a 10)
(let b 20)
(let c (+ a b))
(let d (* (+ a b) 14))

(print "sum")
(print c)

(defun mul (a b)
  (* a b))
(print (mul 10 5))

(let a [1, 2, 3])
(print (len a))
(print (ref a 1))
(print (push a 5))
(print (pop a))

(if (eq b 10)
  (print "b is larger than 10")
  (print "b is smaller than 10"))
`;

const tokenize = (input: string) => {
    return input.replace(/\(/g, ' ( ')
         .replace(/\)/g, ' ) ')
         .replace(/\"/g, ' " ')
         .replace(/\[/g, ' [ ')
         .replace(/\]/g, ' ] ')
         .replace(/\n/g, ' ')
         .split(' ')
         .filter(c => c != '' && c != '\n')
};

const parseStatement = (tokens: string[]): any => {
    if (tokens.length <= 0) throw 'Unexpected EOF';
    let token = tokens.shift();
    if (token === '(') {
        let list = [];
        while (tokens[0] !== ')') {
            list.push(parseStatement(tokens));
        }
        tokens.shift();
        const [op, ...params] = list;
        if (op === "if") {
            const [condition, then_arm, else_arm] = params;
            return {
                type: 'ConditionalStatement',
                condition,
                then_statement: then_arm,
                else_statement: else_arm
            };
        }
        return {
            type: 'Statement',
            op: op,
            seq: params
        };
    } else if (token === '[') {
        let list = [];
        while (tokens[0] !== ']') {
            list.push(tokens.shift()!.replace(",", ""));
        }
        tokens.shift();
        return {
            type: 'List',
            seq: list
        };
    } else if (token === '"') {
        let string = [];
        while (tokens[0] !== '"') {
            string.push(tokens.shift());
        }
        tokens.shift();
        return string.join(" ");
    } else if (token === ')') {
        throw 'Unexpected )';
    } else {
        if (token!.match(/\d+/)) {
            return +token!;
        } else {
            return token;
        }
    }
}

const parseSeq = (tokens: string[]): any => {
    let ret = [];
    while (tokens.length) {
        let statement = parseStatement(tokens);
        ret.push(statement);
    }
    return ret;
};

console.log(JSON.stringify(parseSeq(tokenize(source)), null, '\t'))
