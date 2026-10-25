import { IsString, Matches, MaxLength } from 'class-validator';

export class RejectUserDto {
  @IsString()
  @Matches(/\S/, { message: 'Reason for rejection is required' })
  @MaxLength(500)
  reason: string;
}