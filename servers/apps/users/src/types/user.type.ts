import {Field, ObjectType} from "@nestjs/graphql";
import {User} from "../entities/user.entity";

@ObjectType()
export class ErrorType {
    @Field()
    message: string;

    @Field({nullable: true})
    code?: string;


}

@ObjectType()
export class RegisterRepose {
    @Field(() => User, {nullable: true})
    user?: User | any;

    @Field(() => ErrorType, {nullable: true})
    error?: ErrorType;
}

@ObjectType()
export class LoginRepose {
    @Field(() => User, {nullable: true})
    user?: User | any;

    @Field(() => ErrorType, {nullable: true})
    error?: ErrorType;
}