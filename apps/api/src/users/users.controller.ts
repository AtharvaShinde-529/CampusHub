import { Controller, Get, Put, Post, Body, UseGuards, Req, Patch, Param, NotFoundException, UseInterceptors, UploadedFile, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from '../audit/audit.service';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { studentProfile: true, facultyProfile: true }
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/public')
  async getPublicProfile(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true, facultyProfile: true, memberships: { include: { organization: true } } }
    });
    if (!user) throw new NotFoundException('User not found');
    return { id: user.id, email: user.email, globalRole: user.globalRole, avatarUrl: user.avatarUrl, studentProfile: user.studentProfile, facultyProfile: user.facultyProfile, memberships: user.memberships };
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req: any, @Body() body: any) {
    if (req.user.role === 'STUDENT') {
      return this.prisma.studentProfile.update({
        where: { userId: req.user.userId },
        data: { bio: body.bio, skills: body.skills, projects: body.projects, interests: body.interests }
      });
    } else if (req.user.role === 'FACULTY') {
      return this.prisma.facultyProfile.update({ where: { userId: req.user.userId }, data: { bio: body.bio } });
    }
    return { message: 'Admin profile requires no bio updates.' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('password')
  async changePassword(@Req() req: any, @Body() body: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const isValid = await argon2.verify(user.passwordHash, body.oldPassword);
    if (!isValid) throw new UnauthorizedException('Incorrect current password');
    
    const newHash = await argon2.hash(body.newPassword);
    await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
    return { message: 'Password updated successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const avatarUrl = `http://localhost:3000/uploads/${file.filename}`;
    await this.prisma.user.update({ where: { id: req.user.userId }, data: { avatarUrl } });
    return { avatarUrl };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('all')
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, globalRole: true, status: true, avatarUrl: true, createdAt: true, studentProfile: { select: { firstName: true, lastName: true } }, facultyProfile: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  async updateUserStatus(@Param('id') id: string, @Body('status') status: 'ACTIVE' | 'SUSPENDED', @Req() req: any) {
    const res = await this.prisma.user.update({ where: { id }, data: { status } });
    await this.audit.logAction(req.user.userId, 'CHANGE_USER_STATUS', id, `Changed status of ${res.email} to ${status}`);
    return res;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('faculty')
  async getFaculty() {
    return this.prisma.user.findMany({ where: { globalRole: 'FACULTY' }, include: { facultyProfile: true } });
  }
}
