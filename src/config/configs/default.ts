import { config } from 'dotenv';
config();

export default {
  application: {
    port: process.env.PORT || 3000,
  },
  database: {
    postgres: {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['{src,dist}/**/**.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    },
  },
};
