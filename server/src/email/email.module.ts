import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  imports: [ConfigModule, JwtModule, UsersModule],
  exports: [EmailService],
})
export class EmailModule {}
