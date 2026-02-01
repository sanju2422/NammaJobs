
export type Language = 'en' | 'kn';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedAt: string;
  sourceUrl?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AISearchResponse {
  jobs: Job[];
  sources: GroundingSource[];
  summary: string;
}
