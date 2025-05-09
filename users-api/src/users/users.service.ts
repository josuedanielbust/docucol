import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MessagingService } from '../messaging/messaging.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.create({
      data: createUserDto,
    });
    
    // Publish user created event
    await this.messagingService.publishToExchange('user.created', {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: new Date(),
    });
    
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if password is included in the update payload
    if (updateUserDto.password) {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // Update the user with potentially modified DTO
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    
    // Publish user updated event
    await this.messagingService.publishToExchange('user.updated', {
      id: updatedUser.id,
      email: updateUserDto.email,
      firstName: updateUserDto.first_name,
      lastName: updateUserDto.last_name,
      updatedAt: new Date(),
    });
    
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });
    
    // Publish user deleted event
    await this.messagingService.publishToExchange('user.deleted', {
      id: deletedUser.id,
      deletedAt: new Date(),
    });
    
    return deletedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email },
    });
  }
}
