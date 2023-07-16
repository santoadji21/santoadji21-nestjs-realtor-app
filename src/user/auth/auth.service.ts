import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async signUp(signUpDto: SignUpDto) {
    const userExists = await this.prismaService.user.findUnique({
      where: { email: signUpDto.email },
    });
    if (userExists) {
      throw new Error('User already exists');
    }

    const hashedPassword = bcrypt.hashSync(signUpDto.password, 10);

    const saveUser = await this.prismaService.user.create({
      data: {
        ...signUpDto,
        password: hashedPassword,
        user_type: 'BUYER',
      },
    });

    const { password, ...user } = saveUser;

    const token = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return {
      token,
      user,
    };
  }
}
