import mongoose from 'mongoose';

const environmentVariableSchema = new mongoose.Schema(
  {
    // Razorpay
    RAZORPAY_API_KEY: {
      type: String,
      default: '',
      trim: true
    },
    RAZORPAY_SECRET_KEY: {
      type: String,
      default: '',
      trim: true
    },
    
    // Cloudinary
    CLOUDINARY_CLOUD_NAME: {
      type: String,
      default: '',
      trim: true
    },
    CLOUDINARY_API_KEY: {
      type: String,
      default: '',
      trim: true
    },
    CLOUDINARY_API_SECRET: {
      type: String,
      default: '',
      trim: true
    },
    
    // Firebase
    FIREBASE_API_KEY: {
      type: String,
      default: '',
      trim: true
    },
    FIREBASE_AUTH_DOMAIN: {
      type: String,
      default: '',
      trim: true
    },
    FIREBASE_STORAGE_BUCKET: {
      type: String,
      default: '',
      trim: true
    },
    FIREBASE_MESSAGING_SENDER_ID: {
      type: String,
      default: '',
      trim: true
    },
    FIREBASE_APP_ID: {
      type: String,
      default: '',
      trim: true
    },
    FIREBASE_VAPID_KEY: {
      type: String,
      default: '',
      trim: true
    },
    MEASUREMENT_ID: {
      type: String,
      default: '',
      trim: true
    },
    FIREBASE_PROJECT_ID: {
      type: String,
      default: '',
      trim: true
    },
    FIREBASE_CLIENT_EMAIL: {
      type: String,
      default: '',
      trim: true
    },
    FIREBASE_PRIVATE_KEY: {
      type: String,
      default: '',
      trim: true
    },
    FIREBASE_DATABASE_URL: {
      type: String,
      default: '',
      trim: true
    },
    
    // SMTP
    SMTP_HOST: {
      type: String,
      default: '',
      trim: true
    },
    SMTP_PORT: {
      type: String,
      default: '',
      trim: true
    },
    SMTP_USER: {
      type: String,
      default: '',
      trim: true
    },
    SMTP_PASS: {
      type: String,
      default: '',
      trim: true
    },
    
    // SMS Hub India
    SMSINDIAHUB_API_KEY: {
      type: String,
      default: '',
      trim: true
    },
    SMSINDIAHUB_SENDER_ID: {
      type: String,
      default: '',
      trim: true
    },
    
    // Google Maps
    VITE_GOOGLE_MAPS_API_KEY: {
      type: String,
      default: '',
      trim: true
    },
    
    // Metadata
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'environmentvariables'
  }
);

// Create a single document instance (singleton pattern)
environmentVariableSchema.statics.getOrCreate = async function() {
  let envVars = await this.findOne();
  if (!envVars) {
    envVars = await this.create({});
  }
  return envVars;
};

// Method to get all variables as plain object
environmentVariableSchema.methods.toEnvObject = function() {
  const obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.lastUpdatedBy;
  delete obj.lastUpdatedAt;

  return obj;
};

const EnvironmentVariable = mongoose.model('EnvironmentVariable', environmentVariableSchema);

export default EnvironmentVariable;
