import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  // Mock response object
  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  // Mock services
  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user without password if validation is successful', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should return null if user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await authService.validateUser('test@example.com', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return success and set cookie when response object is provided', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockToken = 'jwt-token';

      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authService.login(mockUser, mockResponse);

      expect(result).toEqual({ success: true });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'jwt',
        mockToken,
        expect.any(Object)
      );
    });
  });

  describe('register', () => {
    it('should create user and return login response', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockToken = 'jwt-token';

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authService.register('test@example.com', 'password123', mockResponse);

      expect(result).toEqual({ success: true });
      expect(mockUserService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
      });
    });
  });

  describe('logout', () => {
    it('should clear cookie and return success', async () => {
      const result = await authService.logout(mockResponse);

      expect(result).toEqual({ success: true });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'jwt',
        expect.any(Object)
      );
    });
  });
}); 