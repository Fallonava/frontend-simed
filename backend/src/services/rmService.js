const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Format RM number to "00-00-00"
const formatRM = (number) => {
    const str = number.toString().padStart(6, '0');
    return `${str.slice(0, 2)}-${str.slice(2, 4)}-${str.slice(4, 6)}`;
};

/**
 * Generate next independent sequential RM number.
 * Uses atomic transaction to prevent race conditions.
 */
const generateNextRM = async () => {
    return await prisma.$transaction(async (tx) => {
        // 1. Get or Create Sequence for 'medical_record'
        let seq = await tx.sequence.findUnique({
            where: { key: 'medical_record' }
        });

        if (!seq) {
            seq = await tx.sequence.create({
                data: { key: 'medical_record', value: 0 }
            });
        }

        // 2. Increment
        const updatedSeq = await tx.sequence.update({
            where: { key: 'medical_record' },
            data: { value: { increment: 1 } }
        });

        // 3. Format
        return formatRM(updatedSeq.value);
    });
};

module.exports = {
    generateNextRM,
    formatRM
};
