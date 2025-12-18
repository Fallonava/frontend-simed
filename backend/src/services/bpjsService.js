// Mock Service for BPJS V-Claim Simulation
// In production, this would use axios with proper Headers (X-Consid-ID, X-Signature)

// MOCK DATA DICTIONARY
const MOCK_DB = {
    '1000000000000001': { // KASUS 1: AKTIF - PBI (Kelas 3)
        nama: 'BUDI SANTOSO (PBI)',
        noKartu: '000123456001',
        sex: 'L',
        tglLahir: '1980-01-01',
        statusPeserta: { kode: '0', keterangan: 'AKTIF' },
        jenisPeserta: { kode: '1', keterangan: 'PBI (APBN)' },
        kelasTanggungan: { kode: '3', keterangan: 'KELAS III' }
    },
    '1000000000000002': { // KASUS 2: AKTIF - MANDIRI (Kelas 1)
        nama: 'SITI AMINAH (MANDIRI)',
        noKartu: '000123456002',
        sex: 'P',
        tglLahir: '1995-05-20',
        statusPeserta: { kode: '0', keterangan: 'AKTIF' },
        jenisPeserta: { kode: '2', keterangan: 'PEKERJA MANDIRI' },
        kelasTanggungan: { kode: '1', keterangan: 'KELAS I' }
    },
    '1000000000000003': { // KASUS 3: NON-AKTIF (Tunggakan)
        nama: 'A. YANI (TUNGGAKAN)',
        noKartu: '000123456003',
        sex: 'L',
        tglLahir: '1975-08-17',
        statusPeserta: { kode: '1', keterangan: 'NON-AKTIF (TUNGGAKAN)' }, // Kode 1 usually issue
        jenisPeserta: { kode: '2', keterangan: 'PEKERJA MANDIRI' },
        kelasTanggungan: { kode: '2', keterangan: 'KELAS II' }
    },
    '1000000000000004': { // KASUS 4: DATA TIDAK LENGKAP
        nama: 'TEST DATA ERROR',
        noKartu: '000123456004',
        sex: 'L',
        tglLahir: '2000-01-01',
        statusPeserta: { kode: '0', keterangan: 'AKTIF' },
        jenisPeserta: { kode: '1', keterangan: 'PBI' },
        kelasTanggungan: { kode: '3', keterangan: 'KELAS III' }
    }
};

const checkKepesertaanByNIK = async (nik) => {
    // Simulate API Latency (Random 500ms - 1500ms)
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const participant = MOCK_DB[nik];

    if (participant) {
        return {
            status: 'OK',
            data: participant
        };
    } else if (nik === '0000000000000000') {
        return {
            status: 'FAILED',
            message: 'Peserta Tidak Ditemukan'
        };
    } else {
        // Fallback for random NIK - Treats as New Active Patient
        return {
            status: 'OK',
            data: {
                nama: `PASIEN BARU (${nik.slice(-4)})`,
                nik: nik,
                noKartu: `000${nik.slice(0, 9)}`,
                sex: Math.random() > 0.5 ? 'L' : 'P',
                tglLahir: '1990-01-01',
                statusPeserta: { kode: '0', keterangan: 'AKTIF' },
                jenisPeserta: { kode: '1', keterangan: 'PBI (APBN)' },
                kelasTanggungan: { kode: '3', keterangan: 'KELAS III' }
            }
        };
    }
};

const insertSEP = async (data) => {
    // Simulate API Latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const { noKartu, poli, rujukan } = data;

    // Generate Dummy SEP Number
    // Format: KODE_RS + 'R' + BULAN + TAHUN + SEQUENCE (e.g. 0001R0011221000001)
    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    const sepNo = `0001R001${month}${year}B${randomSeq}`;

    return {
        status: 'OK',
        data: {
            noSep: sepNo,
            tglSep: date.toISOString().split('T')[0],
            peserta: {
                noKartu: noKartu,
                nama: MOCK_DB[Object.keys(MOCK_DB).find(k => MOCK_DB[k].noKartu === noKartu)]?.nama || 'PESERTA DUMMY'
            },
            poli: poli,
            diagnosa: data.diagnosa,
            catatan: 'SEP INI ADALAH SIMULASI UNTUK TESTING'
        }
    };
};

module.exports = {
    checkKepesertaanByNIK,
    insertSEP
};
