import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma/prisma.service';

export let app: INestApplication;
export let prismaService: PrismaService;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [],
  }).compile();

  app = moduleFixture.createNestApplication();
  prismaService = moduleFixture.get<PrismaService>(PrismaService);
  
  await app.init();
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  // Clean up database before each test
  if (prismaService) {
    await prismaService.generationLog.deleteMany();
    await prismaService.website.deleteMany();
  }
});
