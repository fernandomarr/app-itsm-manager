import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: (configService: ConfigService) => {
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const supabaseKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase configuration is missing');
        }

        return createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'SUPABASE_CLIENT_AUTH',
      useFactory: (configService: ConfigService) => {
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const supabaseKey = configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase configuration is missing');
        }

        return createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
          },
        });
      },
      inject: [ConfigService],
    },
    DatabaseService,
  ],
  exports: ['SUPABASE_CLIENT', 'SUPABASE_CLIENT_AUTH', DatabaseService],
})
export class DatabaseModule {}
