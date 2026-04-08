import { Module } from '@nestjs/common';
import { ChangeService } from './change.service';
import { ChangeController } from './change.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ChangeController],
  providers: [ChangeService],
  exports: [ChangeService],
})
export class ChangeModule {}
