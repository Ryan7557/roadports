const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        const dbconnection = await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log(`MongoDB successfully connected ${dbconnection.connection.host}`);

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB Disconnected')
        });

    } catch (error) {
        console.error(`MongoDB Connection Error, ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;