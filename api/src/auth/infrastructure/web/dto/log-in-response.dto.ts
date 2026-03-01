import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogInResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jwt!: string;
}
