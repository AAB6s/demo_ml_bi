// Ahmed's ML Salary Prediction Module
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Send, RotateCcw, Loader2, AlertCircle } from 'lucide-react';

interface FormData {
  age: number;
  gender: string;
  educationLevel: string;
  jobTitle: string;
  yearsOfExperience: number;
}

interface PredictionResult {
  salary: string;
  confidence: string;
  keyDrivers: string[];
  businessInsight: string;
}

const initialFormData: FormData = {
  age: 30,
  gender: '',
  educationLevel: '',
  jobTitle: '',
  yearsOfExperience: 5,
};

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const EDUCATION_OPTIONS = ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Professional Degree'];
const JOB_TITLE_OPTIONS = ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps Engineer', 'Data Analyst', 'Project Manager', 'Business Analyst'];

export const MLSalary = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = useCallback(() => {
    return (
      formData.age >= 18 && formData.age <= 70 &&
      formData.gender !== '' &&
      formData.educationLevel !== '' &&
      formData.jobTitle !== '' &&
      formData.yearsOfExperience >= 0
    );
  }, [formData]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError('Please fill in all required fields with valid values');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('LLM_API_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectiveId: 'salary_prediction',
          inputs: formData,
        }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setResult(data);
    } catch {
      // Demo mode: Generate mock result
      setTimeout(() => {
        setResult(generateMockResult(formData));
        setIsLoading(false);
      }, 1500);
      return;
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Age */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Age <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              min={18}
              max={70}
              value={formData.age}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 18)}
              className="input-field w-full"
              placeholder="18-70"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Gender <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="input-field w-full"
            >
              <option value="">Select gender...</option>
              {GENDER_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Education Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Education Level <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.educationLevel}
              onChange={(e) => handleInputChange('educationLevel', e.target.value)}
              className="input-field w-full"
            >
              <option value="">Select education...</option>
              {EDUCATION_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Job Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Job Title <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              className="input-field w-full"
            >
              <option value="">Select job title...</option>
              {JOB_TITLE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Years of Experience */}
          <div className="space-y-2 sm:col-span-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">
                Years of Experience <span className="text-destructive">*</span>
              </label>
              <span className="text-sm font-semibold text-primary">{formData.yearsOfExperience} years</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              value={formData.yearsOfExperience}
              onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !isFormValid()}
          className="btn-primary flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isLoading ? 'Analyzing...' : 'Run Analysis'}
        </button>
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Results Section */}
      <div className="min-h-[200px]">
        {isLoading && <ResultSkeleton />}
        {result && !isLoading && <ResultCards result={result} />}
        {!result && !isLoading && (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            Run analysis to see salary prediction results
          </div>
        )}
      </div>
    </div>
  );
};

// Result Cards Component
const ResultCards = ({ result }: { result: PredictionResult }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    {/* Prediction Card */}
    <div className="card-result">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-foreground">Predicted Salary</h4>
      </div>
      <p className="text-2xl font-bold text-primary mb-2">{result.salary}</p>
      <p className="text-sm text-muted-foreground">Confidence: {result.confidence}</p>
    </div>

    {/* Key Drivers Card */}
    <div className="card-result">
      <h4 className="font-semibold text-foreground mb-3">Key Drivers</h4>
      <ul className="space-y-2">
        {result.keyDrivers.map((driver, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            {driver}
          </li>
        ))}
      </ul>
    </div>

    {/* Business Insight Card */}
    <div className="card-result accent-soft-bg border-primary/20">
      <h4 className="font-semibold text-foreground mb-2">Business Insight</h4>
      <p className="text-sm text-muted-foreground">{result.businessInsight}</p>
    </div>
  </motion.div>
);

// Loading Skeleton
const ResultSkeleton = () => (
  <div className="space-y-4">
    <div className="card-result h-28 shimmer" />
    <div className="card-result h-32 shimmer" />
    <div className="card-result h-20 shimmer" />
  </div>
);

// Mock result generator
function generateMockResult(formData: FormData): PredictionResult {
  const baseSalary = 50000;
  const experienceBonus = formData.yearsOfExperience * 3000;
  const educationBonus = EDUCATION_OPTIONS.indexOf(formData.educationLevel) * 8000;
  const estimatedSalary = baseSalary + experienceBonus + educationBonus;
  
  return {
    salary: `$${(estimatedSalary - 10000).toLocaleString()} - $${(estimatedSalary + 15000).toLocaleString()}`,
    confidence: '85%',
    keyDrivers: [
      `Years of experience (${formData.yearsOfExperience} years) significantly impacts compensation`,
      `${formData.educationLevel} provides a competitive advantage in this role`,
      `${formData.jobTitle} positions show strong market demand`,
      'Age and career trajectory align with senior-level expectations',
    ],
    businessInsight: `Based on current market conditions, professionals with ${formData.yearsOfExperience}+ years experience in ${formData.jobTitle} roles are in high demand. Consider emphasizing technical skills and leadership experience during salary negotiations.`,
  };
}

export const mlSalaryConfig = {
  id: 'salary',
  title: 'Salary Prediction',
  description: 'Salary prediction from demographics and experience',
  icon: DollarSign,
  component: MLSalary,
  disabled: false,
};

export default MLSalary;
