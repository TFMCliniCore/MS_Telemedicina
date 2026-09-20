import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 👈 Importación esencial
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma/prisma-client-exception.filter';

async function bootstrap() {
  if (existsSync('.env')) loadEnvFile();

  const app = await NestFactory.create(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);

  app.enableShutdownHooks();
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(
    new PrismaClientExceptionFilter(httpAdapter),
  );

  // 🎯 Configuración de Swagger para Telemedicina
  const config = new DocumentBuilder()
    .setTitle('CliniCore - MS Telemedicina')
    .setDescription('Endpoints para la gestión de videollamadas, citas virtuales y enlaces de Meet')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 🎯 Forzamos que exponga el JSON en la ruta limpia que el Gateway redirige
  SwaggerModule.setup('api/v1/telemedicina/docs', app, document, {
    jsonDocumentUrl: 'api/v1/telemedicina/docs-json',
    swaggerOptions: { jsonEditor: true },
  });

  // Tomamos el puerto estrictamente del entorno
  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port, '0.0.0.0');
  console.log(`MS Telemedicina corriendo de forma segura en puerto ${port}`);
}
void bootstrap();