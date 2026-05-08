import { IsString, Length, IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class CreateConversionDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  fromCurrency!: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  toCurrency!: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount!: number;
}
