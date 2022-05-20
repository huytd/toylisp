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
