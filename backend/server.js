import { env } from './src/config/env.js';
import app from './src/app.js';

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  Examify Server is running on port ${PORT}`);
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`=========================================`);
});
