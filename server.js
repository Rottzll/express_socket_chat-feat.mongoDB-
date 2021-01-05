const app = require('./app.js');
const PORT= process.env.PORT || 3000;

app.listen( PORT, function(){
    console.log('Express listening on port', PORT);
}); 