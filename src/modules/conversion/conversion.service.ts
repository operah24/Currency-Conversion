import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversion } from 'src/core/database/models/conversion.model';
import { Repository } from 'typeorm';
import { CreateConversionDto } from './dto/create-conversion.dto';
import {
  fetchRates,
  CurrencyRate,
} from 'src/common/http/conversion.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ConversionService {
  constructor(
    @InjectRepository(Conversion)
    private conversionRepo: Repository<Conversion>,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) { }

  public async getRates(): Promise<CurrencyRate[]> {
    const cacheKey = 'exchange_rates';

    const cachedRates =
      await this.cacheManager.get<CurrencyRate[]>(cacheKey);

    if (cachedRates) {
      return cachedRates;
    }

    const rates: CurrencyRate[] = await fetchRates();


    await this.cacheManager.set(cacheKey, rates, 300);

    return rates;
  }


  async convert(dto: CreateConversionDto) {
    try {
      const rates = await this.getRates();

      const targetRate = rates.find(
        (r: CurrencyRate) => r.currency.toUpperCase() === dto.toCurrency.toUpperCase(),
      );

      if (!targetRate) {
        throw new NotFoundException('Exchange rate not found');
      }

      const exchangeRate = targetRate.sellValue;
      const convertedAmount = dto.amount * exchangeRate;

      const conversion = this.conversionRepo.create({
        amount: dto.amount,
        fromCurrency: dto.fromCurrency.toUpperCase(),
        toCurrency: dto.toCurrency.toUpperCase(),
        exchangeRate,
        convertedAmount,
      });

      return await this.conversionRepo.save(conversion);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Could not convert currency!');
    }
  }
}
