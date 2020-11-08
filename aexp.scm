(define (aexp input)
  (define (split-newline input)
    (let loop1 ((start 0))
      (let loop2 ((end start))
        (if (< end (string-length input))
            (let ((ch (string-ref input end)))
              (cond ((char=? ch #\newline)
                     (cons (substring input start end)
                           (loop1 (+ end 1))))
                    (else (loop2 (+ end 1)))))
            '()))))

  (define (max-length inputlist)
    (apply max (map string-length inputlist)))

  (define (create-matrix maxlength inputlist)
    (let ((result (make-vector (length inputlist))))
      (let loop1 ((i 0) (inputlist inputlist))
        (if (null? inputlist)
            result
            (let ((line (make-vector maxlength)))
              (vector-set! result i line)
              (let loop2 ((j 0))
                (cond ((null? inputlist) result)
                      ((< j (string-length (car inputlist)))
                       (vector-set! line j (string-ref (car inputlist) j))
                       (loop2 (+ j 1)))
                      ((< j maxlength)
                       (vector-set! line j #\space)
                       (loop2 (+ j 1)))
                      (else
                       (loop1 (+ i 1) (cdr inputlist))))))))))

  (define (matrix-ref matrix x y)
    (vector-ref (vector-ref matrix y) x))

  (define (matrix-ref-char matrix x y)
    (make-string 1 (matrix-ref matrix x y)))

  (define (matrix-set! matrix x y val)
    (vector-set! (vector-ref matrix y) x val))

  (define (x-start segment) (caar segment))
  (define (x-end segment) (cdar segment))
  (define (y-start segment) (cadr segment))
  (define (y-end segment) (cddr segment))

  (define (matcher-x matrix pattern x y maxx)
    (let ((x x))
      (lambda ()
        (let loop1 ((x0 x))
          (let loop2 ((x1 x0) (i 0))
            (cond ((>= i (string-length pattern))
                   (set! x x1)
                   `((,x0 . ,(- x1 1)) . (,y . ,y)))
                  ((not (and (>= x1 0) (< x1 maxx))) #f)
                  ((char=? (string-ref pattern i) #\.)
                   (loop2 (+ x1 1) (+ i 1)))
                  ((char=? (string-ref pattern i) #\^)
                   (cond ((char=? (matrix-ref matrix x1 y) #\space)
                          (loop2 (+ x1 1) (+ i 1)))
                         ((= x1 0)
                          (loop2 x1 (+ i 1)))
                         (else (loop1 (+ x0 1)))))
                  ((char=? (string-ref pattern i)
                           (matrix-ref matrix x1 y))
                   (loop2 (+ x1 1) (+ i 1)))
                  (else (loop1 (+ x0 1)))))))))

  (define (matcher-y matrix pattern x y maxy)
    (let ((y y))
      (lambda ()
        (let loop1 ((y0 y))
          (let loop2 ((y1 y0) (i 0))
            (cond ((>= i (string-length pattern))
                   (set! y y1)
                   `((,x . ,x) . (,y0 . ,(- y1 1))))
                  ((not (and (>= y1 0) (< y1 maxy))) #f)
                  ((char=? (string-ref pattern i) #\.)
                   (loop2 (+ y1 1) (+ i 1)))
                  ((char=? (string-ref pattern i) #\^)
                   (cond ((char=? (matrix-ref x y1) #\space)
                          (loop2 (+ y1 1) (+ i 1)))
                         (else (loop1 (+ y0 1)))))
                  ((char=? (string-ref pattern i)
                           (matrix-ref matrix x y1))
                   (loop2 (+ y1 1) (+ i 1)))
                  (else (loop1 (+ y0 1)))))))))

  (define (create-quadro input)
    (let* ((inputlist (split-newline input))
           (maxlength (max-length inputlist))
           (matrix (create-matrix maxlength inputlist)))
      (lambda (msg)
        (cond ((eq? msg 'get-size-x) maxlength)
              ((eq? msg 'get-size-y) (vector-length matrix))
              ((eq? msg 'search-horizontal)
               (lambda (pattern x y)
                 (matcher-x matrix pattern x y maxlength)))
              ((eq? msg 'search-vertical)
               (lambda (pattern x y)
                 (matcher-y matrix pattern x y (vector-length matrix))))
              ((eq? msg 'get)
               (lambda (x y) (matrix-ref matrix x y)))
              ((eq? msg 'set!)
               (lambda (x y ch) (matrix-set! matrix x y ch)))
              (else (error "invalid message" msg))))))

  (define (quadro-size-x quadro) (quadro 'get-size-x))
  (define (quadro-size-y quadro) (quadro 'get-size-y))
  (define (quadro-matcher-x quadro pattern x y) ((quadro 'search-horizontal) pattern x y))
  (define (quadro-matcher-y quadro pattern x y) ((quadro 'search-vertical) pattern x y))
  (define (quadro-ref quadro x y) ((quadro 'get) x y))
  (define (quadro-set! quadro x y ch) ((quadro 'set!) x y ch))

  (define (scan-cons-cell quadro)
    (define (scan-horizontal-cell)
      (let loop1 ((i 0) (result '()))
        (if (< i (quadro-size-y quadro))
            (let loop2 ((matcher (quadro-matcher-x quadro "+.+.+" 0 i))
                        (res-inner result))
              (let ((scanned (matcher)))
                (if scanned
                    (loop2 matcher (cons scanned res-inner))
                    (loop1 (+ i 1) res-inner))))
            result)))

    (define (scan-vertical-cell)
      (let loop1 ((i 0) (result '()))
        (if (< i (quadro-size-x quadro))
            (let loop2 ((matcher (quadro-matcher-y quadro "+.+" i 0))
                        (res-inner result))
              (let ((scanned (matcher)))
                (if scanned
                    (loop2 matcher (cons scanned res-inner))
                    (loop1 (+ i 1) res-inner))))
            result)))

    (define (scan-horizontal-line lines y)
      (let loop1 ((i 0))
        (if (< i (quadro-size-y quadro))
            (let loop2 ((lines lines))
              (cond ((null? lines) #f)
                    ((= y (y-start (car lines))) (car lines))
                    (else (loop2 (cdr lines)))))
            #f)))

    (define (scan-vertical-line lines x y)
      (let loop1 ((i 0))
        (if (< i (quadro-size-x quadro))
            (let loop2 ((lines lines))
              (cond ((null? lines) #f)
                    ((and (= x (x-start (car lines)))
                          (= y (y-start (car lines))))
                     (car lines))
                    (else (loop2 (cdr lines)))))
            #f)))

    (let ((horizontal (scan-horizontal-cell))
          (vertical (scan-vertical-cell)))
      (let loop ((hlines horizontal))
        (if (null? hlines)
            '()
            (let ((vt1 (scan-vertical-line vertical
                                           (x-start (car hlines))
                                           (y-start (car hlines))))
                  (vt2 (scan-vertical-line vertical
                                           (x-end (car hlines))
                                           (y-start (car hlines)))))
              (if (and vt1 vt2)
                  (let ((ho1 (car hlines))
                        (ho2 (scan-horizontal-line horizontal
                                                   (y-end vt1))))
                    (if (and ho1 ho2)
                        (cons (list ho1 ho2 vt1 vt2)
                              (loop (cdr hlines)))
                        (loop (cdr hlines))))
                  (loop (cdr hlines))))))))

  (define (cell-up cell) (car cell))
  (define (cell-down cell) (cadr cell))
  (define (cell-left cell) (caddr cell))
  (define (cell-right cell) (cadddr cell))

  (define (cons-cell-from-point conscells x y)
    (let loop ((cells conscells))
      (if (null? cells)
          #f
          (let ((cell (car cells)))
            (cond ((and (>= x (x-start (cell-up cell)))
                        (<= x (x-end (cell-up cell)))
                        (>= y (y-start (cell-left cell)))
                        (<= y (y-end (cell-left cell))))
                   cell)
                  (else
                   (loop (cdr cells))))))))

  (define (scan-link quadro conscells)
    (define (start x y)
      (cond ((char=? (quadro-ref quadro x y) #\/)
             (list 'atom '()))
            ((char=? (quadro-ref quadro x (- y 1)) #\|)
             (traverse-up x (- y 1)))
            (else (start-right x y))))

    (define (start-right x y)
      (cond ((char=? (quadro-ref quadro (+ x 1) y) #\-)
             (traverse-right (+ x 1) y))
            (else (start-down x y))))

    (define (start-down x y)
      (cond ((char=? (quadro-ref quadro x (+ y 1)) #\|)
             (traverse-down x (+ y 1)))
            (else (start-left x y))))

    (define (start-left x y)
      (cond ((char=? (quadro-ref quadro (- x 1) y) #\-)
             (traverse-left (- x 1) y))
            (else (error "Syntax error"))))

    (define (traverse-up x y)
      (quadro-set! quadro x y #\.)
      (cond ((char=? (quadro-ref quadro x (- y 1)) #\^)
             (endpoint x (- y 2)))
            ((char=? (quadro-ref quadro x (- y 1)) #\+)
             (start x (- y 1)))
            (else (traverse-up x (- y 1)))))

    (define (traverse-right x y)
      (quadro-set! quadro x y #\.)
      (cond ((char=? (quadro-ref quadro (+ x 1) y) #\>)
             (endpoint (+ x 2) y))
            ((char=? (quadro-ref quadro (+ x 1) y) #\+)
             (start (+ x 1) y))
            (else (traverse-right (+ x 1) y))))

    (define (traverse-down x y)
      (quadro-set! quadro x y #\.)
      (cond ((char=? (quadro-ref quadro x (+ y 1)) #\v)
             (endpoint x (+ y 2)))
            ((char=? (quadro-ref quadro x (+ y 1)) #\+)
             (start x (+ y 1)))
            (else (traverse-down x (+ y 1)))))

    (define (traverse-left x y)
      (quadro-set! quadro x y #\.)
      (cond ((char=? (quadro-ref quadro (- x 1) y) #\>)
             (endpoint (- x 2) y))
            ((char=? (quadro-ref quadro (- x 1) y) #\+)
             (start (- x 1) y))
            (else (traverse-left (- x 1) y))))

    (define (endpoint x y)
      (let ((cellid (cons-cell-from-point conscells x y)))
        (if cellid
            (list 'cell-id cellid)
            (list 'atom (get-value (- x 1) y)))))

    (define (get-value x y)
      (let loop1 ((x1 x))
        (if (char=? (quadro-ref quadro x1 y) #\space)
            (let loop2 ((x2 (+ x1 1)) (result ""))
              (if (char=? (quadro-ref quadro x2 y) #\space)
                  result
                  (loop2 (+ x2 1)
                         (string-append result
                                        (make-string 1 (quadro-ref quadro x2 y))))))
            (loop1 (- x1 1)))))

    (let loop ((cells conscells))
      (cond ((null? cells) '())
            (else
             (cons (cons (car cells)
                         (cons (start (+ (x-start (cell-up (car cells))) 1)
                                      (+ (y-start (cell-up (car cells))) 1))
                               (start (+ (x-start (cell-up (car cells))) 3)
                                      (+ (y-start (cell-up (car cells))) 1))))
                   (loop (cdr cells)))))))

  (define (detect-start-point quadro conscells)
    (let loop1 ((i 0))
      (if (< i (quadro-size-y quadro))
          (let ((matcher (quadro-matcher-x quadro "^>|" 0 i)))
            (let loop2 ((scanned (matcher)))
              (if scanned
                  (let ((found (cons-cell-from-point conscells (x-end scanned) i)))
                    (if found
                        found
                        (loop2 (matcher))))
                  (loop1 (+ i 1)))))
          (error "Syntax error"))))

  (define (atom? obj) (not (pair? obj)))

  (define (construct-sexp quadro conscells structs rootpoint)
    (define (create)
      (define (create-defined cell result)
        (if (assq cell result)
            (cdr (assq cell result))
            (list 'unresolved cell)))

      (let loop ((structs structs) (result '()))
        (cond ((null? structs) result)
              ((eq? (cadar structs) 'cell-id)
               (cons (cons (caar structs)
                           (cons (create-defined (caddr structs) result)
                                 (create-defined (cdddr structs) result)))
                     (loop (cdr structs)
                           (cons (car structs) result))))
              (else (cons (car structs)
                          (loop (cdr structs)
                                (cons (car structs) result)))))))

    (define (resolve unresolve)
      (let loop ((lst unresolve))
        (cond ((null? lst) 'ok)
              (else
               (cond ((eq? (caar (cdar lst)) 'atom)
                      (set-car! (cdar lst) (cadar (cdar lst))))
                     (else
                      (set-car! (cdar lst)
                                (cdr (assq (cadar (cdar lst)) unresolve)))))
               (cond ((eq? (cadr (cdar lst)) 'atom)
                      (set-cdr! (cdar lst) (caddr (cdar lst))))
                     (else
                      (set-cdr! (cdar lst)
                                (cdr (assq (caddr (cdar lst)) unresolve)))))
               (loop (cdr lst))))))

    (let ((unresolve structs))
      (resolve unresolve)
      (cdr (assq rootpoint unresolve))))

  (let* ((quadro (create-quadro input))
         (conscells (scan-cons-cell quadro))
         (structs (scan-link quadro conscells))
         (root (detect-start-point quadro conscells))
         (result (construct-sexp quadro conscells structs root)))
    result))

(define test1
  (string-append
    "  +-+-+             \n"
    " >|*|*-----+        \n"
    "  +|+-+    |        \n"
    "   |       |        \n"
    "   v       |  +-+-+ \n"
    "  +-+-+    +->|/|/| \n"
    "  |*|/|       +-+-+ \n"
    "  +|+-+             \n"
    "   |                \n"
    "   |                \n"
    "   v                \n"
    " equal?             \n"
    "                    \n"
    "                    \n"
    "                    \n"
    ""))

(define x1 (aexp test1))

(define test2
  (string-append
   "  +-+-+             \n"
   " >|*|*----------+   \n"
   "  +|+-+         |   \n"
   "   | ^          |   \n"
   "   | |          |   \n"
   "   | +-----+    v   \n"
   "   v       |  +-+-+ \n"
   "  +-+-+    +---*|/| \n"
   "  |*|/|       +-+-+ \n"
   "  +|+-+             \n"
   "   |                \n"
   "   |                \n"
   "   v                \n"
   " equal?             \n"
   "                    \n"
   "                    \n"
   "                    \n"
   ""))

(define x2 (aexp test2))

