const express = require('express');
const URL = require('./models/url');
const app = express();
const { connectTOMongoDB } = require('./connect');
const urlRoute = require('./routes/url');
const path = require('path');

const PORT = process.env.PORT || 8001;

connectTOMongoDB('mongodb://127.0.0.1:27017/short-url')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

app.set("view engine","ejs");
app.set('views',path.resolve("./views"));
app.use(express.json());

app.get('/test',async (req,res)=>{
    const allUrls=await URL.find({});
    return res.end(`
        <html>
        <head></head>
        <body>
        <ol>
        ${allUrls.map(url=>`<li>${url.shortId}-${url.redirectURL}-${url.visitHistory.length}</li>`).join('')};
        </ol>
        </body>
        </html>
        `);
});//server side render by adarsh

app.use('/url', urlRoute);

app.get('/url/:shortId', async (req, res) => {
    const shortId = req.params.shortId;

    try {
        const entry = await URL.findOneAndUpdate(
            { shortId },
            { $push: { visitHistory: { timeStamp: Date.now() } } },
            { new: true } //  updated document
        );

        if (!entry) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        res.redirect(entry.redirectURL);
    } catch (error) {
        console.error('Error in URL redirection:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Listening at http://localhost:${PORT}`);
}).on('error', (error) => {
    console.error('Server error:', error);
});
