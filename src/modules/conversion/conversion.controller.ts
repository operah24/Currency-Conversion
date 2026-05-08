import { Controller, Post, Body } from '@nestjs/common';
import { ConversionService } from './conversion.service';
import { CreateConversionDto } from './dto/create-conversion.dto';

@Controller('api/v1/convert')
export class ConversionController {
  constructor(private readonly conversionService: ConversionService) { }

  @Post()
  async convert(@Body() dto: CreateConversionDto) {
    const result = await this.conversionService.convert(dto);

    return {
      data: result,
    };
  }
}
