import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { TicketsService } from './tickets.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { AssignTicketDto } from './dto/assign-ticket.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/roles.guard.js';
import { Roles } from '../common/roles.decorator.js';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post()
    @Roles('USER', 'MANAGER')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new ticket (USER, MANAGER)' })
    @ApiResponse({ status: 201, description: 'Ticket created' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    async create(@Body() createTicketDto: CreateTicketDto, @Request() req: any) {
        return this.ticketsService.create(createTicketDto, req.user.id);
    }

    @Get()
    @Roles('MANAGER', 'SUPPORT', 'USER')
    @ApiOperation({
        summary:
            'List tickets (MANAGER=all, SUPPORT=assigned, USER=own)',
    })
    @ApiResponse({ status: 200, description: 'List of tickets' })
    async findAll(@Request() req: any) {
        return this.ticketsService.findAll(req.user);
    }

    @Patch(':id/assign')
    @Roles('MANAGER', 'SUPPORT')
    @ApiOperation({ summary: 'Assign a ticket (MANAGER, SUPPORT)' })
    @ApiResponse({ status: 200, description: 'Ticket assigned' })
    @ApiResponse({ status: 400, description: 'Cannot assign to USER role' })
    @ApiResponse({ status: 404, description: 'Ticket or user not found' })
    async assign(
        @Param('id', ParseIntPipe) id: number,
        @Body() assignTicketDto: AssignTicketDto,
    ) {
        return this.ticketsService.assign(id, assignTicketDto);
    }

    @Patch(':id/status')
    @Roles('MANAGER', 'SUPPORT')
    @ApiOperation({ summary: 'Update ticket status (MANAGER, SUPPORT)' })
    @ApiResponse({ status: 200, description: 'Status updated' })
    @ApiResponse({ status: 400, description: 'Invalid status transition' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateStatusDto,
        @Request() req: any,
    ) {
        return this.ticketsService.updateStatus(id, updateStatusDto, req.user.id);
    }

    @Delete(':id')
    @Roles('MANAGER')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a ticket (MANAGER only)' })
    @ApiResponse({ status: 204, description: 'Ticket deleted' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.ticketsService.remove(id);
    }
}
