import { Lightbulb } from 'lucide-react';
import SkillAnalysisForm from "./components/SkillAnalysisForm";
import SirineApp from "./App"; 

// Named export for your main App.tsx to find
export { SirineApp };

// The array for Sirine's MLContainer.tsx
export const sirineObjectives = [
  {
    id: 'skill-analysis',
    title: 'Skill Analysis',
    description: 'Analyze skill gaps and workforce readiness',
    icon: Lightbulb,
    component: SkillAnalysisForm,
    disabled: false
  }
];

// Default export for the container
export default sirineObjectives;
