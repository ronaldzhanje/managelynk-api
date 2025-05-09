import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Log the cookies received in the request for debugging
          console.log('Incoming cookies:', request?.cookies);
          
          // Extract token from the cookie
          const token = request?.cookies?.jwt;
          if (token) return token;
          
          // Fallback to Bearer token in header
          const authHeader = request.headers.authorization;
          if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
            return authHeader.split(' ')[1];
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Returning an object with a userId property for consistent access in the application.
    return { 
      userId: payload.sub, 
      email: payload.email,
      role: payload.role
    };
  }
} 