import { Module } from '@nestjs/common';
import { StateService } from './state.service';
import { StateController } from './state.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { State } from './entities/state.entity';

@Module({
  controllers: [StateController],
  providers: [StateService],
  imports: [SequelizeModule.forFeature([State])],
  exports: [SequelizeModule],
})
export class StateModule {}
