import { Injectable, UnauthorizedException, ConflictException, Controller, Logger, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext, Transport, ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from './jwt/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('INTEROP_SERVICE') private readonly interopTransferClient: ClientProxy
  ) {}

  async signup(signupDto: SignupDto): Promise<{ user: Partial<User>; access_token: string; message: string }> {
    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(signupDto.password);

    // Create the new user
    const user = await this.prisma.user.create({
      data: {
        id: signupDto.id,
        first_name: signupDto.first_name,
        last_name: signupDto.last_name,
        address: signupDto.address,
        city: signupDto.city,
        department: signupDto.department,
        email: signupDto.email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = this.jwtService.generateToken(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    await this.interopTransferClient.emit('user.created', user);

    return {
      user: userWithoutPassword,
      access_token: token,
      message: 'User registered successfully',
    };
  }

  async signin(signinDto: SigninDto): Promise<{ user: Partial<User>; access_token: string; message: string }> {
    // Find user by email
    const user = await this.prisma.user.findFirst({
      where: { email: signinDto.email },
    });

    // If user doesn't exist or password doesn't match
    if (!user || !(await this.validatePassword(signinDto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const token = this.jwtService.generateToken(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token: token,
      message: 'Login successful',
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
