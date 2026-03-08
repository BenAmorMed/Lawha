import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Design } from './entities/design.entity';
import { CreateDesignDto, UpdateDesignDto, DesignResponseDto } from './designs.dto';

@Injectable()
export class DesignsService {
  constructor(
    @InjectRepository(Design)
    private readonly designRepository: Repository<Design>,
  ) {}

  async createDesign(createDesignDto: CreateDesignDto): Promise<DesignResponseDto> {
    const design = this.designRepository.create(createDesignDto);
    const savedDesign = await this.designRepository.save(design);
    return this.mapToDto(savedDesign);
  }

  async getAllDesigns(userId: string): Promise<DesignResponseDto[]> {
    const designs = await this.designRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return designs.map((design) => this.mapToDto(design));
  }

  async getDesignById(id: string): Promise<DesignResponseDto> {
    const design = await this.designRepository.findOne({ where: { id } });
    if (!design) {
      throw new NotFoundException(`Design with ID ${id} not found`);
    }
    return this.mapToDto(design);
  }

  async updateDesign(id: string, updateDesignDto: UpdateDesignDto): Promise<DesignResponseDto> {
    const design = await this.designRepository.preload({
      id,
      ...updateDesignDto,
    });
    if (!design) {
      throw new NotFoundException(`Design with ID ${id} not found`);
    }
    const updatedDesign = await this.designRepository.save(design);
    return this.mapToDto(updatedDesign);
  }

  async deleteDesign(id: string): Promise<void> {
    const result = await this.designRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Design with ID ${id} not found`);
    }
  }

  private mapToDto(design: Design): DesignResponseDto {
    return {
      id: design.id,
      userId: design.userId,
      name: design.name,
      photos: design.photos,
      frameConfig: design.frameConfig,
      textCustomization: design.textCustomization,
      createdAt: design.createdAt,
    };
  }
}
