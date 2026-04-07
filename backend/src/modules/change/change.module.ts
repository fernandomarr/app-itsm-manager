import { Module } from '@nestjs/common';
import { ChangeService } from './change.service';
import { ChangeController } from './change.controller';

@Module({
  controllers: [ChangeController],
  providers: [ChangeService],
  exports: [ChangeService],
})
export class ChangeModule {}
