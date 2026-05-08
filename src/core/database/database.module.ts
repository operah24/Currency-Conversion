import { Global, Module } from '@nestjs/common';
import { FactoryProvider } from '@nestjs/common/interfaces';
import * as path from 'path';
import * as typeorm from 'typeorm';
import { config } from '../config';

function onModuleDestroy<T extends object>(
  thing: T,
  callback: (thing: T) => Promise<void>,
): T {
  return new Proxy<T>(thing, {
    get(target: T, property: PropertyKey) {
      if (property === 'onModuleDestroy') {
        return () => callback(thing);
      }
      return target[property as keyof T];
    },
  });
}

const databaseProvider = {
  provide: typeorm.DataSource,
  useFactory: async () => {
    const conn = await new typeorm.DataSource({
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
    return onModuleDestroy(conn, (c) => c.destroy());
  },
};

const entityManagerProvider: FactoryProvider = {
  provide: typeorm.EntityManager,
  useFactory: async (cxn: typeorm.DataSource) => {
    if (!cxn.isInitialized) {
      await cxn.initialize();
    }
    const manager = cxn.createEntityManager();
    return onModuleDestroy(manager, (m) => m.release());
  },
  inject: [typeorm.DataSource],
};

@Global()
@Module({
  providers: [databaseProvider, entityManagerProvider],
  exports: [databaseProvider, entityManagerProvider],
})
export class DatabaseModule {}
