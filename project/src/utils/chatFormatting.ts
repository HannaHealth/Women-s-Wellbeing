/**
 * Utility functions for formatting chat messages from the AI assistant
 */

import React from 'react';

/**
 * Convert markdown to HTML with proper styling for AI assistant responses
 * @param content Markdown content from AI response
 * @returns React component with formatted HTML
 */
export const renderFormattedMessage = (content: string): React.ReactElement => {
  // Basic markdown parsing for the assistant's messages
  // Convert markdown to HTML
  let formattedContent = content
    // Headers
    .replace(/### (.*)/g, '<h3 class="text-lg font-bold text-blue-700 mt-3 mb-2">$1</h3>')
    .replace(/## (.*)/g, '<h2 class="text-xl font-bold text-blue-800 mt-4 mb-2">$1</h2>')
    .replace(/# (.*)/g, '<h1 class="text-2xl font-bold text-blue-900 mt-4 mb-3">$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    // Lists
    .replace(/^\s*[\-\*]\s+(.*)/gm, '<li class="ml-4">$1</li>')
    .replace(/^\s*\d+\.\s+(.*)/gm, '<li class="ml-4 list-decimal">$1</li>')
    
    // Code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-pink-600 font-mono">$1</code>')
    
    // Links (if any)
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
    
    // Handle paragraphs (lines with content)
    .replace(/^(?!<[hl]|<li|<code|<a|<strong|<em)(.+)$/gm, '<p class="mb-2">$1</p>')
    
    // Make numeric values in health contexts stand out
    .replace(/(\d+\s*(?:mg\/dL|mmHg|kg|lbs|hours|steps))/g, 
             '<span class="font-medium text-blue-600">$1</span>')
    
    // Wrap consecutive list items
    .replace(/(<li[^>]*>.*<\/li>\n<li[^>]*>.*<\/li>)/g, '<ul class="mb-3">$1</ul>');
  
  return React.createElement('div', {
    className: "prose prose-sm max-w-none",
    dangerouslySetInnerHTML: { __html: formattedContent }
  });
};

/**
 * Format health metrics for display in chat
 * @param metrics Health metrics object
 * @returns Formatted string in markdown
 */
export const formatHealthMetricsForChat = (metrics: any): string => {
  let markdown = "### My Current Health Metrics\n\n";
  
  if (metrics.blood_glucose) {
    markdown += `- Blood Glucose: **${metrics.blood_glucose} mg/dL**\n`;
  }
  
  if (metrics.weight) {
    markdown += `- Weight: **${metrics.weight} kg**\n`;
  }
  
  if (metrics.blood_pressure_systolic && metrics.blood_pressure_diastolic) {
    markdown += `- Blood Pressure: **${metrics.blood_pressure_systolic}/${metrics.blood_pressure_diastolic} mmHg**\n`;
  }
  
  if (metrics.steps) {
    markdown += `- Steps: **${metrics.steps}**\n`;
  }
  
  if (metrics.sleep_hours) {
    markdown += `- Sleep: **${metrics.sleep_hours} hours**\n`;
  }
  
  if (metrics.mood) {
    const moodMap: Record<number, string> = {
      1: "Very poor",
      2: "Poor",
      3: "Neutral",
      4: "Good",
      5: "Very good"
    };
    markdown += `- Mood: **${moodMap[metrics.mood] || metrics.mood}**\n`;
  }
  
  return markdown;
};

/**
 * Format a care plan summary for sharing in chat
 * @param carePlan Care plan object
 * @returns Formatted string in markdown
 */
export const formatCarePlanForChat = (carePlan: any): string => {
  if (!carePlan) return "I don't have an active care plan yet.";
  
  let markdown = `### My Current Care Plan: ${carePlan.title}\n\n`;
  
  markdown += `**Start Date:** ${new Date(carePlan.start_date).toLocaleDateString()}\n`;
  if (carePlan.end_date) {
    markdown += `**End Date:** ${new Date(carePlan.end_date).toLocaleDateString()}\n`;
  }
  
  markdown += "\n**Weekly Goals:**\n";
  if (carePlan.content.weeklyGoals && carePlan.content.weeklyGoals.length > 0) {
    carePlan.content.weeklyGoals.forEach((goal: string, index: number) => {
      markdown += `${index + 1}. ${goal}\n`;
    });
  }
  
  return markdown;
};

/**
 * Add AI assistant signature to a response
 * @param content Response content
 * @returns Content with signature
 */
export const addAssistantSignature = (content: string): string => {
  // Only add signature if it doesn't already exist
  if (!content.includes("Hanna™")) {
    return content + "\n\n~ Hanna™";
  }
  return content;
};