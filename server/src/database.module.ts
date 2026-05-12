import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

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
  ],
})
export class DBModule {}
