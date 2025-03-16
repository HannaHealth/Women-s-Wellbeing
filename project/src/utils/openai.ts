import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { addAssistantSignature } from './chatFormatting';

// Types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Enable client-side usage
});

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get a response from the OpenAI API
 * @param messages The conversation history
 * @param userId The user's ID (for context retrieval)
 * @param includeHealthData Whether to include health data in the prompt
 * @returns The AI assistant's response
 */
export async function getAIResponse(
  messages: ChatMessage[],
  userId: string,
  includeHealthData: boolean = false
): Promise<string> {
  try {
    // Create a context-aware system message
    const systemMessage: ChatMessage = {
      role: 'system',
      content: await buildSystemPrompt(userId, includeHealthData)
    };

    // Add system message to the beginning of the conversation
    const fullMessages = [systemMessage, ...messages];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 1000
    });

    // Extract and format the response
    const assistantResponse = response.choices[0]?.message?.content || 
      "I'm sorry, I'm having trouble generating a response right now.";
    
    // Add the assistant signature
    return addAssistantSignature(assistantResponse);
  } catch (error) {
    console.error('Error getting AI response:', error);
    return "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again later.\n\n~ Hanna™";
  }
}

/**
 * Build a system prompt with user context
 * @param userId The user's ID
 * @param includeHealthData Whether to include health data
 * @returns The system prompt
 */
async function buildSystemPrompt(userId: string, includeHealthData: boolean): Promise<string> {
  let prompt = `You are Hanna™, an AI-powered health assistant specializing in women's health, with expertise in diabetes, obesity, and nutrition management. 

Your goal is to provide personalized, evidence-based guidance while being empathetic and supportive. Always sign your responses with "~ Hanna™".

Guidelines:
- Provide accurate health information based on established medical guidelines
- Be empathetic and supportive, especially for sensitive health topics
- Use clear, accessible language and avoid medical jargon when possible
- Offer practical, actionable advice tailored to the user's situation
- Never claim to diagnose conditions or replace medical professionals
- When uncertain, acknowledge limitations and suggest consulting healthcare providers

Current date: ${new Date().toISOString().split('T')[0]}
`;

  if (includeHealthData) {
    // Get user profile and health data
    try {
      const userData = await getUserHealthContext(userId);
      if (userData) {
        prompt += `\nUser Context:\n${userData}\n`;
      }
    } catch (error) {
      console.error('Error getting user health context:', error);
    }
  }

  return prompt;
}

/**
 * Retrieve health context for a user
 * @param userId The user's ID
 * @returns A formatted string with user health information
 */
async function getUserHealthContext(userId: string): Promise<string | null> {
  try {
    // Get health profile
    const { data: profileData, error: profileError } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching health profile:', profileError);
      return null;
    }
    
    // Get latest health metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1);
      
    if (metricsError) {
      console.error('Error fetching health metrics:', metricsError);
      return null;
    }
    
    // Build context string
    let context = '';
    
    if (profileData) {
      context += 'Health Profile:\n';
      if (profileData.age) context += `- Age: ${profileData.age} years\n`;
      if (profileData.height) context += `- Height: ${profileData.height} cm\n`;
      
      // Handle medical conditions
      if (profileData.medical_conditions) {
        const conditions = Array.isArray(profileData.medical_conditions) 
          ? profileData.medical_conditions 
          : JSON.parse(profileData.medical_conditions as string);
          
        if (conditions.length > 0) {
          context += `- Medical Conditions: ${conditions.join(', ')}\n`;
        }
      }
      
      // Handle medications
      if (profileData.medications) {
        const medications = Array.isArray(profileData.medications) 
          ? profileData.medications 
          : JSON.parse(profileData.medications as string);
          
        if (medications.length > 0) {
          context += `- Medications: ${medications.join(', ')}\n`;
        }
      }
      
      // Handle lifestyle factors
      if (profileData.lifestyle_factors) {
        const lifestyle = typeof profileData.lifestyle_factors === 'string'
          ? JSON.parse(profileData.lifestyle_factors)
          : profileData.lifestyle_factors;
          
        context += '- Lifestyle:\n';
        if (lifestyle.diet_type) context += `  * Diet: ${lifestyle.diet_type}\n`;
        if (lifestyle.activity_level) context += `  * Activity Level: ${lifestyle.activity_level}\n`;
        if (lifestyle.stress_level) context += `  * Stress Level: ${lifestyle.stress_level}\n`;
        if (lifestyle.sleep_quality) context += `  * Sleep Quality: ${lifestyle.sleep_quality}\n`;
      }
    }
    
    if (metricsData && metricsData.length > 0) {
      const latestMetrics = metricsData[0];
      context += '\nRecent Health Metrics:\n';
      context += `- Date: ${latestMetrics.date}\n`;
      if (latestMetrics.blood_glucose) context += `- Blood Glucose: ${latestMetrics.blood_glucose} mg/dL\n`;
      if (latestMetrics.weight) context += `- Weight: ${latestMetrics.weight} kg\n`;
      if (latestMetrics.blood_pressure_systolic && latestMetrics.blood_pressure_diastolic) {
        context += `- Blood Pressure: ${latestMetrics.blood_pressure_systolic}/${latestMetrics.blood_pressure_diastolic} mmHg\n`;
      }
      if (latestMetrics.steps) context += `- Daily Steps: ${latestMetrics.steps}\n`;
      if (latestMetrics.sleep_hours) context += `- Sleep: ${latestMetrics.sleep_hours} hours\n`;
      if (latestMetrics.mood) {
        const moodMap = ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent'];
        context += `- Mood: ${moodMap[latestMetrics.mood - 1]}\n`;
      }
    }
    
    return context || null;
  } catch (error) {
    console.error('Error in getUserHealthContext:', error);
    return null;
  }
}

/**
 * Generate a personalized care plan for a user
 * @param userId The user's ID
 * @returns A care plan object with sections and goals
 */
export async function generateCarePlan(userId: string): Promise<any> {
  try {
    // Get user profile and health data for context
    const userContext = await getUserHealthContext(userId);
    
    // Build the prompt
    const prompt = `
You are a healthcare AI specializing in creating personalized care plans for women managing diabetes, obesity, and overall health. 
Create a comprehensive 8-week care plan for this patient based on their health profile.

${userContext || 'No detailed health information is available for this user.'}

Generate a complete care plan with the following structure:
{
  "title": "Personalized 8-Week Health Management Plan",
  "sections": [
    {
      "title": "Nutrition Recommendations",
      "content": ["Specific, actionable nutrition recommendations", "Balanced meal suggestions", "Portion control guidance"]
    },
    {
      "title": "Physical Activity Plan",
      "content": ["Realistic exercise recommendations", "Gradual progression schedule", "Activity options for different fitness levels"]
    },
    {
      "title": "Blood Sugar Management",
      "content": ["Monitoring schedule", "Target ranges", "Action steps for high/low readings"]
    },
    {
      "title": "Mental Wellbeing Strategies",
      "content": ["Stress management techniques", "Sleep improvement tips", "Mindfulness practices"]
    }
  ],
  "weeklyGoals": [
    "Track blood glucose 2x daily",
    "Walk for 20 minutes, 5 days per week",
    "Include protein with each meal",
    "Practice deep breathing for 5 minutes daily"
  ]
}

Make all recommendations specific, actionable, and tailored to the user's health profile. Focus on realistic, sustainable changes.
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a healthcare AI specializing in diabetes and obesity management for women." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    // Parse and return the response
    const content = response.choices[0]?.message?.content || '';
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing care plan JSON:', parseError);
      toast.error('Failed to generate care plan. Please try again later.');
      return null;
    }
  } catch (error) {
    console.error('Error generating care plan:', error);
    toast.error('Failed to generate care plan. Please try again later.');
    return null;
  }
}

/**
 * Analyze health metrics to provide insights and trends
 * @param userId The user's ID
 * @returns Analysis object with insights, risk factors, and progress
 */
export async function analyzeHealthData(userId: string): Promise<any> {
  try {
    // Fetch user's health metrics
    const { data: metrics, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);
      
    if (error) {
      console.error('Error fetching health metrics for analysis:', error);
      throw error;
    }
    
    if (!metrics || metrics.length === 0) {
      return {
        insights: [],
        riskFactors: {},
        progressToGoals: {}
      };
    }
    
    // If there's not enough data, return a simple analysis
    if (metrics.length < 3) {
      return performDataAnalysis(metrics);
    }
    
    // Build the prompt
    const prompt = `
Analyze these health metrics and provide insights:

${JSON.stringify(metrics, null, 2)}

Respond with a JSON object containing:
1. insights: Array of 2-3 key observations with title, description, and recommendation
2. riskFactors: Object with risk levels (Low, Moderate, High) for different health aspects
3. progressToGoals: Object with percentage progress toward standard health goals

Format:
{
  "insights": [
    {
      "title": "Blood Glucose Trends",
      "description": "Your blood glucose shows [pattern]",
      "recommendation": "Consider [specific action]"
    }
  ],
  "riskFactors": {
    "bloodSugar": "Low",
    "bloodPressure": "Moderate",
    "weight": "Low"
  },
  "progressToGoals": {
    "bloodGlucose": 85,
    "weight": 60,
    "activity": 75
  }
}

Your response should be a valid JSON object following the exact structure above.
`;

    // Call OpenAI API without the response_format parameter
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a health analytics AI. Analyze health data and provide insights in JSON format." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    // Extract response content
    const content = response.choices[0]?.message?.content || '';
    
    // Extract JSON from the response - look for content between ``` markers if present
    let jsonContent = content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }
    
    // Try to parse the JSON response
    try {
      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Error parsing AI analysis:', parseError);
      return performDataAnalysis(metrics);
    }
  } catch (error) {
    console.error('Error analyzing health data:', error);
    return {
      insights: [],
      riskFactors: {},
      progressToGoals: {}
    };
  }
}

/**
 * Fallback function to analyze health data when AI fails
 * @param metrics Health metrics array
 * @returns Basic analysis object
 */
function performDataAnalysis(metrics: any[]): any {
  // Simple analysis based on latest metrics
  const latest = metrics[0];
  const insights = [];
  const riskFactors: Record<string, string> = {};
  const progressToGoals: Record<string, number> = {};
  
  // Blood glucose analysis
  if (latest.blood_glucose) {
    if (latest.blood_glucose > 180) {
      insights.push({
        title: "High Blood Glucose",
        description: "Your recent blood glucose reading is above the recommended range.",
        recommendation: "Consider checking your carbohydrate intake and discuss with your healthcare provider."
      });
      riskFactors.bloodSugar = "High";
      progressToGoals.bloodGlucose = 40;
    } else if (latest.blood_glucose > 140) {
      insights.push({
        title: "Elevated Blood Glucose",
        description: "Your blood glucose is slightly elevated.",
        recommendation: "Monitor your levels closely and consider adjusting your meal timing."
      });
      riskFactors.bloodSugar = "Moderate";
      progressToGoals.bloodGlucose = 65;
    } else if (latest.blood_glucose >= 70) {
      riskFactors.bloodSugar = "Low";
      progressToGoals.bloodGlucose = 90;
    } else {
      insights.push({
        title: "Low Blood Glucose",
        description: "Your blood glucose reading is below the recommended range.",
        recommendation: "Consider having a small snack with carbohydrates and protein."
      });
      riskFactors.bloodSugar = "Moderate";
      progressToGoals.bloodGlucose = 60;
    }
  }
  
  // Blood pressure analysis
  if (latest.blood_pressure_systolic && latest.blood_pressure_diastolic) {
    if (latest.blood_pressure_systolic >= 140 || latest.blood_pressure_diastolic >= 90) {
      insights.push({
        title: "Elevated Blood Pressure",
        description: "Your blood pressure reading is above the normal range.",
        recommendation: "Consider reducing sodium intake and discuss with your healthcare provider."
      });
      riskFactors.bloodPressure = "High";
      progressToGoals.bloodPressure = 50;
    } else if (latest.blood_pressure_systolic >= 130 || latest.blood_pressure_diastolic >= 80) {
      riskFactors.bloodPressure = "Moderate";
      progressToGoals.bloodPressure = 75;
    } else {
      riskFactors.bloodPressure = "Low";
      progressToGoals.bloodPressure = 90;
    }
  }
  
  // Activity level based on steps
  if (latest.steps) {
    if (latest.steps >= 10000) {
      progressToGoals.activity = 100;
    } else if (latest.steps >= 7500) {
      progressToGoals.activity = 85;
    } else if (latest.steps >= 5000) {
      progressToGoals.activity = 65;
    } else if (latest.steps >= 2500) {
      progressToGoals.activity = 40;
    } else {
      progressToGoals.activity = 20;
      insights.push({
        title: "Increase Physical Activity",
        description: "Your step count is lower than recommended for optimal health.",
        recommendation: "Try to incorporate more walking into your daily routine."
      });
    }
  }
  
  // If we don't have enough insights
  if (insights.length === 0) {
    insights.push({
      title: "Continue Tracking",
      description: "Keep logging your health metrics to identify trends over time.",
      recommendation: "Regular tracking helps you and your healthcare provider make informed decisions."
    });
  }
  
  return {
    insights,
    riskFactors,
    progressToGoals
  };
}