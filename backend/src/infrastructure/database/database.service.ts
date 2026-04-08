import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabaseClient: SupabaseClient,
  ) {}

  /**
   * Get Supabase client with service role (admin access)
   * Use this for internal operations that bypass RLS
   */
  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  /**
   * Get Supabase client with user authentication
   * Use this for operations that should respect RLS
   */
  getClientWithUser(token: string): SupabaseClient {
    // Set the auth token in the global headers so RLS respects the user context
    const url = (this.supabaseClient as any).supabaseUrl as string;
    const key = (this.supabaseClient as any).supabaseKey as string;
    return createClient(url, key, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  /**
   * Execute raw SQL query (service role only)
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const { data, error } = await this.supabaseClient.rpc('exec_sql', {
      sql_query: sql,
      sql_params: params,
    });

    if (error) {
      throw error;
    }

    return data as T[];
  }
}
