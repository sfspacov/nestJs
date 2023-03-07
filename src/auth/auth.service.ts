import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { NotFoundException } from "@nestjs/common/exceptions";

@Injectable({})
export class AuthService {
    constructor(private prisma: PrismaService) { }

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

        return user;
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
            return user;
        } catch (error) {
            if (error.code == 'P2002') {
                throw new ConflictException("Email already registered")
            }
            throw error;
        }
    }
}