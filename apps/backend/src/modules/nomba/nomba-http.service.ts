import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { Agent } from 'https';
import { firstValueFrom } from 'rxjs';

interface NombaTokenResponse {
  data: {
    access_token: string;
  };
}

@Injectable()
export class NombaHttpService {
  private readonly logger = new Logger(NombaHttpService.name);
  private readonly baseUrl: string;
  private readonly accountId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly httpsAgent = new Agent({ family: 4 });

  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null; // epoch ms

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('NOMBA_BASE_URL')!;
    this.accountId = this.configService.get<string>('NOMBA_ACCOUNT_ID')!;
    this.clientId = this.configService.get<string>('NOMBA_CLIENT_ID')!;
    this.clientSecret = this.configService.get<string>('NOMBA_CLIENT_SECRET')!;
  }

  private isTokenValid(): boolean {
    return (
      !!this.accessToken &&
      !!this.tokenExpiresAt &&
      Date.now() < this.tokenExpiresAt
    );
  }

  private async issueToken(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<NombaTokenResponse>(
          `${this.baseUrl}/auth/token/issue`,
          {
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              accountId: this.accountId,
            },
          },
        ),
      );

      this.accessToken = response.data.data.access_token;
      this.tokenExpiresAt = Date.now() + 55 * 60 * 1000;

      this.logger.log('Nomba access token issued successfully');
    } catch (error) {
      this.logger.error('Failed to issue Nomba access token', error);
      throw new InternalServerErrorException(
        'Unable to authenticate with Nomba',
      );
    }
  }

  private async getValidToken(): Promise<string> {
    if (!this.isTokenValid()) {
      await this.issueToken();
    }
    return this.accessToken!;
  }

  private async buildAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidToken();
    return {
      Authorization: `Bearer ${token}`,
      accountId: this.accountId,
      'Content-Type': 'application/json',
    };
  }

  async get<T = any>(
    path: string,
    config: AxiosRequestConfig = {},
  ): Promise<T> {
    return this.request<T>('GET', path, undefined, config);
  }

  async post<T = any>(
    path: string,
    body: Record<string, any> = {},
    config: AxiosRequestConfig = {},
  ): Promise<T> {
    return this.request<T>('POST', path, body, config);
  }

  async put<T = any>(
    path: string,
    body: Record<string, any> = {},
    config: AxiosRequestConfig = {},
  ): Promise<T> {
    return this.request<T>('PUT', path, body, config);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT',
    path: string,
    body?: Record<string, any>,
    config: AxiosRequestConfig = {},
    isRetry = false,
  ): Promise<T> {
    const headers = await this.buildAuthHeaders();
    const url = `${this.baseUrl}${path}`;

    try {
      const response = await firstValueFrom(
        this.httpService.request<T>({
          url,
          method,
          data: body,
          httpAgent: this.httpsAgent,
          ...config,
          headers: { ...headers, ...config.headers },
        }),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401 && !isRetry) {
        this.logger.warn(
          'Nomba token rejected, forcing refresh and retrying once',
        );
        this.accessToken = null;
        this.tokenExpiresAt = null;
        return this.request<T>(method, path, body, config, true);
      }

      this.logger.error(
        `Nomba request failed: ${method} ${path}`,
        axiosError.response?.data ?? axiosError.message,
      );

      throw new HttpException(
        axiosError.response?.data ?? 'Nomba request failed',
        axiosError.response?.status ?? 500,
      );
    }
  }
}
