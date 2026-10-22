import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Email already exists');

    const hash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        globalRole: dto.role,
        status: 'ACTIVE',
        ...(dto.role === 'STUDENT' ? {
          studentProfile: {
            create: {
              firstName: dto.firstName,
              lastName: dto.lastName,
              rollNumber: dto.identifier,
              department: 'General',
              interests: [],
              skills: []
            }
          }
        } : dto.role === 'FACULTY' ? {
          facultyProfile: {
            create: {
              firstName: dto.firstName,
              lastName: dto.lastName,
              designation: dto.identifier,
              department: 'General'
            }
          }
        } : {})
      },
      include: { studentProfile: true, facultyProfile: true }
    });

    return {
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, role: user.globalRole }
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.globalRole };
    return {
      message: 'Login successful',
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.globalRole }
    };
  }
}
