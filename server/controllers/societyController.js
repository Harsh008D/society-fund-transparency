const Society = require("../models/society");
const createSociety = async (req, res) => {
    try {
        const { name, address, totalMembers, financialYear } = req.body;

        const society = await Society.create({
            name,
            address,
            totalMembers,
            financialYear
        });

        res.status(201).json({
            message: "Society created successfully",
            society
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getSocieties = async (req, res) => {
    try {
        const societies = await Society.find();

        res.status(200).json(societies);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {createSociety, getSocieties};