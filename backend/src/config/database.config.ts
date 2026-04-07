import { ConfigService } from '@nestjs/config';

export interface DatabaseConfigType {
  supabaseUrl: string;
  supabaseKey: string;
  supabaseServiceRoleKey: string;
}

export const DatabaseConfig = {
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_ANON_KEY!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
};

export function getDatabaseConfig(configService: ConfigService): DatabaseConfigType {
  return {
    supabaseUrl: configService.get<string>('SUPABASE_URL')!,
    supabaseKey: configService.get<string>('SUPABASE_ANON_KEY')!,
    supabaseServiceRoleKey: configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
  };
}
