import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { NotFoundException } from "@nestjs/common/exceptions";
import { JwtService } from "@nestjs/jwt/dist";
import { ConfigService } from "@nestjs/config/dist/config.service";

@Injectable({})
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService) { }

    async signin(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });

        if (!user)
            throw new NotFoundException('Credentials incorrect');

        const pwMatches = await argon.verify(user.hash, dto.password);
        if (!pwMatches)
            throw new NotFoundException('Credentials incorrect');

        delete user.hash;

        return this.signToken(user.id, user.email);
    }

    async signToken(userId: number, email: string): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email
        };

        const secret = this.config.get("JWT_SECRET");
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret
        });

        return { 
            access_token: token 
        };
    }

    async signup(dto: AuthDto) {
        const hash = await argon.hash(dto.password);
        try {
            const user = await this.prisma.user.create(
                {
                    data:
                    {
                        email: dto.email,
                        hash
                    },
                    select:
                    {
                        id: true,
                        createdAt: true
                    }
                })
            return this.signToken(user.id, dto.email);
        } catch (error) {
            if (error.code == 'P2002') {
                throw new ConflictException("Email already registered")
            }
            throw error;
        }
    }
}