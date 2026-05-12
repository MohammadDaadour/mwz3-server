import { Module } from '@nestjs/common';
import { SubstypesService } from './substypes.service';
import { SubstypesController } from './substypes.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { SubType } from './entities/subtype.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [SubstypesController],
  providers: [SubstypesService],
  imports: [SequelizeModule.forFeature([SubType]), UsersModule],
  exports: [SequelizeModule],
})
export class SubstypesModule {}
