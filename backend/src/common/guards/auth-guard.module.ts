import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { TenantGuard } from './tenant.guard';
import { RolesGuard } from './roles.guard';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret-change-in-prod',
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthGuard, TenantGuard, RolesGuard],
  exports: [AuthGuard, TenantGuard, RolesGuard],
})
export class AuthGuardModule {}
