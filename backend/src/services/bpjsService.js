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
    // Advanced Logic for Type A Hospital (IGD, KLL, Backdate)
    const {
        noKartu, poli, rujukan, diagnosa,
        is_igd = false, // If true, validation low urgency
        is_kll = false, // If true, Jasa Raharja check
        tgl_sep_custom = null // For Backdate (must be <= 3 days)
    } = data;

    const tglSep = tgl_sep_custom || new Date().toISOString().split('T')[0];

    // --- MOCK MODE ---
    if (!IS_PRODUCTION || !CONS_ID) {
        await new Promise(resolve => setTimeout(resolve, 800));

        // 1. MOCK BACKDATE VALIDATION
        if (tgl_sep_custom) {
            const diffTime = Math.abs(new Date() - new Date(tgl_sep_custom));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 4) { // 3 + 1 tolerance
                return { status: 'FAILED', message: 'SEP Backdate Maksimal 3x24 Jam!' };
            }
        }

        // 2. MOCK IGD VALIDATION
        if (is_igd) {
            const lowUrgencyCodes = ['J30', 'H52', 'Z00'];
            const dgPrefix = diagnosa.split('.')[0];
            if (lowUrgencyCodes.includes(dgPrefix)) {
                return { status: 'WARNING', message: 'Diagnosa Masuk Kategori Low Urgency (Bukan Gawat Darurat).' };
            }
        }

        const date = new Date();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        const randomSeq = Math.floor(100000 + Math.random() * 900000);
        const sepNo = `0001R001${month}${year}B${randomSeq}`;

        return {
            status: 'OK',
            data: {
                noSep: sepNo,
                tglSep: tglSep,
                peserta: {
                    noKartu: noKartu,
                    nama: MOCK_DB[Object.keys(MOCK_DB).find(k => MOCK_DB[k].noKartu === noKartu)]?.nama || 'PESERTA DUMMY'
                },
                poli: is_igd ? 'IGD' : poli,
                diagnosa: diagnosa,
                catatan: is_kll ? 'KASUS KLL (JASA RAHARJA)' : 'SEP SIMULASI',
                keterangan: is_kll ? 'Menunggu Suplesi Jasa Raharja' : '-'
            }
        };
    }

    // --- REAL PRODUCTION MODE (Bridging V-Claim 2.0) ---
    try {
        const client = getClient();

        // Construct Payload
        const payload = {
            request: {
                t_sep: {
                    noKartu: noKartu,
                    tglSep: tglSep,
                    ppkPelayanan: '0001R001',
                    jnsPelayanan: '2', // Rawat Jalan / IGD
                    klsRawat: {
                        klsRawatHak: '3',
                        klsRawatNaik: '',
                        pembiayaan: '',
                        penanggungJawab: ''
                    },
                    noMR: data.noMR || '000000',
                    rujukan: {
                        asalRujukan: is_igd ? '2' : '1', // 2=Pusat (IGD)
                        tglRujukan: tglSep,
                        noRujukan: rujukan || '-',
                        ppkRujukan: '00000000'
                    },
                    catatan: 'Created via SIMIMED',
                    diagAwal: diagnosa || 'Z00.0',
                    poli: {
                        tujuan: is_igd ? 'IGD' : 'INT', // Map to correct poli
                        eksekutif: '0'
                    },
                    cob: { cob: '0' },
                    katarak: { katarak: '0' },
                    jaminan: {
                        lakaLantas: is_kll ? '1' : '0', // 1=Ya, 0=Tidak
                        penjamin: {
                            tglKejadian: is_kll ? tglSep : '',
                            keterangan: is_kll ? 'Kecelakaan Lalu Lintas' : '',
                            suplesi: {
                                suplesi: '0', // 0=Tidak, 1=Ya (Check history)
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
        return { status: 'ERROR', message: 'Gagal Membuat SEP V2' };
    }
};

const updateTaskID = async (data) => {
    const { kodebooking, taskid, waktu } = data;

    // 1. MOCK MODE
    if (!IS_PRODUCTION || !CONS_ID) {
        console.log(`[MOCK BPJS] Sending Task ID ${taskid} for ${kodebooking} at ${waktu}`);
        return { status: 'OK', message: 'Task ID Updated (Mock)' };
    }

    // 2. REAL MODE
    try {
        const client = getClient();
        const payload = {
            kodebooking: kodebooking,
            taskid: taskid,
            waktu: waktu // milliseconds usually
        };
        const response = await client.post('/antrean/updatewaktu', payload);

        if (response.data.metadata.code === 200) {
            return { status: 'OK', message: 'Task ID Sent' };
        } else {
            return { status: 'FAILED', message: response.data.metadata.message };
        }
    } catch (error) {
        console.error("BPJS TaskID Error:", error.message);
        return { status: 'ERROR', message: 'Failed to send Task ID' };
    }
};



const updateBedApplicare = async (data) => {
    const { koderuang, kotealas, tersedia, tersediapria, tersediawanita, tersediapriawanita } = data;

    // 1. MOCK MODE
    if (!IS_PRODUCTION || !CONS_ID) {
        console.log(`[MOCK APPLICARE] Syncing Bed ${koderuang} -> ${tersedia} available`);
        return { status: 'OK', message: 'Applicare Updated (Mock)' };
    }

    // 2. REAL MODE
    try {
        const client = getClient();
        // Applicare URL usually different base, but for this bridging we use client helper
        const payload = {
            koderuang,
            kotealas,
            tersedia,
            tersediapria,
            tersediawanita,
            tersediapriawanita
        };
        const response = await client.post('/applicare/update', payload);
        return { status: 'OK', message: 'Applicare Sent' };
    } catch (error) {
        console.error("Applicare Error:", error.message);
        return { status: 'ERROR', message: 'Applicare Sync Failed' };
    }
};

const checkFingerprint = async (patientId) => {
    // Standard for hemodialysis, heart, etc.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter for TODAY's success log
    const log = await prisma.fingerprintLog.findFirst({
        where: {
            patient_id: parseInt(patientId),
            status: 'SUCCESS',
            check_time: { gte: today }
        }
    });

    if (log) {
        return { status: 'OK', valid: true, message: 'Fingerprint Valid' };
    }

    // For MOCK: If patient NIK ends with '1', assume success for demo
    const patient = await prisma.patient.findUnique({ where: { id: parseInt(patientId) } });
    if (patient && patient.nik.endsWith('1')) {
        return { status: 'OK', valid: true, message: 'Fingerprint Valid (Simulated)' };
    }

    return { status: 'FAILED', valid: false, message: 'Silakan Scan Sidik Jari Terlebih Dahulu!' };
};

const insertInternalReferral = async (data) => {
    const { noSepAsal, poliTujuan, tglRujukan, diagnosa } = data;

    // 1. MOCK MODE
    if (!IS_PRODUCTION || !CONS_ID) {
        console.log(`[MOCK BPJS] Creating Internal Referral for SEP ${noSepAsal} -> ${poliTujuan}`);
        return { status: 'OK', data: { noRujukan: `REF-INT-${Date.now()}`, tglRujukan } };
    }

    // 2. REAL MODE (Bridging Rujukan Internal)
    try {
        const client = getClient();
        const payload = {
            request: {
                t_rujukan: {
                    noSep: noSepAsal,
                    tglRujukan: tglRujukan,
                    ppkDirujuk: '0001R001', // RS Sendiri
                    jnsPelayanan: '2',
                    catatan: 'Rujukan Sub-Spesialis',
                    diagRujukan: diagnosa,
                    tipeRujukan: '1', // 1=Rujukan Parsial/Internal
                    poliRujukan: poliTujuan,
                    user: 'admin'
                }
            }
        };
        const response = await client.post('/Rujukan/insert', payload);
        return { status: 'OK', data: response.data.response };
    } catch (error) {
        return { status: 'ERROR', message: 'Gagal Membuat Rujukan Internal' };
    }
};

module.exports = {
    checkKepesertaanByNIK,
    insertSEP,
    updateTaskID,
    updateBedApplicare,
    checkFingerprint,
    insertInternalReferral
};
