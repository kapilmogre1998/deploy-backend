const express = require("express");
const router = express.Router();
const Folder = require('../schema/folderSchema');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/all/folders', authenticateToken, async (req, res) => {
    try {
        const userId = req.query.id;

        if (!userId) {
            console.log(userId);
            return res.status(400).json('UserId is not present.')
        }

        const folderList = await Folder.findOne({ owner: userId })

        if (!folderList) {
            return res.status(200).json({ message: 'No folders found.', data: [] })
        }

        res.status(200).json({ data: folderList, message: 'Folders fetched successfully' })
    } catch (error) {
        console.log(error, 'fetach all');
        res.status(500).json({ message: 'Something went wrong' })
    }
})

router.post('/create/folder', authenticateToken, async (req, res) => {
    try {
        const { folderName, userId } = req.body;

        const folderExists = await Folder.findOne({ owner: userId, "folders.folderName": folderName })

        if (folderExists) {
            return res.status(200).json({ message: 'Folder already exists' })
        }

        await Folder.findOneAndUpdate(
            { owner: userId },
            { $addToSet: { folders: { folderName, forms: [] } } },
            { new: true, upsert: true }
        );

        res.status(200).send({ message: 'Folder created successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" })
    }
})

router.post('/delete/folder', authenticateToken, async (req, res) => {
    try {
        const { userId, folderId } = req.body;

        const folderList = await Folder.findOne({ owner: userId, 'folders._id': folderId });

        const folderExists = folderList.folders.find(f => f._id.toString() === folderId);

        if (!folderExists) {
            return res.status(400).json({ message: `Folder doesn't exists.` })
        }

        // Delete the folder
        const result = await Folder.updateOne(
            { owner: userId },
            { $pull: { folders: { _id: folderId } } }
        );

        // Check if deletion was successful
        if (result.deletedCount === 0) {
            return res.status(400).json({ message: "Folder could not be deleted." });
        }

        res.status(200).send({ message: 'Folder is deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
})

router.post('/create/new-form', authenticateToken, async (req, res) => {
    const { name, folderId, userId, folderName = 'NO_FOLDER' } = req.body;

    try {
        if (folderId) {
            const folder = await Folder.findOne({ owner: userId, 'folders._id': folderId });

            if (!folder) {
                return res.status(400).json({ message: 'Folder does not exist.' });
            }

            const foundFolder = folder.folders.find(f => f._id.toString() === folderId);

            if (!foundFolder) {
               return res.status(400).json({ message: 'Folder with specified ID not found inside folders array.' });
            }

            // Check if the form name already exists in the existing forms
            const existingForm = foundFolder.forms.find(form => form.formName === name);

            if (existingForm) {
               return res.status(200).json({ message: 'Form name already exists' });
            }

            // Add the new form to the forms array in foundFolder
            foundFolder.forms.push({
                formName: name,
                owner: userId,
                createdAt: new Date()
            });

            await folder.save();
        } else {
                await Folder.findOneAndUpdate(
                    { owner: userId },
                    { $addToSet: { folders: { folderName, forms: [{ formName: name, owner: userId, createdAt: new Date() }] } } },
                    { new: true, upsert: true }
                );
        }

        res.status(200).json({ message: 'Form added successfully' });
    } catch (error) {
        console.log("🚀 ~ router.post ~ error:", error)
        res.status(500).json({ message: "Something went wrong" })
    }
})

router.post('/delete/form', authenticateToken, async (req, res) => {
    try {
        const { formId, folderId, userId } = req.body;

        const folderList = await Folder.findOne({ owner: userId, 'folders._id': folderId });

        const folderExists = folderList.folders.find(f => f._id.toString() === folderId);

        if (!folderExists) {
            return res.status(400).json({ message: `Folder doesn't exists.` })
        }

        folderExists.forms = folderExists.forms.filter(form => form._id.toString() !== formId);

        // Check if the folder is "NO_FOLDER" and its forms list is empty
        if (folderExists.folderName === "NO_FOLDER" && folderExists.forms.length === 0) {
            // Remove the folder from the folders array
            folderList.folders = folderList.folders.filter(f => f._id.toString() !== folderId);
        }

        // // Save the updated folder document
        await folderList.save();

        res.status(200).send({ message: 'Form is deleted successfully' })
    } catch (error) {
        console.log("🚀 ~ router.post ~ error:", error)
        res.status(500).json({ message: "Something went wrong" })
    }
})

module.exports = router;