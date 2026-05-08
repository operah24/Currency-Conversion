import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { ConversionModule } from './modules/conversion/conversion.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    DatabaseModule,
    ConversionModule,
    CacheModule.register({
      ttl: 300,
      max: 100,
    }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
