import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import pg from 'pg';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        database: configService.get('DB_NAME'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        host: '127.0.0.1',
        port: 5432,
        autoLoadModels: true,
        omitNull: false,
        // logging: false
        // synchronize: true,
        // sync: { force: true },
      }),
    }),

    // ...
    // ConfigModule.forRoot({ isGlobal: true }),
    // SequelizeModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     dialect: 'postgres',
    //     uri: configService.get<string>('DATABASE_URL'),
    //     dialectModule: pg,
    //     dialectOptions: {
    //       ssl: false,
    //     },
    //     pool: {
    //       max: 1,
    //       min: 0,
    //       acquire: 10000,
    //       idle: 30000,
    //     },
    //     autoLoadModels: true,
    //     synchronize: true,
    //     retry: {
    //       max: 2,
    //     },
    //     keepAlive: false,
    //   }),
    // })
  ],
})
export class DBModule { }
