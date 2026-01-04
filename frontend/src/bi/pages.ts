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
    embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=2d1c6636-e210-409d-b399-1265f169fc76&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730',
  },
  {
    id: 2,
    title: 'Salary Insights',
    description: 'Compensation benchmarks and salary distribution analysis',
    embedUrl:
      'https://app.powerbi.com/reportEmbed?reportId=1da78df1-ec2f-4b59-971b-6431af3e9cf3&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730',
  },
  {
    id: 3,
    title: 'Remote Work & Job Types',
    description: 'Remote work trends and job type distribution',
    embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=5cb60d85-ac59-44e4-ae1a-bb6bb4910bda&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730',
  },
  {
    id: 4,
    title: 'Company & Freelance Insights',
    description: 'Company hiring patterns and freelance market analysis',
    embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=97d849ba-7103-4382-8efb-ae608ac6789b&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730',
  },
  {
    id: 5,
    title: 'Workforce & HR Analytics',
    description: 'Employee lifecycle and HR performance metrics',
    embedUrl:
      'https://app.powerbi.com/reportEmbed?reportId=27942447-2c23-4caa-8b99-0fa52a6f7720&groupId=b83c3805-40a8-4e09-8413-26f5ac3e6bb4&autoAuth=true',
  },
  {
    id: 6,
    title: 'Distribution and Evolution of Skills in Job Postings',
    description: 'Skills demand trends and technology evolution',
    embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=ee118c9f-c080-46e6-a1c6-6617b44bb22d&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730',
  },
]

export default biPages