import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  // Mock response object
  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  // Mock AuthService
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { success: true };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await authController.register(registerDto, mockResponse);

      expect(result).toEqual(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        mockResponse,
      );
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockRequest = { user: mockUser };
      const expectedResult = { success: true };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await authController.login(mockRequest, mockResponse);

      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(mockUser, mockResponse);
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const expectedResult = { success: true };

      mockAuthService.logout.mockResolvedValue(expectedResult);

      const result = await authController.logout(mockResponse);

      expect(result).toEqual(expectedResult);
      expect(authService.logout).toHaveBeenCalledWith(mockResponse);
    });
  });
}); 