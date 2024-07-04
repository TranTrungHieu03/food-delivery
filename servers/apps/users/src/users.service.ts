import {BadRequestException, Injectable} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {LoginDto, RegisterDto} from "./dto/user.dto";
import {Response} from "express";
import {PrismaService} from "../../../prisma/Prisma.service";
import bcrypt from "bcrypt"
import {EmailService} from "./email/email.service";

interface UserData {
    name: string,
    email: string,
    password: string,
    phone_number: number
}

@Injectable()
export class UsersService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly emailService : EmailService
    ) {
    }

    //register service
    async register(registerDto: RegisterDto, response: Response) {
        const {name, email, password, phone_number} = registerDto;
        const isEmailExist = await this.prisma.user.findUnique({
            where: {
                email,
            }
        })
        if (isEmailExist) {
            throw new BadRequestException("Email already exists");
        }
        const isPhoneNumberExist = await this.prisma.user.findUnique({
            where: {
                phone_number,
            }
        })
        if (isPhoneNumberExist) {
            throw new BadRequestException("Phone number already exists");
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
                phone_number
            }
        }) 
        const activationToken = await this.createActivationToken(user)
        const activationCode = activationToken.activationCode

        await this.emailService.sendMail({
            email, 
            subject:"Active your account",
            template: "./activation-email",
            name,
            activationCode
            
        })
        return {user, response}

    }

    //create activation token
    async createActivationToken(user: UserData) {
        const activationCode = Math.floor(1000 + Math.random() * 9000).toString()
        const token = this.jwtService.sign({
                user, activationCode,
            },
            {
                secret: this.configService.get<string>("ACTIVATION_SECRET"),
                expiresIn: "5m"
            })
        return {token, activationCode}
    }

    //login service
    async login(LoginDto: LoginDto, response: Response) {
        const {email, password} = LoginDto;

        const user = {
            email,
            password

        }
        return user
    }


    //get all user service
    async getUsers() {
        return this.prisma.user.findMany({})

    }
}
