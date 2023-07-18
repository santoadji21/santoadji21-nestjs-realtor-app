import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateProductKeyDto, SignInDto, SignUpDto } from './dto/auth.dto';
import { UserType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  private generateJwtToken(userId: number) {
    return this.jwtService.sign({ sub: userId });
  }

  async signUp(signUpDto: SignUpDto, userType: UserType) {
    const userExists = await this.prismaService.user.findUnique({
      where: { email: signUpDto.email },
    });
    if (userExists) {
      throw new HttpException('User already exists', 409);
    }

    const hashedPassword = bcrypt.hashSync(signUpDto.password, 10);

    delete signUpDto.productKey;
    const createdUser = await this.prismaService.user.create({
      data: {
        ...signUpDto,
        password: hashedPassword,
        user_type: userType,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        user_type: true,
      },
    });

    const token = await this.generateJwtToken(createdUser.id);

    return {
      token,
      user: createdUser,
    };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: signInDto.email },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const isValidPassword = bcrypt.compareSync(
      signInDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new HttpException('Invalid credentials', 401);
    }

    delete user.password;
    const token = await this.generateJwtToken(user.id);

    return {
      token,
      user,
    };
  }

  generateProductKey(generateProductKey: GenerateProductKeyDto) {
    const productKey = `${generateProductKey.email}-${generateProductKey.userType}-${process.env.PRODUCT_KEY_SECRET}}`;
    return bcrypt.hash(productKey, 10);
  }

  validateProductKey(productKey: string, payloadKey: string) {
    return bcrypt.compare(productKey, payloadKey);
  }
}
