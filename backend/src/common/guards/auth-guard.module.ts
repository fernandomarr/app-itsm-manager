import { Module, Global } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { TenantGuard } from './tenant.guard';
import { RolesGuard } from './roles.guard';
import { AuthModule } from '../../modules/auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [AuthGuard, TenantGuard, RolesGuard],
  exports: [AuthGuard, TenantGuard, RolesGuard],
})
export class AuthGuardModule {}
