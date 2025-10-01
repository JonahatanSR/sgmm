import { config } from 'dotenv';

// Load environment variables
config();

export interface IEnvironmentConfig {
  // Server
  NODE_ENV: string;
  PORT: number;
  HOST: string;

  // Database
  DATABASE_URL: string;
  REDIS_URL: string;

  // JWT
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // Session
  SESSION_SECRET: string;

  // SAML
  SAML_ENTRY_POINT: string;
  SAML_ISSUER: string;
  SAML_CERT: string;

  // CORS
  CORS_ORIGIN: string;

  // File Upload
  MAX_FILE_SIZE: number;
  UPLOAD_DIR: string;

  // System
  RENEWAL_DEADLINE: string;
  COMPANY_DOMAIN_SR: string;
  COMPANY_DOMAIN_WP: string;
  FRONTEND_DASHBOARD_URL: string;
}

class EnvironmentConfig implements IEnvironmentConfig {
  public readonly NODE_ENV: string;
  public readonly PORT: number;
  public readonly HOST: string;
  public readonly DATABASE_URL: string;
  public readonly REDIS_URL: string;
  public readonly JWT_SECRET: string;
  public readonly JWT_REFRESH_SECRET: string;
  public readonly JWT_EXPIRES_IN: string;
  public readonly JWT_REFRESH_EXPIRES_IN: string;
  public readonly SESSION_SECRET: string;
  public readonly SAML_ENTRY_POINT: string;
  public readonly SAML_ISSUER: string;
  public readonly SAML_CERT: string;
  public readonly CORS_ORIGIN: string;
  public readonly MAX_FILE_SIZE: number;
  public readonly UPLOAD_DIR: string;
  public readonly RENEWAL_DEADLINE: string;
  public readonly COMPANY_DOMAIN_SR: string;
  public readonly COMPANY_DOMAIN_WP: string;
  public readonly FRONTEND_DASHBOARD_URL: string;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.PORT = parseInt(process.env.PORT || '3000', 10);
    this.HOST = process.env.HOST || '0.0.0.0';

    this.DATABASE_URL = this.getRequiredEnvVar('DATABASE_URL');
    this.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

    this.JWT_SECRET = this.getRequiredEnvVar('JWT_SECRET');
    this.JWT_REFRESH_SECRET = this.getRequiredEnvVar('JWT_REFRESH_SECRET');
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
    this.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    this.SESSION_SECRET = this.getRequiredEnvVar('SESSION_SECRET');

    this.SAML_ENTRY_POINT = this.getRequiredEnvVar('SAML_ENTRY_POINT');
    this.SAML_ISSUER = this.getRequiredEnvVar('SAML_ISSUER');
    this.SAML_CERT = this.getRequiredEnvVar('SAML_CERT');

    this.CORS_ORIGIN = process.env.CORS_ORIGIN || '*'; // Permitir acceso desde cualquier origen en desarrollo

    this.MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10);
    this.UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

    this.RENEWAL_DEADLINE = process.env.RENEWAL_DEADLINE || '2024-11-30';
    this.COMPANY_DOMAIN_SR = process.env.COMPANY_DOMAIN_SR || 'siegfried.com.mx';
    this.COMPANY_DOMAIN_WP = process.env.COMPANY_DOMAIN_WP || 'weser.com.mx';
    this.FRONTEND_DASHBOARD_URL = process.env.FRONTEND_DASHBOARD_URL || 'http://localhost:8080';
  }

  private getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Required environment variable ${name} is not set`);
    }
    return value;
  }

  public isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }

  public isTest(): boolean {
    return this.NODE_ENV === 'test';
  }
}

export const env = new EnvironmentConfig();
