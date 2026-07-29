import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(readonly configService: ConfigService) {
    super({
      // clientID: configService.get('FB_ID'),
      // clientSecret: configService.get('FB_TOKEN'),
      // callbackURL: 'https://mwz3.com/redirect/facebook',
      clientID: 'placeholder',
      clientSecret: 'placeholder',
      callbackURL: 'https://example.com/placeholder',
      scope: 'email',
      profileFields: ['emails', 'name'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails } = profile;

    // Decode area from the state parameter round-tripped by Facebook
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
