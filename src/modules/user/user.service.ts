import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { SerializeHttpResponse } from 'src/utils/serializer.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { MediaService } from '../media/media.service';
import { SyncEmployeeDto } from './dto/sync-user.dto';
import { DB_NAME } from 'src/constants/db.constant';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, DB_NAME)
    private readonly userRepository: Repository<User>,
    private readonly mediaService: MediaService,
  ) {}

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return SerializeHttpResponse(false, HttpStatus.NOT_FOUND, 'User not found');
    }

    const updateData: Partial<User> = {};

    if (updateUserDto.fullName !== undefined) {
      updateData.fullName = updateUserDto.fullName;
    }

    if (updateUserDto.address !== undefined) {
      updateData.address = updateUserDto.address;
    }

    if (updateUserDto.contactNumber !== undefined) {
      updateData.contactNumber = updateUserDto.contactNumber;
    }

    await this.userRepository.update(userId, updateData);

    const updatedUser = await this.userRepository.findOne({ where: { id: userId } });

    return SerializeHttpResponse(updatedUser, HttpStatus.OK, 'User updated successfully');
  }

  async updateUserProfilePicture(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return SerializeHttpResponse(false, HttpStatus.NOT_FOUND, 'User not found');
    }

    const uploadResult = await this.mediaService.uploadFile(file, 'profile-pictures');

    await this.userRepository.update(userId, {
      profilePicture: uploadResult.url,
    });

    const updatedUser = await this.userRepository.findOne({ where: { id: userId } });

    return SerializeHttpResponse(
      { profilePicture: updatedUser?.profilePicture },
      HttpStatus.OK,
      'Profile picture updated successfully',
    );
  }

  async syncEmployee(syncEmployeeDto: SyncEmployeeDto) {
    console.log('syncEmployeeDto', syncEmployeeDto);
    const user = await this.userRepository.findOne({ where: { id: syncEmployeeDto.id } });

    if (!user) {
      return SerializeHttpResponse(false, HttpStatus.NOT_FOUND, 'User not found');
    }

    await this.userRepository.update(user.id, {
      address: syncEmployeeDto.address,
      isActive: syncEmployeeDto.isActive,
      fullName: syncEmployeeDto.fullName,
      companyId: syncEmployeeDto.companyId,
      sectionId: syncEmployeeDto.sectionId,
      departmentId: syncEmployeeDto.departmentId,
      securityLevel: syncEmployeeDto.securityLevel,
      contactNumber: syncEmployeeDto.contactNumber,
    });

    const updatedUser = await this.userRepository.findOne({ where: { id: user.id } });

    return SerializeHttpResponse(updatedUser, HttpStatus.OK, 'Employee synced successfully');
  }
}
