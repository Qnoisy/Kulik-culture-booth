const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs'); // Додано fs для видалення файлів

const app = express();
const port = 3000;

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: 'database.sqlite',
});

const News = sequelize.define(
	'News',
	{
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		image: {
			type: DataTypes.STRING,
		},
	},
	{
		timestamps: true,
	}
);

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/uploads/gallery');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	},
});

const upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
	session({
		secret: 'secret',
		resave: false,
		saveUninitialized: true,
	})
);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
	const newsItems = await News.findAll();
	res.render('index', { newsItems });
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', (req, res) => {
	const { username, password } = req.body;
	if (username === 'admin' && password === 'password') {
		req.session.loggedIn = true;
		res.redirect('/admin');
	} else {
		res.redirect('/login');
	}
});

app.get('/admin', (req, res) => {
	if (!req.session.loggedIn) {
		return res.redirect('/login');
	}
	res.render('admin');
});

app.post('/add', upload.single('image'), async (req, res) => {
	try {
		const { title, content } = req.body;
		const image = req.file ? `/uploads/gallery/${req.file.filename}` : null;
		const newsItem = await News.create({ title, content, image });
		res.status(200).json(newsItem);
	} catch (error) {
		console.error('Error adding news item:', error);
		res.status(500).send('Error adding news item');
	}
});

app.delete('/delete/:id', async (req, res) => {
	try {
		const newsId = req.params.id;
		const newsItem = await News.findByPk(newsId);

		if (newsItem) {
			if (newsItem.image) {
				const imagePath = path.join(__dirname, 'public', newsItem.image);
				fs.unlink(imagePath, err => {
					if (err) {
						console.error('Error deleting image:', err);
					}
				});
			}

			await newsItem.destroy();
			res.status(200).send('News item deleted');
		} else {
			res.status(404).send('News item not found');
		}
	} catch (error) {
		console.error('Error deleting news item:', error);
		res.status(500).send('Error deleting news item');
	}
});

app.get('/news', async (req, res) => {
	try {
		const newsItems = await News.findAll();
		res.json(newsItems);
	} catch (error) {
		console.error('Error fetching news items:', error);
		res.status(500).send('Error fetching news items');
	}
});

app.listen(port, async () => {
	try {
		await sequelize.sync({ force: true }); // This will drop the table if it already exists
		console.log(`Server is running on http://localhost:${port}`);
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
});
