import {SubscriptionPlanService} from '../services/subscription-plan.service';
import {Request, Response} from 'express';
const subscriptionPlanService = new SubscriptionPlanService();

//create subscription plan
export const createSubscriptionPlan = async (req: Request, res: Response) => {
  try {
    const subscriptionPlan = await subscriptionPlanService.createSubscriptionPlan(req.body);
    res.status(201).json(subscriptionPlan);
  } catch (error) {
    res.status(500).json({ error: "Error creating subscription plan" });
  }
};

//get all subscription plans
export const getAllSubscriptionPlans = async (req: Request, res: Response) => {
  try {
    const subscriptionPlans = await subscriptionPlanService.findAllSubscriptionPlans();
    res.status(200).json(subscriptionPlans);
  } catch (error) {
    res.status(500).json({ error: "Error fetching subscription plans" });
  }
};

//get subscription plan by id
export const getSubscriptionPlanById = async (req: Request, res: Response):Promise<any> =>
{
  try {
    const subscriptionPlanId = req.params.id;
    if (!subscriptionPlanId) {
      return res.status(400).json({ error: "Invalid subscription plan ID" });
    }
    const subscriptionPlan = await subscriptionPlanService.findSubscriptionPlanById(subscriptionPlanId);
    if (!subscriptionPlan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }
    res.status(200).json(subscriptionPlan);
  } catch (error) {
    res.status(500).json({ error: "Error fetching subscription plan" });
  }
};

//update subscription plan
export const updateSubscriptionPlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const subscriptionPlan = await subscriptionPlanService.updateSubscriptionPlan(req.params.id, req.body);
    if (!subscriptionPlan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }
    res.status(200).json(subscriptionPlan);
  } catch (error) {
    res.status(500).json({ error: "Error updating subscription plan" });
  }
};

//delete subscription plan
export const deleteSubscriptionPlan = async (req: Request, res: Response) => {
  try {
    await subscriptionPlanService.deleteSubscriptionPlan(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error deleting subscription plan" });
  }
};