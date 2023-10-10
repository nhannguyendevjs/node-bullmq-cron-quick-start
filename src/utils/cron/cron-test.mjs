import { CronTime } from 'cron-time-generator';
import cronstrue from 'cronstrue';
import { addCronJobs } from './cron.mjs';

const testCron = () => {
  console.log('----------BEGIN TEST CRON----------');

  const cronExpression = CronTime.everyMinute();
  console.log('Expression: ', cronExpression);

  const cronDescription = cronstrue.toString(cronExpression);
  console.log('Description: ', cronDescription);

  addCronJobs([{
    name: 'cron-job',
    data: {
      callback: 'console.log(`${new Date().toString()} running a task`);',
    },
    opts: {
      repeat: {
        pattern: cronExpression,
      },
    },
  }]);
}

export {
  testCron,
}
