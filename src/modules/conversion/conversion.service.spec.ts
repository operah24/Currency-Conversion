import { Test, TestingModule } from '@nestjs/testing';
import { ConversionService } from './conversion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Conversion } from 'src/core/database/models/conversion.model';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as httpService from '../../common/http/conversion.service';

jest.mock('../../common/http/conversion.service');

describe('ConversionService', () => {
  let service: ConversionService;
  let repository: Repository<Conversion>;
  let cacheManager: Cache;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRates = [
    { currency: 'USD', sellValue: 1.0, buyValue: 1.0 },
    { currency: 'EUR', sellValue: 0.85, buyValue: 0.84 },
    { currency: 'GBP', sellValue: 0.73, buyValue: 0.72 },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversionService,
        {
          provide: getRepositoryToken(Conversion),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ConversionService>(ConversionService);
    repository = module.get<Repository<Conversion>>(getRepositoryToken(Conversion));
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRates', () => {
    it('should return cached rates when available', async () => {
      mockCacheManager.get.mockResolvedValue(mockRates);

      const result = await service.getRates();

      expect(cacheManager.get).toHaveBeenCalledWith('exchange_rates');
      expect(result).toEqual(mockRates);
      expect(httpService.fetchRates).not.toHaveBeenCalled();
    });

    it('should fetch and cache rates when cache is empty', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      (httpService.fetchRates as jest.Mock).mockResolvedValue(mockRates);

      const result = await service.getRates();

      expect(cacheManager.get).toHaveBeenCalledWith('exchange_rates');
      expect(httpService.fetchRates).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('exchange_rates', mockRates, 300);
      expect(result).toEqual(mockRates);
    });

    it('should cache rates with 300-second TTL', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      (httpService.fetchRates as jest.Mock).mockResolvedValue(mockRates);

      await service.getRates();

      expect(cacheManager.set).toHaveBeenCalledWith('exchange_rates', mockRates, 300);
    });
  });

  describe('convert', () => {
    const createConversionDto = {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      amount: 100,
    };

    it('should successfully convert currency with valid input', async () => {
      mockCacheManager.get.mockResolvedValue(mockRates);

      const mockConversion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
        exchangeRate: 0.85,
        convertedAmount: 85,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockConversion);
      mockRepository.save.mockResolvedValue(mockConversion);

      const result = await service.convert(createConversionDto);

      expect(result).toEqual(mockConversion);
      expect(repository.create).toHaveBeenCalledWith({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
        exchangeRate: 0.85,
        convertedAmount: 85,
      });
      expect(repository.save).toHaveBeenCalledWith(mockConversion);
    });

    it('should use correct exchange rate from getRates', async () => {
      mockCacheManager.get.mockResolvedValue(mockRates);

      const mockConversion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        fromCurrency: 'USD',
        toCurrency: 'GBP',
        amount: 100,
        exchangeRate: 0.73,
        convertedAmount: 73,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockConversion);
      mockRepository.save.mockResolvedValue(mockConversion);

      await service.convert({
        fromCurrency: 'USD',
        toCurrency: 'GBP',
        amount: 100,
      });

      expect(repository.create).toHaveBeenCalledWith({
        fromCurrency: 'USD',
        toCurrency: 'GBP',
        amount: 100,
        exchangeRate: 0.73,
        convertedAmount: 73,
      });
    });

    it('should save conversion record to database', async () => {
      mockCacheManager.get.mockResolvedValue(mockRates);

      const mockConversion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
        exchangeRate: 0.85,
        convertedAmount: 85,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockConversion);
      mockRepository.save.mockResolvedValue(mockConversion);

      await service.convert(createConversionDto);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(mockConversion);
    });

    it('should throw NotFoundException when exchange rate not found', async () => {
      mockCacheManager.get.mockResolvedValue(mockRates);

      const invalidDto = {
        fromCurrency: 'USD',
        toCurrency: 'XXX',
        amount: 100,
      };

      await expect(service.convert(invalidDto)).rejects.toThrow(NotFoundException);
      await expect(service.convert(invalidDto)).rejects.toThrow(
        'Exchange rate not found',
      );
    });

    it('should throw InternalServerErrorException on database errors', async () => {
      mockCacheManager.get.mockResolvedValue(mockRates);
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.convert(createConversionDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.convert(createConversionDto)).rejects.toThrow(
        'Could not convert currency!',
      );
    });

    it('should calculate converted amount correctly', async () => {
      mockCacheManager.get.mockResolvedValue(mockRates);

      const testDto = {
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 250.50,
      };

      const expectedConvertedAmount = 250.50 * 0.85;

      const mockConversion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 250.50,
        exchangeRate: 0.85,
        convertedAmount: expectedConvertedAmount,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockConversion);
      mockRepository.save.mockResolvedValue(mockConversion);

      await service.convert(testDto);

      expect(repository.create).toHaveBeenCalledWith({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 250.50,
        exchangeRate: 0.85,
        convertedAmount: expectedConvertedAmount,
      });
    });
  });
});
