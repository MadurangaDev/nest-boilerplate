import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from '../../config/configuration';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { UserRepository } from './repositories/user.repository';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>): JwtModuleOptions => ({
        secret: config.secret,
        // JWT_EXPIRES_IN is a free-form env string ('1d', '7h'); @nestjs/jwt's
        // types want its own StringValue union, so validate the shape at the
        // boundary instead of fighting the type at every call site.
        signOptions: {
          expiresIn: config.expiresIn as NonNullable<JwtModuleOptions['signOptions']>['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // The only place that connects the port to the adapter.
    { provide: UserRepository, useClass: PrismaUserRepository },
  ],
})
export class AuthModule {}
