import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Provider } from '@supabase/auth-js';

export interface SignUpDto {
  email: string;
  password: string;
  fullName: string;
  tenantName?: string;
  tenantSlug?: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tenantId?: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('SUPABASE_CLIENT_AUTH')
    private readonly supabaseClient: SupabaseClient, // We will keep the name so auth works seamlessly
    @Inject('SUPABASE_CLIENT')
    private readonly adminClient: SupabaseClient, // Bypasses RLS for secure database inserts
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Sign up a new user with Supabase Auth
   */
  async signUp(dto: SignUpDto): Promise<AuthResponse> {
    const { data, error } = await this.supabaseClient.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          full_name: dto.fullName,
        },
      },
    });

    if (error) {
      throw new ConflictException(error.message);
    }

    if (!data.user) {
      throw new UnauthorizedException('Failed to create user');
    }

    // Initialize public structures securely bypassing Auth RLS
    await this.adminClient.from('users').insert({
      id: data.user.id,
      email: data.user.email,
      full_name: dto.fullName
    });

    if (dto.tenantSlug) {
      await this.createTenantForUser(data.user.id, dto.tenantName || dto.fullName + "'s Team", dto.tenantSlug);
    }

    return this.generateAuthResponse(data.user);
  }

  /**
   * Sign in existing user
   */
  async signIn(dto: SignInDto): Promise<AuthResponse> {
    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    if (!data.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(data.user);
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'microsoft' | 'github'): Promise<{ url: string }> {
    const { data, error } = await this.supabaseClient.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: this.configService.get('FRONTEND_URL') + '/auth/callback',
        scopes: 'openid profile email',
      },
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return { url: data.url };
  }

  /**
   * Exchange refresh token for new access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { data, error } = await this.supabaseClient.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    if (!data.user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateAuthResponse(data.user);
  }

  /**
   * Sign out user
   */
  async signOut(accessToken: string): Promise<void> {
    await this.supabaseClient.auth.admin.signOut(accessToken);
  }

  /**
   * Create a new tenant for a user
   */
  private async createTenantForUser(
    userId: string,
    tenantName: string,
    tenantSlug: string,
  ): Promise<void> {
    // 1. Create the tenant
    const { data: tenantData, error: tenantErr } = await this.adminClient
      .from('tenants')
      .insert({
        name: tenantName,
        slug: tenantSlug,
      })
      .select('id')
      .single();

    if (tenantErr || !tenantData) {
      throw new ConflictException(`Failed to create tenant: ${tenantErr?.message}`);
    }

    // 2. Link user to tenant as owner
    const { error: linkErr } = await this.adminClient
      .from('tenant_users')
      .insert({
        tenant_id: tenantData.id,
        user_id: userId,
        role: 'owner',
      });

    if (linkErr) {
      throw new ConflictException(`Failed to link tenant to user: ${linkErr.message}`);
    }
  }

  /**
   * Generate JWT response for Supabase user
   */
  private async generateAuthResponse(user: any): Promise<AuthResponse> {
    // Look up user's default tenant
    const { data: tenantUsers } = await this.adminClient
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', user.id)
      .limit(1);

    const tenantId = tenantUsers?.[0]?.tenant_id || user.user_metadata?.tenant_id || null;

    const payload = {
      sub: user.id,
      email: user.email,
      tenant_id: tenantId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      tenantId,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || user.email,
        avatarUrl: user.user_metadata?.avatar_url,
      },
    };
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      return null;
    }
  }
}
