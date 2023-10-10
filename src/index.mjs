import http from 'node:http';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import multer from 'multer';
import { serverAdapter } from './utils/cron/cron.mjs';
import { testCron } from './utils/cron/cron-test.mjs';

const __dirname = path.resolve();

const app = express();
app.use(cors());
app.use(compression());
app.use(cookieParser());
app.use(helmet());
app.use(multer().any());
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname + '/public'));

const router = express.Router();
router.use('/admin/queues', serverAdapter.getRouter());

app.use('/', router);

const server = http.createServer(app);
server.once('listening', () => {
  console.log('info', 'Server listening at http://localhost:3000');
  testCron();
});
server.listen({ port: 3000, hostname: 'localhost' });
