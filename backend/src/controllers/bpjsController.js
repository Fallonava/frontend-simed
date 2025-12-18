const bpjsService = require('../services/bpjsService');

exports.checkParticipant = async (req, res) => {
    const { nik } = req.body;

    if (!nik) {
        return res.status(400).json({ error: 'NIK is required' });
    }

    try {
        const result = await bpjsService.checkKepesertaanByNIK(nik);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check participation status' });
    }
};

exports.createSEP = async (req, res) => {
    try {
        const result = await bpjsService.insertSEP(req.body);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create SEP' });
    }
};
