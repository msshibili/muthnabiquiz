import React from 'react';
import { Calendar, MapPin, Sparkles } from 'lucide-react';

export default function ProfSummitBanner() {
  return (
    <section className="prof-summit-banner-section" aria-label="Prof Summit 2026 Announcement">
      <div className="prof-summit-container">
        <div className="prof-summit-badge">
          <Sparkles size={16} className="sparkle-icon" />
          <span>FEATURED CONFERENCE</span>
        </div>
        
        <div className="prof-summit-image-wrapper">
          <img 
            src="/prof-summit.png" 
            alt="Prof Summit 2026 - Professional Students Conference | October 23, 24, 25 at Kuttiady, Kozhikode North" 
            className="prof-summit-img"
            loading="lazy"
          />
        </div>

        <div className="prof-summit-info-bar">
          <div className="summit-info-item">
            <Calendar size={16} className="info-icon" />
            <span>October 23, 24, 25 - 2026</span>
          </div>
          <div className="summit-divider hide-mobile">•</div>
          <div className="summit-info-item">
            <MapPin size={16} className="info-icon" />
            <span>Kuttiady, Kozhikode North</span>
          </div>
        </div>
      </div>
    </section>
  );
}
