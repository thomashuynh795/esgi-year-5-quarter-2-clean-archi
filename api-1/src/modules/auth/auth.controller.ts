
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @ApiOperation({ summary: 'Login' })
    @Post('login')
    async login(@Body() req) {
        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @ApiOperation({ summary: 'Register' })
    @Post('register')
    async register(@Body() req) {
        return this.authService.register(req);
    }
}
