import 'dotenv/config';

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3001,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  localUrl: process.env.LOCAL_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL,
};

export default env;
