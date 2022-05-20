# 05.19.2022 - Work in progress compiling logic

Started working on compiling logic, at this point, the compiler is capable of generating
the opcode for the `print`, `let` statement and some arithmetic operators.

<img width="940" alt="image" src="https://user-images.githubusercontent.com/613943/169437324-4bfa4e37-bee0-42dd-9269-ddfa7dd719a3.png">

Since I don't control the parsing flow (using generated code, thanks PeggyJS), I'm gonna
handle the constant values (like numbers or strings) during the compilation process. The
idea is, whenever we see a constant, we push it to the constant table and get the address
of that value to use in the generated code.

So, for example, with a `let` statement, the generated code would be like this:

```
(let a 10)

LOAD_CONST 1
STORE_NAME a
```

After this, the constant table would contains one value, it look like this:

|value|index |
|:----|:----:|
|50   |1     |

For storing variables, I'll just generate the opcode as `STORE_NAME <name>` for now. The
right way to do this is to create another Symbol table, that handle the binding between
the variable name and the constant value location. That's for the next commit.

Also, I realized I made it this far but forgot to write a proper unit tests :( so had to
stop and setup some tests. Jest is my test runner of choice, and set it up with ESBuild
and TypeScript support seems to be a piece of cake.

The `console.table` method is pretty handful to debug tabular data like arrays or simple
objects.

# 05.18.2022 - Generating parser code with PeggyJS

For this project, I'll just use a generator to create parser code, as I want to focus on
the bytecode virtual machine.

PeggyJS is the best generator I could find for now, it even supports TypeScript, this mean,
we can control the return type for each non-terminals. See commit [dd6e44](https://github.com/huytd/toylisp/commit/dd6e4465338389a207cf9d1ed15e7e91da50490e).
