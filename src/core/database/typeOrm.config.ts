import { DataSource } from 'typeorm';
import { config } from '../config';
import * as path from 'path';

export default new DataSource({
  type: 'postgres',
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.name,
  entities: [path.join(__dirname, '..', '**', '*.model.{js,ts}')],
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  logging: config.db.logging,
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
});
