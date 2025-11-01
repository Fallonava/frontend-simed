import React from 'react';
import PoliklinikCard from './PoliklinikCard';

const PoliklinikGrid = ({ data }) => {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((poli) => (
        <PoliklinikCard key={poli.id} poli={poli} />
      ))}
    </div>
  );
};

export default PoliklinikGrid;