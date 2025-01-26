const router = require('express').Router();
const News = require('../models/News');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all news
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, status, search } = req.query;
        const query = {};
        
        if (category) query.category = category;
        if (status) query.assessment = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const news = await News.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('author', 'username');

        const count = await News.countDocuments(query);

        res.json({
            news,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            hasMore: page * limit < count
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create news
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const newsData = {
            ...req.body,
            author: req.user.id,
            imageUrl: req.file ? req.file.path : null,
            cloudinaryId: req.file ? req.file.filename : null
        };

        const news = new News(newsData);
        await news.save();
        res.status(201).json(news);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get single news
router.get('/:id', async (req, res) => {
    try {
        const news = await News.findById(req.params.id)
            .populate('author', 'username');
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update news
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        if (news.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.imageUrl = req.file.path;
            updateData.cloudinaryId = req.file.filename;
        }

        const updatedNews = await News.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json(updatedNews);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete news
router.delete('/:id', auth, async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        if (news.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await news.remove();
        res.json({ message: 'News deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
