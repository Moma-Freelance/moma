import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NombaHttpService } from './nomba-http.service';

@Module({
  imports: [HttpModule],
  providers: [NombaHttpService],
  exports: [NombaHttpService],
})
export class NombaModule {}
