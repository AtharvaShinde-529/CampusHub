import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { studentProfile: true, facultyProfile: true }
    });
    if (!user) return null;
    const { passwordHash, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req: any, @Body() body: any) {
    if (req.user.role === 'STUDENT') {
      return this.prisma.studentProfile.update({
        where: { userId: req.user.userId },
        data: { bio: body.bio, skills: body.skills, projects: body.projects, interests: body.interests }
      });
    } else {
      return this.prisma.facultyProfile.update({
        where: { userId: req.user.userId },
        data: { bio: body.bio }
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('faculty')
  async getFaculty() {
    return this.prisma.user.findMany({
      where: { globalRole: 'FACULTY' },
      include: { facultyProfile: true }
    });
  }
}
