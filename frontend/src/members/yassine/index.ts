import { Upload, BarChart3, Users } from 'lucide-react';
import HRCsvUpload from "./App";


// The array for HR MLContainer.tsx
export const hrObjectives = [
  {
    id: 'hr-analytics',
    title: 'HR Analytics Dashboard',
    description: 'Upload CSV files and visualize workforce analytics',
    icon: Upload,
    component: HRCsvUpload,
    disabled: false
  }
];

// Default export for the container
export default hrObjectives;