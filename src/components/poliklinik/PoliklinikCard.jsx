import React from 'react';
import { Link } from 'react-router-dom';

const PoliklinikCard = ({ poli }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'Buka Normal': { color: 'green', icon: '✅', bgColor: 'bg-green-50', textColor: 'text-green-800' },
      'Buka dengan Dokter Backup': { color: 'blue', icon: '🔄', bgColor: 'bg-blue-50', textColor: 'text-blue-800' },
      'Tutup': { color: 'red', icon: '❌', bgColor: 'bg-red-50', textColor: 'text-red-800' },
      'Tutup - Semua Dokter Cuti': { color: 'red', icon: '🎯', bgColor: 'bg-red-50', textColor: 'text-red-800' }
    };
    return configs[status] || configs['Tutup'];
  };

  const statusConfig = getStatusConfig(poli.status_buka);

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${statusConfig.color}-500 hover:shadow-xl transition-shadow duration-300`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${statusConfig.bgColor} rounded-lg flex items-center justify-center`}>
            <span className="text-2xl">{poli.icon}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{poli.nama}</h3>
            <p className="text-sm text-gray-500">{poli.hari_buka}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
          {statusConfig.icon} {poli.status_buka}
        </span>
      </div>

      {/* Doctor Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">👨‍⚕️</span>
            <span className="text-sm text-gray-700">Dokter Bertugas:</span>
          </div>
          <span className="font-medium text-gray-900">{poli.dokter_bertugas}</span>
        </div>

        {/* Queue Info */}
        {poli.is_open_today && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">👥</span>
              <span className="text-sm text-gray-700">Antrian Sekarang:</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-gray-900">{poli.antrian_sekarang} orang</span>
              <div className="text-xs text-gray-500">Estimasi: {poli.estimasi_tunggu}</div>
            </div>
          </div>
        )}

        {/* Time Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">🕐</span>
            <span className="text-sm text-gray-700">Jam Operasional:</span>
          </div>
          <span className="font-medium text-gray-900">{poli.jam_buka} - {poli.jam_tutup}</span>
        </div>
      </div>

      {/* Cuti Warning */}
      {poli.is_dokter_cuti && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-800">
            <span>⚠️</span>
            <span className="text-sm font-medium">Dokter utama sedang cuti</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">Dilayani oleh dokter backup</p>
        </div>
      )}

      {/* Description */}
      {poli.keterangan && (
        <p className="text-sm text-gray-600 mb-4">{poli.keterangan}</p>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        <Link
          to="/appointment"
          state={{ poliklinik: poli.nama }}
          className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Buat Janji
        </Link>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Detail
        </button>
      </div>
    </div>
  );
};

export default PoliklinikCard;