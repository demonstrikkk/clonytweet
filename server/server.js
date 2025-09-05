
import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());
// Repeat for other routes or use a router to load them dynamically
app.listen(5000, () => {
  console.log('Backend API server running on http://localhost:5000');
});