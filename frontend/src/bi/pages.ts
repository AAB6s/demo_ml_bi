export interface BIPage {
  id: number
  title: string
  description: string
  embedUrl: string
}

export const biPages: BIPage[] = [
  {
    id: 1,
    title: 'Job Market Overview',
    description: 'Executive summary of job market trends and key metrics',
    embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=363c22e5-5566-452c-9d55-5b41dc4478de&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730',
  },
  {
    id: 2,
    title: 'Salary Insights',
    description: 'Compensation benchmarks and salary distribution analysis',
    embedUrl:
      'https://app.powerbi.com/reportEmbed?reportId=4a8877bf-a60a-4104-8666-14d008fe5a77&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730',
  },
  {
    id: 3,
    title: 'Remote Work & Job Types',
    description: 'Remote work trends and job type distribution',
    embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=09fa5d45-9520-47e7-b135-04efaace2bf2&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730',
  },
  {
    id: 4,
    title: 'Company & Freelance Insights',
    description: 'Company hiring patterns and freelance market analysis',
    embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=ac311e6c-3865-4121-8626-f62b1db366ae&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730',
  },
  {
    id: 5,
    title: 'Workforce & HR Analytics',
    description: 'Employee lifecycle and HR performance metrics',
    embedUrl:
      'https://app.powerbi.com/reportEmbed?reportId=49adcc93-9036-4d01-b60f-a4ddd283f1e9&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730',
  },
  {
    id: 6,
    title: 'Distribution and Evolution of Skills in Job Postings',
    description: 'Skills demand trends and technology evolution',
    embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=9044fe09-667a-46f3-953d-36de60c6d238&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730',
  },
]

export default biPages