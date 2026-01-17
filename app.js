// app.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to my API!' });
});

app.get('/api/users', (req, res) => {
    res.json([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
    ]);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});