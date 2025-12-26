import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/axiosConfig';
import { io } from 'socket.io-client';

export const useRegistrationLogic = (mode = 'RJ') => {
    // Master Data
    const [clinics, setClinics] = useState([]);
    const [doctors, setDoctors] = useState([]);

    // Patient Search
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [patientFound, setPatientFound] = useState(null);
    const [recentPatients, setRecentPatients] = useState([]);

    // Selection
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [paymentType, setPaymentType] = useState('UMUM');

    // Registration Process
    const [ticketData, setTicketData] = useState(null);
    const [showNewPatientModal, setShowNewPatientModal] = useState(false);

    // BPJS / SEP
    const [showSEPModal, setShowSEPModal] = useState(false);
    const [sepData, setSepData] = useState(null);

    // Socket
    const [socket, setSocket] = useState(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [clinicRes, docRes] = await Promise.all([
                    api.get('/polies'),
                    api.get('/doctors-master')
                ]);
                setClinics(clinicRes.data);
                setDoctors(docRes.data);
            } catch (error) {
                console.error("Failed to load master data", error);
                toast.error("Failed to load clinical data");
            }
        };

        fetchMasterData();
        fetchRecentPatients();

        // Socket Connection
        const newSocket = io(`http://${window.location.hostname}:3000`, {
            transports: ['websocket', 'polling']
        });
        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, []);

    // Search Logic
    const handleSearch = useCallback(async (term) => {
        if (!term) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await api.get(`/patients/search?q=${term}`);
            setSearchResults(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const fetchRecentPatients = async () => {
        try {
            const res = await api.get('/patients/recent');
            setRecentPatients(res.data);
        } catch (error) {
            console.error("Failed fetching recent patients");
        }
    };

    // Actions
    const handleSelectPatient = (patient) => {
        setPatientFound(patient);
        setSearchResults([]);
        setSearchTerm(patient.name); // UX: Fill search box
        toast.success(`Patient selected: ${patient.name}`);
    };

    const handleClearPatient = () => {
        setPatientFound(null);
        setSearchTerm('');
        setSearchResults([]);
        setTicketData(null);
        setSepData(null);
    };

    const handleReset = () => {
        handleClearPatient();
        setSelectedClinic(null);
        setSelectedDoctor(null);
        setPaymentType('UMUM');
    };

    // Registration / Ticket Creation
    const handleRegister = async () => {
        if (!patientFound || !selectedDoctor) return;

        // Validation for BPJS
        if (paymentType === 'BPJS' && !sepData) {
            toast.error("Wajib terbitkan SEP untuk pasien BPJS");
            setShowSEPModal(true);
            return;
        }

        const toastId = toast.loading('Creating Ticket...');
        try {
            const payload = {
                patient_id: patientFound.id,
                doctor_id: selectedDoctor,
                // clinicId not needed for takeTicket, it derives from doctor
            };

            const res = await api.post('/queue/ticket', payload);

            if (res.status === 201 || res.data.message === 'Ticket created') {
                const ticket = res.data.ticket;
                // Add friendly names for display
                const doc = doctors.find(d => d.id === selectedDoctor);
                const clinic = clinics.find(c => c.id === (selectedClinic || doc?.poliklinik_id));

                setTicketData({
                    ...ticket,
                    doctorName: doc?.name,
                    clinicName: clinic?.name,
                    patient: patientFound
                });

                toast.success('Registration Successful!', { id: toastId });

                // Emit socket event for queue display
                if (socket) {
                    socket.emit('new_queue', ticket);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Registration Failed', { id: toastId });
        }
    };

    const handlePrintTicket = () => {
        window.print();
        // Maybe auto close after print?
    };

    return {
        // State
        clinics, doctors,
        searchTerm, setSearchTerm, isSearching, searchResults,
        patientFound, recentPatients,
        selectedClinic, setSelectedClinic,
        selectedDoctor, setSelectedDoctor,
        paymentType, setPaymentType,
        ticketData, setTicketData,
        showNewPatientModal, setShowNewPatientModal,
        showSEPModal, setShowSEPModal, sepData, setSepData,

        // Methods
        handleSearch,
        handleSelectPatient,
        handleClearPatient,
        handleReset,
        handleRegister,
        handlePrintTicket,
        fetchRecentPatients
    };
};
