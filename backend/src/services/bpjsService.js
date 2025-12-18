// Mock Service for BPJS V-Claim Simulation
// In production, this would use axios with proper Headers (X-Consid-ID, X-Signature)

const checkKepesertaanByNIK = async (nik) => {
    // Simulate API Latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock Logic
    if (nik === '1234567890123456') {
        return {
            status: 'OK',
            data: {
                nama: 'BUDI SANTOSO (DUMMY)',
                nik: nik,
                noKartu: '000123456789',
                sex: 'L',
                tglLahir: '1990-01-01',
                statusPeserta: {
                    kode: '0',
                    keterangan: 'AKTIF'
                },
                jenisPeserta: {
                    kode: '1',
                    keterangan: 'PBI (APBN)'
                },
                kelasTanggungan: {
                    kode: '3',
                    keterangan: 'KELAS III'
                }
            }
        };
    } else if (nik === '0000000000000000') {
        return {
            status: 'FAILED',
            message: 'Peserta Tidak Ditemukan'
        };
    } else {
        // Random OK for other inputs for demo purpose
        return {
            status: 'OK',
            data: {
                nama: 'PESERTA SIMULASI',
                nik: nik,
                noKartu: '000987654321',
                sex: 'P',
                tglLahir: '1985-05-20',
                statusPeserta: {
                    kode: '0',
                    keterangan: 'AKTIF'
                },
                jenisPeserta: {
                    kode: '2',
                    keterangan: 'PEKERJA MANDIRI'
                },
                kelasTanggungan: {
                    kode: '1',
                    keterangan: 'KELAS I'
                }
            }
        };
    }
};

module.exports = {
    checkKepesertaanByNIK
};
