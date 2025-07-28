import { useState, useCallback } from 'react';
import { openRouterService, type AIRequest, type AIResponse as ServiceAIResponse } from '../services/openRouterService';
import type { AIResponse } from '../types';

export interface UseAIResponseOptions {
  resume?: string;
  jobRole?: string;
  platform?: string;
  model?: 'gpt-4' | 'claude-3.5' | 'gpt-3.5-turbo';
}

export const useAIResponse = (options: UseAIResponseOptions = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generateResponse = useCallback(async (question: string): Promise<AIResponse | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const request: AIRequest = {
        question,
        resume: options.resume,
        jobRole: options.jobRole,
        context: options.platform ? `This is a ${options.platform} interview session.` : undefined,
        model: options.model || 'gpt-4'
      };

      const aiResult: ServiceAIResponse = await openRouterService.generateResponse(request);
      
      const response: AIResponse = {
        id: Date.now().toString(),
        timestamp: new Date(),
        question,
        answer: aiResult.answer,
        model: options.model || 'gpt-4',
        confidence: aiResult.confidence,
        categories: ['Interview Response'],
        isUsed: false
      };

      setResponses(prev => [...prev, response]);
      setCurrentResponse(response.answer);
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI response';
      setError(errorMessage);
      console.error('AI Response Error:', err);
      
      // Return fallback response
      const fallbackResponse: AIResponse = {
        id: Date.now().toString(),
        timestamp: new Date(),
        question,
        answer: `I understand you're asking about "${question}". Let me provide a thoughtful response based on my experience and qualifications for this role.`,
        model: options.model || 'gpt-4',
        confidence: 0.5,
        categories: ['Fallback Response'],
        isUsed: false
      };

      setResponses(prev => [...prev, fallbackResponse]);
      setCurrentResponse(fallbackResponse.answer);
      
      return fallbackResponse;
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  const generateCodingResponse = useCallback(async (question: string, language: string = 'javascript'): Promise<AIResponse | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const aiResult: ServiceAIResponse = await openRouterService.generateCodingResponse(question, language);
      
      const response: AIResponse = {
        id: Date.now().toString(),
        timestamp: new Date(),
        question,
        answer: aiResult.answer,
        model: 'gpt-4',
        confidence: aiResult.confidence,
        categories: ['Coding', 'Technical'],
        isUsed: false
      };

      setResponses(prev => [...prev, response]);
      setCurrentResponse(response.answer);
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate coding response';
      setError(errorMessage);
      console.error('Coding Response Error:', err);
      
      // Return fallback response
      const fallbackResponse: AIResponse = {
        id: Date.now().toString(),
        timestamp: new Date(),
        question,
        answer: `For this coding question: "${question}", I would start by understanding the problem requirements, then design an algorithm considering time and space complexity, and finally implement a clean, efficient solution in ${language}.`,
        model: 'gpt-4',
        confidence: 0.5,
        categories: ['Coding', 'Fallback'],
        isUsed: false
      };

      setResponses(prev => [...prev, fallbackResponse]);
      setCurrentResponse(fallbackResponse.answer);
      
      return fallbackResponse;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearResponses = useCallback(() => {
    setResponses([]);
    setCurrentResponse('');
    setError(null);
  }, []);

  const markResponseAsUsed = useCallback((responseId: string) => {
    setResponses(prev => 
      prev.map(response => 
        response.id === responseId 
          ? { ...response, isUsed: true }
          : response
      )
    );
  }, []);

  return {
    isProcessing,
    responses,
    currentResponse,
    error,
    generateResponse,
    generateCodingResponse,
    clearResponses,
    markResponseAsUsed
  };
};
