import  express from 'express'
import { protect } from '../middleware/auth.js';
import { getPlans, purchasePlan } from '../controller/creditController.js';

const creditRouter =express.Router();

creditRouter.get('/plan',getPlans)
creditRouter.post('/purchase',protect,purchasePlan)

export default creditRouter;

