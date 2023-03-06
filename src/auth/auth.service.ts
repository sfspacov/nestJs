import { Injectable } from "@nestjs/common";
import { User, Bookmark } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";

@Injectable({})
export class AuthService
{
    constructor(private prisma: PrismaService){}
    signin(){
        //this.prisma.user.findFirst()
        return {msg: "Im signin"}
    }
    signup(body){
        //this.prisma.user.create()
        return {msg: "I'm signup"}
    }
}