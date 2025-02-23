import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionalController } from '../vendor.controller';
import { ProfessionalService } from '../vendor.service';
import { VendorDto } from '../vendor.dto';

describe('ProfessionalController', () => {
  let controller: ProfessionalController;
  let service: ProfessionalService;

  const mockProfessional: VendorDto = {
    businessName: 'ABC Plumbing',
    primaryContactName: 'John Doe',
    serviceType: 'Plumbing',
    service_area: ['123 Main St'],
    email: 'john@abcplumbing.com',
    phone: '+1234567890'
  };

  const mockProfessionalService = {
    createProfessional: jest.fn(),
    updateProfessional: jest.fn(),
    getProfessional: jest.fn(),
    deleteProfessional: jest.fn(),
    getAllProfessionals: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionalController],
      providers: [
        {
          provide: ProfessionalService,
          useValue: mockProfessionalService,
        },
      ],
    }).compile();

    controller = module.get<ProfessionalController>(ProfessionalController);
    service = module.get<ProfessionalService>(ProfessionalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProfessional', () => {
    it('should create a professional', async () => {
      mockProfessionalService.createProfessional.mockResolvedValue(mockProfessional);
      
      const result = await controller.createProfessional(mockProfessional);
      
      expect(result).toEqual(mockProfessional);
      expect(service.createProfessional).toHaveBeenCalledWith(mockProfessional);
    });
  });

  describe('updateProfessional', () => {
    it('should update a professional', async () => {
      const updatedProfessional = { 
        ...mockProfessional, 
        businessName: 'ABC Plumbing Updated',
        serviceType: 'Plumbing & Heating'
      };
      mockProfessionalService.updateProfessional.mockResolvedValue(updatedProfessional);
      
      const result = await controller.updateProfessional(1, updatedProfessional);
      
      expect(result).toEqual(updatedProfessional);
      expect(service.updateProfessional).toHaveBeenCalledWith(1, updatedProfessional);
    });
  });

  describe('getProfessional', () => {
    it('should get a professional by id', async () => {
      mockProfessionalService.getProfessional.mockResolvedValue(mockProfessional);
      
      const result = await controller.getProfessional(1);
      
      expect(result).toEqual(mockProfessional);
      expect(service.getProfessional).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteProfessional', () => {
    it('should delete a professional', async () => {
      mockProfessionalService.deleteProfessional.mockResolvedValue({ deleted: true });
      
      const result = await controller.deleteProfessional(1);
      
      expect(result).toEqual({ deleted: true });
      expect(service.deleteProfessional).toHaveBeenCalledWith(1);
    });
  });

  describe('getAllProfessionals', () => {
    it('should get all professionals with no filters', async () => {
      const professionals = [mockProfessional];
      mockProfessionalService.getAllProfessionals.mockResolvedValue(professionals);
      
      const result = await controller.getAllProfessionals();
      
      expect(result).toEqual(professionals);
      expect(service.getAllProfessionals).toHaveBeenCalledWith({});
    });

    it('should get professionals with filters', async () => {
      const filters = {
        serviceType: 'Plumbing',
        zipcode: '12345',
        rating: 5,
        vouched: true,
        limit: 10
      };
      const professionals = [mockProfessional];
      mockProfessionalService.getAllProfessionals.mockResolvedValue(professionals);
      
      const result = await controller.getAllProfessionals(
        filters.serviceType
      );
      
      expect(result).toEqual(professionals);
      expect(service.getAllProfessionals).toHaveBeenCalledWith(filters);
    });
  });
}); 