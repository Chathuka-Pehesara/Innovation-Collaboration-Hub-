import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface IdeaEvaluationRequest {
  title: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface MentorContext {
  project_title?: string;
  project_description?: string;
  user_skills?: string[];
  team_stage?: string;
  project_type?: string;
}

export interface MentorChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
  context?: MentorContext;
}

export interface QuickTipRequest {
  topic: 'idea_refinement' | 'team_building' | 'technical_planning' | 'presentation' | 'general';
  project_title?: string;
}

export interface GenerateDescriptionRequest {
  title: string;
  brief_concept?: string;
  keywords?: string[];
  target_audience?: string;
  template?: 'standard' | 'technical' | 'pitch';
}

export interface RefineDescriptionRequest {
  title: string;
  description: string;
  focus?: 'clarity' | 'technical' | 'concise' | 'pitch';
}

export interface GenerateFromKeywordsRequest {
  keywords: string[];
  domain?: string;
}

export interface ExtractSkillsRequest {
  description: string;
}

/**
 * Evaluate a single idea using the AI service.
 */
export const evaluateIdea = async (data: IdeaEvaluationRequest) => {
  const response = await client.post('/ideas/evaluate', data);
  return response.data;
};

/**
 * Chat with the AI Mentor.
 */
export const mentorChat = async (data: MentorChatRequest) => {
  const response = await client.post('/mentor/chat', data);
  return response.data;
};

/**
 * Get a quick mentorship tip.
 */
export const getQuickTip = async (data: QuickTipRequest) => {
  const response = await client.post('/mentor/quick-tip', data);
  return response.data;
};

/**
 * Find teammate suggestions based on user skills and availability.
 */
export const findTeammates = async (userId: string, maxSuggestions = 5) => {
  const response = await client.post('/find-teammates', null, {
    params: {
      user_id: userId,
      max_suggestions: maxSuggestions,
    },
  });
  return response.data;
};

/**
 * Generate a project description using AI.
 */
export const generateDescription = async (data: GenerateDescriptionRequest) => {
  const response = await client.post('/generator/description', data);
  return response.data;
};

/**
 * Refine a project description.
 */
export const refineDescription = async (data: RefineDescriptionRequest) => {
  const response = await client.post('/generator/refine', data);
  return response.data;
};

/**
 * Generate a description from keywords.
 */
export const generateFromKeywords = async (data: GenerateFromKeywordsRequest) => {
  const response = await client.post('/generator/from-keywords', data);
  return response.data;
};

/**
 * Extract skills from description text.
 */
export const extractSkills = async (data: ExtractSkillsRequest) => {
  const response = await client.post('/generator/extract-skills', data);
  return response.data;
};

