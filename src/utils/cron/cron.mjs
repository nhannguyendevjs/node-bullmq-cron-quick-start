import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';

const connection = new IORedis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });

const cronQueue = new Queue('cronQueue', { connection });

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(cronQueue),
  ],
  serverAdapter,
});

await cronQueue.add('initial', { message: 'Cron is ready to use' });

const addCronJobs = async (jobs = []) => {
  if (jobs.length > 0) {
    for (let index = 0; index < jobs.length; index++) {
      const job = jobs[index];
      const { name, data, opts } = job;
      await cronQueue.add(name, data, opts);
    }
  }
}

// Worker
(() => {
  const _ = new Worker('cronQueue', async job => {
    console.log('info', JSON.stringify(job.data));
    if (job.name === 'cron-job') {
      new Function(job.data.callback)();
    }
  }, { connection });
})();

// Queue Events
(() => {
  const queueEvents = new QueueEvents('cronQueue', { connection });

  queueEvents.on('waiting', async ({ jobId }) => {
    console.log('info', `A job with ID ${jobId} is waiting`);
  });

  queueEvents.on('active', async ({ jobId, prev }) => {
    console.log('info', `Job ${jobId} is now active; previous status was ${prev}`);
  });

  queueEvents.on('completed', async ({ jobId, returnvalue }) => {
    console.log('info', `${jobId} has completed and returned ${returnvalue}`);
    const job = await cronQueue.getJob(jobId);
    await job.updateProgress(100);
  });

  queueEvents.on('failed', async ({ jobId, failedReason }) => {
    console.log('info', `${jobId} has failed with reason ${failedReason}`);
  });
})();

export {
  addCronJobs,
  serverAdapter,
}
