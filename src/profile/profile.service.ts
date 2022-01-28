import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileType } from './types/profile.type';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async find(
    currentUserId: string,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      username: profileUsername,
    });
    console.log(user);

    if (!user) {
      throw new HttpException('Profile does not exist.', HttpStatus.NOT_FOUND);
    }

    const profile = { ...user, following: false } as ProfileType;
    return profile;
  }

  buildProfileResponse(profile: ProfileType) {
    delete profile.email;
    return { profile };
  }
}
