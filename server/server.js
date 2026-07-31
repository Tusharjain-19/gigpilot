import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount API Router
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`⚡ GigPilot AI Express Backend running on http://localhost:${PORT}`);
});
