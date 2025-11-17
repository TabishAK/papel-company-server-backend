import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { AuthenticatedGuard } from 'src/guards/auth.guard';

@Controller('/company')
@ApiTags('Company')
@ApiBearerAuth()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('/company-theme')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Get company theme' })
  getCompanyTheme() {
    return this.companyService.getCompanyTheme();
  }
}
