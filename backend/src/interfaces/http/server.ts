import express from 'express';
import cors from 'cors';
import { MessageController } from './controllers/MessageController';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const messageController = new MessageController();

app.post('/api/messages', (req, res) => messageController.save(req, res));
app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
