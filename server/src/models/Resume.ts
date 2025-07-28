import mongoose, { Document, Schema } from 'mongoose';

// Education Interface
interface IEducation {
  school: string;
  degree: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  description: string;
}

// Experience Interface
interface IExperience {
  company: string;
  position: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  description: string;
}

// Other Experience Interface
interface IOtherExperience {
  title: string;
  description: string;
}

// Personal Details Interface
interface IPersonalDetails {
  name: string;
  email: string;
  address: string;
  phone: string;
}

// Resume Interface
export interface IResume extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  personalDetails: IPersonalDetails;
  introduction: string;
  education: IEducation[];
  experience: IExperience[];
  otherExperience: IOtherExperience[];
  skills: string[];
  languages: string[];
  isDefault: boolean;
  originalFileName?: string;
  parsedFromPdf: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Resume Schema
const ResumeSchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a resume title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    personalDetails: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    introduction: {
      type: String,
      trim: true,
      maxlength: [1000, 'Introduction cannot be more than 1000 characters'],
    },
    education: [
      {
        school: {
          type: String,
          required: true,
          trim: true,
        },
        degree: {
          type: String,
          required: true,
          trim: true,
        },
        timeStart: {
          type: String,
          required: true,
        },
        timeEnd: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
    experience: [
      {
        company: {
          type: String,
          required: true,
          trim: true,
        },
        position: {
          type: String,
          required: true,
          trim: true,
        },
        timeStart: {
          type: String,
          required: true,
        },
        timeEnd: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
    otherExperience: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
    originalFileName: {
      type: String,
      trim: true,
    },
    parsedFromPdf: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one default resume per user
ResumeSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Set all other resumes for this user to not default
    await mongoose.model('Resume').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

export default mongoose.model<IResume>('Resume', ResumeSchema);
