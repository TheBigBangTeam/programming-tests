const express = require('express')
const app = express()
const router = express.Router()
var helmet = require('helmet')
var fs = require('fs')
var https = require('https')

// Connessione al database
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/test');

// Test connessione al database
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connessione a mongodb avvenuta con successo");
});

// Attiva protezioni aggiuntive agli HTTP headers, utile per la sicurezza
app.use(helmet())


// Creo uno schema gatto per il database
var gattoSchema = mongoose.Schema({
    nome: String
});

// Creo il model del gatto, ATTENZIONE Mongoose cerca di trasformare al plurale lo schema (di solito aggiunge una s alla fine ma non solo..) e 
// nel DB sarà quindi 'gattos'
var Gatto = mongoose.model('gatto',gattoSchema);



// Middleware (APPLICATION-LEVEL) che logga il tempo di quando viene chiamata una richiesta e l'ip da cui è stata fatta
app.use(function (req, res, next) {
    req.tempoRichiesta = Date.now()
    console.log("Richiesta: ")
    console.log("\tTempo: " + req.tempoRichiesta);
    console.log("\tIP: " + req.ip)
    next()
})

// Crea un gatto e lo salva nel database  
app.get('/gatto/:nome', (req,res) => {
    // Creo un gatto chiamato col nome della richiesta
    var gattorichiesto = new Gatto({ nome: req.params['nome'] });
    gattorichiesto.save( (err, gattosalvato) => {
        if (err) res.send("Il tuo gatto è stato investito da un'auto, condoglianze");
        else res.send("Eccoti servito il tuo gatto: <br><br>" + "^^[" + gattorichiesto.nome + "]-----> MIAO!");
    });
      
});

app.get('/gatti', (req,res) => {
    var html = "";
    Gatto.find( (err, gatti) => {
        if (err) res.send("I gatti risiedono solo nella tua fantasia");
        else {
            var numerogatti = gatti.length;
            html += "Gatti in totale = " + numerogatti + "<br><br>";
            for(var i=0; i<numerogatti;i++){
                var ngatto = i + 1;
                html += "Gatto n°" + ngatto + " : " + gatti[i].nome + "<br>";
            }
            res.send(html);
        }
    })
})


// Middleware Application CONCATENATO(2 next) specifico montato su '/user/' che stampa sulla console il tipo di richiesta e l'url di origine
app.use('/users/:userId', function (req, res, next) {
    console.log('Request URL:', req.originalUrl)
    next()
  }, function (req, res, next) {
    console.log('Request Type:', req.method)
    next()
  })

// Middleware (ROUTER-LEVEL) che stampa a video una stringa per ogni richiesta AL SOLO ROUTER
router.use(function (req, res, next) {
    console.log('Wabba dabba lub lub')
    next()
})

// Per accedere a questa usa /rem/rick        (per capire perchè guarda la prossima istruzione dopo questo blocco)
router.get('/rick', function(req,res){ // Route di test per il middleware sopra 
    // PRIMA PASSA PER IL MIDDLEWARE SOPRA
    res.send('Fooooorte!')
})

// COLLEGO IL ROUTER ALL'APP sul percorso /rem
app.use('/rem', router)

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

// All permette di rispondere a ogni richiest (GET, POST etc..) allo stesso modo
app.all('/all', (req,res) => res.send('Risponderò così a qualsiasi tipo di richiesta'))

// res.download permette di inviare file da scaricare all'utente che usa il sito web
app.get('/download', (req,res) => res.download('provadownload.txt'))

// Avvia il server HTTP 
app.listen(8080, () => console.log('Example app at localhost:8080'))


// Avvia il server HTTPS, Attenzione: devi crearti i certificati auto-firmati (Ad esempio usando openssl)
var sslOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};
  
var httpsServer = https.createServer(sslOptions, app);
httpsServer.listen(8443, () => console.log('Example https server at localhost:8443'));