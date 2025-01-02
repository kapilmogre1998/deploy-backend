const app = require('./app');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./db/config');

const port = process.env.PORT || 8001;

app.listen(port, async () => {
    console.log(`listening to port ${port}`);
    await connectDB();
})