const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const dataPath = path.join(__dirname, 'data', 'userProgress.json');

// Read Progress
app.get('/api/progress/:userId', (req, res) => {
  const userId = req.params.userId;
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  res.json(data[userId] || { intervals: [], duration: 0 });
});

// Save/Update Progress
app.post('/api/progress/:userId', (req, res) => {
  const userId = req.params.userId;
  const { intervals, duration } = req.body;

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  data[userId] = { intervals, duration };

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  res.status(200).json({ message: 'Progress updated successfully.' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
