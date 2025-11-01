import React from 'react';
import HeroSection from '../components/home/HeroSection';
import EmergencyBanner from '../components/home/EmergencyBanner';
import FeatureCards from '../components/home/FeatureCards';
import PoliklinikOverview from '../components/home/PoliklinikOverview';
import StatsSection from '../components/home/StatsSection';
import Testimonials from '../components/home/Testimonials';
import CTASection from '../components/home/CTASection';

const HomePage = ({ showNotification }) => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <EmergencyBanner />
      <FeatureCards />
      <PoliklinikOverview />
      <StatsSection />
      <Testimonials />
      <CTASection />
    </div>
  );
};

export default HomePage;