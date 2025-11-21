import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from './workspaces.service';
import { PrismaService } from '../../prisma.service';
import { EmailsService } from '../emails/emails.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let prisma: PrismaService;
  let emailsService: EmailsService;

  const mockPrismaService = {
    workspace: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    membership: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workspaceInvite: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockEmailsService = {
    sendTemplateEmail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        FRONTEND_URL: 'http://localhost:3000',
        PUBLIC_APP_URL: 'http://localhost:3000',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailsService,
          useValue: mockEmailsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    prisma = module.get<PrismaService>(PrismaService);
    emailsService = module.get<EmailsService>(EmailsService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWorkspace', () => {
    const userId = 'user-1';
    const createDto = { name: 'Test Workspace' };

    it('should successfully create a workspace', async () => {
      mockPrismaService.workspace.findUnique.mockResolvedValue(null);
      mockPrismaService.workspace.create.mockResolvedValue({
        id: 'workspace-1',
        name: 'Test Workspace',
        slug: 'test-workspace',
        ownerId: userId,
        owner: {
          id: userId,
          email: 'test@example.com',
          name: 'Test User',
        },
        members: [
          {
            userId,
            role: WorkspaceRole.OWNER,
            user: {
              id: userId,
              email: 'test@example.com',
              name: 'Test User',
            },
          },
        ],
      });
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.createWorkspace(userId, createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Workspace');
      expect(mockPrismaService.workspace.create).toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { activeWorkspaceId: 'workspace-1' },
      });
    });

    it('should generate unique slug when duplicate exists', async () => {
      mockPrismaService.workspace.findUnique
        .mockResolvedValueOnce({ id: 'existing' }) // First call - exists
        .mockResolvedValueOnce(null); // Second call - available
      
      mockPrismaService.workspace.create.mockResolvedValue({
        id: 'workspace-1',
        name: 'Test Workspace',
        slug: 'test-workspace-1',
        ownerId: userId,
        members: [],
      });
      mockPrismaService.user.update.mockResolvedValue({});

      await service.createWorkspace(userId, createDto);

      expect(mockPrismaService.workspace.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.workspace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'test-workspace-1',
          }),
        }),
      );
    });
  });

  describe('getUserWorkspaces', () => {
    const userId = 'user-1';

    it('should return user workspaces', async () => {
      const mockMemberships = [
        {
          workspace: {
            id: 'workspace-1',
            name: 'Workspace 1',
            owner: { id: 'owner-1', email: 'owner@example.com' },
            _count: { members: 5 },
          },
          role: WorkspaceRole.OWNER,
        },
      ];

      mockPrismaService.membership.findMany.mockResolvedValue(mockMemberships);

      const result = await service.getUserWorkspaces(userId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Workspace 1');
      expect(result[0].role).toBe(WorkspaceRole.OWNER);
      expect(mockPrismaService.membership.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getWorkspaceById', () => {
    const workspaceId = 'workspace-1';
    const userId = 'user-1';

    it('should return workspace if user is member', async () => {
      const mockMembership = {
        workspace: {
          id: workspaceId,
          name: 'Test Workspace',
          owner: { id: 'owner-1' },
          members: [],
        },
        role: WorkspaceRole.MEMBER,
      };

      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);

      const result = await service.getWorkspaceById(workspaceId, userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(workspaceId);
      expect(result.role).toBe(WorkspaceRole.MEMBER);
    });

    it('should throw NotFoundException if user is not member', async () => {
      mockPrismaService.membership.findUnique.mockResolvedValue(null);

      await expect(
        service.getWorkspaceById(workspaceId, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setActiveWorkspace', () => {
    const workspaceId = 'workspace-1';
    const userId = 'user-1';

    it('should set active workspace if user is member', async () => {
      mockPrismaService.membership.findUnique.mockResolvedValue({
        userId,
        workspaceId,
        role: WorkspaceRole.MEMBER,
      });
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.setActiveWorkspace(userId, workspaceId);

      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { activeWorkspaceId: workspaceId },
      });
    });

    it('should throw ForbiddenException if user is not member', async () => {
      mockPrismaService.membership.findUnique.mockResolvedValue(null);

      await expect(
        service.setActiveWorkspace(userId, workspaceId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('renameWorkspace', () => {
    const workspaceId = 'workspace-1';
    const userId = 'owner-1';
    const updateDto = { name: 'New Name' };

    it('should rename workspace if user is owner', async () => {
      mockPrismaService.membership.findUnique.mockResolvedValue({
        userId,
        workspaceId,
        role: WorkspaceRole.OWNER,
      });
      mockPrismaService.workspace.update.mockResolvedValue({
        id: workspaceId,
        name: 'New Name',
      });

      const result = await service.renameWorkspace(workspaceId, userId, updateDto);

      expect(result.name).toBe('New Name');
      expect(mockPrismaService.workspace.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      mockPrismaService.membership.findUnique.mockResolvedValue({
        userId: 'member-1',
        workspaceId,
        role: WorkspaceRole.MEMBER,
      });

      await expect(
        service.renameWorkspace(workspaceId, 'member-1', updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteWorkspace', () => {
    const workspaceId = 'workspace-1';
    const userId = 'owner-1';

    it('should delete workspace if user is owner', async () => {
      mockPrismaService.membership.findUnique.mockResolvedValue({
        userId,
        workspaceId,
        role: WorkspaceRole.OWNER,
      });
      mockPrismaService.workspace.delete.mockResolvedValue({
        id: workspaceId,
      });

      const result = await service.deleteWorkspace(workspaceId, userId);

      expect(result.success).toBe(true);
      expect(mockPrismaService.workspace.delete).toHaveBeenCalledWith({
        where: { id: workspaceId },
      });
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      mockPrismaService.membership.findUnique.mockResolvedValue({
        userId: 'member-1',
        workspaceId,
        role: WorkspaceRole.MEMBER,
      });

      await expect(
        service.deleteWorkspace(workspaceId, 'member-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('inviteMember', () => {
    const workspaceId = 'workspace-1';
    const userId = 'owner-1';
    const inviteDto = { email: 'newuser@example.com', role: WorkspaceRole.MEMBER };

    it('should create invitation and send email', async () => {
      mockPrismaService.membership.findUnique.mockResolvedValue({
        userId,
        workspaceId,
        role: WorkspaceRole.OWNER,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockPrismaService.workspaceInvite.create.mockResolvedValue({
        id: 'invite-1',
        token: 'invite-token',
        email: inviteDto.email,
        workspaceId,
        role: inviteDto.role,
        expiresAt: new Date(),
        workspace: {
          id: workspaceId,
          name: 'Test Workspace',
          slug: 'test-workspace',
        },
        inviter: {
          name: 'Test User',
          email: 'owner@example.com',
        },
      });
      mockEmailsService.sendTemplateEmail.mockResolvedValue(true);
      mockConfigService.get.mockReturnValue('http://localhost:3000');

      const result = await service.inviteMember(workspaceId, userId, inviteDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.workspaceInvite.create).toHaveBeenCalled();
      expect(mockEmailsService.sendTemplateEmail).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not admin or owner', async () => {
      mockPrismaService.membership.findUnique.mockResolvedValue({
        userId: 'member-1',
        workspaceId,
        role: WorkspaceRole.MEMBER,
      });

      await expect(
        service.inviteMember(workspaceId, 'member-1', inviteDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

