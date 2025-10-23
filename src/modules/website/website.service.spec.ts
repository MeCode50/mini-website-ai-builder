import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('WebsiteService', () => {
  let service: WebsiteService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    website: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsiteService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WebsiteService>(WebsiteService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new website', async () => {
      const createWebsiteDto = {
        title: 'Test Website',
        description: 'A test website',
        prompt: 'Create a test website',
        htmlContent: '<html><body>Test</body></html>',
        cssContent: 'body { color: red; }',
        isPublic: false,
      };

      const expectedWebsite = {
        id: '1',
        ...createWebsiteDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: null,
      };

      mockPrismaService.website.create.mockResolvedValue(expectedWebsite);

      const result = await service.create(createWebsiteDto);

      expect(mockPrismaService.website.create).toHaveBeenCalledWith({
        data: createWebsiteDto,
      });
      expect(result).toEqual(expectedWebsite);
    });
  });

  describe('findOne', () => {
    it('should return a website when found', async () => {
      const websiteId = '1';
      const expectedWebsite = {
        id: websiteId,
        title: 'Test Website',
        description: 'A test website',
        prompt: 'Create a test website',
        htmlContent: '<html><body>Test</body></html>',
        cssContent: 'body { color: red; }',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: null,
      };

      mockPrismaService.website.findUnique.mockResolvedValue(expectedWebsite);

      const result = await service.findOne(websiteId);

      expect(mockPrismaService.website.findUnique).toHaveBeenCalledWith({
        where: { id: websiteId },
      });
      expect(result).toEqual(expectedWebsite);
    });

    it('should throw NotFoundException when website not found', async () => {
      const websiteId = '1';
      mockPrismaService.website.findUnique.mockResolvedValue(null);

      await expect(service.findOne(websiteId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated websites', async () => {
      const query = { page: 1, limit: 10 };
      const websites = [
        {
          id: '1',
          title: 'Test Website 1',
          description: 'A test website',
          prompt: 'Create a test website',
          htmlContent: '<html><body>Test</body></html>',
          cssContent: 'body { color: red; }',
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: null,
        },
      ];

      mockPrismaService.website.findMany.mockResolvedValue(websites);
      mockPrismaService.website.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });
  });

  describe('update', () => {
    it('should update a website when found', async () => {
      const websiteId = '1';
      const updateDto = { title: 'Updated Title' };
      const existingWebsite = {
        id: websiteId,
        title: 'Original Title',
        description: 'A test website',
        prompt: 'Create a test website',
        htmlContent: '<html><body>Test</body></html>',
        cssContent: 'body { color: red; }',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: null,
      };
      const updatedWebsite = { ...existingWebsite, ...updateDto };

      mockPrismaService.website.findUnique.mockResolvedValue(existingWebsite);
      mockPrismaService.website.update.mockResolvedValue(updatedWebsite);

      const result = await service.update(websiteId, updateDto);

      expect(mockPrismaService.website.update).toHaveBeenCalledWith({
        where: { id: websiteId },
        data: updateDto,
      });
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException when website not found', async () => {
      const websiteId = '1';
      const updateDto = { title: 'Updated Title' };

      mockPrismaService.website.findUnique.mockResolvedValue(null);

      await expect(service.update(websiteId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a website when found', async () => {
      const websiteId = '1';
      const existingWebsite = {
        id: websiteId,
        title: 'Test Website',
        description: 'A test website',
        prompt: 'Create a test website',
        htmlContent: '<html><body>Test</body></html>',
        cssContent: 'body { color: red; }',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: null,
      };

      mockPrismaService.website.findUnique.mockResolvedValue(existingWebsite);
      mockPrismaService.website.delete.mockResolvedValue(existingWebsite);

      await service.remove(websiteId);

      expect(mockPrismaService.website.delete).toHaveBeenCalledWith({
        where: { id: websiteId },
      });
    });

    it('should throw NotFoundException when website not found', async () => {
      const websiteId = '1';
      mockPrismaService.website.findUnique.mockResolvedValue(null);

      await expect(service.remove(websiteId)).rejects.toThrow(NotFoundException);
    });
  });
});
