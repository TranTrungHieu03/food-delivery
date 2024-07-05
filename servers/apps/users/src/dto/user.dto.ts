import {Field, InputType} from "@nestjs/graphql";
import {IsEmail, IsNotEmpty, IsString, MinLength} from "class-validator";

@InputType()
export class RegisterDto {
    @Field()
    @IsNotEmpty({message: "Name is required"})
    @IsString({message: "Name must to be one string"})
    name: string;

    @Field()
    @IsNotEmpty({message: "Password is required"})
    @MinLength(8, {message: "Password must be at least 8 characters"})
    password: string;

    @Field()
    @IsNotEmpty({message: "Email is required"})
    @IsEmail({}, {message: "Email is invalid"})
    email: string;

    @Field()
    @IsNotEmpty({message: "Phone number is required"})
    phone_number: number;

}
@InputType()
export class ActivationDto {
    @Field()
    @IsNotEmpty({message: "Activation token is required"})
    activationToken: string;

    @Field()
    @IsNotEmpty({message: "Activation code is required"})
    activationCode: string;
}
@InputType()
export class LoginDto {

    @Field()
    @IsNotEmpty({message: "Password is required"})
    @MinLength(8, {message: "Password must be at least 8 characters"})
    password: string;

    @Field()
    @IsNotEmpty({message: "Email is required"})
    @IsEmail({}, {message: "Email is invalid"})
    email: string;

}