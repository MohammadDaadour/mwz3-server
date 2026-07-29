import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(readonly configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_ID'),
      clientSecret: configService.get('GOOGLE_TOKEN'),
      callbackURL: `https://mwz3.com/redirect/google`,
      scope: ['profile', 'email'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;

    // Decode area from the state parameter round-tripped by Google
    const area = req.query?.state ?? null;

    const user = {
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
    };

    const payload = {
      user,
      accessToken,
      area,
    };

    done(null, payload);
  }
}
