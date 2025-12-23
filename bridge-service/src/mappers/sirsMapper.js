const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SIRSMapper {
    /**
     * RL3: Pelayanan Rawat Inap (Service Indicators)
     */
    static async calculateRL3(month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of month
        const daysInMonth = endDate.getDate();

        // 1. Total Beds
        const totalBeds = await prisma.bed.count({
            where: { status: { not: 'MTC' } } // Exclude maintenance
        });

        // 2. Admissions in this period
        const admissions = await prisma.admission.findMany({
            where: {
                check_in: { lte: endDate },
                OR: [
                    { check_out: null },
                    { check_out: { gte: startDate } }
                ]
            }
        });

        // Calculate Inpatient Days (Hari Rawat)
        let totalInpatientDays = 0;
        let totalDischarges = 0;
        let totalDeaths = 0;
        let deathsOver48h = 0;

        admissions.forEach(adm => {
            const stayStart = adm.check_in < startDate ? startDate : adm.check_in;
            const stayEnd = !adm.check_out || adm.check_out > endDate ? endDate : adm.check_out;

            const diffTime = Math.abs(stayEnd - stayStart);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            totalInpatientDays += diffDays;

            if (adm.status === 'DISCHARGED' && adm.check_out >= startDate && adm.check_out <= endDate) {
                totalDischarges++;

                // Track mortality from medical records link (disposition)
                // In a real system, we'd check MedicalRecord or Admission note
                if (adm.notes?.toLowerCase().includes('meninggal')) {
                    totalDeaths++;
                    const hoursAlive = Math.abs(adm.check_out - adm.check_in) / (1000 * 60 * 60);
                    if (hoursAlive >= 48) deathsOver48h++;
                }
            }
        });

        // Calculations
        const bor = (totalInpatientDays / (totalBeds * daysInMonth)) * 100;
        const alos = totalDischarges > 0 ? (totalInpatientDays / totalDischarges) : 0;
        const bto = totalBeds > 0 ? (totalDischarges / totalBeds) : 0;
        const toi = totalDischarges > 0 ? (((totalBeds * daysInMonth) - totalInpatientDays) / totalDischarges) : 0;
        const ndr = totalDischarges > 0 ? (deathsOver48h / totalDischarges) * 1000 : 0;
        const gdr = totalDischarges > 0 ? (totalDeaths / totalDischarges) * 1000 : 0;

        return {
            report_type: 'RL3',
            month,
            year,
            metrics: {
                total_beds: totalBeds,
                total_inpatient_days: totalInpatientDays,
                total_discharges: totalDischarges,
                bor: parseFloat(bor.toFixed(2)),
                alos: parseFloat(alos.toFixed(2)),
                bto: parseFloat(bto.toFixed(2)),
                toi: parseFloat(toi.toFixed(2)),
                ndr: parseFloat(ndr.toFixed(2)),
                gdr: parseFloat(gdr.toFixed(2))
            }
        };
    }

    /**
     * RL4: Morbiditas Pasien (Top 10 Diseases)
     */
    static async calculateRL4(month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const topDiseases = await prisma.medicalRecord.groupBy({
            by: ['icd10_code'],
            _count: {
                icd10_code: true
            },
            where: {
                visit_date: {
                    gte: startDate,
                    lte: endDate
                },
                icd10_code: { not: null }
            },
            orderBy: {
                _count: {
                    icd10_code: 'desc'
                }
            },
            take: 10
        });

        // Get ICD names
        const enrichedDiseases = await Promise.all(topDiseases.map(async (d) => {
            const icd = await prisma.iCD10.findUnique({ where: { code: d.icd10_code } });
            return {
                code: d.icd10_code,
                name: icd?.name || 'Unknown',
                count: d._count.icd10_code
            };
        }));

        return {
            report_type: 'RL4',
            month,
            year,
            data: enrichedDiseases
        };
    }

    /**
     * RL2: Ketenagaan (HR Staffing)
     */
    static async calculateRL2() {
        const staff = await prisma.employee.groupBy({
            by: ['role'],
            _count: {
                id: true
            }
        });

        return {
            report_type: 'RL2',
            timestamp: new Date().toISOString(),
            data: staff.map(s => ({
                category: s.role,
                count: s._count.id
            }))
        };
    }
}

module.exports = SIRSMapper;
