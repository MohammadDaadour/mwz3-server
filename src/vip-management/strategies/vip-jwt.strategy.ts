import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy, AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { VipManagementService } from '../vip-management.service';

@Injectable()
export class VipJwtStrategy extends PassportStrategy(Strategy, 'vip-jwt') {
    constructor(
        configService: ConfigService,
        private readonly vipService: VipManagementService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    console.log('Cookies received:', req.cookies);           // ← add
                    console.log('access_token:', req.cookies?.access_token); // ← add
                    return req.cookies?.access_token;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_VIP_SECRET'),
        });
    }

    async validate(payload: any) {

        const user = await this.vipService.findOneParams({ id: payload.sub });

        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}

@Injectable()
export class VipJwtGuard extends AuthGuard('vip-jwt') { }
