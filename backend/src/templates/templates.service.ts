import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './template.entity';

@Injectable()
export class TemplatesService {
    constructor(
        @InjectRepository(Template)
        private readonly templateRepository: Repository<Template>,
    ) { }

    async findAll(category?: string): Promise<Template[]> {
        const query = this.templateRepository.createQueryBuilder('template')
            .where('template.active = :active', { active: true });

        if (category) {
            query.andWhere('template.category = :category', { category });
        }

        return query.getMany();
    }

    async findByKey(key: string): Promise<Template> {
        const template = await this.templateRepository.findOne({
            where: { templateKey: key }
        });

        if (!template) {
            throw new NotFoundException(`Template with key \${key} not found`);
        }

        return template;
    }
}
