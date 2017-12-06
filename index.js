
const express = require('express')
const app = express()

// Middleware (APPLICATION-LEVEL) che logga il tempo di quando viene chiamata una richiesta
app.use(function (req, res, next) {
    req.tempoRichiesta = Date.now()
    console.log(req.tempoRichiesta);
    next()
})

// Middleware Application CONCATENATO specifico montato su '/user/' che stampa sulla console il tipo di richiesta e l'url di origine
app.use('/users/:userId', function (req, res, next) {
    console.log('Request URL:', req.originalUrl)
    next()
  }, function (req, res, next) {
    console.log('Request Type:', req.method)
    next()
  })

// Queste route hanno come match /,
app.route('/')
  .get((req, res) => res.send('GET to request homepage alle: ' + req.tempoRichiesta ))
  .post((req, res) => res.send('POST to request homepage'))

// Questa route risponde a /ciao , /ciaooo, /ciaooooo etc...
app.get('/ciao+', (req,res) => res.send('GET to request ciao(oooooo..)'))

// Questa route risponde a /hello oppure /helo
app.get('/hel?lo', (req,res) => res.send('GET to request hello or helo'))

// Route che prende in input un valore
app.get('/users/:userId', (req,res) => res.send('You searched for user : ' + req.params['userId']))

// Uso di next(middleware) con la Arrow notation '=>' per le funzioni
app.get('/middleware', (req,res,next) => {console.log('next function will send response..'); next() }, (req,res) => res.send('Hello man!'))

// Uso più complesso di middleware e valore, si vince con /middleinput/michele/codice/1337 
app.get('/middleinput/:nome/codice/:codice', (req,res,next) => {
    if(req.params['nome'] === 'michele'){
        next();
    } else {
        res.send('Bravo....peccato che il tuo nome è sbagliato');
    }
}, (req,res) => {
    if(req.params['codice'] === '1337'){
        console.log('Abbiamo un vincitore...');
        res.send('HAI VINTO!!!!!');
    } else {
        res.send('Si ok....ma il codice non è giusto!');
    }
})



// Avvia il server 
app.listen(3000, () => console.log('Example app at localhost:3000'))

