import React from 'react';

const PoliklinikList = ({ data }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Buka Normal': 'text-green-600 bg-green-50',
      'Buka dengan Dokter Backup': 'text-blue-600 bg-blue-50',
      'Tutup': 'text-red-600 bg-red-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Poliklinik
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dokter Bertugas
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Jam Operasional
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Antrian
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((poli) => (
            <tr key={poli.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{poli.icon}</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {poli.nama}
                    </div>
                    <div className="text-sm text-gray-500">
                      {poli.hari_buka}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(poli.status_buka)}`}>
                  {poli.status_buka}
                </span>
                {poli.is_dokter_cuti && (
                  <div className="text-xs text-yellow-600 mt-1">
                    ⚠️ Dokter cuti
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {poli.dokter_bertugas}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {poli.jam_buka} - {poli.jam_tutup}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {poli.is_open_today ? (
                  <div className="text-sm text-gray-900">
                    <div className="font-semibold">{poli.antrian_sekarang} orang</div>
                    <div className="text-xs text-gray-500">Estimasi: {poli.estimasi_tunggu}</div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900 mr-4">
                  Buat Janji
                </button>
                <button className="text-gray-600 hover:text-gray-900">
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PoliklinikList;