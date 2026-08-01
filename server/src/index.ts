import { createApp } from './app.js';
import { env } from './config.js';

const app = createApp();
app.listen(env.PORT, () => {
  console.log(`NanoPay backend running on http://localhost:${env.PORT}`);
});
