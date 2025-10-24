"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaService = exports.app = void 0;
const testing_1 = require("@nestjs/testing");
const prisma_service_1 = require("../src/common/prisma/prisma.service");
beforeAll(async () => {
    const moduleFixture = await testing_1.Test.createTestingModule({
        imports: [],
    }).compile();
    exports.app = moduleFixture.createNestApplication();
    exports.prismaService = moduleFixture.get(prisma_service_1.PrismaService);
    await exports.app.init();
});
afterAll(async () => {
    await exports.app.close();
});
beforeEach(async () => {
    if (exports.prismaService) {
        await exports.prismaService.generationLog.deleteMany();
        await exports.prismaService.website.deleteMany();
    }
});
//# sourceMappingURL=setup.js.map