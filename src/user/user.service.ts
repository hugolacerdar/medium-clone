import 'dotenv/config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/createUser.dto';
import { UserEntity } from './user.entity';
import { sign } from 'jsonwebtoken';
import 'dotenv';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginDTO } from './dto/login.dto';
import { compare } from 'bcrypt';
import { UpdateUserDTO } from './dto/updateUser.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDTO: CreateUserDTO): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      email: createUserDTO.email,
    });
    const userByUsername = await this.userRepository.findOne({
      username: createUserDTO.username,
    });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        'Email or username are taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new UserEntity();

    Object.assign(newUser, createUserDTO);

    return await this.userRepository.save(newUser);
  }

  async login({ email, password }: LoginDTO): Promise<UserEntity> {
    const incorrectCredentialsMessage = `Incorrect email or password. Please check your credentials.`;

    const user = await this.userRepository.findOne(
      {
        email,
      },
      { select: ['id', 'username', 'email', 'image', 'bio', 'password'] },
    );

    if (!user) {
      throw new HttpException(
        incorrectCredentialsMessage,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new HttpException(
        incorrectCredentialsMessage,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    delete user.password;
    return user;
  }

  async update(
    user: UserEntity,
    updateUserDTO: UpdateUserDTO,
  ): Promise<UserEntity> {
    return this.userRepository.save({ ...user, ...updateUserDTO });
  }

  async findById(id: string): Promise<UserEntity> {
    return this.userRepository.findOne(id);
  }

  generateJWT(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.username,
      },
      process.env.JWT_SECRET,
    );
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJWT(user),
      },
    };
  }
}
