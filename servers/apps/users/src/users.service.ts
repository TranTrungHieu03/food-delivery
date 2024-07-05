import {BadRequestException, Injectable} from '@nestjs/common';
import {JwtService, JwtVerifyOptions} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {ActivationDto, LoginDto, RegisterDto} from "./dto/user.dto";
import {Response} from "express";
import {PrismaService} from "../../../prisma/Prisma.service";
import bcrypt from "bcrypt"
import {EmailService} from "./email/email.service";
import {TokenSender} from "./utils/sendToken";

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
        private readonly emailService: EmailService
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
        const user = {
            name,
            email,
            password: hashPassword,
            phone_number
        }
        const activationToken = await this.createActivationToken(user)
        const activationCode = activationToken.activationCode
        const activation_token = activationToken.token

        await this.emailService.sendMail({
            email,
            subject: "Active your account",
            template: "./activation-email",
            name,
            activationCode

        })
        return {activation_token, response}

    }

    //activation user
    async activateUser(activationDto: ActivationDto, response: Response) {
        const {activationCode, activationToken} = activationDto;
        const newUser: { user: UserData, activationCode: string } = this.jwtService.verify(
            activationToken,
            {secret: this.configService.get<string>('ACTIVATION_SECRET')} as JwtVerifyOptions
        ) as { user: UserData, activationCode: string };
        if (newUser.activationCode !== activationCode) {
            throw new BadRequestException("Invalid activation token");
        }
        const {name, email, password, phone_number} = newUser.user;
        const existUser = await this.prisma.user.findUnique({
            where: {
                email
            }
        })
        if (existUser) {
            throw new BadRequestException("Email already exists");
        }
        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                password,
                phone_number
            }
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
    async login(LoginDto: LoginDto) {
        const {email, password} = LoginDto;

        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        });
        if (user && await this.comparePassword(password, user.password)) {
            const tokenSender = new TokenSender(this.configService, this.jwtService)
            return tokenSender.sendToken(user)
        } else {
            return {
                user: null,
                accessToken: null,
                refreshToken: null,
                error: {
                    message: "Invalid email or password"
                }
            }
        }
    }

    //compare pass
    async comparePassword(password: string, hashPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashPassword);
    }

    //get logged in user
    async getLoggedInUser(req: any) {
        const user = req.user;
        const refreshToken = req.refreshtoken;
        const accessToken = req.accesstoken;
        console.log(user, refreshToken, accessToken)
        return {user, refreshToken, accessToken}
    }
    
    //logout user
    async logout(req:any){
        req.user = null
        req.accessToken = null
        req.refreshToken = null
        return {message:"Logged out successfully"};
    }

    //get all user service
    async getUsers() {
        return this.prisma.user.findMany({})

    }


}
