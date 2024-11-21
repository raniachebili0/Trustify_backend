import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Trustify')
    .setDescription('The API description of our applicayion mobile Trustify')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

    const document = SwaggerModule.createDocument(app, config); // Create the document
     SwaggerModule.setup('api', app, document);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe()); //validation global tout controller
  await app.listen(3000 /*'192.168.243.57'*/);
}
bootstrap();
