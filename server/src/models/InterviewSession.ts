import mongoose, { Document, Schema } from 'mongoose';

// Interview Session Interface
export interface IInterviewSession extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  sessionType: 'trial' | 'premium';
  company: string;
  position: string;
  duration: number; // in minutes
  creditsUsed: number;
  questions: Array<{
    question: string;
    answer: string;
    timestamp: Date;
    confidence: number;
  }>;
  status: 'active' | 'completed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  feedback?: string;
  rating?: number;
  metadata?: {
    resumeId?: string;
    language?: string;
    simpleEnglish?: boolean;
    extraInstructions?: string;
    aiModel?: string;
    createdFromFlow?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Interview Session Schema
const InterviewSessionSchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionType: {
      type: String,
      enum: ['trial', 'premium'],
      required: true,
    },
    company: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
      maxlength: [100, 'Company name cannot be more than 100 characters'],
    },
    position: {
      type: String,
      required: [true, 'Please provide position title'],
      trim: true,
      maxlength: [100, 'Position title cannot be more than 100 characters'],
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    creditsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
        },
        answer: {
          type: String,
          required: true,
          trim: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        confidence: {
          type: Number,
          min: 0,
          max: 1,
          default: 0.8,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [1000, 'Feedback cannot be more than 1000 characters'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    metadata: {
      resumeId: {
        type: String,
        trim: true,
      },
      language: {
        type: String,
        default: 'English',
        trim: true,
      },
      simpleEnglish: {
        type: Boolean,
        default: false,
      },
      extraInstructions: {
        type: String,
        trim: true,
        maxlength: [1000, 'Extra instructions cannot be more than 1000 characters'],
      },
      aiModel: {
        type: String,
        default: 'gpt-4',
        trim: true,
      },
      createdFromFlow: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate duration before saving
InterviewSessionSchema.pre('save', function (next) {
  if (this.endTime && this.startTime) {
    const endTime = this.endTime as Date;
    const startTime = this.startTime as Date;
    this.duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  }
  next();
});

export default mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
