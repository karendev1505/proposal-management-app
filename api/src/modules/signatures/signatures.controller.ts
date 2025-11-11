import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Req, 
  UseGuards,
  BadRequestException
} from '@nestjs/common';
import { Request } from 'express';
import { SignaturesService, CreateSignatureDto } from './signatures.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('signatures')
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) {}

  // Create signature for a proposal
  @Post(':proposalId')
  async createSignature(
    @Param('proposalId') proposalId: string,
    @Body() createSignatureDto: CreateSignatureDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.signaturesService.create({
      proposalId,
      userId: createSignatureDto.userId || 'anonymous-user', // TODO: Get from JWT token
      signatureData: createSignatureDto.signatureData,
      ipAddress,
      userAgent,
    });
  }

  // Get signature for a proposal
  @Get('proposal/:proposalId')
  findByProposal(@Param('proposalId') proposalId: string) {
    return this.signaturesService.findByProposal(proposalId);
  }

  // Verify sign token and get proposal
  @Post('verify/:token')
  async verifyToken(@Param('token') token: string) {
    try {
      const proposal = await this.signaturesService.getProposalByToken(token);
      return {
        valid: true,
        proposal,
      };
    } catch (error) {
      return {
        valid: false,
        message: error.message,
      };
    }
  }

  // Get proposal by sign token (for public access)
  @Get('proposal-by-token/:token')
  async getProposalByToken(@Param('token') token: string) {
    return this.signaturesService.getProposalByToken(token);
  }

  // Generate sign link for proposal (protected route)
  @UseGuards(JwtAuthGuard)
  @Post('generate-link/:proposalId')
  async generateSignLink(@Param('proposalId') proposalId: string) {
    const token = await this.signaturesService.generateSignToken(proposalId);
    const signUrl = `${process.env.FRONTEND_URL}/proposal/${token}`;
    
    return {
      token,
      signUrl,
    };
  }

  // Upload signature image endpoint removed - signatures are now handled via base64 in create method

  // Audit logs endpoint removed - SignatureAudit table no longer exists

  // Get all signatures (protected route)
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.signaturesService.findAll();
  }

  // Get specific signature (protected route)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.signaturesService.findOne(id);
  }
}
