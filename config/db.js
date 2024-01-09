import mongoose from 'mongoose';

const connectDb = async () => {
  try {
    // eslint-disable-next-line no-undef
    await mongoose.connect(
      // eslint-disable-next-line no-undef
      process.env.APP_MONGO_URL || 'mongodb://localhost:27017/standard-clone'
    );
    console.log('Database connected...');
  } catch (error) {
    console.log('Error->', error);
  }
};

export default connectDb;
