import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionalService } from '../vendor.service';
import { Knex } from 'knex';
import { Professional} from '../vendor.entity';
import { VendorDto } from '../vendor.dto';

interface MockQueryBuilder {
  insert?: jest.Mock;
  returning?: jest.Mock;
  where?: jest.Mock;
  update?: jest.Mock;
  delete?: jest.Mock;
  first?: jest.Mock;
  select?: jest.Mock;
  limit?: jest.Mock;
  then?: jest.Mock;
}

describe('ProfessionalService', () => {
  let service: ProfessionalService;
  let knex: Knex & { [key: string]: any };

  const sampleProfessional: Professional = {
    id: 1,
    businessName: 'Acme Plumbing',
    primaryContactName: 'John Doe',
    serviceType: 'Plumbing',
    service_area: ['123 Main St'],
    email: 'john@example.com',
    phone: '1234567890'
  };

  const mockQueryBuilder: MockQueryBuilder = {
    insert: jest.fn(),
    returning: jest.fn(),
    where: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    first: jest.fn(),
    select: jest.fn(),
    limit: jest.fn(),
    then: jest.fn(),
  };

  beforeEach(async () => {
    mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.insert.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.returning.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.update.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.delete.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.first.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.limit.mockReturnValue(mockQueryBuilder);

    knex = jest.fn() as any;
    (knex as any).mockImplementation(() => mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionalService,
        {
          provide: 'KNEX_CONNECTION',
          useValue: knex,
        },
      ],
    }).compile();

    service = module.get<ProfessionalService>(ProfessionalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProfessional', () => {
    it('should insert a new professional and return its id', async () => {
      mockQueryBuilder.returning.mockResolvedValueOnce([123]);
      const result = await service.createProfessional(sampleProfessional);
      
      expect(knex).toHaveBeenCalledWith('professionals');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(sampleProfessional);
      expect(mockQueryBuilder.returning).toHaveBeenCalledWith('id');
      expect(result).toEqual([123]);
    });
  });

  describe('getProfessional', () => {
    it('should retrieve a professional by id', async () => {
      mockQueryBuilder.first.mockResolvedValueOnce(sampleProfessional);
      const result = await service.getProfessional(1);

      expect(knex).toHaveBeenCalledWith('professionals');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toEqual(sampleProfessional);
    });
  });

  describe('updateProfessional', () => {
    it('should update a professional and return the number of affected rows', async () => {
      mockQueryBuilder.update.mockResolvedValueOnce(1);

      const updateData: Partial<Professional> = {
        businessName: 'Acme Plumbing and Heating',
      };

      const result = await service.updateProfessional(1, updateData);

      expect(knex).toHaveBeenCalledWith('professionals');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(updateData);
      expect(result).toBe(1);
    });
  });

  describe('deleteProfessional', () => {
    it('should delete a professional and return the number of affected rows', async () => {
      mockQueryBuilder.delete.mockResolvedValueOnce(1);

      const result = await service.deleteProfessional(1);

      expect(knex).toHaveBeenCalledWith('professionals');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('getAllProfessionals', () => {
    it('should return all professionals without filters', async () => {
      const professionals = [sampleProfessional, {
        ...sampleProfessional,
        id: 2,
        businessName: 'Electric Solutions',
        serviceType: 'Electrical',
        serviceLocationZip: '10002',
      }];
      
      mockQueryBuilder.select.mockReturnValueOnce(Promise.resolve(professionals));
      const result = await service.getAllProfessionals({});
      
      expect(knex).toHaveBeenCalledWith('professionals');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(result).toEqual(professionals);
    });

    // TODO: Fix this test
    xit('should apply filters correctly', async () => {
      const professionals: VendorDto[] = [
        {
          businessName: 'Acme Plumbing',
          primaryContactName: 'John Doe',
          serviceType: 'Plumbing',
          service_area: ['123 Main St'],
          email: 'john@example.com',
          phone: '1234567890'
        }
      ];
      mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.limit.mockReturnValueOnce(Promise.resolve(professionals));
      
      const filters = {
        serviceType: 'Plumbing',
        zipcode: '10001',
        vouched: true,
        limit: 10,
      };

      const result = await service.getAllProfessionals(filters);

      expect(knex).toHaveBeenCalledWith('professionals');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('serviceType', 'like', '%Plumbing%');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('zipcode', '10001');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('vouched', true);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(professionals);
    });
  });
});