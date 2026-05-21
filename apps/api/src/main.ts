import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors();

  // ── Swagger ──────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('AlmoxPert API')
    .setDescription(
      'API de gerenciamento de almoxarifado do Serviço Social do IFBA ' +
      'Campus Vitória da Conquista. Permite o controle de estoque de ' +
      'materiais escolares e o gerenciamento de pedidos de alunos.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT obtido em POST /api/v1/auth/login',
      },
      'JWT',
    )
    .addTag('Auth',      'Autenticação — obtenção de token JWT')
    .addTag('Users',     'Gerenciamento de usuários (admin e estudantes)')
    .addTag('Items',     'Itens e variações do almoxarifado')
    .addTag('Stock',     'Consulta e configuração de estoque')
    .addTag('Shipments', 'Entradas de estoque (recebimento de materiais)')
    .addTag('Orders',    'Pedidos de materiais pelos estudantes')
    .addTag('Movements', 'Histórico de movimentações de estoque')
    .addTag('Health',    'Status da aplicação')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Disponível em /docs
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,   // mantém o token entre reloads da página
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'AlmoxPert — API Docs',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`AlmoxPert API running on port ${process.env.PORT ?? 3000}`);
  console.log(`Swagger docs available at http://localhost:${process.env.PORT ?? 3000}/docs`);
}

bootstrap();
