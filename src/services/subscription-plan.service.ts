import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Logger } from "../utils/logger";
import { SubscriptionPlan } from "../entities/subscription-plan.entity";
import { CreateSubscriptionPlanDto } from "../dtos/subscription/create-subscription-plan.dto";

export class SubscriptionPlanService {
  private subscriptionPlanRepository: Repository<SubscriptionPlan>;

  constructor() {
    this.subscriptionPlanRepository = AppDataSource.getRepository(SubscriptionPlan);
  }

  //create 
  async createSubscriptionPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    try {
      const subscriptionPlan = this.subscriptionPlanRepository.create(dto);
      return await this.subscriptionPlanRepository.save(subscriptionPlan);
    } catch (error) {
      Logger.error("Error creating subscription plan", error);
      throw error;
    }
  }

  //find all
  async findAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      return await this.subscriptionPlanRepository.find();
    } catch (error) {
      Logger.error("Error finding subscription plans", error);
      throw error;
    }
  }

  //find by id
  async findSubscriptionPlanById(id: string): Promise<SubscriptionPlan> {
    try {
      const subscriptionPlan = await this.subscriptionPlanRepository.findOne({ where: { id } });
      if (!subscriptionPlan) {
        throw new Error("Subscription plan not found");
      }
      return subscriptionPlan;
    } catch (error) {
      Logger.error("Error finding subscription plan by id", error);
      throw error;
    }
  }

  //update
    async updateSubscriptionPlan(id: string, dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan | null> {
        try {
        const subscriptionPlan = await this.subscriptionPlanRepository.findOne({ where: { id } });
        if (!subscriptionPlan) {
            return null;
        }
        Object.assign(subscriptionPlan, dto);
        return await this.subscriptionPlanRepository.save(subscriptionPlan);
        } catch (error) {
        Logger.error("Error updating subscription plan", error);
        throw error;
        }

    }
    //delete
    async deleteSubscriptionPlan(id: string): Promise<void> {
        try {
            const result = await this.subscriptionPlanRepository.delete(id);
            if (result.affected === 0) {
                throw new Error("Subscription plan not found");
            }
        } catch (error) {
            Logger.error("Error deleting subscription plan", error);
            throw error;
        }
    }
}