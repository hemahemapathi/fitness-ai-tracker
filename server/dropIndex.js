import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
await mongoose.connection.collection('goals').dropIndex('userId_1');
console.log('Index dropped successfully');
await mongoose.disconnect();
process.exit(0);
