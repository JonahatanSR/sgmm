import { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import session from '@fastify/session';
const { RedisStore } = require('connect-redis');
import { createClient } from 'redis';
import { env } from '../config/environment';

export async function registerSession(app: FastifyInstance) {
  app.log.info('Starting session middleware registration...');

  // 1. Register cookie plugin (dependency for session)
  await app.register(cookie);
  app.log.info('Cookie plugin registered successfully.');

  // 2. Create and connect the Redis client
  app.log.info('Creating Redis client...');
  const redisClient = createClient({
    url: env.REDIS_URL,
    socket: {
      keepAlive: true,
      reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
    },
  });

  redisClient.on('error', (err) => app.log.error('Redis Client Error', err));
  redisClient.on('connect', () => app.log.info('Redis client connecting...'));
  redisClient.on('ready', () => app.log.info('Redis client is ready.'));

  try {
    await redisClient.connect();
    app.log.info('Redis connected successfully.');
  } catch (err: any) {
    app.log.error('Failed to connect to Redis:', err);
    throw err;
  }

  // 3. Initialize RedisStore with the connected client
  app.log.info('Creating Redis store...');
  let redisStore;
  try {
    redisStore = new RedisStore({
      client: redisClient,
      prefix: 'sgmm:session:',
      ttl: 8 * 60 * 60, // 8 hours in seconds
    });
    app.log.info('Redis store created successfully.');
  } catch (storeError: any) {
    app.log.error('Failed to create Redis store:', storeError);
    app.log.error('RedisStore constructor error:', storeError?.message);
    app.log.error('RedisStore constructor stack:', storeError?.stack);
    throw storeError;
  }

  // 4. Register session plugin with the store
  await app.register(session, {
    secret: env.SESSION_SECRET,
    cookieName: 'sgmm_session',
    cookie: {
      httpOnly: true,
      secure: env.isProduction(),
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
      path: '/',
    },
    store: redisStore,
    saveUninitialized: false,
  });

  app.log.info('Session middleware registered successfully.');
}

/**
 * Utilidad para obtener información de sesión de forma tipada
 */
export interface SessionData {
  userId?: string;
  userRole?: 'EMPLOYEE' | 'HR_ADMIN' | 'SUPER_ADMIN';
  companyId?: string;
  employeeId?: string;
  loginTime?: number;
  lastActivity?: number;
}

/**
 * Helper para trabajar con sesiones de forma segura
 */
export class SessionHelper {
  /**
   * Obtiene datos de sesión de forma tipada
   */
  static getSessionData(session: any): SessionData {
    return {
      userId: session?.userId,
      userRole: session?.userRole,
      companyId: session?.companyId,
      employeeId: session?.employeeId,
      loginTime: session?.loginTime,
      lastActivity: session?.lastActivity,
    };
  }

  /**
   * Establece datos de sesión de forma segura
   */
  static setSessionData(session: any, data: Partial<SessionData>): void {
    if (!session) return;

    const now = Date.now();
    
    // Actualizar campos proporcionados
    Object.assign(session, data);
    
    // Actualizar timestamp de última actividad
    session.lastActivity = now;
  }

  /**
   * Limpia datos de sesión
   */
  static clearSession(session: any): void {
    if (!session) return;

    delete session.userId;
    delete session.userRole;
    delete session.companyId;
    delete session.employeeId;
    delete session.loginTime;
    delete session.lastActivity;
  }

  /**
   * Verifica si la sesión es válida y no ha expirado
   */
  static isSessionValid(session: any, maxIdleTime: number = 8 * 60 * 60 * 1000): boolean {
    if (!session || !session.userId || !session.lastActivity) {
      return false;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;
    
    return timeSinceLastActivity < maxIdleTime;
  }
}