import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { TicketsModule } from './tickets/tickets.module.js';
import { CommentsModule } from './comments/comments.module.js';

// Entities
import { Role } from './entities/role.entity.js';
import { User } from './entities/user.entity.js';
import { Ticket } from './entities/ticket.entity.js';
import { TicketComment } from './entities/ticket-comment.entity.js';
import { TicketStatusLog } from './entities/ticket-status-log.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'support_tickets'),
        entities: [Role, User, Ticket, TicketComment, TicketStatusLog],
        synchronize: true, // Auto-create tables (dev only)
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    TicketsModule,
    CommentsModule,
  ],
})
export class AppModule { }
