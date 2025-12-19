const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

// ENVIRONMENT VARIABLES
const CONS_ID = process.env.BPJS_CONS_ID;
const SECRET_KEY = process.env.BPJS_SECRET_KEY;
const USER_KEY = process.env.BPJS_USER_KEY; // For V-Claim 2.0
const BASE_URL = process.env.BPJS_BASE_URL || 'https://apijkn-dev.bpjs-kesehatan.go.id/vclaim-rest-1.1'; // Dev URL default
const IS_PRODUCTION = process.env.BPJS_MODE === 'PRODUCTION'; // Set 'PRODUCTION' or 'MOCK'

// --- MOCK DATA DICTIONARY (Fallback) ---
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
        statusPeserta: { kode: '1', keterangan: 'NON-AKTIF (TUNGGAKAN)' },
        jenisPeserta: { kode: '2', keterangan: 'PEKERJA MANDIRI' },
        kelasTanggungan: { kode: '2', keterangan: 'KELAS II' }
    }
};

// --- HELPER: GENERATE SIGNATURE ---
const generateHeaders = () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const data = CONS_ID + '&' + timestamp;
    const signature = crypto.createHmac('sha256', SECRET_KEY)
        .update(data)
        .digest('base64');

    return {
        'X-cons-id': CONS_ID,
        'X-timestamp': timestamp,
        'X-signature': signature,
        'user_key': USER_KEY,
        'Content-Type': 'Application/x-www-form-urlencoded' // V-Claim usually uses this or JSON depending on endpoint
    };
};

const getClient = () => {
    return axios.create({
        baseURL: BASE_URL,
        headers: generateHeaders()
    });
};

// --- CORE FUNCTIONS ---

const checkKepesertaanByNIK = async (nik) => {
    // 1. MOCK MODE CHECK
    if (!IS_PRODUCTION || !CONS_ID) {
        // Simulate API Latency (Random 500ms - 1500ms)
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        const participant = MOCK_DB[nik];
        if (participant) {
            return { status: 'OK', data: participant };
        } else if (nik === '0000000000000000') {
            return { status: 'FAILED', message: 'Peserta Tidak Ditemukan' };
        } else {
            // Random Fallback
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
    }

    // 2. REAL PRODUCTION MODE
    try {
        const client = getClient();
        // V-Claim Endpoint: /Peserta/nik/{nik}/tglSEP/{tglSEP}
        const tglSEP = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const response = await client.get(`/Peserta/nik/${nik}/tglSEP/${tglSEP}`);

        if (response.data.metaData.code === '200') {
            return {
                status: 'OK',
                data: response.data.response.peserta
            };
        } else {
            return {
                status: 'FAILED',
                message: response.data.metaData.message
            };
        }
    } catch (error) {
        console.error('BPJS API Error:', error.message);
        return { status: 'ERROR', message: 'Koneksi ke BPJS Gagal' };
    }
};

const insertSEP = async (data) => {
    const { noKartu, poli, rujukan, diagnosa } = data;

    // 1. MOCK MODE
    if (!IS_PRODUCTION || !CONS_ID) {
        await new Promise(resolve => setTimeout(resolve, 800));
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
                diagnosa: diagnosa,
                catatan: 'SEP SIMULASI'
            }
        };
    }

    // 2. REAL PRODUCTION MODE
    try {
        const client = getClient();
        // Payload must match V-Claim 2.0 standards
        const payload = {
            request: {
                t_sep: {
                    noKartu: noKartu,
                    tglSep: new Date().toISOString().split('T')[0],
                    ppkPelayanan: '0001R001', // RS Code (Should be in .env too)
                    jnsPelayanan: '2', // 1=Inpatient, 2=Outpatient
                    klsRawat: {
                        klsRawatHak: '3', // Dynamic
                        klsRawatNaik: '',
                        pembiayaan: '',
                        penanggungJawab: ''
                    },
                    noMR: data.noMR || '000000',
                    rujukan: {
                        asalRujukan: '1', // 1=Faskes 1, 2=RS
                        tglRujukan: new Date().toISOString().split('T')[0],
                        noRujukan: rujukan || '-',
                        ppkRujukan: '00000000' // Mock PPK
                    },
                    catatan: 'Created via System',
                    diagAwal: diagnosa || 'Z00.0',
                    poli: {
                        tujuan: 'INT', // Internal Medicine Code (Example)
                        eksekutif: '0'
                    },
                    cob: { cob: '0' },
                    katarak: { katarak: '0' },
                    jaminan: {
                        lakaLantas: '0',
                        penjamin: {
                            tglKejadian: '',
                            keterangan: '',
                            suplesi: {
                                suplesi: '0',
                                noSepSuplesi: '',
                                lokasiLaka: {
                                    kdPropinsi: '',
                                    kdKabupaten: '',
                                    kdKecamatan: ''
                                }
                            }
                        }
                    },
                    tujuanKunj: '0',
                    flagProcedure: '',
                    kdPenunjang: '',
                    asesmenPelayanan: '',
                    skdp: { noSurat: '', kodeDPJP: '' },
                    dpjpLayan: '',
                    noTelp: '08123456789',
                    user: 'admin system'
                }
            }
        };

        const response = await client.post('/SEP/2.0/insert', payload);

        if (response.data.metaData.code === '200') {
            return {
                status: 'OK',
                data: response.data.response.sep
            };
        } else {
            return {
                status: 'FAILED',
                message: response.data.metaData.message
            };
        }
    } catch (error) {
        console.error('BPJS SEP Error:', error.message);
        return { status: 'ERROR', message: 'Gagal Membuat SEP' };
    }
};

module.exports = {
    checkKepesertaanByNIK,
    insertSEP
};
