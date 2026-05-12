import { Controller, Get, Header, Res, Post, Body, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackPageViewDto } from './dto/analytics.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Response, Request } from "express";

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Post("track")
  @Public()
  async trackPageView(
    @Body() trackDto: TrackPageViewDto,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<void> {
    // const clientSessionId = req.cookies["_sid"];
    const { sessionId, isNew } = await this.analyticsService.trackPageView(
      trackDto,
      // sessionId: clientSessionId,
    );

    res.json({ sessionId });
  }

  @Get("track-ip")
  @Public()
  track(@Req() req: Request) {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress;
    return { ip };
  }

  @Get('visitors')
  @Public()
  getVisitorsCount() {
    return this.analyticsService.getVisitorsCount();
  }

  @Get('views/period')
  @Public()
  getViewsByPeriod() {
    return this.analyticsService.getViewsByPeriod();
  }

  @Get('unique-visitors')
  @Public()
  getUniqueVisitors() {
    return this.analyticsService.getUniqueVisitors();
  }

  @Get('unique-visitors/period')
  @Public()
  getUniqueVisitorsByPeriod() {
    return this.analyticsService.getUniqueVisitorsByPeriod();
  }

  @Get('page-views')
  @Public()
  getPageViews() {
    return this.analyticsService.getPageViews();
  }

  @Get('devices')
  @Public()
  getDevices() {
    return this.analyticsService.getDevices();
  }

  @Get('top-pages')
  @Public()
  getTopPages() {
    return this.analyticsService.getTopPages();
  }

  // @Get('bounce-rate')
  // @Public()
  // getBounceRate() {
  //   return this.analyticsService.getBounceRate();
  // }
}
