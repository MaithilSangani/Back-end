import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { email },
            select: ['id', 'name', 'email', 'password', 'role_id'],
            relations: ['role'],
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (password !== user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    async login(user: User) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role.name,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
            },
        };
    }
}
