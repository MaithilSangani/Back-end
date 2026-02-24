import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Role } from './entities/role.entity.js';
import { User } from './entities/user.entity.js';
import { Ticket } from './entities/ticket.entity.js';
import { TicketComment } from './entities/ticket-comment.entity.js';
import { TicketStatusLog } from './entities/ticket-status-log.entity.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'support_tickets',
        entities: [Role, User, Ticket, TicketComment, TicketStatusLog],
        synchronize: true,
    });

    await dataSource.initialize();
    console.log('Database connected for seeding...');

    const roleRepository = dataSource.getRepository(Role);
    const userRepository = dataSource.getRepository(User);

    // Seed roles
    const roleNames = ['MANAGER', 'SUPPORT', 'USER'];
    for (const name of roleNames) {
        const exists = await roleRepository.findOne({ where: { name } });
        if (!exists) {
            await roleRepository.save(roleRepository.create({ name }));
            console.log(`Role "${name}" created.`);
        } else {
            console.log(`Role "${name}" already exists.`);
        }
    }

    // Seed default MANAGER user
    const managerRole = await roleRepository.findOne({
        where: { name: 'MANAGER' },
    });
    if (!managerRole) {
        throw new Error('MANAGER role not found after seeding!');
    }

    const existingAdmin = await userRepository.findOne({
        where: { email: 'admin@example.com' },
    });
    if (!existingAdmin) {
        const plainPassword = 'admin123';
        await userRepository.save(
            userRepository.create({
                name: 'Admin',
                email: 'admin@example.com',
                password: plainPassword,
                role_id: managerRole.id,
            }),
        );
        console.log('Default MANAGER user created (admin@example.com / admin123)');
    } else {
        console.log('Default MANAGER user already exists.');
    }

    await dataSource.destroy();
    console.log('Seeding complete!');
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
