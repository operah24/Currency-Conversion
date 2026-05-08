import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptors';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import morgan from 'morgan';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(morgan('dev'));
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors();
  const PORT = process.env.PORT || 4213;
  await app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
bootstrap();
