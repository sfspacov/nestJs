import { ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { User, Bookmark } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Injectable({})
export class AuthService {
    constructor(private prisma: PrismaService) { }
    signin() {
        //this.prisma.user.findFirst()
        return { msg: "Im signin" }
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
            if (error.code == 'P2002'){
                throw new ConflictException("Email already registered")
            }
            throw error;
        }
    }
}