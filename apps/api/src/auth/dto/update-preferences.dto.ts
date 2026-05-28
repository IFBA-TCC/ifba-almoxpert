import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  receiveEmails: boolean;
}
