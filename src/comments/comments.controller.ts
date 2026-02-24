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
import { CommentsService } from './comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/roles.guard.js';
import { Roles } from '../common/roles.decorator.js';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post('tickets/:id/comments')
    @Roles('MANAGER', 'SUPPORT', 'USER')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary:
            'Add a comment to a ticket (MANAGER; SUPPORT if assigned; USER if owner)',
    })
    @ApiResponse({ status: 201, description: 'Comment created' })
    @ApiResponse({ status: 403, description: 'No access to this ticket' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    async create(
        @Param('id', ParseIntPipe) ticketId: number,
        @Body() createCommentDto: CreateCommentDto,
        @Request() req: any,
    ) {
        return this.commentsService.create(ticketId, createCommentDto, req.user);
    }

    @Get('tickets/:id/comments')
    @Roles('MANAGER', 'SUPPORT', 'USER')
    @ApiOperation({
        summary:
            'Get comments for a ticket (MANAGER; SUPPORT if assigned; USER if owner)',
    })
    @ApiResponse({ status: 200, description: 'List of comments' })
    @ApiResponse({ status: 403, description: 'No access to this ticket' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    async findAll(
        @Param('id', ParseIntPipe) ticketId: number,
        @Request() req: any,
    ) {
        return this.commentsService.findAllByTicket(ticketId, req.user);
    }

    @Patch('comments/:id')
    @Roles('MANAGER', 'SUPPORT', 'USER')
    @ApiOperation({ summary: 'Edit a comment (MANAGER or comment author)' })
    @ApiResponse({ status: 200, description: 'Comment updated' })
    @ApiResponse({ status: 403, description: 'Not your comment' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    async update(
        @Param('id', ParseIntPipe) commentId: number,
        @Body() updateCommentDto: UpdateCommentDto,
        @Request() req: any,
    ) {
        return this.commentsService.update(commentId, updateCommentDto, req.user);
    }

    @Delete('comments/:id')
    @Roles('MANAGER', 'SUPPORT', 'USER')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a comment (MANAGER or comment author)' })
    @ApiResponse({ status: 204, description: 'Comment deleted' })
    @ApiResponse({ status: 403, description: 'Not your comment' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    async remove(
        @Param('id', ParseIntPipe) commentId: number,
        @Request() req: any,
    ) {
        return this.commentsService.remove(commentId, req.user);
    }
}
