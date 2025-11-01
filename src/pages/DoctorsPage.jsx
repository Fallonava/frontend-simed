import React, { useState } from 'react';
import { mockDoctorsData } from '../services/mockData';
import DoctorCard from '../components/doctors/DoctorCard';

const DoctorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');

  const specializations = [...new Set(mockDoctorsData.map(doc => doc.spesialisasi))];

  const filteredDoctors = mockDoctorsData.filter(doctor => {
    const matchesSearch = doctor.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.spesialisasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = specializationFilter === 'all' || 
                                 doctor.spesialisasi === specializationFilter;
    return matchesSearch && matchesSpecialization;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tim Dokter Profesional
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dikenang karena keahliannya, diingat karena kebaikannya. 
            Tim dokter spesialis kami siap memberikan pelayanan terbaik.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari nama dokter atau spesialisasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="w-full md:w-64">
              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">Semua Spesialisasi</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Menampilkan <span className="font-semibold">{filteredDoctors.length}</span> dokter
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>

        {/* Empty State */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Dokter tidak ditemukan
            </h3>
            <p className="text-gray-600">
              Coba ubah kata kunci pencarian atau filter spesialisasi
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;