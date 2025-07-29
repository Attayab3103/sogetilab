import { Request, Response } from 'express';
// Session management is disabled. All endpoints return 501 Not Implemented.
export const createSession = async (_req: Request, res: Response) => res.status(501).json({ success: false, message: 'Session management is disabled.' });
export const getSessions = async (_req: Request, res: Response) => res.status(501).json({ success: false, message: 'Session management is disabled.' });
export const getSession = async (_req: Request, res: Response) => res.status(501).json({ success: false, message: 'Session management is disabled.' });
export const updateSession = async (_req: Request, res: Response) => res.status(501).json({ success: false, message: 'Session management is disabled.' });
export const deleteSession = async (_req: Request, res: Response) => res.status(501).json({ success: false, message: 'Session management is disabled.' });
export const addQuestionToSession = async (_req: Request, res: Response) => res.status(501).json({ success: false, message: 'Session management is disabled.' });
export const getQuestions = async (_req: Request, res: Response) => res.status(501).json({ success: false, message: 'Session management is disabled.' });
export const completeSession = async (_req: Request, res: Response) => res.status(501).json({ success: false, message: 'Session management is disabled.' });
