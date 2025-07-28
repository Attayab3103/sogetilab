import { Request, Response } from 'express';
import InterviewSession from '../models/InterviewSession.js';
import Resume from '../models/Resume.js';

// @desc    Create a new interview session
// @route   POST /api/sessions
// @access  Private
export const createSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const {
      sessionType,
      company,
      position,
      resumeId,
      language,
      simpleEnglish,
      extraInstructions,
      aiModel
    } = req.body;

    // Validate required fields
    if (!company || !position) {
      return res.status(400).json({
        success: false,
        message: 'Company and position are required',
      });
    }

    // Validate resume exists if provided
    if (resumeId) {
      const resume = await Resume.findOne({
        _id: resumeId,
        userId: req.user._id,
      });

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found',
        });
      }
    }

    // Create session with extended data
    const sessionData = {
      userId: req.user._id,
      sessionType: sessionType || 'trial',
      company: company.trim(),
      position: position.trim(),
      status: 'active',
      startTime: new Date(),
      creditsUsed: sessionType === 'trial' ? 0 : 1,
      questions: [],
      // Store modal flow data as metadata
      metadata: {
        resumeId: resumeId || null,
        language: language || 'English',
        simpleEnglish: simpleEnglish || false,
        extraInstructions: extraInstructions || '',
        aiModel: aiModel || 'gpt-4',
        createdFromFlow: true
      }
    };

    const session = await InterviewSession.create(sessionData);

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all sessions for logged in user
// @route   GET /api/sessions
// @access  Private
export const getSessions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const sessions = await InterviewSession.find({ userId: req.user._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error: any) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Private
export const getSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('userId', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update session (add questions, end session, etc.)
// @route   PUT /api/sessions/:id
// @access  Private
export const updateSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const { question, answer, confidence, status, feedback, rating } = req.body;

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    // Add question/answer if provided
    if (question && answer) {
      session.questions.push({
        question,
        answer,
        timestamp: new Date(),
        confidence: confidence || 0.8,
      });
    }

    // Update status if provided
    if (status) {
      session.status = status;
      if (status === 'completed' || status === 'cancelled') {
        session.endTime = new Date();
        session.duration = Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000);
      }
    }

    // Add feedback if provided
    if (feedback) session.feedback = feedback;
    if (rating) session.rating = rating;

    const updatedSession = await session.save();

    res.status(200).json({
      success: true,
      data: updatedSession,
    });
  } catch (error: any) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private
export const deleteSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    await session.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Add question and answer to session
// @route   POST /api/sessions/:id/questions
// @access  Private
export const addQuestionToSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const { question, answer, confidence } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required',
      });
    }

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    // Add question to session
    session.questions.push({
      question: question.trim(),
      answer: answer.trim(),
      timestamp: new Date(),
      confidence: confidence || 0.8,
    });

    const updatedSession = await session.save();

    res.status(200).json({
      success: true,
      data: updatedSession,
    });
  } catch (error: any) {
    console.error('Add question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get questions from a session
// @route   GET /api/sessions/:id/questions
// @access  Private
export const getQuestions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    res.status(200).json({
      success: true,
      data: session.questions,
    });
  } catch (error: any) {
    console.error('Get questions from session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Complete session
// @route   PUT /api/sessions/:id/complete
// @access  Private
export const completeSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const { status, endTime, duration } = req.body;

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    // Update session completion
    session.status = status || 'completed';
    session.endTime = endTime ? new Date(endTime) : new Date();
    session.duration = duration || 0;

    const updatedSession = await session.save();

    res.status(200).json({
      success: true,
      data: updatedSession,
    });
  } catch (error: any) {
    console.error('Complete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
