const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const FormData = require('form-data');
const stream = require('stream');

exports.analyzeDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // 1. Fetch document from DB
        const document = await prisma.document.findFirst({
            where: { id: parseInt(id), userId: userId }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // 2. Prepare file for Python API
        const formData = new FormData();
        const bufferStream = new stream.PassThrough();
        bufferStream.end(document.data);

        formData.append('file', bufferStream, {
            filename: document.fileName,
            contentType: document.fileType,
        });

        // 3. Call Python AI Engine
        const aiHeaders = {
            ...formData.getHeaders(),
            'x-ai-provider': req.headers['x-ai-provider'] || 'gemini',
            'x-ai-api-key': req.headers['x-ai-api-key'] || '',
            'x-ai-model': req.headers['x-ai-model'] || ''
        };

        const aiResponse = await axios.post('http://localhost:8000/analyze', formData, {
            headers: aiHeaders
        });

        // 4. Return result
        res.status(200).json(aiResponse.data);

    } catch (error) {
        console.error('Error analyzing document:', error.message);
        if (error.response) {
            console.error('AI Service Error:', error.response.data);
        }
        res.status(500).json({ message: 'Error analyzing document' });
    }
};

exports.analyzeImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const userId = req.user.id;

        // 1. Prepare/Proxy file for Python API
        const formData = new FormData();
        // req.file.buffer contains the file data from multer memory storage
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // 2. Call Python AI Engine
        const aiHeaders = {
            ...formData.getHeaders(),
            'x-ai-provider': req.headers['x-ai-provider'] || 'gemini',
            'x-ai-api-key': req.headers['x-ai-api-key'] || '',
            'x-ai-model': req.headers['x-ai-model'] || ''
        };

        const aiResponse = await axios.post('http://localhost:8000/analyze', formData, {
            headers: aiHeaders
        });

        const analysisData = aiResponse.data;

        // 3. Gamification Logic
        // count words in simplified_text
        const wordCount = analysisData.simplified_text ? analysisData.simplified_text.split(/\s+/).length : 0;
        const xpGain = 10; // fixed xp for page processed

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (user) {
            let newXp = user.xp + xpGain;
            let newWords = user.totalWordsRead + wordCount;
            let newLevel = user.level;

            if (newXp >= newLevel * 500) {
                newLevel += 1;
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    xp: newXp,
                    totalWordsRead: newWords,
                    level: newLevel
                }
            });

            // 4. Return result + stats
            res.status(200).json({
                ...analysisData,
                userStats: {
                    xp: updatedUser.xp,
                    level: updatedUser.level,
                    totalWordsRead: updatedUser.totalWordsRead,
                    xpGained: xpGain
                }
            });
        } else {
            res.status(200).json(analysisData);
        }

    } catch (error) {
        console.error('Error analyzing image:', error.message);
        if (error.response) {
            console.error('AI Service Error:', error.response.data);
        }
        res.status(500).json({ message: 'Error analyzing image' });
    }
};

exports.simplifyText = async (req, res) => {
    // legacy support or direct text input
    try {
        const { text } = req.body;
        const response = await axios.post('http://localhost:8000/simplify', { text });
        res.json(response.data);
    } catch (error) {
        console.error('Error simplifying text:', error);
        res.status(500).json({ message: 'Error simplifying text' });
    }
};

// test api key validation
exports.testApiKey = async (req, res) => {
    try {
        const provider = req.headers['x-ai-provider'] || 'gemini';
        const apiKey = req.headers['x-ai-api-key'];

        if (!apiKey) {
            return res.status(400).json({ valid: false, error: 'No API key provided' });
        }

        // create a simple test image (1x1 pixel png)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        const testImageBuffer = Buffer.from(testImageBase64, 'base64');

        const formData = new FormData();
        formData.append('file', testImageBuffer, {
            filename: 'test.png',
            contentType: 'image/png'
        });

        // test the api key with python service
        const aiHeaders = {
            ...formData.getHeaders(),
            'x-ai-provider': provider,
            'x-ai-api-key': apiKey
        };

        const aiResponse = await axios.post('http://localhost:8000/analyze', formData, {
            headers: aiHeaders,
            timeout: 10000 // 10 second timeout
        });

        // if we get here without error, the key is valid
        if (aiResponse.data && !aiResponse.data.error) {
            return res.status(200).json({ valid: true, message: 'API key is valid' });
        } else {
            return res.status(200).json({ valid: false, error: aiResponse.data.error || 'Invalid API key' });
        }

    } catch (error) {
        console.error('API Key Test Error:', error.message);

        // check if it's an api key error
        if (error.response && error.response.data) {
            const errorMsg = error.response.data.error || error.response.data.chunked_text || 'Invalid API key';
            return res.status(200).json({ valid: false, error: errorMsg });
        }

        return res.status(200).json({ valid: false, error: 'Failed to validate API key' });
    }
};
