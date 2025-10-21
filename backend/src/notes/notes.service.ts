import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { Note } from './note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    @Inject('REDIS_CLIENT')
    private redisClient: Redis,
  ) {}

  async findAll(userId: string, tags?: string[]): Promise<Note[]> {
    // Generate cache key
    const cacheKey = tags && tags.length > 0
      ? `notes:user:${userId}:tags:${tags.sort().join(',')}`
      : `notes:user:${userId}:all`;

    // Try to get from cache
    const cached = await this.redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Query database
    const queryBuilder = this.notesRepository
      .createQueryBuilder('note')
      .where('note.userId = :userId', { userId })
      .orderBy('note.updatedAt', 'DESC');

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('note.tags && :tags', { tags });
    }

    const notes = await queryBuilder.getMany();

    // Cache results for 5 minutes
    await this.redisClient.setex(cacheKey, 300, JSON.stringify(notes));

    return notes;
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.notesRepository.findOne({ where: { id } });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('You do not have access to this note');
    }

    return note;
  }

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    const note = this.notesRepository.create({
      ...createNoteDto,
      userId,
      tags: createNoteDto.tags || [],
    });

    const savedNote = await this.notesRepository.save(note);

    // Invalidate cache
    await this.invalidateCache(userId);

    return savedNote;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userId: string): Promise<Note> {
    const note = await this.findOne(id, userId);

    Object.assign(note, updateNoteDto);
    const updatedNote = await this.notesRepository.save(note);

    // Invalidate cache
    await this.invalidateCache(userId);

    return updatedNote;
  }

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.findOne(id, userId);
    await this.notesRepository.remove(note);

    // Invalidate cache
    await this.invalidateCache(userId);
  }

  private async invalidateCache(userId: string): Promise<void> {
    const pattern = `notes:user:${userId}:*`;
    const keys = await this.redisClient.keys(pattern);

    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }
}
