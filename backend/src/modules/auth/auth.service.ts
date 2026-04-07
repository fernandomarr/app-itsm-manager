import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

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
    private readonly supabaseClient: SupabaseClient,
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

    // Create tenant if provided
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
      provider,
      options: {
        redirectTo: this.configService.get('FRONTEND_URL') + '/auth/callback',
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
    const { error } = await this.supabaseClient
      .from('tenants')
      .insert({
        name: tenantName,
        slug: tenantSlug,
      })
      .single();

    if (error) {
      throw new ConflictException(`Failed to create tenant: ${error.message}`);
    }
  }

  /**
   * Generate JWT response for Supabase user
   */
  private async generateAuthResponse(user: any): Promise<AuthResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
      tenant_id: user.user_metadata?.tenant_id,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
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
