import express from 'express';
import cors from 'cors';
import { MessageController } from './controllers/MessageController';
import { AuthController } from './controllers/AuthController';
import { ParkingSlotController } from './controllers/ParkingSlotController';
import { ReservationController } from './controllers/ReservationController';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const messageController = new MessageController();
const authController = new AuthController();
const parkingSlotController = new ParkingSlotController();
const reservationController = new ReservationController();

app.post('/api/messages', (req, res) => messageController.save(req, res));
app.get('/health', (req, res) => res.send('OK'));

// Auth
app.post('/api/login', (req, res) => authController.login(req, res));
app.get('/api/users', (req, res) => authController.getUsers(req, res));

// Slots
app.get('/api/slots', (req, res) => parkingSlotController.getAvailable(req, res));

// Reservations
app.post('/api/reservations', (req, res) => reservationController.create(req, res));
app.get('/api/reservations/user/:userId', (req, res) => reservationController.getByUser(req, res));
app.post('/api/reservations/checkin', (req, res) => reservationController.checkIn(req, res));
app.post('/api/reservations/cancel', (req, res) => reservationController.cancel(req, res));
app.post('/api/jobs/cancel-unconfirmed', (req, res) => reservationController.cancelUnconfirmed(req, res));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
