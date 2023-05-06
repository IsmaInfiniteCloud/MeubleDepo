const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const dbName = 'meubleZone';

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(`${mongoUrl}/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('Connecte a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Erreur lors de la connexion MongoDB:', err);
});

const MeubleSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: [String],
  category: String
});

const Item = mongoose.model('Item', MeubleSchema);

app.get('/', async (req, res) => {
  try {
    const items = await Item.find().exec();
    res.render('items', { items });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la connexion MongoDB');
  }
});


app.get('/item/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).exec();
    res.render('item', { item });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la connexion MongoDB');
  }
});

app.get('/new-item', (req, res) => {
  res.render('new-item');
});

app.post('/new-item', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem .save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la connexion à la base de données');
  }
});

//supprimer un item
app.post('/item/delete/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await Item.findById(itemId).exec();
    if (!item) {
      return res.status(404).send("Item not found");
    }
    await Item.findByIdAndDelete(itemId).exec();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la connexion à MongoDB");
  }
});

// Update an item
app.post('/item/update/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const updatedItem = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
    };
    await Item.findByIdAndUpdate(itemId, updatedItem).exec();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la connexion MongoDB");
  }
});

app.get('/item/update/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).exec();
    if (!item) {
      return res.status(404).send("Item non trouvee");
    }
    res.render('update-item', {item});
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la connexion MongoDB");
  }
});


app.listen(port, () => {
  console.log(`Server sur le port : ${port}`);
});
