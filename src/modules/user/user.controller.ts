import {
  Req,
  Post,
  Body,
  Patch,
  UseGuards,
  Controller,
  UploadedFile,
  ParseFilePipe,
  UseInterceptors,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { TenantGuard } from 'src/guards/tenant.guard';
import { SyncEmployeeDto } from './dto/sync-user.dto';
import { AuthenticatedRequest } from 'src/types/request';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticatedGuard } from 'src/guards/auth.guard';
import { FileUpload } from 'src/decorators/file-upload.decorator';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch()
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Update user information' })
  async updateUser(@Req() req: AuthenticatedRequest, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(req.user.id, updateUserDto);
  }

  @ApiBearerAuth()
  @Patch('/profile-picture')
  @UseGuards(AuthenticatedGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update user profile picture' })
  @ApiConsumes('multipart/form-data')
  @FileUpload()
  async updateUserProfilePicture(
    @Req() req: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })] }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.updateUserProfilePicture(req.user.id, file);
  }

  // this will call by tenant to sync employee data from tenant to system
  @Post('/sync-employee')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Sync employee data from tenant' })
  async syncEmployee(@Body() syncEmployeeDto: SyncEmployeeDto) {
    return this.userService.syncEmployee(syncEmployeeDto);
  }
}
