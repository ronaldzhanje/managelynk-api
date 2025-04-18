import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service'; // You'll need to create this
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, res?: Response) {
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    
    if (res) {
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProduction, // true in production, false in development
        sameSite: isProduction ? 'none' : 'lax', // 'none' for production, 'lax' for development
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      return { success: true };
    }

    return { access_token: token };
  }

  async register(email: string, password: string, res?: Response) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create({
      email,
      password: hashedPassword,
    });

    return this.login(user, res);
  }

  async logout(res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    });
    return { success: true };
  }
} 