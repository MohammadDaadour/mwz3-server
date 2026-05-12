import { IsNotEmpty } from "class-validator";

export class CreateRequestDto {
    @IsNotEmpty()
    userId: number;

    @IsNotEmpty()
    amount: number;
}