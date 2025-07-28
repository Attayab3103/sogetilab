import { Request, Response } from 'express';
import Resume from '../models/Resume';

// @desc    Get all resumes for logged in user
// @route   GET /api/resumes
// @access  Private
export const getResumes = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const resumes = await Resume.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error: any) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
export const getResume = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error: any) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
export const createResume = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Add user to req.body
    req.body.userId = req.user._id;

    // Validate required fields
    const { title, personalDetails } = req.body;
    if (!title || !personalDetails?.name || !personalDetails?.email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and personal details (name, email)',
      });
    }

    const resume = await Resume.create(req.body);

    res.status(201).json({
      success: true,
      data: resume,
    });
  } catch (error: any) {
    console.error('Create resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
export const updateResume = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    let resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error: any) {
    console.error('Update resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    await Resume.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Set default resume
// @route   PUT /api/resumes/:id/default
// @access  Private
export const setDefaultResume = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Set this resume as default (pre-save middleware will handle others)
    resume.isDefault = true;
    await resume.save();

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error: any) {
    console.error('Set default resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
