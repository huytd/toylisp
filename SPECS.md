# ToyLISP Specification

ToyLISP is a small dialect of LISP that only supports a handful of features:

- Variable declaration
- Function declaration
- If statement
- Print to STDOUT
- Vector data structure
- Immutable String

## Variable Declaration

A variable can be declared with the `(let)` call:

```lisp
(let <identifier> <expression>)
```
For example:

```lisp
(let a 10)
(let b 20)
(let c (+ a b))
```

## Function Declaration

A function can be created with a `(defun)` call:

```lisp
(defun <function-name> <parameter-list> <body>)
```

For example:

```lisp
(defun mul (a b)
  (* a b))
```

## If Statement

For conditional branching, we have `(if)` call:

```lisp
(if <condition> <then-statement> <else-statement>)
```

For example:

```lisp
(if (eq b 10)
  (print "b is larger than 10")
  (print "b is smaller than 10"))
```

## Vector

Different from strings and interger, which is stack allocated at compile time. Vector is the heap allocated data structure at runtime.

It can be defined using a comma separated sequences of numbers, between a pair of squared brackets `[ ... ]`:

```lisp
(let a [1, 2, 3])
```

It can be resized by `(push)` and `(pop)` commands:

```lisp
(print (push a 5))
(print (pop a))
```

To read a value at any index from a Vector, use `(ref)`, to count the number of elements inside a Vector, use `(len)`, for simplicity, we do not manage the capacity of the Vector:

```lisp
(print (len a))
(print (ref a 1))
```
