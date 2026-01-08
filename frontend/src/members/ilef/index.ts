// frontend/src/members/ilef/index.ts
import { BarChart3, Users } from 'lucide-react';
import DemandForecasting from './DemandForecasting';
import JobSegmentation from './JobSegmentation';

const ilefObjectives = [
  {
    id: 'demand-forecast',
    title: 'Market Demand Forecast',
    description: 'Predict job opening volumes using ML Regression models',
    icon: BarChart3,
    component: DemandForecasting,
    disabled: false // AJOUTE CETTE LIGNE
  },
  {
    id: 'job-segmentation',
    title: 'Strategic Segmentation',
    description: 'Analyze skill clusters and market role categories',
    icon: Users,
    component: JobSegmentation,
    disabled: false // AJOUTE CETTE LIGNE
  }
];

export default ilefObjectives;