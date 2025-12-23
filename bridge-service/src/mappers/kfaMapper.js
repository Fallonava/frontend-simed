/**
 * KFA (Kamus Farmasi dan Alat Kesehatan) Mapper
 * Maps internal drug codes to SATUSEHAT KFA Codes
 */
class KFAMapper {
    constructor() {
        // In a real system, this would be a lookup table in DB or a Redis cache
        // Here we use a dictionary for common drugs as a fallback
        this.mappingTable = {
            'PCM-500': '93000378', // Paracetamol 500mg
            'AMX-500': '93000102', // Amoxicillin 500mg
            'MET-500': '93001824', // Metformin 500mg
            'AML-5': '93000045', // Amlodipine 5mg
            'INS-GL': '93001234', // Insulin Glargine
        };
    }

    /**
     * Get KFA Code from internal code
     */
    getKFACode(internalCode) {
        return this.mappingTable[internalCode] || '93000000'; // Default to generic medical supply
    }

    /**
     * Reverse lookup (if needed)
     */
    getInternalCode(kfaCode) {
        return Object.keys(this.mappingTable).find(key => this.mappingTable[key] === kfaCode);
    }
}

module.exports = new KFAMapper();
