import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { SwitchRoleDto } from './dto/switch-role.dto';
// SwitchRoleDto kita simpan dulu karena butuh setup keamanan tambahan

@Controller('auth') // Prefix routing: semua endpoint di sini akan berawalan /auth
export class AuthController {
  // Dependency Injection: Menyambungkan Controller dengan Service
  constructor(private readonly authService: AuthService) {}

  // Endpoint: POST /auth/register
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    // Data JSON otomatis divalidasi oleh RegisterDto di sini
    // Kalau lolos, langsung lempar ke otak (Service)
    return this.authService.register(registerDto);
  }

  // Endpoint: POST /auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK) // Ubah status code default NestJS dari 201 (Created) jadi 200 (OK) untuk login
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Endpoint: POST /auth/switch-role
  // (Akan kita kerjakan di langkah selanjutnya setelah mengaktifkan JWT Guard)
  // Endpoint: POST /auth/switch-role
  @Post('switch-role')
  @UseGuards(AuthGuard('jwt')) // <--- INILAH SATPAMNYA!
  @HttpCode(HttpStatus.OK)
  async switchRole(@Request() req, @Body() switchRoleDto: SwitchRoleDto) {
    // req.user berisi payload JWT yang di-return dari jwt.strategy.ts tadi
    const userId = req.user.sub; 
    
    // Lempar ke service
    return this.authService.switchRole(userId, switchRoleDto);
  }
}