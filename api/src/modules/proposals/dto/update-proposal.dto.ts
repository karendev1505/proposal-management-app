import { CreateProposalDto } from './create-proposal.dto';

export class UpdateProposalDto {
  title?: string;
  content?: string;
  clientEmail?: string;
  clientName?: string;
  templateId?: string;
  status?: string;
}
