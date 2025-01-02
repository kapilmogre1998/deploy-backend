const express = require('express');
const router = express.Router();
const Form = require('../schema/formSchema');
const FormBot = require('../schema/formBotSchema');
const authenticateToken = require('../middleware/authenticateToken')

router.get('/get/form-bot/:formBotId', async (req, res) => {
    try {
        const formBotId = req.params.formBotId;

        if (!formBotId) {
            return res.status(400).send("Please provide a valid form bot id");
        }

        const form = await Form.findById(formBotId);

        if (!form) {
            return res.status(400).send("No such form exists");
        }

        return res.status(200).json({ data: form.elements, message: 'success' });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
})

router.post('/submit/form-bot', async (req, res) => {
    try {
        const { formBotId, elements, formDataId } = req.body;

        if (!formBotId) {
            return res.status(400).send({ message: "Please provide a valid form bot id" });
        }

        //find element with the given id and update it's value
        await FormBot.findOneAndUpdate(
            { "formBotData._id": formDataId },
            { $set: { "formBotData.$.elements": elements } },
            { new: true }
        );

        return res.status(200).json({ message: "Submitted successfully" });

    } catch (error) {
        res.status(500).json({ message: 'Something went wrong!' })
    }
})

router.post('/view/count', async (req, res) => {
    try {
        const { formBotId } = req.body;
        let formbot = '';

        if (!formBotId) {
            return res.status(400).send("Please provide a valid form bot id");
        }

        formbot = await FormBot.findOne({formBotId});

        if (!formbot) {
            formbot = await FormBot.create({
                formBotId
            })
        }

        formbot.viewCount = (parseInt(formbot.viewCount) || 0) + 1;

        await formbot.save();

        return res.status(200).json({ sts: 1, message: "Incremented view count" });

    } catch (error) {
        res.status(500).json({ message: 'Something went wrong!' })
    }
})


router.post('/form/start-count', async (req, res) => {
    try {
        const { formBotId, elements } = req.body;
        let formbot = '';
        let lastElementId = '';

        if (!formBotId) {
            return res.status(400).send("Please provide a valid form bot id");
        }

        formbot = await FormBot.findOne({formBotId});

        if (!formbot) {
            formbot = await FormBot.create({
                formBotId,
                formBotData: { elements: [] }
            })

            const lastElementIndex = formbot.formBotData.length - 1;

            lastElementId = formbot.formBotData[lastElementIndex]._id.toString();
        } else {
            if (elements?.length > 0) {

                formbot.formBotData.push({ elements });

                const lastElementIndex = formbot.formBotData.length - 1;

                lastElementId = formbot.formBotData[lastElementIndex]._id.toString();
            }

            await formbot.save();
        }

        formbot.startCount = (parseInt(formbot.startCount) || 0) + 1;

        await formbot.save();

        return res.status(200).json({ sts: 1, message: "Incremented view count", formDataId: lastElementId  });

    } catch (error) {
        res.status(500).json({ message: 'Something went wrong!' })
    }
})

router.get('/form-bot/analytics', authenticateToken,  async (req, res) => {
    try {
        const { formId } = req.query;

        const form = await Form.findOne({formId});

        if(!form){
            return res.status(400).json({ message: 'Please provide valid form Id' })
        }

        const formBotId = form._id.toString();

        if(!formBotId){
            return res.status(400).json({ message: 'FormBot Id is not present' })
        }

        const botData = await FormBot.findOne({formBotId});
        
        if(botData.formBotData.length === 0){
            return res.status(200).json({ message: 'No analytics found for this form yet!', sts: 0, data: { formBotData: [], formBotStructure: form.elements } })
        }

        return res.status(200).json({ message: 'success', data: {formBotData: botData, formBotStrucure: form.elements}, sts: 1 })

    } catch (error) {
        console.log("🚀 ~ router.get ~ error:", error)
        res.status(500).json({ message: 'Something went wrong!' })
    }
})

module.exports = router;