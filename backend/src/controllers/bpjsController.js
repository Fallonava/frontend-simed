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
        // Pass all parameters including is_igd, is_kll, tgl_sep_custom
        const result = await bpjsService.insertSEP(req.body);

        // Log if successful (Optional: Add to Sep table)
        // For now just return result

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create SEP' });
    }
};

exports.checkFingerprint = async (req, res) => {
    const { patientId } = req.params;
    try {
        const result = await bpjsService.checkFingerprint(patientId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createInternalReferral = async (req, res) => {
    try {
        const result = await bpjsService.insertInternalReferral(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
