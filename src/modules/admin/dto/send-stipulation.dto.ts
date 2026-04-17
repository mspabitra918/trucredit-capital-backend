import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class SendStipulationDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  missingItems: string[];
  // e.g. ["Missing Month 3 Bank Statement", "Blurry ID — re-upload needed", "Tax Return 2024"]
}
