const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.uploadDocument = async (req, res) => {
    try {
        const { originalname, mimetype, buffer } = req.file;
        const userId = req.user.id;
        const documentCount = await prisma.document.count({
            where: { userId: userId }
        });

        if (documentCount >= 3) {
            return res.status(400).json({ message: 'Upload limit reached. Maximum 3 documents allowed.' });
        }

        const document = await prisma.document.create({
            data: {
                fileName: originalname,
                fileType: mimetype,
                data: buffer,
                userId: userId
            }
        });

        res.status(201).json({ message: 'Document uploaded successfully', document: { id: document.id, fileName: document.fileName, uploadDate: document.uploadDate } });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Error uploading document' });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const documents = await prisma.document.findMany({
            where: { userId: userId },
            select: {
                id: true,
                fileName: true,
                uploadDate: true
            },
            orderBy: {
                uploadDate: 'desc'
            }
        });
        res.status(200).json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Error fetching documents' });
    }
};

exports.getDocumentById = async (req, res) => {
    try {
        const documentId = parseInt(req.params.id);
        const userId = req.user.id;

        const document = await prisma.document.findFirst({
            where: { id: documentId, userId: userId },
            select: { id: true, fileName: true, uploadDate: true, lastPage: true }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ message: 'Error fetching document' });
    }
};

exports.getDocumentContent = async (req, res) => {
    try {
        const documentId = parseInt(req.params.id);
        const userId = req.user.id;

        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                userId: userId
            }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.setHeader('Content-Type', document.fileType);
        res.setHeader('Content-Disposition', `attachment; filename=${document.fileName}`);
        res.send(document.data);

    } catch (error) {
        console.error('Error fetching document content:', error);
        res.status(500).json({ message: 'Error fetching document content' });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const documentId = parseInt(req.params.id);
        const userId = req.user.id;
        console.log(`Delete request for doc ID: ${documentId} by user ID: ${userId}`);

        // verify ownership before deleting
        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                userId: userId
            }
        });

        if (!document) {
            console.log("Document not found or unauthorized");
            return res.status(404).json({ message: 'Document not found or unauthorized' });
        }

        await prisma.document.delete({
            where: {
                id: documentId
            }
        });

        console.log("Document deleted successfully");
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Error deleting document' });
    }
};

exports.updateProgress = async (req, res) => {
    try {
        const documentId = parseInt(req.params.id);
        const { pageNumber } = req.body;
        const userId = req.user.id;

        const document = await prisma.document.findFirst({
            where: { id: documentId, userId: userId }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const updatedDoc = await prisma.document.update({
            where: { id: documentId },
            data: { lastPage: pageNumber }
        });

        res.json({ message: 'Progress updated', lastPage: updatedDoc.lastPage });

    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ message: 'Error updating progress' });
    }
};
