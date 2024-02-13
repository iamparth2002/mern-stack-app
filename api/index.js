const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
// const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const Post = require('./models/Post');

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const salt = bcrypt.genSaltSync(10);
const secret = 'iamparth2002';
const bucket = 'parth-blog-app';

dotenv.config();
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(__dirname + '/uploads'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log('MongoDB connected');
});

async function uploadToS3(path, originalFilename, mimetype) {
  const client = new S3Client({
    region: 'eu-north-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  const parts = originalFilename.split('.');
  const ext = parts[parts.length - 1];
  const newFileName = Date.now() + '.' + ext;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Body: fs.readFileSync(`${path}.${ext}`),
      Key: newFileName,
      ContentType: mimetype,
      ACL: 'public-read',
    })
  );
  // https://parth-blog-app.s3.eu-north-1.amazonaws.com/1707763587439.jpeg
  return `https://${bucket}.s3.eu-north-1.amazonaws.com/${newFileName}`;
}

app.post('/api/register', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post('/api/login', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id: userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});

app.get('/api/profile', (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});

const uploadMiddleware = multer({ dest: '/tmp' });
app.post('/api/post', uploadMiddleware.single('file'), async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  const { originalname, path, mimetype } = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path + '.' + ext;

  fs.renameSync(path, newPath);

  const url = await uploadToS3(path, originalname, mimetype);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: url,
      author: info.id,
    });
    res.json(postDoc);
  });
});

app.get('/api/post', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  const posts = await Post.find()
    .populate('author', ['username'])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
});

app.get('/api/post/:id', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  const post = await Post.findById(req.params.id).populate('author', [
    'username',
  ]);
  res.json(post);
});

app.post('/api/logout', (req, res) => {
  res.cookie('token', '').json('ok');
});

app.put('/api/post', uploadMiddleware.single('file'), async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  const { originalname, path, mimetype } = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path + '.' + ext;

  fs.renameSync(path, newPath);
  const url = await uploadToS3(path, originalname, mimetype);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: url,
    });

    res.json(postDoc);
  });
});

app.delete('/api/post/:id', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  try {
    const id = req.params.id;
    const deletedPost = await Post.findByIdAndDelete(id);
    res.json('ok').status(200);
  } catch (error) {
    res.json(error);
  }
});

app.get('/api/post', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL)
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`backend is up 0n ${PORT}`);
});
//
