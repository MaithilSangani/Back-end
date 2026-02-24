import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { Role } from '../entities/role.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
        const existingUser = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const role = await this.rolesRepository.findOne({
            where: { name: createUserDto.role },
        });
        if (!role) {
            throw new NotFoundException(`Role "${createUserDto.role}" not found`);
        }

        const user = this.usersRepository.create({
            name: createUserDto.name,
            email: createUserDto.email,
            password: createUserDto.password,
            role_id: role.id,
        });

        const savedUser = await this.usersRepository.save(user);

        // Re-fetch to get the role relation and exclude password
        const result = await this.usersRepository.findOne({
            where: { id: savedUser.id },
        });
        return result!;
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findById(id: number): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }
}
