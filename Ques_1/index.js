const express = require('express');
const axios = require('axios');

const WINDOW_SIZE = 10;
const TIMEOUT = 500;

const app = express();

const numbersStore = {
  'p': [],
  'f': [],
  'e': [2,4,6,8],
  'r': []
};

app.get('/numbers/:qualifier', async (req, res) => {
  const qualifier = req.params.qualifier;

  if (!['p', 'f', 'e', 'r'].includes(qualifier)) {
    return res.status(400).json({ error: 'Invalid qualifier' });
  }

  try {
    const response = await axios.get(`http://testserver.com/numbers/${qualifier}`, { timeout: TIMEOUT });
    const newNumbers = response.data.numbers || [];

    const uniqueFetchedNumbers = [...new Set(newNumbers)];

    const windowPrevState = [...numbersStore[qualifier]];

    numbersStore[qualifier] = [...new Set([...numbersStore[qualifier], ...uniqueFetchedNumbers])].slice(-WINDOW_SIZE);

    const windowCurrState = [...numbersStore[qualifier]];
    const avg = calculateAverage(numbersStore[qualifier]);

    res.json({
      numbers: uniqueFetchedNumbers,
      windowPrevState,
      windowCurrState,
      avg: avg.toFixed(2),
    });
  } catch (error) {
    console.error('Error fetching numbers:', error.message);
    res.status(500).json({ error: 'Error fetching numbers or timed out' });
  }
});

function calculateAverage(numbers) {
  if (!numbers.length) return 0.0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

const port = process.env.PORT || 9876;
app.listen(port, () => console.log(`Server listening on port ${port}`));
