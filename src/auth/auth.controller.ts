import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import { HttpCode } from "@nestjs/common/decorators/http/http-code.decorator";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }
    
    @Post('signup')
    async signup(@Body() dto: AuthDto){
        console.log(dto)
        return await this.authService.signup(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    async signin(@Body() dto: AuthDto){
        return await this.authService.signin(dto);
    }
}