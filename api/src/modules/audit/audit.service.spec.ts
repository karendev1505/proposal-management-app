import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../../prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: PrismaService;

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logAction', () => {
    const auditData = {
      userId: 'user-1',
      workspaceId: 'workspace-1',
      action: 'proposal.created',
      entity: 'proposal',
      entityId: 'proposal-1',
      metadata: { title: 'Test Proposal' },
    };

    it('should successfully log an action', async () => {
      mockPrismaService.auditLog.create.mockResolvedValue({
        id: 'audit-1',
        ...auditData,
        createdAt: new Date(),
      });

      await service.logAction(auditData);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: auditData.userId,
          workspaceId: auditData.workspaceId,
          action: auditData.action,
          entity: auditData.entity,
          entityId: auditData.entityId,
          metadata: auditData.metadata,
        },
      });
    });

    it('should handle errors gracefully without throwing', async () => {
      const error = new Error('Database error');
      mockPrismaService.auditLog.create.mockRejectedValue(error);

      // Should not throw
      await expect(service.logAction(auditData)).resolves.not.toThrow();
    });

    it('should handle missing metadata', async () => {
      const dataWithoutMetadata = {
        ...auditData,
        metadata: undefined,
      };

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: 'audit-1',
        ...dataWithoutMetadata,
        metadata: {},
        createdAt: new Date(),
      });

      await service.logAction(dataWithoutMetadata);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          ...dataWithoutMetadata,
          metadata: {},
        },
      });
    });
  });

  describe('getAuditLogs', () => {
    const workspaceId = 'workspace-1';

    it('should return audit logs with default pagination', async () => {
      const mockLogs = [
        {
          id: 'audit-1',
          userId: 'user-1',
          workspaceId,
          action: 'proposal.created',
          entity: 'proposal',
          createdAt: new Date(),
          user: {
            id: 'user-1',
            email: 'user@example.com',
            name: 'Test User',
          },
        },
      ];

      mockPrismaService.auditLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.auditLog.count.mockResolvedValue(1);

      const result = await service.getAuditLogs(workspaceId);

      expect(result.logs).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith({
        where: { workspaceId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should filter by userId', async () => {
      const filters = { userId: 'user-1' };
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);
      mockPrismaService.auditLog.count.mockResolvedValue(0);

      await service.getAuditLogs(workspaceId, filters);

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            workspaceId,
            userId: 'user-1',
          }),
        }),
      );
    });

    it('should filter by action', async () => {
      const filters = { action: 'proposal.created' };
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);
      mockPrismaService.auditLog.count.mockResolvedValue(0);

      await service.getAuditLogs(workspaceId, filters);

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            workspaceId,
            action: 'proposal.created',
          }),
        }),
      );
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const filters = { startDate, endDate };
      
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);
      mockPrismaService.auditLog.count.mockResolvedValue(0);

      await service.getAuditLogs(workspaceId, filters);

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            workspaceId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
        }),
      );
    });

    it('should handle custom pagination', async () => {
      const filters = { limit: 10, offset: 20 };
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);
      mockPrismaService.auditLog.count.mockResolvedValue(0);

      const result = await service.getAuditLogs(workspaceId, filters);

      expect(result.limit).toBe(10);
      expect(result.offset).toBe(20);
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        }),
      );
    });
  });
});

