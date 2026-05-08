import axios, { AxiosError } from 'axios';
import { config } from 'src/core/config';

export interface CurrencyRate {
  currency: string;
  sellValue: number;
  buyValue: number;
}

interface RatesResponse {
  data: CurrencyRate[];
}

export class RatesFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RatesFetchError';
  }
}

export const fetchRates = async (): Promise<CurrencyRate[]> => {
  try {
    const response = await axios.get<RatesResponse>(
      config.currencyRatesApiUrl,
    );

    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const statusText = axiosError.response.statusText ?? 'Unknown error';
      throw new RatesFetchError(
        `Failed to fetch rates: ${axiosError.response.status} ${statusText}`,
      );
    } else if (axiosError.request) {
      throw new RatesFetchError(
        'Failed to fetch rates: No response from server',
      );
    } else {
      throw new RatesFetchError(`Failed to fetch rates: ${axiosError.message}`);
    }
  }
};
