import { Global, Module } from '@nestjs/common';
import { IntegracionMeetService } from './integracion-meet.service';

@Global()
@Module({
  providers: [IntegracionMeetService],
  exports: [IntegracionMeetService],
})
export class IntegracionMeetModule {}
