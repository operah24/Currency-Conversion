import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversion } from 'src/core/database/models/conversion.model';
import { ConversionController } from './conversion.controller';
import { ConversionService } from './conversion.service';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
@Module({
  imports: [TypeOrmModule.forFeature([Conversion]), CacheModule.register()],
  controllers: [ConversionController],
  providers: [ConversionService],
})
export class ConversionModule {}
