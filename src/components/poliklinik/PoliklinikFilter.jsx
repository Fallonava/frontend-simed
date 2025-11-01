import React from 'react';

const PoliklinikFilter = ({ filters, onFilterChange }) => {
  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'open', label: 'Sedang Buka' },
    { value: 'closed', label: 'Sedang Tutup' }
  ];

  const hariOptions = [
    { value: 'all', label: 'Semua Hari' },
    { value: 'senin', label: 'Senin' },
    { value: 'selasa', label: 'Selasa' },
    { value: 'rabu', label: 'Rabu' },
    { value: 'kamis', label: 'Kamis' },
    { value: 'jumat', label: 'Jumat' },
    { value: 'sabtu', label: 'Sabtu' },
    { value: 'minggu', label: 'Minggu' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="flex-1">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari poliklinik atau dokter..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="input-field pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-48">
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="input-field"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Hari Filter */}
      <div className="w-full sm:w-48">
        <select
          value={filters.hari}
          onChange={(e) => onFilterChange({ hari: e.target.value })}
          className="input-field"
        >
          {hariOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PoliklinikFilter;