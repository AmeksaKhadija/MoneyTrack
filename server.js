const { name } = require('ejs');
const express = require('express');
const path = require('path');
const app = express();
const PORT = 4000;

// app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));


let publicPath = path.join(__dirname, './public');
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    // res.send('Hello world !');
    res.render('index');
});


app.get('people/:id',function(req,res){
    let data = {
        id: req.params.id,
        name: 'ayoub',
        age: 20,
        job: 'developer',
        friends: ['tayeb','yusuf','ali']
    }
    res.render('person',data);
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
