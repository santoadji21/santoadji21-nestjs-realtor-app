import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [UserController, AuthController],
  providers: [UserService],
  imports: [AuthModule, PrismaModule],
})
export class UserModule {}
