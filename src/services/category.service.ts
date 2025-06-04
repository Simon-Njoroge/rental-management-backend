import { Repository } from "typeorm";
import { Category } from "../entities/category.entity";
import { AppDataSource } from "../config/data-source";
import { CreateCategoryDto } from "../dtos/category/create-category.dto";
import { UpdateCategoryDto } from "../dtos/category/update-category.dto";
import { createHttpError } from "../utils/errors";
import { Logger } from "../utils/logger";

export class CategoryService {
  private categoryRepository: Repository<Category>;

  constructor() {
    this.categoryRepository = AppDataSource.getRepository(Category);
  }

  async create(dto: CreateCategoryDto): Promise<{ success: boolean; message: string; category: Category; timestamp: string }> {
    try {
      const existing = await this.categoryRepository.findOneBy({ name: dto.name });
      if (existing) {
        throw createHttpError(409, "Category with this name already exists");
      }

      const category = this.categoryRepository.create(dto);
      const savedCategory = await this.categoryRepository.save(category);

      Logger.info(`Category created with ID: ${savedCategory.id}`);

      return {
        success: true,
        message: "Category created successfully",
        category: savedCategory,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      Logger.error(`Error creating category: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ relations: ["properties"] });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["properties"],
    });
    if (!category) throw createHttpError(404, "Category not found");
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw createHttpError(404, "Category not found");

    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoryRepository.findOneBy({ name: dto.name });
      if (existing && existing.id !== id) {
        throw createHttpError(409, "Category with this name already exists");
      }
    }

    Object.assign(category, dto);
    const updated = await this.categoryRepository.save(category);

    Logger.info(`Category updated with ID: ${updated.id}`);

    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw createHttpError(404, "Category not found");
    }
    Logger.info(`Category deleted with ID: ${id}`);
  }
}
