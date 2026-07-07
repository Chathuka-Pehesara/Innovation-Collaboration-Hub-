import { api } from '../api';

export interface IdeaEvaluationResponse {
  overall_score: number;
  feasibility_score: number;
  feasibility_rationale: string;
  innovation_score: number;
  innovation_rationale: string;
  impact_score: number;
  impact_rationale: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  suggested_tech_stack: string[];
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

export interface MentorChatResponse {
  reply: string;
  suggestions: string[];
  follow_up_questions: string[];
  topic: string;
  mode: string;
  generated_at: string;
}

export interface QuickTipResponse {
  topic: string;
  tip: string;
  related_actions: string[];
  mode: string;
}

export interface TeammateResult {
  user_id: string;
  compatibility_score: number;
  matching_skills: string[];
  complementary_skills: {
    user1_unique: string[];
    user2_unique: string[];
    shared: string[];
  };
  team_balance_score: number;
  proficiency_distribution: Record<string, number>;
}

export interface FindTeammatesResponse {
  user_id: string;
  suggestions: TeammateResult[];
  total_suggestions: number;
}

export interface GenerateDescriptionResponse {
  title: string;
  description: string;
  outline: {
    problem_statement: string;
    proposed_solution: string;
    key_features: string[];
    expected_outcomes: string[];
  };
  suggested_skills: string[];
  estimated_timeline_weeks: number;
  template_used: string;
  mode: string;
  generated_at: string;
}

export interface RefineDescriptionResponse {
  title: string;
  original_description: string;
  refined_description: string;
  changes_summary: string[];
  focus: string;
  mode: string;
  generated_at: string;
}

/**
 * Request AI to evaluate a project idea.
 */
export const evaluateIdeaApi = async (title: string, description: string): Promise<IdeaEvaluationResponse> => {
  const { data } = await api.post<IdeaEvaluationResponse>('/ai/evaluate', { title, description });
  return data;
};

/**
 * Send a message to the AI Mentor chatbot.
 */
export const mentorChatApi = async (
  message: string,
  history: ChatMessage[] = [],
  context?: MentorContext
): Promise<MentorChatResponse> => {
  const { data } = await api.post<MentorChatResponse>('/ai/mentor/chat', {
    message,
    conversation_history: history,
    context,
  });
  return data;
};

/**
 * Request a quick tip from the AI Mentor.
 */
export const getQuickTipApi = async (
  topic: 'idea_refinement' | 'team_building' | 'technical_planning' | 'presentation' | 'general',
  projectTitle?: string
): Promise<QuickTipResponse> => {
  const { data } = await api.post<QuickTipResponse>('/ai/mentor/quick-tip', {
    topic,
    project_title: projectTitle,
  });
  return data;
};

/**
 * Request teammate suggestions based on AI matching.
 */
export const findTeammatesApi = async (limit = 6): Promise<FindTeammatesResponse> => {
  const { data } = await api.get<FindTeammatesResponse>('/ai/find-teammates', {
    params: { limit },
  });
  return data;
};

/**
 * Request draft generation based on title, keywords, and outline configurations.
 */
export const generateDescriptionApi = async (payload: {
  title: string;
  brief_concept?: string;
  keywords?: string[];
  target_audience?: string;
  template?: 'standard' | 'technical' | 'pitch';
}): Promise<GenerateDescriptionResponse> => {
  const { data } = await api.post<GenerateDescriptionResponse>('/ai/generate-desc', payload);
  return data;
};

/**
 * Request AI description refinement.
 */
export const refineDescriptionApi = async (
  title: string,
  description: string,
  focus: 'clarity' | 'technical' | 'concise' | 'pitch' = 'clarity'
): Promise<RefineDescriptionResponse> => {
  const { data } = await api.post<RefineDescriptionResponse>('/ai/refine-desc', {
    title,
    description,
    focus,
  });
  return data;
};

/**
 * Generate description from keywords only.
 */
export const generateFromKeywordsApi = async (
  keywords: string[],
  domain?: string
): Promise<GenerateDescriptionResponse> => {
  const { data } = await api.post<GenerateDescriptionResponse>('/ai/from-keywords', {
    keywords,
    domain,
  });
  return data;
};

/**
 * Extract skills from any text.
 */
export const extractSkillsApi = async (description: string): Promise<{ skills: string[] }> => {
  const { data } = await api.post<{ skills: string[] }>('/ai/extract-skills', { description });
  return data;
};
