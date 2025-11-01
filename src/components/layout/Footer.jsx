import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">RS</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Rumah Sehat</h3>
                <p className="text-gray-400">Melayani dengan Hati</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Rumah Sakit Terpercaya yang memberikan pelayanan kesehatan terbaik 
              dengan tim dokter profesional dan fasilitas modern.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <span>📞</span>
                <span>(021) 1234-5678</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <span>📧</span>
                <span>info@rumahsehat.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/poliklinik" className="text-gray-400 hover:text-white transition-colors">Poliklinik</Link></li>
              <li><Link to="/dokter" className="text-gray-400 hover:text-white transition-colors">Dokter Spesialis</Link></li>
              <li><Link to="/appointment" className="text-gray-400 hover:text-white transition-colors">Buat Janji</Link></li>
              <li><Link to="/emergency" className="text-gray-400 hover:text-white transition-colors">Emergency</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Layanan</h4>
            <ul className="space-y-2">
              <li className="text-gray-400">Rawat Inap</li>
              <li className="text-gray-400">Rawat Jalan</li>
              <li className="text-gray-400">UGD 24 Jam</li>
              <li className="text-gray-400">Medical Checkup</li>
              <li className="text-gray-400">Laboratorium</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Rumah Sehat. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;