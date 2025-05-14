import { Controller, Post, Body, UseGuards, Request, Response, Get, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      example: {
        email: "user@example.com",
        password: ""
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        id: 1,
        email: "user@example.com",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  async register(
    @Body() registerDto: { email: string; password: string },
    @Response({ passthrough: true }) res,
  ) {
    return this.authService.register(registerDto.email, registerDto.password, res);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    schema: {
      example: {
        email: "user@example.com",
        password: "strongPassword123"
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      example: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req, @Response({ passthrough: true }) res) {
    return this.authService.login(req.user, res);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Response({ passthrough: true }) res) {
    return this.authService.logout(res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current user profile',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        role: 'user'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    const user = await this.authService.getProfile(req.user.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
} 