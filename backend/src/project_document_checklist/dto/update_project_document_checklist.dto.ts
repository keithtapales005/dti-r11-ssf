import { IsNotEmpty, IsString } from 'class-validator';

// The only thing that can be changed by hand: verifying a document (or taking the verification back).
export class UpdateProjectDocumentChecklistDto {
    @IsString()
    @IsNotEmpty()
    status!: string;
}
