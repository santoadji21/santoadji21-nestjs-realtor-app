import {
  Body,
  Controller,
  Param,
  ParseEnumPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GenerateProductKeyDto, SignInDto, SignUpDto } from './dto/auth.dto';
import { UserType } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup/:userType')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (userType !== UserType.BUYER) {
      if (!signUpDto.productKey) {
        throw new UnauthorizedException(
          'Product key is required for this user type',
        );
      }
      const payloadProductKey: GenerateProductKeyDto = {
        email: signUpDto.email,
        userType,
      };
      const productKey = await this.authService.generateProductKey(
        payloadProductKey,
      );
      console.log({ productKey });
      const isValidProductKey = this.authService.validateProductKey(
        productKey,
        signUpDto.productKey,
      );
      if (!isValidProductKey) {
        throw new UnauthorizedException('Invalid product key');
      }
    }
    return this.authService.signUp(signUpDto, userType);
  }

  @Post('/signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('/generate-product-key')
  generateProductKey(@Body() generateProductKetDto: GenerateProductKeyDto) {
    return this.authService.generateProductKey(generateProductKetDto);
  }
}
