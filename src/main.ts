import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as cookieParser from 'cookie-parser';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:3000', 'https://mwz3-next.vercel.app', process.env.FRONTEND_URL].filter(Boolean),
    allowedHeaders: [
      'Content-Type', 
      'Authorization',
      'Access-Control-Allow-Origin',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  });
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.enableShutdownHooks();

  const config = new DocumentBuilder().setTitle('MWZ3 Server').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3200);
}

bootstrap();





// src/main.ts  

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import cookieParser from 'cookie-parser';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import helmet from 'helmet';
// import { ValidationPipe } from '@nestjs/common';
// import express from 'express';

// let cachedServer: any = null;

// async function bootstrap() {
//   const server = express();

//   const app = await NestFactory.create(AppModule, {
//     bodyParser: false, // important for webhooks
//   });

//   const expressApp = app.getHttpAdapter().getInstance();

//   // Apply middlewares to the raw express server (optional but good)
//   server.use(cookieParser());
//   server.use(helmet({ crossOriginResourcePolicy: false }));

//   // Nest setup
//   app.enableCors({
//     origin: ['http://localhost:3000', 'https://mwz3-next.vercel.app', process.env.FRONTEND_URL].filter(Boolean),
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
//     credentials: true,
//   });

//   app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

//   const config = new DocumentBuilder()
//     .setTitle('MWZ3 Server')
//     .setDescription('API for MWZ3')
//     .setVersion('1.0')
//     .build();
//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api', app, document);

//   // ←←← THIS IS THE CRITICAL PART ←←←
//   await app.init();                    // First init Nest
//   server.use(expressApp);              // Then mount Nest's express app onto your server

//   return server;
// }

// // Vercel handler
// export default async function handler(req: any, res: any) {
//   if (!cachedServer) {
//     cachedServer = await bootstrap();
//   }
//   cachedServer(req, res);
// }

// export const config = {
//   api: {
//     bodyParser: false,
//     externalResolver: true,
//   },
// };
