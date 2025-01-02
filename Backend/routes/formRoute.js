const express = require('express');
const router = express.Router();
const Form = require('../schema/formSchema');
const Folder = require('../schema/folderSchema');
const authenticateToken = require('../middleware/authenticateToken')

router.post('/create/form-workspace', authenticateToken, async (req, res) => {
    try {
        const { folderId, formName, userId, list, formId } = req.body;

        const folderList = await Folder.findOne({ owner: userId, 'folders._id': folderId });

        const existingFolder = folderList.folders.find(f => f._id.toString() === folderId);

        if (!existingFolder) {
            return res.status(200).json({ message: 'Folder not found' });
        }

        let form;

        form = await Form.findOne({ formId });

        if(form) {
            form.formName = formName;
            form.elements = list;

            await form.save();
        } else {
            form = await Form.create({
                folder: folderId,
                owner: userId,
                formName,
                formId,
                elements: list
            })
        }

        const formIndex = existingFolder.forms.findIndex(form => form._id.toString() === formId);

        if (formIndex === -1) {
            return res.status(404).json({ message: 'Form not found in the folder' });
        }

        existingFolder.forms[formIndex].formName = formName;

        await folderList.save();

        res.status(200).json({ message: 'success', formBotId: form._id.toString() })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong!" })
    }
})

router.get('/get/form-workspace', authenticateToken, async(req, res) => {
    try {
        const { folderId, formId, ownerId } = req.query;

        const folderList = await Folder.findOne({ owner: ownerId, 'folders._id': folderId });

        const existingFolder = folderList.folders.find(f => f._id.toString() === folderId);

        if (!existingFolder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        const form = await  Form.findOne({ formId });

        if (!form) {
            return res.status(200).json({ message: 'Form not found', data: {} });
        }

        res.status(200).json({ data: {elements: form.elements, formName: form.formName, formBotId: form._id.toString()}, message: 'success' });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
})

module.exports = router;