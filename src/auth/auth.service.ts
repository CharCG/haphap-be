import { 
  BadRequestException, 
  Injectable, 
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service'; // Sesuaikan path jika berbeda
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';

@Injectable()
export class AuthService {
  // 1. Dependency Injection: Memanggil alat yang dibutuhkan
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ===========================================================================
  // REGISTER LOGIC
  // ===========================================================================
  async register(registerDto: RegisterDto) {
    const { name, email, password, phone } = registerDto;

    // 2. Cek apakah email sudah dipakai
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar. Silakan gunakan email lain.');
    }

    // 3. Hash Password (Enkripsi 10 putaran)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Simpan ke Database
    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
      },
      select: {
        // SELECT ini penting agar password hasil hash TIDAK ikut terkirim ke frontend
        id: true,
        name: true,
        email: true,
        activeRole: true,
        isMerchant: true,
      }
    });

    return newUser;
  }

  // ===========================================================================
  // LOGIN LOGIC
  // ===========================================================================
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Cari user berdasarkan email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        merchant: true, // Ambil data merchant sekalian (jika ada) untuk token
      }
    });

    // 2. Jika user tidak ada, lemparkan error 401 Unauthorized
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // 3. Cocokkan password dari frontend dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // 4. Buat Payload untuk dimasukkan ke dalam JWT Token
    // Jangan pernah menaruh data sensitif (seperti password) di dalam payload JWT!
    const payload = {
      sub: user.id, // standard JWT untuk User ID
      email: user.email,
      role: user.activeRole,
      isMerchant: user.isMerchant,
      merchantId: user.merchant?.id || null, // Diambil jika dia punya toko
    };

    // 5. Generate Token
    const accessToken = await this.jwtService.signAsync(payload);

    // 6. Buang password sebelum dikirim ke frontend
    const { password: _, merchant, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  // ===========================================================================
  // SWITCH ROLE LOGIC
  // ===========================================================================
  async switchRole(userId: string, dto: SwitchRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    // Validasi: Cegah customer ganti ke merchant kalau belum di-approve admin
    if (dto.targetRole === 'MERCHANT' && !user.isMerchant) {
      throw new BadRequestException('Akun belum terdaftar/disetujui sebagai Merchant');
    }

    // Update activeRole di database
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { activeRole: dto.targetRole },
      include: { merchant: true }
    });

    // Terbitkan JWT token BARU dengan role yang sudah diperbarui
    const payload = {
      sub: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.activeRole, // Ini sekarang pakai targetRole yang baru
      isMerchant: updatedUser.isMerchant,
      merchantId: updatedUser.merchant?.id || null,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      activeRole: updatedUser.activeRole,
    };
  }
}