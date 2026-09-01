/* ==========================================================================
   GET CABS - Interactive JavaScript Engine
   Company: Get Cabs
   Phone: 9894020156
   ========================================================================== */

// Global SVG Image Placeholder & Error Handler
window.getFallbackSvg = function(title) {
  const cleanTitle = title ? String(title).replace(/['"<>&]/g, '') : 'Get Cabs Coimbatore';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#d90429"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bg)"/>
    <circle cx="300" cy="150" r="48" fill="#ffb703" opacity="0.25"/>
    <path d="M280 170 L300 120 L320 170 Z" fill="#ffb703"/>
    <circle cx="300" cy="115" r="8" fill="#ffffff"/>
    <text x="300" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" fill="#ffffff" text-anchor="middle">${cleanTitle}</text>
    <text x="300" y="270" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#ffb703" text-anchor="middle">🚕 Get Cabs Coimbatore • Hotline: 9894020156</text>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
};

window.handleImgError = function(imgEl, title) {
  if (!imgEl) return;
  imgEl.onerror = null; // Prevent recursion
  imgEl.src = window.getFallbackSvg(title || imgEl.alt || 'Get Cabs Tour');
};

document.addEventListener('DOMContentLoaded', function () {

  // 1. Mobile Menu Toggle & Close on Click
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mainMenu = document.querySelector('.main-menu');

  if (mobileToggle && mainMenu) {
    mobileToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      mainMenu.classList.toggle('active');
    });

    // Close menu when clicking outside or clicking any menu link
    document.addEventListener('click', function(e) {
      if (mainMenu.classList.contains('active') && !mainMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        mainMenu.classList.remove('active');
      }
    });

    const menuLinks = mainMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', function() {
        mainMenu.classList.remove('active');
      });
    });
  }

  // 2. Booking Form Tabs Handling (Local Rides, Oneway, Outstation, Hourly Package)
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabPanels = document.querySelectorAll('.tab-content-panel');

  tabLinks.forEach(link => {
    link.addEventListener('click', function () {
      const targetTab = this.getAttribute('data-tab');

      // Update Active Tab Link
      tabLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      // Update Active Panel
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `tab-${targetTab}`) {
          panel.classList.add('active');
        }
      });

      // Recalculate fare for the newly active tab
      updateAllEstimates();
    });
  });

  // 3. Get Cabs Coimbatore Comprehensive Fare & Distance Engine
  // Complete Location database with precise GPS coordinates for Coimbatore
  const COVAI_LOCALITIES = {
    // Hotels & Commercial Landmarks
    'park elanza': { lat: 11.0155, lng: 76.9635, name: 'Park Elanza, Ram Nagar' },
    'hotel park elanza': { lat: 11.0155, lng: 76.9635, name: 'Park Elanza' },
    'residency towers': { lat: 11.0100, lng: 76.9800, name: 'The Residency Towers, Avinashi Rd' },
    'the residency': { lat: 11.0100, lng: 76.9800, name: 'The Residency Towers' },
    'le meridien': { lat: 11.0620, lng: 77.0850, name: 'Le Meridien, Neelambur' },
    'vivanta': { lat: 11.0080, lng: 76.9750, name: 'Vivanta Coimbatore, Race Course' },
    'taj vivanta': { lat: 11.0080, lng: 76.9750, name: 'Vivanta Coimbatore' },
    'radisson blu': { lat: 11.0030, lng: 77.0010, name: 'Radisson Blu, Peelamedu' },
    'zone by the park': { lat: 11.0200, lng: 76.9780, name: 'Zone by The Park, Avinashi Rd' },
    'gokulam park': { lat: 11.0610, lng: 77.0780, name: 'Gokulam Park, Neelambur' },
    'aloft': { lat: 11.0360, lng: 77.0320, name: 'Aloft Coimbatore, Singanallur' },
    'ibis': { lat: 11.0100, lng: 76.9850, name: 'Ibis Hotel, Lakshmi Mills' },
    'city tower': { lat: 11.0160, lng: 76.9650, name: 'Hotel City Tower, Gandhipuram' },
    'kiscol grands': { lat: 11.0250, lng: 76.9550, name: 'Kiscol Grands, Tatabad' },
    'brookefields': { lat: 11.0080, lng: 76.9575, name: 'Brookefields Mall' },
    'brooke fields': { lat: 11.0080, lng: 76.9575, name: 'Brookefields Mall' },
    'prozone mall': { lat: 11.0540, lng: 76.9920, name: 'Prozone Mall, Saravanampatti' },
    'prozone': { lat: 11.0540, lng: 76.9920, name: 'Prozone Mall' },
    'fun republic': { lat: 11.0260, lng: 77.0020, name: 'Fun Republic Mall, Peelamedu' },
    'fun mall': { lat: 11.0260, lng: 77.0020, name: 'Fun Republic Mall' },
    'broadway': { lat: 11.0400, lng: 77.0500, name: 'Broadway Cinemas, KMCH' },

    // Roads & Streets
    'dr nanjappa rd': { lat: 11.0150, lng: 76.9650, name: 'Dr Nanjappa Road' },
    'nanjappa road': { lat: 11.0150, lng: 76.9650, name: 'Dr Nanjappa Road' },
    'nanjappa rd': { lat: 11.0150, lng: 76.9650, name: 'Dr Nanjappa Road' },
    'nanjappa': { lat: 11.0150, lng: 76.9650, name: 'Dr Nanjappa Road' },
    'sastri rd': { lat: 11.0175, lng: 76.9640, name: 'Sastri Road, Ram Nagar' },
    'sastri road': { lat: 11.0175, lng: 76.9640, name: 'Sastri Road, Ram Nagar' },
    'shastri rd': { lat: 11.0175, lng: 76.9640, name: 'Sastri Road' },
    'cross cut rd': { lat: 11.0195, lng: 76.9645, name: 'Cross Cut Road, Gandhipuram' },
    'cross cut road': { lat: 11.0195, lng: 76.9645, name: 'Cross Cut Road' },
    'crosscut': { lat: 11.0195, lng: 76.9645, name: 'Cross Cut Road' },
    '100 feet rd': { lat: 11.0220, lng: 76.9630, name: '100 Feet Road, Gandhipuram' },
    '100 feet road': { lat: 11.0220, lng: 76.9630, name: '100 Feet Road' },
    '100ft road': { lat: 11.0220, lng: 76.9630, name: '100 Feet Road' },
    '100ft': { lat: 11.0220, lng: 76.9630, name: '100 Feet Road' },
    'db road': { lat: 11.0120, lng: 76.9470, name: 'DB Road, RS Puram' },
    'diwan bahadur': { lat: 11.0120, lng: 76.9470, name: 'DB Road, RS Puram' },
    'tv swamy rd': { lat: 11.0150, lng: 76.9450, name: 'TV Swamy Road, RS Puram' },
    'tv swamy road': { lat: 11.0150, lng: 76.9450, name: 'TV Swamy Road' },
    'nsr road': { lat: 11.0290, lng: 76.9430, name: 'NSR Road, Saibaba Colony' },
    'nsr rd': { lat: 11.0290, lng: 76.9430, name: 'NSR Road' },
    'race course': { lat: 11.0060, lng: 76.9740, name: 'Race Course' },
    'racecourse': { lat: 11.0060, lng: 76.9740, name: 'Race Course' },
    'avinashi road': { lat: 11.0250, lng: 77.0100, name: 'Avinashi Road' },
    'avinashi rd': { lat: 11.0250, lng: 77.0100, name: 'Avinashi Road' },
    'trichy road': { lat: 11.0010, lng: 77.0100, name: 'Trichy Road' },
    'trichy rd': { lat: 11.0010, lng: 77.0100, name: 'Trichy Road' },
    'sathy road': { lat: 11.0450, lng: 76.9800, name: 'Sathyamangalam Road' },
    'sathyamangalam road': { lat: 11.0450, lng: 76.9800, name: 'Sathyamangalam Road' },
    'mettupalayam road': { lat: 11.0450, lng: 76.9420, name: 'Mettupalayam Road' },
    'mtp road': { lat: 11.0450, lng: 76.9420, name: 'Mettupalayam Road' },
    'palakkad road': { lat: 10.9600, lng: 76.9400, name: 'Palakkad Road' },
    'pollachi road': { lat: 10.9200, lng: 76.9700, name: 'Pollachi Road' },
    'marudhamalai road': { lat: 11.0300, lng: 76.8800, name: 'Marudhamalai Road' },
    'siruvani road': { lat: 10.9800, lng: 76.8500, name: 'Siruvani Road' },
    'thadagam road': { lat: 11.0400, lng: 76.9100, name: 'Thadagam Road' },
    'perur main road': { lat: 10.9800, lng: 76.9300, name: 'Perur Main Road' },

    // Transit Hubs & Bus Stands
    'central bus stand': { lat: 11.0178, lng: 76.9670, name: 'Gandhipuram Central Bus Stand' },
    'gandhipuram bus stand': { lat: 11.0178, lng: 76.9670, name: 'Gandhipuram Bus Stand' },
    'omni bus stand': { lat: 11.0210, lng: 76.9680, name: 'Omni Bus Stand, Gandhipuram' },
    'omni bus': { lat: 11.0210, lng: 76.9680, name: 'Omni Bus Stand' },
    'setc bus stand': { lat: 11.0170, lng: 76.9665, name: 'SETC Bus Stand, Gandhipuram' },
    'setc': { lat: 11.0170, lng: 76.9665, name: 'SETC Bus Stand' },
    'singanallur bus stand': { lat: 10.9996, lng: 77.0270, name: 'Singanallur Bus Stand' },
    'ukkadam bus stand': { lat: 10.9890, lng: 76.9600, name: 'Ukkadam Bus Stand' },
    'saibaba colony bus stand': { lat: 11.0320, lng: 76.9430, name: 'MTP Road New Bus Stand' },
    'railway station': { lat: 10.9980, lng: 76.9628, name: 'Coimbatore Junction Railway Station' },
    'coimbatore junction': { lat: 10.9980, lng: 76.9628, name: 'Coimbatore Junction' },
    'cbe junction': { lat: 10.9980, lng: 76.9628, name: 'Coimbatore Junction' },
    'junction': { lat: 10.9980, lng: 76.9628, name: 'Coimbatore Junction' },
    'station': { lat: 10.9980, lng: 76.9628, name: 'Coimbatore Railway Station' },
    'north railway station': { lat: 11.0210, lng: 76.9540, name: 'Coimbatore North Railway Station' },
    'coimbatore north': { lat: 11.0210, lng: 76.9540, name: 'Coimbatore North' },
    'podanur junction': { lat: 10.9650, lng: 76.9950, name: 'Podanur Junction' },
    'podanur railway station': { lat: 10.9650, lng: 76.9950, name: 'Podanur Railway Station' },
    'peelamedu railway station': { lat: 11.0310, lng: 77.0150, name: 'Peelamedu Railway Station' },
    'irugur railway station': { lat: 11.0180, lng: 77.0760, name: 'Irugur Railway Station' },
    'airport': { lat: 11.0298, lng: 77.0434, name: 'Coimbatore International Airport (CJB)' },
    'coimbatore airport': { lat: 11.0298, lng: 77.0434, name: 'Coimbatore Airport (CJB)' },
    'cjb': { lat: 11.0298, lng: 77.0434, name: 'Coimbatore Airport (CJB)' },
    'aerodrome': { lat: 11.0330, lng: 77.0350, name: 'Civil Aerodrome Post' },

    // Hospitals & IT / Tech Parks
    'kmch': { lat: 11.0500, lng: 77.0600, name: 'KMCH Hospital, Avinashi Rd' },
    'kovai medical center': { lat: 11.0500, lng: 77.0600, name: 'KMCH Hospital' },
    'psg hospital': { lat: 11.0250, lng: 77.0120, name: 'PSG IMS & Hospital, Peelamedu' },
    'psg ims': { lat: 11.0250, lng: 77.0120, name: 'PSG IMS & Hospital' },
    'ganga hospital': { lat: 11.0310, lng: 76.9480, name: 'Ganga Hospital, Saibaba Colony' },
    'ramakrishna hospital': { lat: 11.0210, lng: 76.9830, name: 'Sri Ramakrishna Hospital, Sidhapudur' },
    'gknm hospital': { lat: 11.0090, lng: 76.9780, name: 'GKNM Hospital, Pappanaickenpalayam' },
    'cmch': { lat: 10.9990, lng: 76.9690, name: 'Coimbatore Medical College Hospital' },
    'royal care': { lat: 11.0650, lng: 77.0800, name: 'Royal Care Hospital, Neelambur' },
    'tidel park': { lat: 11.0330, lng: 77.0300, name: 'Tidel Park ELCOT, Peelamedu' },
    'tidel': { lat: 11.0330, lng: 77.0300, name: 'Tidel Park' },
    'codissia': { lat: 11.0400, lng: 77.0350, name: 'CODISSIA Trade Fair Complex' },
    'chil sez': { lat: 11.0860, lng: 76.9990, name: 'CHIL SEZ IT Park, Saravanampatti' },
    'kgisl': { lat: 11.0840, lng: 76.9970, name: 'KGISL IT Park, Saravanampatti' },
    'psg tech': { lat: 11.0240, lng: 77.0030, name: 'PSG College of Technology, Peelamedu' },
    'psg': { lat: 11.0240, lng: 77.0030, name: 'PSG Tech, Peelamedu' },
    'cit': { lat: 11.0270, lng: 77.0280, name: 'CIT, Civil Aerodrome' },
    'kumaraguru': { lat: 11.0820, lng: 76.9880, name: 'Kumaraguru College (KCT)' },
    'kct': { lat: 11.0820, lng: 76.9880, name: 'Kumaraguru College' },
    'amrita university': { lat: 10.9010, lng: 76.9000, name: 'Amrita Vishwa Vidyapeetham, Ettimadai' },
    'amrita': { lat: 10.9010, lng: 76.9000, name: 'Amrita University, Ettimadai' },
    'bharathiar university': { lat: 11.0380, lng: 76.8790, name: 'Bharathiar University' },
    'bharathiar': { lat: 11.0380, lng: 76.8790, name: 'Bharathiar University' },
    'karunya university': { lat: 10.9380, lng: 76.7450, name: 'Karunya University' },
    'karunya': { lat: 10.9380, lng: 76.7450, name: 'Karunya University' },
    'tnau': { lat: 11.0130, lng: 76.9320, name: 'TNAU Tamil Nadu Agricultural University' },

    // Areas, Neighborhoods & Localities
    'ram nagar': { lat: 11.0160, lng: 76.9620, name: 'Ram Nagar' },
    'ramnagar': { lat: 11.0160, lng: 76.9620, name: 'Ram Nagar' },
    'gandhipuram': { lat: 11.0168, lng: 76.9676, name: 'Gandhipuram' },
    'tatabad': { lat: 11.0220, lng: 76.9580, name: 'Tatabad' },
    'sivananda colony': { lat: 11.0330, lng: 76.9520, name: 'Sivananda Colony' },
    'sivanandha colony': { lat: 11.0330, lng: 76.9520, name: 'Sivananda Colony' },
    'saibaba colony': { lat: 11.0280, lng: 76.9460, name: 'Saibaba Colony' },
    'saibaba': { lat: 11.0280, lng: 76.9460, name: 'Saibaba Colony' },
    'rs puram': { lat: 11.0118, lng: 76.9450, name: 'RS Puram' },
    'r.s. puram': { lat: 11.0118, lng: 76.9450, name: 'RS Puram' },
    'townhall': { lat: 10.9940, lng: 76.9610, name: 'Town Hall' },
    'town hall': { lat: 10.9940, lng: 76.9610, name: 'Town Hall' },
    'oppanakara': { lat: 10.9940, lng: 76.9610, name: 'Oppanakara Street, Town Hall' },
    'peelamedu': { lat: 11.0264, lng: 77.0093, name: 'Peelamedu' },
    'hopes college': { lat: 11.0250, lng: 77.0180, name: 'Hopes College' },
    'hopes': { lat: 11.0250, lng: 77.0180, name: 'Hopes College' },
    'nava india': { lat: 11.0230, lng: 76.9950, name: 'Nava India' },
    'lakshmi mills': { lat: 11.0180, lng: 76.9850, name: 'Lakshmi Mills' },
    'ramanathapuram': { lat: 11.0020, lng: 76.9850, name: 'Ramanathapuram' },
    'sungam': { lat: 11.0010, lng: 76.9750, name: 'Sungam' },
    'red fields': { lat: 11.0080, lng: 76.9820, name: 'Red Fields' },
    'puliyakulam': { lat: 11.0080, lng: 76.9900, name: 'Puliyakulam' },
    'puliakulam': { lat: 11.0080, lng: 76.9900, name: 'Puliyakulam' },
    'singanallur': { lat: 10.9996, lng: 77.0270, name: 'Singanallur' },
    'ondipudur': { lat: 11.0020, lng: 77.0540, name: 'Ondipudur' },
    'irugur': { lat: 11.0180, lng: 77.0760, name: 'Irugur' },
    'sulur': { lat: 11.0240, lng: 77.1260, name: 'Sulur' },
    'ganapathy': { lat: 11.0375, lng: 76.9740, name: 'Ganapathy' },
    'avarampalayam': { lat: 11.0310, lng: 76.9820, name: 'Avarampalayam' },
    'sidhapudur': { lat: 11.0200, lng: 76.9750, name: 'Sidhapudur' },
    'siddhapudur': { lat: 11.0200, lng: 76.9750, name: 'Sidhapudur' },
    'saravanampatti': { lat: 11.0805, lng: 76.9946, name: 'Saravanampatti' },
    'saravanampatty': { lat: 11.0805, lng: 76.9946, name: 'Saravanampatti' },
    'kalapatti': { lat: 11.0710, lng: 77.0370, name: 'Kalapatti' },
    'chinniyampalayam': { lat: 11.0380, lng: 77.0700, name: 'Chinniyampalayam' },
    'sitra': { lat: 11.0350, lng: 77.0500, name: 'SITRA, Airport Rd' },
    'goldwins': { lat: 11.0450, lng: 77.0580, name: 'Goldwins' },
    'neelambur': { lat: 11.0600, lng: 77.0950, name: 'Neelambur' },
    'karumathampatti': { lat: 11.1090, lng: 77.1780, name: 'Karumathampatti' },
    'vilankurichi': { lat: 11.0560, lng: 77.0120, name: 'Vilankurichi' },
    'koundampalayam': { lat: 11.0450, lng: 76.9380, name: 'Koundampalayam' },
    'kavundampalayam': { lat: 11.0450, lng: 76.9380, name: 'Koundampalayam' },
    'edayarpalayam': { lat: 11.0380, lng: 76.9200, name: 'Edayarpalayam' },
    'thudiyalur': { lat: 11.0772, lng: 76.9380, name: 'Thudiyalur' },
    'gn mills': { lat: 11.0620, lng: 76.9400, name: 'GN Mills' },
    'periyanaickenpalayam': { lat: 11.1450, lng: 76.9350, name: 'Periyanaickenpalayam' },
    'pns': { lat: 11.1450, lng: 76.9350, name: 'Periyanaickenpalayam' },
    'narasimhanaickenpalayam': { lat: 11.1120, lng: 76.9400, name: 'Narasimhanaickenpalayam' },
    'karamadai': { lat: 11.2420, lng: 76.9580, name: 'Karamadai' },
    'mettupalayam': { lat: 11.3000, lng: 76.9400, name: 'Mettupalayam (MTP)' },
    'mtp': { lat: 11.3000, lng: 76.9400, name: 'Mettupalayam' },
    'sirumugai': { lat: 11.3200, lng: 77.0030, name: 'Sirumugai' },
    'annur': { lat: 11.2330, lng: 77.1330, name: 'Annur' },
    'kovilpalayam': { lat: 11.1390, lng: 77.0420, name: 'Kovilpalayam' },
    'vadavalli': { lat: 11.0245, lng: 76.9056, name: 'Vadavalli' },
    'pn pudur': { lat: 11.0180, lng: 76.9200, name: 'PN Pudur' },
    'marudhamalai': { lat: 11.0460, lng: 76.8520, name: 'Marudhamalai Temple' },
    'thadagam': { lat: 11.0650, lng: 76.8650, name: 'Thadagam' },
    'anaikatti': { lat: 11.1050, lng: 76.7720, name: 'Anaikatti' },
    'perur': { lat: 10.9710, lng: 76.9150, name: 'Perur Pateeswarar Temple' },
    'selvapuram': { lat: 10.9920, lng: 76.9380, name: 'Selvapuram' },
    'telungupalayam': { lat: 10.9980, lng: 76.9280, name: 'Telungupalayam' },
    'sukrawarpet': { lat: 11.0020, lng: 76.9550, name: 'Sukrawarpet' },
    'ukkadam': { lat: 10.9890, lng: 76.9600, name: 'Ukkadam' },
    'kuniyamuthur': { lat: 10.9575, lng: 76.9535, name: 'Kuniyamuthur' },
    'kovaipudur': { lat: 10.9385, lng: 76.9380, name: 'Kovaipudur' },
    'sundarapuram': { lat: 10.9520, lng: 76.9800, name: 'Sundarapuram' },
    'kurichi': { lat: 10.9500, lng: 76.9700, name: 'Kurichi' },
    'podanur': { lat: 10.9650, lng: 76.9950, name: 'Podanur' },
    'eachanari': { lat: 10.9230, lng: 76.9670, name: 'Eachanari Temple' },
    'madukkarai': { lat: 10.9020, lng: 76.9600, name: 'Madukkarai' },
    'malumichampatti': { lat: 10.8950, lng: 76.9880, name: 'Malumichampatti' },
    'othakkalmandapam': { lat: 10.8650, lng: 76.9920, name: 'Othakkalmandapam' },
    'kinathukadavu': { lat: 10.8220, lng: 77.0190, name: 'Kinathukadavu' },
    'pollachi': { lat: 10.6600, lng: 77.0050, name: 'Pollachi' },
    'ettimadai': { lat: 10.9010, lng: 76.9000, name: 'Ettimadai' },
    'alandurai': { lat: 10.9500, lng: 76.7800, name: 'Alandurai' },
    'pooluvapatti': { lat: 10.9500, lng: 76.7800, name: 'Pooluvapatti' },
    'booluvampatti': { lat: 10.9500, lng: 76.7800, name: 'Booluvampatti' },
    'isha yoga center': { lat: 10.9760, lng: 76.7360, name: 'Isha Yoga Center' },
    'isha yoga': { lat: 10.9760, lng: 76.7360, name: 'Isha Yoga Center' },
    'adiyogi': { lat: 10.9760, lng: 76.7360, name: 'Adiyogi 112ft Shiva' },
    'dhyanalinga': { lat: 10.9760, lng: 76.7360, name: 'Dhyanalinga Temple' },
    'isha': { lat: 10.9760, lng: 76.7360, name: 'Isha Yoga Center' },
    'kovai kutralam': { lat: 10.9400, lng: 76.7100, name: 'Kovai Kutralam Falls' },
    'palladam': { lat: 10.9980, lng: 77.2900, name: 'Palladam' },
    'tiruppur': { lat: 11.1085, lng: 77.3411, name: 'Tiruppur' },
    'tirupur': { lat: 11.1085, lng: 77.3411, name: 'Tiruppur' }
  };

  // Pre-sort locality keys descending by length so longest, most specific phrases match first
  const SORTED_LOCALITY_KEYS = Object.keys(COVAI_LOCALITIES).sort((a, b) => b.length - a.length);

  // Outstation one-way distances from Coimbatore in KM
  const OUTSTATION_DISTANCES = {
    'ooty': { onewayKm: 87, roundTripKm: 220, isHills: true, fixedOneway: 3500 },
    'coonoor': { onewayKm: 70, roundTripKm: 200, isHills: true, fixedOneway: 2900 },
    'kotagiri': { onewayKm: 70, roundTripKm: 200, isHills: true, fixedOneway: 2900 },
    'munnar': { onewayKm: 160, roundTripKm: 350, isHills: true, fixedOneway: 3800 },
    'kodaikanal': { onewayKm: 175, roundTripKm: 380, isHills: true, fixedOneway: 4200 },
    'kodai': { onewayKm: 175, roundTripKm: 380, isHills: true, fixedOneway: 4200 },
    'valparai': { onewayKm: 105, roundTripKm: 250, isHills: true, fixedOneway: 3200 },
    'yercaud': { onewayKm: 195, roundTripKm: 420, isHills: true, fixedOneway: 4800 },
    'wayanad': { onewayKm: 140, roundTripKm: 320, isHills: true, fixedOneway: 5500 },
    'palani': { onewayKm: 110, roundTripKm: 250, isHills: false, fixedOneway: 3900 },
    'tiruppur': { onewayKm: 55, roundTripKm: 250, isHills: false, fixedOneway: 1900 },
    'tirupur': { onewayKm: 55, roundTripKm: 250, isHills: false, fixedOneway: 1900 },
    'erode': { onewayKm: 100, roundTripKm: 250, isHills: false, fixedOneway: 3500 },
    'salem': { onewayKm: 165, roundTripKm: 340, isHills: false, fixedOneway: 3799 },
    'madurai': { onewayKm: 215, roundTripKm: 450, isHills: false, fixedOneway: 4499 },
    'bangalore': { onewayKm: 360, roundTripKm: 750, isHills: false, fixedOneway: 7499 },
    'bengaluru': { onewayKm: 360, roundTripKm: 750, isHills: false, fixedOneway: 7499 },
    'mysore': { onewayKm: 200, roundTripKm: 420, isHills: false, fixedOneway: 5499 },
    'mysuru': { onewayKm: 200, roundTripKm: 420, isHills: false, fixedOneway: 5499 },
    'chennai': { onewayKm: 500, roundTripKm: 1050, isHills: false, fixedOneway: 11500 },
    'trichy': { onewayKm: 215, roundTripKm: 450, isHills: false, fixedOneway: 4800 },
    'guruvayur': { onewayKm: 140, roundTripKm: 300, isHills: false, fixedOneway: 3800 },
    'palakkad': { onewayKm: 52, roundTripKm: 250, isHills: false, fixedOneway: 1900 },
    'sathyamangalam': { onewayKm: 70, roundTripKm: 250, isHills: false, fixedOneway: 2500 },
    'kangeyam': { onewayKm: 70, roundTripKm: 250, isHills: false, fixedOneway: 2500 },
    'udumalpet': { onewayKm: 70, roundTripKm: 250, isHills: false, fixedOneway: 2500 },
    'perundurai': { onewayKm: 80, roundTripKm: 250, isHills: false, fixedOneway: 2900 },
    'gobi': { onewayKm: 83, roundTripKm: 250, isHills: false, fixedOneway: 2900 },
    'dharapuram': { onewayKm: 85, roundTripKm: 250, isHills: false, fixedOneway: 2950 },
    'kanyakumari': { onewayKm: 440, roundTripKm: 900, isHills: false, fixedOneway: 10500 },
    'rameshwaram': { onewayKm: 380, roundTripKm: 800, isHills: false, fixedOneway: 9200 },
    'thanjavur': { onewayKm: 260, roundTripKm: 540, isHills: false, fixedOneway: 6200 }
  };

  const HILL_STATIONS = [
    'ooty', 'coonoor', 'munnar', 'kodaikanal', 'kodai', 'valparai',
    'yercaud', 'kotagiri', 'anamalai', 'wayanad', 'palani hills',
    'nilgiris', 'masinagudi', 'pykara', 'gudalur', 'topslip', 'agali'
  ];

  const FIXED_ONEWAY_RATES = {
    'annur': 1100,
    'isha': 1100,
    'adiyogi': 1100,
    'anaikatti': 1300,
    'mettupalayam': 1400,
    'palladam': 1500,
    'sirumugai': 1500,
    'avinashi': 1600,
    'pollachi': 1600,
    'vana bathrakaliamman': 1600,
    'airport to tiruppur': 1700,
    'puliyampatti': 1800,
    'palakkad': 1900,
    'tirupur': 1900,
    'tiruppur': 1900,
    'airport to palakkad': 2200,
    'sathyamangalam': 2500,
    'kangeyam': 2500,
    'udumalpet': 2500,
    'perundurai': 2900,
    'gobi': 2900,
    'dharapuram': 2950,
    'kotagiri': 2900,
    'coonoor': 2900,
    'erode': 3500,
    'ooty': 3500,
    'palani': 3900,
    'valparai': 3200,
    'munnar': 3800,
    'kodaikanal': 4200,
    'yercaud': 4800,
    'bangalore': 7499,
    'mysore': 5499
  };

  // Haversine formula to compute great-circle distance between two GPS coordinates
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Find locality coordinate match using longest matching keyword first
  function findLocality(query = '') {
    let q = String(query).toLowerCase().trim();
    if (!q) return null;

    // Clean address tokens (strip pincodes, "coimbatore", "tamil nadu", etc. unless that's all there is)
    const cleaned = q.replace(/,\s*coimbatore/gi, '')
                     .replace(/,\s*tamil\s*nadu/gi, '')
                     .replace(/641\d{3}/g, '')
                     .replace(/[,\.-]/g, ' ')
                     .replace(/\s+/g, ' ')
                     .trim();

    const searchTarget = cleaned || q;

    for (let i = 0; i < SORTED_LOCALITY_KEYS.length; i++) {
      const key = SORTED_LOCALITY_KEYS[i];
      if (searchTarget.includes(key) || q.includes(key)) {
        return COVAI_LOCALITIES[key];
      }
    }
    return null;
  }

  function isHillStation(text1 = '', text2 = '') {
    const combined = (String(text1) + ' ' + String(text2)).toLowerCase();
    return HILL_STATIONS.some(kw => combined.includes(kw));
  }

  function formatPriceRange(exactPrice) {
    const exact = Math.round(exactPrice);
    return `₹${exact.toLocaleString('en-IN')}`;
  }

  // 1. Dynamic Local Distance Estimation
  function estimateLocalDistance(pickup = '', drop = '') {
    const p = String(pickup).toLowerCase().trim();
    const d = String(drop).toLowerCase().trim();
    if (!p || !d) return 0;

    const loc1 = findLocality(p);
    const loc2 = findLocality(d);

    if (loc1 && loc2) {
      const straightDist = haversineDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng);
      // Same spot / same neighborhood (e.g. Park Elanza to Ram Nagar / Bus Stand)
      if (straightDist < 0.8) {
        return 1.1;
      }
      // Direct distance * 1.35 (city road winding curvature factor)
      const roadDist = straightDist * 1.35;
      return Math.round(roadDist * 10) / 10;
    }

    if (loc1 || loc2) {
      // Known point to an arbitrary locality: compute realistic 3.5 to 7.5 KM
      const known = loc1 || loc2;
      const otherStr = loc1 ? d : p;
      let hash = 0;
      for (let i = 0; i < otherStr.length; i++) {
        hash = (hash + otherStr.charCodeAt(i) * 13) % 41;
      }
      const dist = 3.2 + (hash / 10);
      return Math.round(dist * 10) / 10;
    }

    // Both arbitrary locations: compute realistic local city distance (2.0 to 6.5 KM)
    let hash = 0;
    const combined = p + '#' + d;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash + combined.charCodeAt(i) * 17) % 45;
    }
    const dist = 2.0 + (hash / 10);
    return Math.round(dist * 10) / 10;
  }

  // 2. Local Taxi Fare Calculation
  // Base fare: ₹150 for first 2.5 KM (includes 2.5 KM ride)
  // Beyond 2.5 KM: Sedan @ ₹28/KM, Prime Sedan @ ₹30/KM, Prime SUV @ ₹36/KM, Premium SUV @ ₹45/KM
  function calculateLocalFare(km, pickup = '', drop = '', cabType = 'sedan') {
    const dist = Math.max(0, parseFloat(km) || 0);
    if (dist <= 0) return 0;

    let baseFare = 150;
    let perKmRate = 28;

    if (cabType === 'prime_sedan') {
      baseFare = 170;
      perKmRate = 30;
    } else if (cabType === 'prime_suv') {
      baseFare = 250;
      perKmRate = 36;
    } else if (cabType === 'premium_suv') {
      baseFare = 350;
      perKmRate = 45;
    }

    let fare = baseFare;
    if (dist > 2.5) {
      fare += (dist - 2.5) * perKmRate;
    }

    // District border outskirts adjustment (+₹100)
    const combined = (String(pickup) + ' ' + String(drop)).toLowerCase();
    const borderOutskirts = [
      'karumathampatti', 'karanampettai', 'paapampatti', 'ganeshapuram',
      'kovilpalayam', 'karamadai', 'booluvampatti', 'pooluvapatti',
      'ettimadai', 'kinathukadavu', 'malumichampatti', 'sulur'
    ];
    if (borderOutskirts.some(loc => combined.includes(loc))) {
      fare += 100;
    }

    return Math.round(fare);
  }

  // 3. Oneway Drop Fare Calculation
  function calculateOnewayFare(km, destName = '', pickupName = '', cabType = 'sedan') {
    const normDrop = String(destName).toLowerCase().trim();
    const normPickup = String(pickupName).toLowerCase().trim();
    let baseRate = 0;

    // Check fixed tariff dictionary match
    for (let key in FIXED_ONEWAY_RATES) {
      if (normDrop.includes(key) || normPickup.includes(key)) {
        baseRate = FIXED_ONEWAY_RATES[key];
        break;
      }
    }

    if (!baseRate) {
      const dist = Math.max(0, parseFloat(km) || 0);
      if (dist <= 100) {
        baseRate = dist * 2 * 17;
      } else {
        baseRate = (dist * 2 * 14) + 400;
      }
    }

    // Apply vehicle class multiplier
    let multiplier = 1.0;
    if (cabType === 'prime_sedan') multiplier = 1.10;
    else if (cabType === 'prime_suv') multiplier = 1.35;
    else if (cabType === 'premium_suv') multiplier = 1.65;

    return Math.round(baseRate * multiplier);
  }

  // 4. Outstation Round Trip Distance & Fare Calculation
  function resolveOutstationDetails(destQuery = '') {
    const q = String(destQuery).toLowerCase().trim();
    for (let key in OUTSTATION_DISTANCES) {
      if (q.includes(key) || key.includes(q)) {
        return OUTSTATION_DISTANCES[key];
      }
    }
    // Default estimate for unrecognized outstation destination
    return { onewayKm: 125, roundTripKm: 250, isHills: isHillStation(q) };
  }

  function calculateOutstationFare(roundTripKm, isHills, cabType = 'sedan') {
    const dist = Math.max(250, parseFloat(roundTripKm) || 250);
    let perKm = 13;
    let driverBatta = 400;
    let hillCharge = isHills ? 400 : 0;

    if (cabType === 'prime_sedan') {
      perKm = 14;
      driverBatta = 400;
    } else if (cabType === 'prime_suv') {
      perKm = 18;
      driverBatta = 500;
      if (isHills) hillCharge = 500;
    } else if (cabType === 'premium_suv') {
      perKm = 23;
      driverBatta = 600;
      if (isHills) hillCharge = 600;
    }

    const fare = (dist * perKm) + driverBatta + hillCharge;
    return Math.round(fare);
  }

  // 5. Hourly Package Fare Calculation
  function calculateHourlyFare(hours, cabType = 'sedan') {
    const hrs = parseInt(hours, 10) || 1;
    let basePrice = hrs * 350;
    if (hrs >= 12) basePrice = 3500;
    else if (hrs >= 10) basePrice = 3000;

    let multiplier = 1.0;
    if (cabType === 'prime_sedan') multiplier = 1.15;
    else if (cabType === 'prime_suv') multiplier = 1.50;
    else if (cabType === 'premium_suv') multiplier = 2.00;

    return Math.round(basePrice * multiplier);
  }

  // 6. Address Input Handler (Location suggestion dropdowns disabled per user request)
  function setupAddressAutocomplete() {
    const selector = '.address-autocomplete, #local-pickup, #local-drop, #oneway-pickup, #oneway-drop, #outstation-pickup, #outstation-drop, #hourly-pickup, [data-field="pickup"], [data-field="drop"]';
    const inputs = document.querySelectorAll(selector);

    // Remove any existing autocomplete dropdown elements in the DOM
    document.querySelectorAll('.autocomplete-dropdown').forEach(dd => dd.remove());

    inputs.forEach(input => {
      if (!input || input.dataset.autocompleteBound) return;
      input.dataset.autocompleteBound = "true";
      input.setAttribute('autocomplete', 'off');

      // Remove any existing dropdown inside parent
      const parent = input.closest('.field-group') || input.parentNode;
      if (parent) {
        const existingDropdown = parent.querySelector('.autocomplete-dropdown');
        if (existingDropdown) existingDropdown.remove();
      }

      // Update fare estimates on typing without showing any location suggestions dropdown
      input.addEventListener('input', function() {
        updateAllEstimates();
      });
    });
  }

  // Update all estimate displays in the booking tabs
  function updateAllEstimates() {
    // 1. Local Ride
    const localPickup = document.getElementById('local-pickup')?.value || '';
    const localDrop = document.getElementById('local-drop')?.value || '';
    const localCabType = document.getElementById('local-cab-type')?.value || 'sedan';
    const localFareEl = document.getElementById('local-fare-display');
    if (localFareEl) {
      if (!localPickup.trim() || !localDrop.trim()) {
        localFareEl.textContent = 'Enter pickup & drop';
      } else {
        const localDist = estimateLocalDistance(localPickup, localDrop);
        const localPrice = calculateLocalFare(localDist, localPickup, localDrop, localCabType);
        localFareEl.textContent = `${formatPriceRange(localPrice)} (~${localDist} KM)`;
      }
    }

    // 2. Oneway Ride
    const onewayPickup = document.getElementById('oneway-pickup')?.value || '';
    const onewayDrop = document.getElementById('oneway-drop')?.value || '';
    const onewayCabType = document.getElementById('oneway-cab-type')?.value || 'sedan';
    const onewayFareEl = document.getElementById('oneway-fare-display');
    if (onewayFareEl) {
      if (!onewayPickup.trim() || !onewayDrop.trim()) {
        onewayFareEl.textContent = 'Enter pickup & drop';
      } else {
        const outstationDetails = resolveOutstationDetails(onewayDrop);
        let onewayDist = 87;
        if (outstationDetails && outstationDetails.onewayKm) {
          onewayDist = outstationDetails.onewayKm;
        } else {
          const locDist = estimateLocalDistance(onewayPickup, onewayDrop);
          if (locDist > 0) onewayDist = Math.max(25, locDist);
        }
        const onewayPrice = calculateOnewayFare(onewayDist, onewayDrop, onewayPickup, onewayCabType);
        onewayFareEl.textContent = `${formatPriceRange(onewayPrice)} (${onewayDist} KM drop)`;
      }
    }

    // 3. Outstation Round Trip
    const outstationPickup = document.getElementById('outstation-pickup')?.value || '';
    const outstationDrop = document.getElementById('outstation-drop')?.value || '';
    const outstationCabType = document.getElementById('outstation-cab-type')?.value || 'sedan';
    const manualHillsSelect = document.getElementById('outstation-is-hills');
    const outstationFareEl = document.getElementById('outstation-fare-display');
    
    if (outstationFareEl) {
      if (!outstationPickup.trim() || !outstationDrop.trim()) {
        outstationFareEl.textContent = 'Enter pickup & destination';
      } else {
        const outstationDetails = resolveOutstationDetails(outstationDrop);
        let isOutstationHills = outstationDetails.isHills || isHillStation(outstationPickup, outstationDrop);
        
        if (manualHillsSelect) {
          if (manualHillsSelect.value === 'yes') {
            isOutstationHills = true;
          } else if (manualHillsSelect.value === 'no' && !outstationDetails.isHills) {
            isOutstationHills = false;
          } else if (isOutstationHills) {
            manualHillsSelect.value = 'yes';
          }
        }

        const outstationDist = outstationDetails.roundTripKm || (estimateLocalDistance(outstationPickup, outstationDrop) * 2) || 200;
        const outstationPrice = calculateOutstationFare(outstationDist, isOutstationHills, outstationCabType);
        outstationFareEl.textContent = `${formatPriceRange(outstationPrice)} (${outstationDist} KM Round Trip)`;
      }
    }

    // 4. Hourly Package Rental
    const selectedHours = document.getElementById('hourly-pkg-select')?.value || 10;
    const hourlyPickup = document.getElementById('hourly-pickup')?.value || '';
    const hourlyCabType = document.getElementById('hourly-cab-type')?.value || 'sedan';
    const hourlyFareEl = document.getElementById('hourly-fare-display');
    if (hourlyFareEl) {
      if (!hourlyPickup.trim()) {
        hourlyFareEl.textContent = 'Enter pickup location';
      } else {
        const hourlyPrice = calculateHourlyFare(selectedHours, hourlyCabType);
        hourlyFareEl.textContent = `${formatPriceRange(hourlyPrice)} (${selectedHours} Hrs Package)`;
      }
    }
  }

  // Attach dynamic input event listeners for live price updates & auto hill detection
  const calcInputs = [
    'local-pickup', 'local-drop', 'local-cab-type',
    'oneway-pickup', 'oneway-drop', 'oneway-cab-type',
    'outstation-pickup', 'outstation-drop', 'outstation-is-hills', 'outstation-cab-type',
    'hourly-pkg-select', 'hourly-cab-type', 'hourly-pickup'
  ];

  calcInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateAllEstimates);
      el.addEventListener('change', updateAllEstimates);
      el.addEventListener('keyup', updateAllEstimates);
    }
  });

  // Initialize interactive address autocomplete on all booking address fields
  setupAddressAutocomplete();
  updateAllEstimates();

  // 4. Booking Submission & Modal Popup
  const forms = [
    { id: 'form-local', type: 'Local Ride' },
    { id: 'form-oneway', type: 'Oneway Ride' },
    { id: 'form-outstation', type: 'Outstation Travel' },
    { id: 'form-hourly', type: 'Hourly Package Rental' }
  ];

  const modalOverlay = document.getElementById('booking-modal');
  const modalDetails = document.getElementById('modal-details-body');
  const modalCloseBtn = document.getElementById('modal-close');

  forms.forEach(item => {
    const formEl = document.getElementById(item.id);
    if (formEl) {
      formEl.addEventListener('submit', function (e) {
        e.preventDefault();

        // Extract values dynamically
        let pickup = formEl.querySelector('[data-field="pickup"]')?.value || 'Coimbatore Gandhipuram';
        let drop = formEl.querySelector('[data-field="drop"]')?.value || 'Coimbatore Airport CJB';
        let date = formEl.querySelector('[data-field="date"]')?.value || 'Today';
        let time = formEl.querySelector('[data-field="time"]')?.value || 'Immediate';
        let phone = formEl.querySelector('[data-field="phone"]')?.value || '9894020156';
        let fare = formEl.querySelector('.price-tag')?.textContent || '₹450';

        if (modalDetails) {
          modalDetails.innerHTML = `
            <div style="text-align:left; background:#f9fafb; padding:18px; border-radius:10px; margin:16px 0; border:1px solid #e5e7eb; font-size:0.95rem;">
              <p style="margin-bottom:6px;"><strong>Booking Type:</strong> <span style="color:#d90429; font-weight:700;">${item.type}</span></p>
              <p style="margin-bottom:6px;"><strong>Pickup Location:</strong> ${pickup}</p>
              <p style="margin-bottom:6px;"><strong>Drop Location / Destination:</strong> ${drop}</p>
              <p style="margin-bottom:6px;"><strong>Date & Time:</strong> ${date} at ${time}</p>
              <p style="margin-bottom:6px;"><strong>Customer Phone:</strong> ${phone}</p>
              <p style="margin-top:10px; font-size:1.15rem; color:#d90429;"><strong>Estimated Fare:</strong> ${fare}</p>
            </div>
            <p style="font-size:0.875rem; color:#059669; background:#ecfdf5; padding:12px; border-radius:8px; font-weight:600;">
              ✓ Get Cabs booking confirmation SMS & driver details will be sent to ${phone}. Or call us directly at <strong>9894020156</strong>.
            </p>
          `;

          // Dynamic WhatsApp link with formatted booking message
          const waMsg = encodeURIComponent(
            `*🚕 GET CABS COIMBATORE - BOOKING REQUEST*\n\n` +
            `• *Booking Type:* ${item.type}\n` +
            `• *Pickup:* ${pickup}\n` +
            `• *Drop:* ${drop}\n` +
            `• *Date & Time:* ${date} ${time !== 'Immediate' ? 'at ' + time : ''}\n` +
            `• *Phone:* ${phone}\n` +
            `• *Estimated Fare:* ${fare}\n\n` +
            `Please confirm my cab booking and driver details.`
          );
          const waBtn = document.getElementById('modal-whatsapp-btn');
          if (waBtn) {
            waBtn.href = `https://wa.me/919894020156?text=${waMsg}`;
          }

          // Trigger Google Ads & Analytics conversion event
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'generate_lead', {
              event_category: 'Cab Booking',
              event_label: item.type,
              value: parseInt((fare || '').replace(/\D/g, '')) || 0,
              currency: 'INR'
            });
            window.gtag('event', 'conversion', {
              send_to: 'AW-18362358549'
            });
          }
        }

        if (modalOverlay) {
          modalOverlay.classList.add('active');
        }
      });
    }
  });

  // Track Phone Calls & WhatsApp Clicks across all CTA buttons
  document.addEventListener('click', function (e) {
    const target = e.target.closest('a[href^="tel:"], a[href*="wa.me"]');
    if (!target) return;

    const isTel = target.getAttribute('href').startsWith('tel:');
    const isWa = target.getAttribute('href').includes('wa.me');

    if (typeof window.gtag === 'function') {
      if (isTel) {
        window.gtag('event', 'contact', {
          event_category: 'Phone Call',
          event_label: '9894020156'
        });
        window.gtag('event', 'conversion', {
          send_to: 'AW-18362358549'
        });
      } else if (isWa) {
        window.gtag('event', 'contact', {
          event_category: 'WhatsApp Booking',
          event_label: '9894020156'
        });
        window.gtag('event', 'conversion', {
          send_to: 'AW-18362358549'
        });
      }
    }
  });

  if (modalCloseBtn && modalOverlay) {
    modalCloseBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  // 5. FAQ Accordion Handling
  const faqHeads = document.querySelectorAll('.faq-head');
  faqHeads.forEach(btn => {
    btn.addEventListener('click', function () {
      const parentCard = this.parentElement;
      const isActive = parentCard.classList.contains('active');

      document.querySelectorAll('.faq-card').forEach(card => card.classList.remove('active'));

      if (!isActive) {
        parentCard.classList.add('active');
      }
    });
  });

  // 6. Smooth Scroll Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
        if (mainMenu) mainMenu.classList.remove('active');
      }
    });
  });

  // 7. Scroll Reveal Animations Observer
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // 8. Deferred Non-Critical Features (Canvas, Video, Chatbot, Modals, Spin Wheel)
  let deferredInitialized = false;
  let realOpenDedicatedPage = null;

  window.openDedicatedPage = function(pageKey, blogKey, packageKey) {
    if (!deferredInitialized) initDeferredFeatures();
    if (typeof realOpenDedicatedPage === 'function') {
      realOpenDedicatedPage(pageKey, blogKey, packageKey);
    }
  };

  function initDeferredFeatures() {
    if (deferredInitialized) return;
    deferredInitialized = true;

    // 8a. Dynamic Ambient Highway Motion Engine (Canvas Fallback & Backdrop)
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
      const ctx = heroCanvas.getContext('2d');
      let width, height;

      function resizeCanvas() {
        if (!heroCanvas.parentElement) return;
        width = heroCanvas.width = heroCanvas.parentElement.clientWidth || window.innerWidth;
        height = heroCanvas.height = heroCanvas.parentElement.clientHeight || 500;
      }
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      // Highway streaks particles
      const streaks = [];
      const numStreaks = 45;
      for (let i = 0; i < numStreaks; i++) {
        streaks.push({
          x: Math.random() * 2 - 1,
          y: Math.random(),
          z: Math.random() * 0.9 + 0.1,
          speed: Math.random() * 0.015 + 0.008,
          color: Math.random() > 0.4 ? 'rgba(217, 4, 41, ' : (Math.random() > 0.5 ? 'rgba(255, 183, 3, ' : 'rgba(255, 255, 255, '),
          length: Math.random() * 80 + 40
        });
      }

      function renderHighway() {
        if (!ctx || width === 0) return;
        ctx.clearRect(0, 0, width, height);

        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, '#0b1329');
        skyGrad.addColorStop(0.5, '#111827');
        skyGrad.addColorStop(1, '#080d1a');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height * 0.35;

        ctx.beginPath();
        ctx.moveTo(cx - width * 0.1, cy);
        ctx.lineTo(cx + width * 0.1, cy);
        ctx.lineTo(width * 1.2, height);
        ctx.lineTo(-width * 0.2, height);
        ctx.closePath();
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        streaks.forEach(s => {
          s.y += s.speed;
          if (s.y > 1) {
            s.y = 0;
            s.x = Math.random() * 2 - 1;
          }

          const px = cx + (s.x * (s.y * width * 0.6));
          const py = cy + (s.y * (height - cy));
          const pLength = s.length * s.y;
          const opacity = Math.min(s.y * 1.5, 0.9);

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + (s.x * pLength * 0.2), py + pLength);
          ctx.strokeStyle = `${s.color}${opacity})`;
          ctx.lineWidth = Math.max(1, s.y * 5);
          ctx.stroke();
        });

        requestAnimationFrame(renderHighway);
      }
      renderHighway();
    }

  // 9. Ensure Background Video Autoplay & Fallback Handling
  const heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.playsInline = true;

    function attemptPlay() {
      const playPromise = heroVideo.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          heroVideo.style.opacity = '1';
        }).catch(() => {
          // If browser restricts unprompted autoplay, fallback poster/canvas runs smoothly
          heroVideo.style.opacity = '0.4';
        });
      }
    }

    heroVideo.addEventListener('loadeddata', attemptPlay);
    heroVideo.addEventListener('canplay', attemptPlay);
    attemptPlay();

    // Re-trigger play on user interaction anywhere on page
    document.addEventListener('click', function playOnInteraction() {
      if (heroVideo.paused) {
        heroVideo.play().then(() => {
          heroVideo.style.opacity = '1';
        }).catch(() => {});
      }
    }, { once: true });
  }

  // 10. Dedicated Sub-Page Router & Dynamic Page Renderer
  const pageOverlay = document.getElementById('dedicated-page-overlay');
  const pageTitleEl = document.getElementById('dedicated-page-title');
  const pageContentEl = document.getElementById('dedicated-page-content');
  const pageCloseBtn = document.getElementById('dedicated-page-close');

  const BLOG_DATA = {
    'ooty-guide': {
      title: 'Top 10 Places to Visit in Ooty from Coimbatore (2026 Cab Guide)',
      category: 'Ooty Hill Guide',
      date: 'July 2026',
      readTime: '5 min read',
      img: './public/assets/images/blog-ooty.webp',
      content: `
        <div class="blog-full-article">
          <div class="blog-hero-header">
            <span class="blog-tag-badge" style="position:static; display:inline-block; margin-bottom:12px;">Ooty Hill Guide</span>
            <h1>Top 10 Places to Visit in Ooty from Coimbatore (2026 Cab Guide)</h1>
            <div class="blog-meta-info" style="font-size:0.9rem;">
              <span>📅 July 2026</span> • <span>⏱️ 5 min read</span> • <span>✍️ Get Cabs Travel Desk</span>
            </div>
          </div>

          <img src="./public/assets/images/blog-ooty.webp" alt="Coimbatore to Ooty Cab Travel" class="blog-featured-img" onerror="this.onerror=null; this.src='./public/assets/images/dest-ooty.webp';" />

          <p>Ooty, known as the <em>Queen of Hill Stations</em>, is located just 85 KM from Coimbatore city. Traveling by cab from Coimbatore to Ooty gives you the flexibility to enjoy breathtaking viewpoints along the Mettupalayam and Coonoor ghat road with 36 hairpin curves.</p>

          <h3 style="font-size:1.4rem; font-weight:800; margin:24px 0 12px 0; color:var(--brand-dark);">1. Ooty Botanical Gardens</h3>
          <p>Spread over 55 acres on the slopes of Doddabetta peak, the Government Botanical Garden features over 1,000 species of exotic plants, ferns, and a 20-million-year-old fossilized tree trunk.</p>

          <h3 style="font-size:1.4rem; font-weight:800; margin:24px 0 12px 0; color:var(--brand-dark);">2. Ooty Lake & Boating Spot</h3>
          <p>Constructed in 1824 by John Sullivan, Ooty Lake is an iconic destination for pedal boating and motorboat rides surrounded by tall eucalyptus trees.</p>

          <h3 style="font-size:1.4rem; font-weight:800; margin:24px 0 12px 0; color:var(--brand-dark);">3. Doddabetta Peak (2,637 meters)</h3>
          <p>The highest mountain peak in the Nilgiris district. Enjoy panoramic 360-degree views of the valley through the Telescope House observatory.</p>

          <h3 style="font-size:1.4rem; font-weight:800; margin:24px 0 12px 0; color:var(--brand-dark);">4. Rose Garden & Tea Park</h3>
          <p>Home to over 20,000 varieties of roses, making it one of the largest rose collections in India.</p>

          <div class="blog-cta-banner">
            <h3>Ready for an Ooty Trip from Coimbatore?</h3>
            <p style="margin-bottom:16px;">Book a Sedan for ₹2,380 or an Innova SUV for ₹3,800. Driver Batta included with zero hidden costs!</p>
            <a href="tel:9894020156" class="btn btn-yellow" style="padding:12px 24px;">📞 Call 9894020156 to Book Ooty Cab</a>
          </div>

          <h3 style="font-size:1.4rem; font-weight:800; margin:24px 0 12px 0; color:var(--brand-dark);">5. Coonoor Tea Estates & Sim's Park</h3>
          <p>En route from Mettupalayam to Ooty, stop by Coonoor for lush green tea garden photography, fresh factory tea tasting, and Sim's Park botanical displays.</p>

          <h3 style="font-size:1.4rem; font-weight:800; margin:24px 0 12px 0; color:var(--brand-dark);">Cab Fare Breakdown (Coimbatore to Ooty)</h3>
          <ul style="margin-left:20px; line-height:1.8;">
            <li><strong>Oneway Sedan (Dzire / Etios):</strong> ₹2,380 ~ ₹2,560 (85 KM + ₹500 Batta + ₹400 Hill Charge)</li>
            <li><strong>Oneway SUV (Ertiga / Innova):</strong> ₹3,800 ~ ₹4,100</li>
            <li><strong>Round Trip (Day Package):</strong> ₹15/KM + ₹500 Driver Batta</li>
          </ul>
        </div>
      `
    },
    'airport-guide': {
      title: 'Coimbatore Airport Taxi Booking: Fast 24/7 Pickups & Fixed Fares',
      category: 'Airport Taxi',
      date: 'July 2026',
      readTime: '4 min read',
      img: './public/assets/images/blog-tips.webp',
      content: `
        <div class="blog-full-article">
          <div class="blog-hero-header">
            <span class="blog-tag-badge" style="position:static; display:inline-block; margin-bottom:12px;">Airport Taxi</span>
            <h1>Coimbatore Airport Taxi Booking: Fast 24/7 Pickups & Fixed Fares</h1>
            <div class="blog-meta-info" style="font-size:0.9rem;">
              <span>📅 July 2026</span> • <span>⏱️ 4 min read</span> • <span>✍️ Get Cabs Dispatch Desk</span>
            </div>
          </div>

          <img src="./public/assets/images/blog-tips.webp" alt="Coimbatore Airport Taxi Service" class="blog-featured-img" onerror="this.onerror=null; this.src='./public/assets/images/dest-ooty.webp';" />

          <p>Coimbatore International Airport (CJB) located in Peelamedu connects thousands of business and leisure travelers daily. Getting a reliable taxi with zero surge pricing is crucial for early morning or late night flights.</p>

          <h3>Why Choose Get Cabs for Airport Transfers?</h3>
          <ul style="margin-left:20px; line-height:1.8;">
            <li><strong>10-Minute Instant Dispatch:</strong> Our cabs are stationed near Peelamedu, Hopes College, Gandhipuram, and RS Puram.</li>
            <li><strong>Zero Surge Fees:</strong> Unlike app aggregators, Get Cabs maintains fixed transparent ₹28/KM pricing 24 hours a day.</li>
            <li><strong>Flight Delay Monitoring:</strong> Provide your flight number and our driver waits for you at the CJB arrival gate without extra waiting penalties.</li>
          </ul>

          <div class="blog-cta-banner">
            <h3>Need an Immediate Airport Pickup or Drop?</h3>
            <p style="margin-bottom:16px;">Call our 24/7 hotline <strong>9894020156</strong> for immediate vehicle assignment in under 10 minutes!</p>
            <a href="tel:9894020156" class="btn btn-yellow" style="padding:12px 24px;">📞 Call 9894020156 Now</a>
          </div>
        </div>
      `
    },
    'oneway-vs-round': {
      title: 'Oneway Cabs vs Round Trip Travel: Save Up to 40% On Intercity Travel',
      category: 'Fare Hacks',
      date: 'July 2026',
      readTime: '6 min read',
      img: './public/assets/images/fleet-sedan.webp',
      content: `
        <div class="blog-full-article">
          <div class="blog-hero-header">
            <span class="blog-tag-badge" style="position:static; display:inline-block; margin-bottom:12px;">Fare Hacks</span>
            <h1>Oneway Cabs vs Round Trip Travel: Save Up to 40% On Intercity Travel</h1>
            <div class="blog-meta-info" style="font-size:0.9rem;">
              <span>📅 July 2026</span> • <span>⏱️ 6 min read</span> • <span>✍️ Get Cabs Billing Team</span>
            </div>
          </div>

          <img src="./public/assets/images/fleet-sedan.webp" alt="Oneway Cabs Coimbatore" class="blog-featured-img" onerror="this.onerror=null; this.src='./public/assets/images/dest-ooty.webp';" />

          <p>Traditional outstation taxis charge return kilometer fares regardless of whether you need the cab for the journey back. Get Cabs Oneway Intercity Service eliminates return charges completely!</p>

          <h3>Cost Comparison Example: Coimbatore to Tirupur (55 KM)</h3>
          <p><strong>Traditional Outstation Taxi (Round Trip Charges):</strong> 110 KM @ ₹15/KM + ₹300 Driver Batta = ₹1,950+</p>
          <p><strong>Get Cabs Oneway Fare:</strong> 55 KM @ ₹28/KM + ₹300 Driver Batta = <strong>₹1,710 ~ ₹1,840</strong> (Save money and pay only for actual distance traveled!)</p>

          <div class="blog-cta-banner">
            <h3>Book Your Oneway Cab Today</h3>
            <p style="margin-bottom:16px;">Oneway drops available from Coimbatore to Chennai, Bangalore, Salem, Erode, Tirupur, Madurai & Kerala.</p>
            <a href="tel:9894020156" class="btn btn-yellow" style="padding:12px 24px;">📞 Call 9894020156 to Book</a>
          </div>
        </div>
      `
    },
    'hill-drives': {
      title: 'Best Hill Station Drives from Coimbatore: Valparai, Kodaikanal & Munnar',
      category: 'Outstation Tours',
      date: 'July 2026',
      readTime: '5 min read',
      img: './public/assets/images/blog-valparai.webp',
      content: `
        <div class="blog-full-article">
          <div class="blog-hero-header">
            <span class="blog-tag-badge" style="position:static; display:inline-block; margin-bottom:12px;">Outstation Tours</span>
            <h1>Best Hill Station Drives from Coimbatore: Valparai, Kodaikanal & Munnar</h1>
            <div class="blog-meta-info" style="font-size:0.9rem;">
              <span>📅 July 2026</span> • <span>⏱️ 5 min read</span> • <span>✍️ Get Cabs Tour Desk</span>
            </div>
          </div>

          <img src="./public/assets/images/blog-valparai.webp" alt="Hill Drives Outstation Cabs" class="blog-featured-img" onerror="this.onerror=null; this.src='./public/assets/images/dest-ooty.webp';" />

          <p>Coimbatore is surrounded by Western Ghats mountain destinations. Hiring an experienced hill station driver ensures comfort, safety, and smooth navigation through foggy hairpin bends.</p>

          <h3>1. Valparai (105 KM • 40 Hairpin Bends)</h3>
          <p>A serene tea estate sanctuary with Lion-tailed Macaque sightings and Aliyar Dam views.</p>

          <h3>2. Munnar (160 KM • Tea Valley Gateway)</h3>
          <p>Famous for Anamudi Peak, Mattupetty Dam, and sprawling spice plantations.</p>

          <h3>3. Kodaikanal (175 KM • Princess of Hill Stations)</h3>
          <p>Explore Kodai Lake, Pillar Rocks, and Coaker's Walk with family SUV comfort.</p>

          <div class="blog-cta-banner">
            <h3>Book Your Hill Station SUV Tour</h3>
            <p style="margin-bottom:16px;">Innova Crysta & Ertiga Prime SUVs available with veteran hill drivers.</p>
            <a href="tel:9894020156" class="btn btn-yellow" style="padding:12px 24px;">📞 Call 9894020156</a>
          </div>
        </div>
      `
    }
  };

  const PAGE_TEMPLATES = {
    'privacy-policy': {
      title: 'Privacy Policy',
      content: `
        <div class="policy-doc">
          <h2>Get Cabs Coimbatore Privacy Policy</h2>
          <p style="color:var(--text-muted);">Last Updated: July 2026 • Official Policy Document</p>
          
          <div class="policy-highlight-box">
            🔒 <strong>Commitment to Confidentiality:</strong> Get Cabs respects your personal data. We do NOT share, sell, or disclose your phone numbers, name, or trip locations to external third parties or telemarketing agencies.
          </div>

          <h3>1. Data We Collect</h3>
          <p>To provide accurate taxi dispatch and driver assignment in Coimbatore, Get Cabs collects:</p>
          <ul>
            <li><strong>Customer Contact Details:</strong> Phone number and customer name provided during web booking or phone call to 9894020156.</li>
            <li><strong>Trip Information:</strong> Pickup address, landmark, destination drop point, requested travel date, and preferred vehicle type (Sedan / SUV / Traveller).</li>
            <li><strong>GPS & Route Data:</strong> Live GPS coordinates utilized solely by the assigned driver during active ride navigation.</li>
          </ul>

          <h3>2. How We Use Your Data</h3>
          <p>Your details are strictly used for:</p>
          <ul>
            <li>Dispatching closest driver to your pickup location in Coimbatore.</li>
            <li>Sending booking confirmation SMS, driver contact details, and vehicle registration numbers.</li>
            <li>Customer support resolution and fare calculation transparency.</li>
          </ul>

          <h3>3. Data Protection & Security</h3>
          <p>All online reservation details are stored securely. Payment information handled directly with drivers via cash or UPI is verified immediately with zero stored card details.</p>

          <h3>4. Contact Data Officer</h3>
          <p>For privacy queries or request for data removal, contact Get Cabs Coimbatore at <strong>booking@getcabs.in</strong> or call <strong>9894020156</strong>.</p>
        </div>
      `
    },
    'terms-conditions': {
      title: 'Terms & Conditions',
      content: `
        <div class="policy-doc">
          <h2>Terms & Conditions of Service</h2>
          <p style="color:var(--text-muted);">Effective July 2026 • Get Cabs Coimbatore</p>

          <h3>1. Booking & Fare Structure</h3>
          <ul>
            <li><strong>Local Rides:</strong> Transparent ₹28/KM pricing for local city rides without peak surge charges.</li>
            <li><strong>Oneway Rides:</strong> ₹28/KM + Driver Batta (₹500 for Ooty route, ₹300 for other intercity routes) + ₹400 Hill Charge where applicable.</li>
            <li><strong>Outstation Round Trip:</strong> Charged at ₹15/KM (up & down cumulative mileage) + ₹300-₹500 daily Driver Batta. Minimum daily mileage benchmark is 250 KM per day as per Tamil Nadu commercial rules.</li>
          </ul>

          <h3>2. Tolls, Parking & State Permits</h3>
          <p>Highway toll booth charges, airport entry/parking fees, and inter-state permit taxes (e.g. Kerala / Karnataka permits) are extra at actuals payable by the passenger or added to the final invoice.</p>

          <h3>3. Passenger Luggage & Vehicle Capacity</h3>
          <ul>
            <li><strong>4-Seater Sedan:</strong> Maximum 4 passengers + 3 medium suitcases.</li>
            <li><strong>6-Seater SUV:</strong> Maximum 6 passengers + 4 medium suitcases.</li>
            <li><strong>7-Seater Innova:</strong> Maximum 7 passengers + 4 large suitcases.</li>
          </ul>

          <h3>4. Safety & Conduct</h3>
          <p>Smoking, consumption of alcohol, or illegal substances inside Get Cabs vehicles is strictly prohibited. Drivers hold full rights to terminate rides in cases of unruly behavior.</p>
        </div>
      `
    },
    'cancellation-policy': {
      title: 'Cancellation & Refund Policy',
      content: `
        <div class="policy-doc">
          <h2>Cancellation & Refund Policy</h2>
          <p style="color:var(--text-muted);">Transparent & Customer-Friendly Policy</p>

          <div class="policy-highlight-box">
            ✅ <strong>100% Free Cancellation:</strong> Cancel your booking free of charge anytime prior to driver vehicle dispatch!
          </div>

          <h3>1. Cancellation Guidelines</h3>
          <ul>
            <li><strong>Before Driver Dispatch:</strong> Zero cancellation fee.</li>
            <li><strong>After Driver Arrives at Pickup Location:</strong> If the ride is cancelled after the driver has reached your pickup spot in Coimbatore, a nominal ₹100 driver arrival fee applies.</li>
          </ul>

          <h3>2. Pre-Paid & Advance Booking Refunds</h3>
          <p>For advance outstation or airport reservations where advance payment was made, full refunds are processed within 24 business hours directly to your UPI/Bank account.</p>

          <h3>3. Extreme Weather & Hill Road Closures</h3>
          <p>In case of unexpected weather landslides, government road closures, or Nilgiris ghat road bans on Ooty / Valparai routes, Get Cabs provides 100% fee waiver and immediate re-routing support.</p>
        </div>
      `
    },
    'faq': {
      title: 'Frequently Asked Questions (FAQ)',
      content: `
        <div class="policy-doc">
          <h2>Get Cabs Frequently Asked Questions</h2>
          <p style="margin-bottom:20px; color:var(--text-muted);">Everything you need to know about Coimbatore cab booking, rates, and outstation trips.</p>

          <div class="contact-card-box">
            <h3 style="margin-top:0;">1. How fast can I get a cab in Coimbatore?</h3>
            <p>Our cabs are stationed across Gandhipuram, Peelamedu, RS Puram, Saravanampatti, Singanallur, and Coimbatore Airport. Standard pickup time is 5 to 10 minutes!</p>

            <h3>2. How are Oneway Intercity fares calculated?</h3>
            <p>Oneway fares are billed strictly at ₹28 per KM for actual travel distance plus applicable Driver Batta (₹500 for Ooty, ₹300 for non-hill routes). You pay ZERO return charges.</p>

            <h3>3. Are there extra night surge charges for city local rides?</h3>
            <p>No! Get Cabs does NOT charge night surge multipliers for local city transfers in Coimbatore.</p>

            <h3>4. Can I book an Innova Crysta for an Ooty family trip?</h3>
            <p>Yes! We specialize in Innova Crysta and Ertiga SUV hill station trips with experienced hill mountain drivers.</p>

            <h3>5. How do I book instantly?</h3>
            <p>Call our 24/7 hotline directly at <strong style="color:var(--brand-red);">9894020156</strong> or fill out the booking form on the main page.</p>
          </div>
        </div>
      `
    },
    'contact-us': {
      title: 'Contact Get Cabs Coimbatore',
      content: `
        <div class="policy-doc">
          <h2>Contact Us - Get Cabs Coimbatore</h2>
          <p>We are available 24 hours a day, 7 days a week to assist your travel needs.</p>

          <div class="contact-info-list">
            <div class="contact-item">
              <div class="contact-icon">📞</div>
              <div>
                <strong>24/7 Hotline</strong>
                <div style="font-size:1.1rem; color:var(--brand-red); font-weight:800; margin-top:2px;">9894020156</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">Instant Call Booking</div>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon">📍</div>
              <div>
                <strong>Coimbatore Dispatch Office</strong>
                <div style="font-size:0.9rem; margin-top:2px;">Gandhipuram Taxi Stand & Peelamedu Airport Rd, Coimbatore - 641001</div>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon">✉️</div>
              <div>
                <strong>Email Support</strong>
                <div style="font-size:0.9rem; margin-top:2px;">booking@getcabs.in</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">Quick Email Response</div>
              </div>
            </div>
          </div>

          <div class="contact-card-box" style="margin-top:24px;">
            <h3>Send Direct Message / Query</h3>
            <form id="direct-contact-form" onsubmit="event.preventDefault(); alert('Thank you! Get Cabs Coimbatore team will call you back at 9894020156 shortly.');">
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:12px;">
                <input type="text" placeholder="Your Name" required style="padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.95rem; width:100%;" />
                <input type="tel" placeholder="Your Phone Number" required style="padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.95rem; width:100%;" />
              </div>
              <textarea placeholder="Trip requirements or questions..." rows="4" required style="padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.95rem; width:100%; margin-bottom:12px;"></textarea>
              <button type="submit" class="btn btn-red" style="padding:10px 24px;">Submit Direct Query</button>
            </form>
          </div>
        </div>
      `
    },
    'tariff': {
      title: 'Get Cabs Official Tariff Card',
      content: `
        <div class="policy-doc">
          <h2>Get Cabs Official Tariff Card</h2>
          <p style="margin-bottom:16px; color:var(--text-muted);">Transparent, fixed fare structure across local city rides, hourly rentals, and outstation drops in Coimbatore.</p>

          <div class="policy-highlight-box" style="margin-bottom:20px;">
            ❄️ <strong>Mandatory AC Comfort:</strong> Air Conditioning is enabled by default for all Mini & Sedan rides (unless specifically requested off by the customer).
          </div>

          <h3 style="color:var(--brand-dark); font-size:1.2rem; margin-bottom:10px;">1. Local City Rides (Mini / Sedan Cabs)</h3>
          <p style="line-height:1.7; margin-bottom:10px;">Instant local city rides and point-to-point drop services within Coimbatore with verified local professional drivers.</p>
          <ul style="line-height:1.8; margin-left:20px; margin-bottom:20px;">
            <li><strong>Guaranteed Standard Rates:</strong> Fixed upfront taxi pricing with zero surge pricing or meter tampering.</li>
            <li><strong>District Border Outskirts Surcharge:</strong> Outer area trips include a standard adjustment (+₹100 to ₹150) for areas including <em>Karumathampatti, Karanampettai, Paapampatti, Ganeshapuram / Kovilpalayam, Karamadai, Booluvampatti / Pooluvapatti, Ettimadai, Kinathukadavu</em>.</li>
          </ul>

          <h3 style="color:var(--brand-dark); font-size:1.2rem; margin-bottom:10px;">2. Hourly & Daily Rental Packages</h3>
          <ul style="line-height:1.8; margin-left:20px; margin-bottom:20px;">
            <li><strong>Hourly Rental Package:</strong> <strong style="color:var(--brand-red);">₹350 / Hour</strong> (Includes 10 KM free per hour; Additional distance @ ₹25/KM).</li>
            <li><strong>Package A (10 Hours / 100 KM Day Package):</strong> <strong style="color:var(--brand-red);">₹3,000 flat</strong> (Extra KM: ₹10/KM).</li>
            <li><strong>Package B (12 Hours / 100 KM Day Package):</strong> <strong style="color:var(--brand-red);">₹3,500 flat</strong> (Extra time: ₹150/hr for time exceeding 10 hours).</li>
          </ul>

          <h3 style="color:var(--brand-dark); font-size:1.2rem; margin-bottom:10px;">3. One-Way Drop Tariffs (From Gandhipuram, Ukkadam & Railway Station)</h3>
          <div style="overflow-x:auto; margin-bottom:20px;">
            <table class="tariff-table" style="width:100%; border-collapse:collapse; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; font-size:0.95rem;">
              <thead>
                <tr style="background:#1e293b; color:#ffffff; text-align:left;">
                  <th style="padding:10px;">Destination Drop Point</th>
                  <th style="padding:10px;">Distance</th>
                  <th style="padding:10px;">Net Drop Fare</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #e2e8f0;"><td>Annur</td><td>30 KM</td><td><strong style="color:var(--brand-red);">₹1,100</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;"><td>Isha Yoga Center</td><td>33 KM</td><td><strong style="color:var(--brand-red);">₹1,100</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0;"><td>Anaikatti</td><td>30 KM</td><td><strong style="color:var(--brand-red);">₹1,300</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;"><td>Mettupalayam</td><td>37 KM</td><td><strong style="color:var(--brand-red);">₹1,400</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0;"><td>Palladam / Sirumugai</td><td>39 - 40 KM</td><td><strong style="color:var(--brand-red);">₹1,500</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;"><td>Avinashi / Pollachi / MTP Vana Bathrakaliamman Kovil</td><td>42 - 43 KM</td><td><strong style="color:var(--brand-red);">₹1,600</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0;"><td>Airport to Tiruppur</td><td>46 KM</td><td><strong style="color:var(--brand-red);">₹1,700</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;"><td>Puliyampatti</td><td>49 KM</td><td><strong style="color:var(--brand-red);">₹1,800</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0;"><td>Palakkad / Tiruppur Town</td><td>52 - 55 KM</td><td><strong style="color:var(--brand-red);">₹1,900</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;"><td>Airport to Palakkad</td><td>61 KM</td><td><strong style="color:var(--brand-red);">₹2,200</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0;"><td>Sathyamangalam / Kangeyam / Udumalpet</td><td>70 KM</td><td><strong style="color:var(--brand-red);">₹2,500</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;"><td>Perundurai / Gobi / Kotagiri / Coonoor</td><td>70 - 83 KM</td><td><strong style="color:var(--brand-red);">₹2,900</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0;"><td>Dharapuram</td><td>85 KM</td><td><strong style="color:var(--brand-red);">₹2,950</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;"><td>Erode</td><td>100 KM</td><td><strong style="color:var(--brand-red);">₹3,500</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0;"><td>Ooty Bus Stand Only</td><td>87 KM</td><td><strong style="color:var(--brand-red);">₹3,500</strong></td></tr>
                <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;"><td>Palani</td><td>110 KM</td><td><strong style="color:var(--brand-red);">₹3,900</strong></td></tr>
              </tbody>
            </table>
          </div>

          <h3 style="color:var(--brand-dark); font-size:1.2rem; margin-bottom:10px;">4. Distance-Based Round Trip & Long Drop Rules</h3>
          <ul style="line-height:1.8; margin-left:20px; margin-bottom:20px;">
            <li><strong>Oneway drops under 100 KM:</strong> Calculated at round-trip mileage @ <strong>₹17 / KM</strong> (Go + Return).</li>
            <li><strong>Oneway drops over 130 KM:</strong> Calculated at round-trip mileage @ <strong>₹14 / KM</strong> (Go + Return) plus <strong>₹400 Driver Batta</strong>.</li>
          </ul>

          <h3 style="color:var(--brand-dark); font-size:1.2rem; margin-bottom:10px;">5. General Exclusions & Rules</h3>
          <ul style="line-height:1.8; margin-left:20px; margin-bottom:20px;">
            <li><strong>Tolls, Parking & State Permits:</strong> Toll gate charges, parking fees, and interstate permit fees are not included and must be paid directly by the customer at actuals.</li>
            <li><strong>Net Driver Rate:</strong> Fares represent net driver earnings with zero driver commissions deducted.</li>
          </ul>

          <div style="text-align:center; margin-top:24px;">
            <a href="tel:9894020156" class="btn btn-red" style="padding:12px 28px; font-size:1rem; display:inline-block;">📞 Call 9894020156 to Book Cab</a>
          </div>
        </div>
      `
    },
    'popular-routes': {
      title: 'Popular Routes from Coimbatore (Fixed Fares)',
      content: `
        <div class="policy-doc">
          <h2>Popular Intercity & Outstation Drop Routes</h2>
          <p style="margin-bottom:16px;">Fixed net drop rates for Mini & Sedan cabs from Coimbatore hubs.</p>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:16px; margin-top:20px;">
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:16px; border-radius:8px;">
              <h4 style="font-size:1.1rem; color:var(--brand-dark); margin-bottom:4px;">Coimbatore ➔ Ooty Bus Stand</h4>
              <p style="font-size:0.85rem; color:var(--text-muted);">87 KM • Nilgiris Hill Route</p>
              <div style="font-size:1.2rem; color:var(--brand-red); font-weight:800; margin:8px 0;">₹3,500</div>
              <a href="tel:9894020156" class="btn btn-red" style="padding:6px 12px; font-size:0.8rem; display:inline-block;">Book Ooty Cab</a>
            </div>

            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:16px; border-radius:8px;">
              <h4 style="font-size:1.1rem; color:var(--brand-dark); margin-bottom:4px;">Coimbatore ➔ Pollachi</h4>
              <p style="font-size:0.85rem; color:var(--text-muted);">43 KM • Express Corridor</p>
              <div style="font-size:1.2rem; color:var(--brand-red); font-weight:800; margin:8px 0;">₹1,600</div>
              <a href="tel:9894020156" class="btn btn-red" style="padding:6px 12px; font-size:0.8rem; display:inline-block;">Book Pollachi Cab</a>
            </div>

            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:16px; border-radius:8px;">
              <h4 style="font-size:1.1rem; color:var(--brand-dark); margin-bottom:4px;">Coimbatore ➔ Palani</h4>
              <p style="font-size:0.85rem; color:var(--text-muted);">110 KM • Temple Highway</p>
              <div style="font-size:1.2rem; color:var(--brand-red); font-weight:800; margin:8px 0;">₹3,900</div>
              <a href="tel:9894020156" class="btn btn-red" style="padding:6px 12px; font-size:0.8rem; display:inline-block;">Book Palani Cab</a>
            </div>

            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:16px; border-radius:8px;">
              <h4 style="font-size:1.1rem; color:var(--brand-dark); margin-bottom:4px;">Coimbatore ➔ Erode</h4>
              <p style="font-size:0.85rem; color:var(--text-muted);">100 KM • Highway Express</p>
              <div style="font-size:1.2rem; color:var(--brand-red); font-weight:800; margin:8px 0;">₹3,500</div>
              <a href="tel:9894020156" class="btn btn-red" style="padding:6px 12px; font-size:0.8rem; display:inline-block;">Book Erode Cab</a>
            </div>

            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:16px; border-radius:8px;">
              <h4 style="font-size:1.1rem; color:var(--brand-dark); margin-bottom:4px;">Coimbatore ➔ Sathyamangalam</h4>
              <p style="font-size:0.85rem; color:var(--text-muted);">70 KM • Highway Route</p>
              <div style="font-size:1.2rem; color:var(--brand-red); font-weight:800; margin:8px 0;">₹2,500</div>
              <a href="tel:9894020156" class="btn btn-red" style="padding:6px 12px; font-size:0.8rem; display:inline-block;">Book Sathyamangalam Cab</a>
            </div>

            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:16px; border-radius:8px;">
              <h4 style="font-size:1.1rem; color:var(--brand-dark); margin-bottom:4px;">Coimbatore ➔ Coonoor</h4>
              <p style="font-size:0.85rem; color:var(--text-muted);">70 KM • Hill Route</p>
              <div style="font-size:1.2rem; color:var(--brand-red); font-weight:800; margin:8px 0;">₹2,900</div>
              <a href="tel:9894020156" class="btn btn-red" style="padding:6px 12px; font-size:0.8rem; display:inline-block;">Book Coonoor Cab</a>
            </div>
          </div>
        </div>
      `
    },
    'oneway-routes': {
      title: 'Discounted Oneway Routes',
      content: `
        <div class="policy-doc">
          <h2>Coimbatore Oneway Taxi Service</h2>
          <p>Pay strictly for distance traveled. Zero return charges guaranteed!</p>
          <div class="policy-highlight-box">
            🚕 All Oneway fares include vehicle rate, driver batta, and toll estimate with zero hidden extras.
          </div>
          <div style="margin-top:20px; text-align:center;">
            <p>Use our main page Oneway Fare Calculator for live instant price estimates.</p>
            <a href="tel:9894020156" class="btn btn-red" style="padding:12px 28px; font-size:1rem; margin-top:10px; display:inline-block;">📞 Call 9894020156 for Instant Oneway Booking</a>
          </div>
        </div>
      `
    },
    'blogs': {
      title: 'Get Cabs Travel Blogs & Articles',
      content: `
        <div class="policy-doc">
          <h2>Coimbatore Travel Blogs & Cab Guides</h2>
          <p style="margin-bottom:24px;">Explore our travel guides, route tips, and money-saving cab hacks.</p>
          <div id="blogs-full-list" class="blogs-grid"></div>
        </div>
      `
    },
    'tour-packages': {
      title: 'Popular Tour Packages & Outstation Trips',
      content: `
        <div class="policy-doc">
          <h2>Coimbatore Outstation Tour Packages</h2>
          <p style="margin-bottom:24px;">Handcrafted holiday packages with on-the-way sightseeing, temple & river stops, road curve advice, hygienic dining hubs, and fixed vehicle pricing.</p>
          <div id="modal-packages-full-list" class="tour-packages-grid"></div>
        </div>
      `
    }
  };

  const TOUR_PACKAGES_DATA = {
    'ooty-coonoor-kotagiri': {
      title: 'Ooty, Coonoor & Kotagiri Nilgiris Package',
      category: 'Nilgiris Hill Special',
      duration: 'Full Day / 2 Days',
      distance: '85 KM to Ooty (3 Hours Drive)',
      startingPrice: '₹2,380',
      img: './public/assets/images/dest-ooty.webp',
      content: `
        <div class="tour-detail-container">
          <div class="tour-hero-header">
            <span class="blog-tag-badge">Nilgiris Hill Special</span>
            <h1>Ooty, Coonoor & Kotagiri Nilgiris Tour Package</h1>
            <p style="color:#e2e8f0; font-size:1.05rem;">Experience 36 Hairpin Curves, sprawling tea gardens, cascading waterfalls, and peak viewpoints from Coimbatore.</p>
          </div>

          <div class="tour-specs-strip">
            <div class="tour-spec-item"><span>Total Distance</span><span>85 KM (One Way)</span></div>
            <div class="tour-spec-item"><span>Est. Drive Time</span><span>2.5 to 3.5 Hours</span></div>
            <div class="tour-spec-item"><span>Ghat Road</span><span>36 Hairpin Bends</span></div>
            <div class="tour-spec-item"><span>Ideal Timing</span><span>6:00 AM Departure</span></div>
            <div class="tour-spec-item"><span>Base Fare</span><span>₹2,380 Onwards</span></div>
          </div>

          <div class="guide-section-box">
            <h3>📍 On-The-Way Sightseeing Places</h3>
            <p>Your journey from Coimbatore to the Nilgiris passes through rich agricultural plains and lush mountain foothills:</p>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Bhavani River Banks at Mettupalayam:</strong> Beautiful river views at the base of the Western Ghats.</li>
              <li><strong>Burliyar Fruit Stalls:</strong> Famous roadside stops for exotic fresh hill fruits like Mangosteen, Rambutan, Passion Fruit, and fresh Jackfruit.</li>
              <li><strong>Black Bridge (Wellington):</strong> Historic British military cantonment area with manicured gardens and eucalyptus tree avenues.</li>
              <li><strong>Coonoor Tea Estates:</strong> Sprawling green tea carpets along the road. Great for tea tasting and photo stops.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🛣️ Road Conditions, Curves & Hairpin Bends</h3>
            <div class="road-bends-warning">
              ⚠️ <strong>36 Hairpin Curves Warning:</strong> The Mettupalayam to Coonoor/Ooty ghat road features 36 sharp hairpin bends with steep gradient climbs.
            </div>
            <p><strong>Driving Tips & Road Notes:</strong></p>
            <ul style="margin-left:20px; line-height:1.8;">
              <li>Roads are freshly paved bitumen tar, equipped with convex safety mirrors and reflective cat-eyes.</li>
              <li>Morning mist and afternoon fog are common around Wellington and Doddabetta Peak; all Get Cabs vehicles come equipped with high-intensity fog lamps.</li>
              <li>Our drivers are veteran Nilgiris hill specialists trained in gear braking and mountain right-of-way courtesy.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🛕 Popular Temples, Rivers & Waterfalls</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Elk Hill Murugan Temple (Ooty):</strong> Features a grand 40-ft Lord Murugan statue set against lush hill backdrops.</li>
              <li><strong>Catherine Falls (Kotagiri):</strong> A breathtaking double-tiered waterfall cascading from a height of 250 feet.</li>
              <li><strong>Laws Falls (Coonoor):</strong> Scenic waterfall amidst dense forest cover along the Coonoor ghat road.</li>
              <li><strong>Pykara River & Waterfalls:</strong> Pristine river surrounded by pine forests offering speed boat rides and waterfall vistas.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>⏱️ Timings & Operating Hours</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Recommended Departure:</strong> 6:00 AM from Coimbatore to beat Mettupalayam checkpost traffic.</li>
              <li><strong>Ooty Botanical Garden:</strong> 7:00 AM – 6:30 PM</li>
              <li><strong>Doddabetta Peak Viewpoint:</strong> 9:00 AM – 5:30 PM</li>
              <li><strong>Pykara Lake Boating:</strong> 9:30 AM – 5:00 PM</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🍽️ Verified Highway Restaurants & Restrooms</h3>
            <div class="restroom-food-box">
              🧼 <strong>Hygienic Restroom Facilities:</strong> Clean, well-maintained family restrooms are available at designated stops along the highway.
            </div>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Hilltop Pure Veg (Mettupalayam):</strong> Excellent South Indian breakfast with squeaky clean restrooms and spacious parking.</li>
              <li><strong>Cabbages & Condiments (Coonoor):</strong> Cozy continental dining and organic tea room with clean restroom facilities.</li>
              <li><strong>Hotel Annapoorna (Ooty Main Market):</strong> Traditional vegetarian meals with hygienic washrooms.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>💰 Complete Vehicle Tariff Breakdown</h3>
            <div class="price-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle Type</th>
                    <th>Seating</th>
                    <th>Oneway Drop</th>
                    <th>Full Day Tour (220 KM)</th>
                    <th>Included Benefits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sedan (Dzire / Etios)</strong></td>
                    <td>4 Passengers</td>
                    <td>₹2,380</td>
                    <td>₹3,800</td>
                    <td>Driver Batta + Hill Charges Included</td>
                  </tr>
                  <tr>
                    <td><strong>SUV (Maruti Ertiga / XL6)</strong></td>
                    <td>6 Passengers</td>
                    <td>₹3,800</td>
                    <td>₹5,500</td>
                    <td>Spacious Boot Space + AC + Hill Specialist</td>
                  </tr>
                  <tr>
                    <td><strong>Premium SUV (Innova Crysta)</strong></td>
                    <td>7 Passengers</td>
                    <td>₹4,800</td>
                    <td>₹6,800</td>
                    <td>Reclining Captain Seats + Luxury Suspensions</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style="font-size:0.85rem; color:#64748b; margin-top:10px;">*Tolls, state permits (if applicable), and parking fees paid at actuals. Zero hidden surge fees!</p>
          </div>

          <div class="blog-cta-banner" style="margin-top:24px;">
            <h3>Book Your Ooty, Coonoor & Kotagiri Cab Tour</h3>
            <p style="margin-bottom:16px;">Call Get Cabs 24/7 hotline or message on WhatsApp for instant booking confirmation!</p>
            <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center;">
              <a href="tel:9894020156" class="btn btn-yellow" style="padding:12px 24px;">📞 Call 9894020156</a>
              <a href="https://wa.me/919894020156?text=Hi%20Get%20Cabs,%20I%20want%20to%20book%20Ooty%20Tour%20Package" target="_blank" class="btn btn-red" style="padding:12px 24px; background:#25d366; border-color:#25d366;">💬 WhatsApp Booking</a>
            </div>
          </div>
        </div>
      `
    },
    'munnar-hills': {
      title: 'Munnar Tea Hills & Waterfalls Package',
      category: 'Tea Hills & Waterfalls',
      duration: '2 Days / 1 Night',
      distance: '160 KM (4.5 Hours Drive)',
      startingPrice: '₹3,800',
      img: './public/assets/images/dest-munnar.webp',
      content: `
        <div class="tour-detail-container">
          <div class="tour-hero-header">
            <span class="blog-tag-badge">Tea Hills & Waterfalls</span>
            <h1>Munnar Tea Hills & Waterfalls Tour Package</h1>
            <p style="color:#e2e8f0; font-size:1.05rem;">Discover sprawling spice plantations, Cheeyappara waterfalls, Marayoor sandalwood forests, and Anamudi Peak views from Coimbatore.</p>
          </div>

          <div class="tour-specs-strip">
            <div class="tour-spec-item"><span>Total Distance</span><span>160 KM (One Way)</span></div>
            <div class="tour-spec-item"><span>Est. Drive Time</span><span>4.5 Hours</span></div>
            <div class="tour-spec-item"><span>Route</span><span>via Udumalpet & Marayoor</span></div>
            <div class="tour-spec-item"><span>Ideal Timing</span><span>5:30 AM Departure</span></div>
            <div class="tour-spec-item"><span>Base Fare</span><span>₹3,800 Onwards</span></div>
          </div>

          <div class="guide-section-box">
            <h3>📍 On-The-Way Sightseeing Places</h3>
            <p>The scenic drive to Munnar via Udumalpet offers incredible ecological diversity:</p>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Udumalpet Cotton Belt & Windmills:</strong> Flat green plains dotted with giant clean-energy wind turbines.</li>
              <li><strong>Amaravathi Dam Crocodile Park:</strong> India's largest mugger crocodile breeding sanctuary near Amaravathi reservoir.</li>
              <li><strong>Chinnar Wildlife Sanctuary:</strong> Border jungle stretch where spotter deer, wild elephants, and giant squirrels are frequently seen crossing the road.</li>
              <li><strong>Marayoor Sandalwood Forests & Jaggery Stalls:</strong> Natural sandalwood forest groves and traditional sugarcane jaggery-making units.</li>
              <li><strong>Lakkam Waterfalls:</strong> Beautiful cascading waterfall right on the Marayoor-Munnar roadside.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🛣️ Road Conditions, Curves & Bends</h3>
            <div class="road-bends-warning">
              ⚠️ <strong>Forest Checkpost & Tea Estate Curves:</strong> Chinnar forest checkpost operates strictly between 6:00 AM and 9:00 PM. Mountain road features narrow S-bends through Marayoor tea estates.
            </div>
            <p><strong>Driving Tips & Road Notes:</strong></p>
            <ul style="margin-left:20px; line-height:1.8;">
              <li>Excellent single-lane and double-lane tarmac; horn usage recommended on blind estate curves.</li>
              <li>Spacious SUV vehicles (Ertiga / Innova Crysta) are highly recommended for family comfort on this 4.5-hour hill drive.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🛕 Popular Temples, Rivers & Waterfalls</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Cheeyappara & Valara Waterfalls:</strong> Seven-step cascading waterfall along the Munnar gap road.</li>
              <li><strong>Subramanya Swamy Temple (Udumalpet):</strong> Revered ancient temple located at the foothills.</li>
              <li><strong>Pamba River Tributaries:</strong> Pristine mountain streams flowing alongside the highway.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>⏱️ Timings & Operating Hours</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Forest Checkpost Hours:</strong> 6:00 AM – 9:00 PM</li>
              <li><strong>Kannan Devan Tea Museum:</strong> 9:00 AM – 5:00 PM</li>
              <li><strong>Eravikulam National Park (Nilgiri Tahr):</strong> 7:30 AM – 4:00 PM</li>
              <li><strong>Mattupetty Dam Boating:</strong> 9:00 AM – 5:30 PM</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🍽️ Verified Highway Restaurants & Restrooms</h3>
            <div class="restroom-food-box">
              🧼 <strong>Hygienic Restroom Facilities:</strong> Clean washrooms available at Udumalpet highway plazas and Marayoor food hubs.
            </div>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Saravana Bhavan (Udumalpet Highway):</strong> Piping hot South Indian breakfast with clean restrooms.</li>
              <li><strong>Marayoor Highway Food Plaza:</strong> Kerala meals, fresh coconut water, and hygienic restrooms.</li>
              <li><strong>Rapsy Restaurant (Munnar Town):</strong> Authentic Malabar biryani and appam stew.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>💰 Complete Vehicle Tariff Breakdown</h3>
            <div class="price-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle Type</th>
                    <th>Oneway Drop</th>
                    <th>2 Days / 1 Night Tour</th>
                    <th>Included Benefits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sedan (Dzire / Etios)</strong></td>
                    <td>₹3,800</td>
                    <td>₹6,500</td>
                    <td>Driver Batta + Kerala Border Permit Included</td>
                  </tr>
                  <tr>
                    <td><strong>SUV (Maruti Ertiga / XL6)</strong></td>
                    <td>₹5,800</td>
                    <td>₹9,500</td>
                    <td>Spacious 6-Seater + AC + Mountain Driver</td>
                  </tr>
                  <tr>
                    <td><strong>Premium SUV (Innova Crysta)</strong></td>
                    <td>₹7,200</td>
                    <td>₹12,500</td>
                    <td>Captain Seats + Unmatched Comfort</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="blog-cta-banner" style="margin-top:24px;">
            <h3>Book Your Munnar Hill & Waterfall Tour</h3>
            <p style="margin-bottom:16px;">Speak with Get Cabs Munnar travel desk for customized hotel + cab itineraries!</p>
            <a href="tel:9894020156" class="btn btn-yellow" style="padding:12px 24px;">📞 Call 9894020156 to Book</a>
          </div>
        </div>
      `
    },
    'kodaikanal-hills': {
      title: 'Kodaikanal Lake & Mountain Peak Package',
      category: 'Princess of Hills',
      duration: 'Full Day / 2 Days',
      distance: '175 KM (4.5 Hours Drive)',
      startingPrice: '₹4,200',
      img: './public/assets/images/dest-kodaikanal.webp',
      content: `
        <div class="tour-detail-container">
          <div class="tour-hero-header">
            <span class="blog-tag-badge">Princess of Hills</span>
            <h1>Kodaikanal Lake & Mountain Peak Tour Package</h1>
            <p style="color:#e2e8f0; font-size:1.05rem;">Explore Kodai Lake boating, Pillar Rocks, Coaker's Walk, Pine Forests, and Silver Cascade waterfalls from Coimbatore.</p>
          </div>

          <div class="tour-specs-strip">
            <div class="tour-spec-item"><span>Total Distance</span><span>175 KM (One Way)</span></div>
            <div class="tour-spec-item"><span>Est. Drive Time</span><span>4.5 Hours</span></div>
            <div class="tour-spec-item"><span>Ghat Road</span><span>14 Hairpin Bends</span></div>
            <div class="tour-spec-item"><span>Ideal Timing</span><span>5:30 AM Departure</span></div>
            <div class="tour-spec-item"><span>Base Fare</span><span>₹4,200 Onwards</span></div>
          </div>

          <div class="guide-section-box">
            <h3>📍 On-The-Way Sightseeing Places</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Palani Foot Hills & Temple View:</strong> Panoramic views of the sacred Palani Dhandayuthapani temple hill.</li>
              <li><strong>Batlagundu Junction Fruit Market:</strong> Fresh sweet mangoes, bananas, and local organic produce.</li>
              <li><strong>Dum Dum Rock Viewpoint:</strong> Historical rock formation overlooking the Manjalar Dam reservoir.</li>
              <li><strong>Silver Cascade Waterfalls:</strong> Magnificent 180-foot waterfall located right at the entrance of Kodaikanal.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🛣️ Road Conditions, Curves & Hairpin Bends</h3>
            <div class="road-bends-warning">
              ⚠️ <strong>14 Hairpin Bends Ghat Road:</strong> The Batlagundu to Kodaikanal road ascends smoothly with 14 wide hairpin bends. Safe, wide tar highway.
            </div>
          </div>

          <div class="guide-section-box">
            <h3>🛕 Popular Temples, Rivers & Waterfalls</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Kurinji Andavar Temple:</strong> Dedicated to Lord Murugan, famous for the Kurinji flower that blooms once every 12 years.</li>
              <li><strong>Poombarai Murugan Temple & Village:</strong> Scenic 3000-year-old temple surrounded by stepped garlic farms.</li>
              <li><strong>Bear Shola Falls:</strong> Tranquil waterfall inside a dense reserve forest.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>⏱️ Timings & Operating Hours</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Kodai Lake Boating & Cycling:</strong> 9:00 AM – 6:00 PM</li>
              <li><strong>Bryant Park Botanical Garden:</strong> 9:00 AM – 6:00 PM</li>
              <li><strong>Coaker's Walk & Telescope House:</strong> 7:00 AM – 7:00 PM</li>
              <li><strong>Pillar Rocks Viewpoint:</strong> 9:00 AM – 5:00 PM</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🍽️ Verified Highway Restaurants & Restrooms</h3>
            <div class="restroom-food-box">
              🧼 <strong>Hygienic Restrooms:</strong> Clean restrooms at Hotel Tamil Nadu Batlagundu and Astoria Veg Kodaikanal.
            </div>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Hotel Tamil Nadu (Batlagundu Bypass):</strong> Hygienic restrooms and delicious South Indian breakfast.</li>
              <li><strong>Astoria Veg Restaurant (Kodai Bus Stand):</strong> Pure vegetarian dining with clean facilities.</li>
              <li><strong>Cloud Street Cafe (Seven Road Junction):</strong> Wood-fired pizzas and hot chocolate.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>💰 Complete Vehicle Tariff Breakdown</h3>
            <div class="price-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle Type</th>
                    <th>Oneway Drop</th>
                    <th>Full Day Tour (350 KM)</th>
                    <th>Included Benefits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sedan (Dzire / Etios)</strong></td>
                    <td>₹4,200</td>
                    <td>₹6,800</td>
                    <td>Driver Batta + Hill Charges Included</td>
                  </tr>
                  <tr>
                    <td><strong>SUV (Maruti Ertiga / XL6)</strong></td>
                    <td>₹6,200</td>
                    <td>₹9,800</td>
                    <td>6 Passenger Seats + Luggage Carrier</td>
                  </tr>
                  <tr>
                    <td><strong>Premium SUV (Innova Crysta)</strong></td>
                    <td>₹7,800</td>
                    <td>₹12,800</td>
                    <td>Luxury Leather Interiors + Smooth Suspension</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="blog-cta-banner" style="margin-top:24px;">
            <h3>Book Kodaikanal Cab Package</h3>
            <a href="tel:9894020156" class="btn btn-yellow" style="padding:12px 24px;">📞 Call 9894020156</a>
          </div>
        </div>
      `
    },
    'yercaud-hills': {
      title: 'Yercaud Shevaroy Hills Gateway Package',
      category: 'Weekend Hill Gateway',
      duration: 'Full Day Tour',
      distance: '195 KM (4 Hours Drive)',
      startingPrice: '₹4,800',
      img: './public/assets/images/dest-coonoor.webp',
      content: `
        <div class="tour-detail-container">
          <div class="tour-hero-header">
            <span class="blog-tag-badge">Weekend Hill Gateway</span>
            <h1>Yercaud Shevaroy Hills Gateway Tour Package</h1>
            <p style="color:#e2e8f0; font-size:1.05rem;">Ascend the 20 Hairpin Bends to Shevaroy Hills, Emerald Lake, Pagoda Point, and Killiyur Waterfalls.</p>
          </div>

          <div class="tour-specs-strip">
            <div class="tour-spec-item"><span>Total Distance</span><span>195 KM (One Way)</span></div>
            <div class="tour-spec-item"><span>Est. Drive Time</span><span>4 Hours</span></div>
            <div class="tour-spec-item"><span>Ghat Road</span><span>20 Hairpin Bends</span></div>
            <div class="tour-spec-item"><span>Ideal Timing</span><span>6:00 AM Departure</span></div>
            <div class="tour-spec-item"><span>Base Fare</span><span>₹4,800 Onwards</span></div>
          </div>

          <div class="guide-section-box">
            <h3>📍 On-The-Way Sightseeing Places</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Sankari Bypass Highway:</strong> Smooth 4-lane expressway via Salem route.</li>
              <li><strong>Salem Steel Plant Corridor:</strong> Industrial township views framed by Shevaroy mountain foothills.</li>
              <li><strong>20 Hairpin Bends Viewpoints:</strong> Scenic pull-over spots overlooking Salem city lights.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🛣️ Road Conditions, Curves & Hairpin Bends</h3>
            <div class="road-bends-warning">
              ⚠️ <strong>20 Hairpin Bends Ascent:</strong> Well-engineered 30 KM mountain road with well-banked hairpin turns and LED reflectors.
            </div>
          </div>

          <div class="guide-section-box">
            <h3>🛕 Popular Temples, Rivers & Waterfalls</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Shevaroy Cave Temple:</strong> Sacred cave shrine dedicated to Lord Shevaroyan and Goddess Kaveri located at the highest peak (5,326 ft).</li>
              <li><strong>Killiyur Waterfalls:</strong> Spectacular 300-foot waterfall cascading into the Raja Rajeshwari valley.</li>
              <li><strong>Raja Rajeshwari Temple:</strong> Peaceful spiritual temple surrounded by spice orchards.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>⏱️ Timings & Operating Hours</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Emerald Lake Boating:</strong> 8:30 AM – 5:30 PM</li>
              <li><strong>Lady's Seat & Telescope House:</strong> 9:00 AM – 6:00 PM</li>
              <li><strong>Botanical Garden & Orchidarium:</strong> 9:00 AM – 5:00 PM</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🍽️ Verified Highway Restaurants & Restrooms</h3>
            <div class="restroom-food-box">
              🧼 <strong>Hygienic Restrooms:</strong> Saravana Bhavan Salem Highway Plaza offers clean washrooms and spacious parking.
            </div>
          </div>

          <div class="guide-section-box">
            <h3>💰 Complete Vehicle Tariff Breakdown</h3>
            <div class="price-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle Type</th>
                    <th>Full Day Tour Rate</th>
                    <th>Included Benefits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sedan (Dzire / Etios)</strong></td>
                    <td>₹4,800</td>
                    <td>Driver Batta + Hill Charges Included</td>
                  </tr>
                  <tr>
                    <td><strong>SUV (Maruti Ertiga / XL6)</strong></td>
                    <td>₹6,800</td>
                    <td>6-Seater Family Comfort</td>
                  </tr>
                  <tr>
                    <td><strong>Premium SUV (Innova Crysta)</strong></td>
                    <td>₹8,500</td>
                    <td>Executive Comfort + Reclining Seats</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="blog-cta-banner" style="margin-top:24px;">
            <h3>Book Yercaud Cab Tour</h3>
            <a href="tel:9894020156" class="btn btn-yellow" style="padding:12px 24px;">📞 Call 9894020156</a>
          </div>
        </div>
      `
    },
    'isha-vellingiri': {
      title: 'Isha Yoga Center & Vellingiri Sacred Package',
      category: 'Spiritual & Wellness',
      duration: 'Half Day / Full Day',
      distance: '30 KM from City (45 Mins)',
      startingPrice: '₹1,200',
      img: './public/assets/images/dest-adiyogi.webp',
      content: `
        <div class="tour-detail-container">
          <div class="tour-hero-header">
            <span class="blog-tag-badge">Spiritual & Wellness</span>
            <h1>Isha Yoga Center & Vellingiri Hills Sacred Package</h1>
            <p style="color:#e2e8f0; font-size:1.05rem;">Visit the 112ft Adiyogi Shiva Statue, Dhyanalinga, Perur Pateeswarar Temple, and Kovai Kutralam waterfalls.</p>
          </div>

          <div class="tour-specs-strip">
            <div class="tour-spec-item"><span>Distance</span><span>30 KM from City</span></div>
            <div class="tour-spec-item"><span>Drive Time</span><span>45 Minutes</span></div>
            <div class="tour-spec-item"><span>Road</span><span>Flat Asphalt Road</span></div>
            <div class="tour-spec-item"><span>Ideal Timing</span><span>6 AM or 3 PM</span></div>
            <div class="tour-spec-item"><span>Base Fare</span><span>₹1,200 Onwards</span></div>
          </div>

          <div class="guide-section-box">
            <h3>📍 On-The-Way Sightseeing Places</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Perur Pateeswarar Temple:</strong> 1000-year-old ancient Chola temple featuring carved Kanaka Sabha pillars.</li>
              <li><strong>Noyyal River Banks:</strong> Sacred river flowing through the historical agricultural belt of Coimbatore.</li>
              <li><strong>Thondamuthur Coconut Farms:</strong> Lush green countryside road lined with tall coconut palms.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🛣️ Road Conditions & Drive Profile</h3>
            <p>Smooth double-lane asphalt road via Thondamuthur and Semmedu. Zero hairpin bends or steep climbs. Perfect drive for senior citizens and families.</p>
          </div>

          <div class="guide-section-box">
            <h3>🛕 Popular Temples, Rivers & Waterfalls</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>112-ft Adiyogi Shiva Statue:</strong> Iconic giant steel monument recognized by Guinness World Records. Adiyogi Divya Darshanam 3D Laser Light Show held every evening at 7:00 PM.</li>
              <li><strong>Dhyanalinga & Holy Kunds:</strong> Meditative consecration with Suryakund (for men) and Chandrakund (for women) subterranean holy dip pools.</li>
              <li><strong>Poondi Vellingiri Aandavar Temple:</strong> Foothills temple for the sacred Vellingiri hill pilgrimage.</li>
              <li><strong>Kovai Kutralam Waterfalls:</strong> Pristine Siruvani river waterfall inside reserve forest.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>⏱️ Timings & Operating Hours</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Isha Yoga Gate Open:</strong> 6:00 AM – 8:00 PM</li>
              <li><strong>Adiyogi Light Show:</strong> 7:00 PM – 7:15 PM Daily</li>
              <li><strong>Perur Pateeswarar Temple:</strong> 6:00 AM – 1:00 PM & 4:00 PM – 8:30 PM</li>
              <li><strong>Kovai Kutralam Entry:</strong> 10:00 AM – 3:30 PM (Closed Mondays)</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🍽️ Verified Highway Restaurants & Restrooms</h3>
            <div class="restroom-food-box">
              🧼 <strong>Hygienic Restrooms:</strong> Isha Visitors Welcome Center provides world-class clean restrooms and baby care rooms.
            </div>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Pepper Vine Eatery (Isha Center):</strong> Organic vegetarian snacks, fresh juices, and herbal teas.</li>
              <li><strong>Saravana Bhavan (Perur Junction):</strong> Traditional South Indian tiffin.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>💰 Complete Vehicle Tariff Breakdown</h3>
            <div class="price-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle Type</th>
                    <th>Half-Day Drop & Wait</th>
                    <th>Full Day City + Isha Package</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sedan (Dzire / Etios)</strong></td>
                    <td>₹1,200</td>
                    <td>₹1,800</td>
                  </tr>
                  <tr>
                    <td><strong>SUV (Maruti Ertiga / XL6)</strong></td>
                    <td>₹1,800</td>
                    <td>₹2,600</td>
                  </tr>
                  <tr>
                    <td><strong>Premium SUV (Innova Crysta)</strong></td>
                    <td>₹2,400</td>
                    <td>₹3,400</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="blog-cta-banner" style="margin-top:24px;">
            <h3>Book Isha & Adiyogi Taxi Package</h3>
            <a href="tel:9894020156" class="btn btn-yellow" style="padding:12px 24px;">📞 Call 9894020156</a>
          </div>
        </div>
      `
    },
    'kerala-coastal': {
      title: 'Kerala Coastal Special (Chavakkad, Cherai, Kochi & Alleppey)',
      category: 'Beaches & Backwaters',
      duration: '2 Days / 1 Night',
      distance: '140 KM to 220 KM',
      startingPrice: '₹4,500',
      img: './public/assets/images/dest-wayanad.webp',
      content: `
        <div class="tour-detail-container">
          <div class="tour-hero-header">
            <span class="blog-tag-badge">Beaches & Backwaters</span>
            <h1>Kerala Coastal Special (Chavakkad, Cherai, Kochi & Alleppey)</h1>
            <p style="color:#e2e8f0; font-size:1.05rem;">Golden beaches, Fort Kochi heritage, Chinese fishing nets, and Alleppey backwater houseboat cruises.</p>
          </div>

          <div class="tour-specs-strip">
            <div class="tour-spec-item"><span>Destinations</span><span>Chavakkad, Cherai, Kochi, Alleppey</span></div>
            <div class="tour-spec-item"><span>Drive Time</span><span>3.5 to 5 Hours</span></div>
            <div class="tour-spec-item"><span>Highway</span><span>NH 544 Express Highway</span></div>
            <div class="tour-spec-item"><span>Base Fare</span><span>₹4,500 Onwards</span></div>
          </div>

          <div class="guide-section-box">
            <h3>📍 On-The-Way Sightseeing Places</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Palakkad Gap Highway:</strong> Mountain gap in the Western Ghats connecting Tamil Nadu and Kerala.</li>
              <li><strong>Bharatapuzha River (River Nila):</strong> Sacred ancient river crossing at Shoranur / Thrissur route.</li>
              <li><strong>Thrissur Cultural Hub:</strong> Vadakkunnathan Temple grounds & heritage town.</li>
              <li><strong>Fort Kochi Chinese Fishing Nets:</strong> Historic 14th-century Chinese fishing cantilever structures at sunset.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🛣️ Road Conditions & Highway Profile</h3>
            <p>Pristine 4-lane NH 544 express highway via Walayar checkpost. Smooth flat road with zero hairpin curves. All Get Cabs vehicles carry valid Kerala State Tourist Taxi Entry Permits.</p>
          </div>

          <div class="guide-section-box">
            <h3>🛕 Popular Beaches, Rivers & Backwaters</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Chavakkad Beach & Floating Park:</strong> Famous Azhimukham river-sea confluence beach.</li>
              <li><strong>Cherai Beach:</strong> Golden sand beach where backwaters and sea run side by side.</li>
              <li><strong>Vembanad Lake & Alleppey Backwaters:</strong> Traditional Kerala houseboat cruise through palm-fringed canals.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🍽️ Verified Highway Restaurants & Restrooms</h3>
            <div class="restroom-food-box">
              🧼 <strong>Hygienic Restrooms:</strong> Kuttanad Highway Plazas & Shell Fuel Stations offer clean washrooms.
            </div>
          </div>

          <div class="guide-section-box">
            <h3>💰 Complete Vehicle Tariff Breakdown</h3>
            <div class="price-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle Type</th>
                    <th>Oneway Drop</th>
                    <th>2 Days / 1 Night Tour</th>
                    <th>Included Benefits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sedan (Dzire / Etios)</strong></td>
                    <td>₹4,500</td>
                    <td>₹8,500</td>
                    <td>Driver Batta + Kerala Tax Permit Included</td>
                  </tr>
                  <tr>
                    <td><strong>SUV (Maruti Ertiga / XL6)</strong></td>
                    <td>₹6,800</td>
                    <td>₹11,800</td>
                    <td>Spacious 6-Seater + AC</td>
                  </tr>
                  <tr>
                    <td><strong>Premium SUV (Innova Crysta)</strong></td>
                    <td>₹8,800</td>
                    <td>₹15,200</td>
                    <td>Reclining Captain Chairs + Highway Luxury</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="blog-cta-banner" style="margin-top:24px;">
            <h3>Book Kerala Coastal & Backwater Tour</h3>
            <a href="tel:9894020156" class="btn btn-yellow" style="padding:12px 24px;">📞 Call 9894020156</a>
          </div>
        </div>
      `
    },
    'pilgrimage-heritage': {
      title: 'Guruvayur, Madurai & Trichy Grand Pilgrimage Package',
      category: 'Heritage Pilgrimage',
      duration: '2 Days / 1 Night',
      distance: '140 KM to 215 KM',
      startingPrice: '₹3,800',
      img: './public/assets/images/dest-madurai.webp',
      content: `
        <div class="tour-detail-container">
          <div class="tour-hero-header">
            <span class="blog-tag-badge">Heritage Pilgrimage</span>
            <h1>Guruvayur, Madurai & Trichy Grand Pilgrimage Tour</h1>
            <p style="color:#e2e8f0; font-size:1.05rem;">Visit Guruvayur Sree Krishna Temple, Madurai Meenakshi Amman Temple, and Trichy Srirangam Ranganathaswamy Temple.</p>
          </div>

          <div class="tour-specs-strip">
            <div class="tour-spec-item"><span>Destinations</span><span>Guruvayur, Madurai, Trichy</span></div>
            <div class="tour-spec-item"><span>Drive Time</span><span>3.5 to 4 Hours per Sector</span></div>
            <div class="tour-spec-item"><span>Highways</span><span>NH 44 & NH 83 Expressways</span></div>
            <div class="tour-spec-item"><span>Base Fare</span><span>₹3,800 Onwards</span></div>
          </div>

          <div class="guide-section-box">
            <h3>📍 Key Temple Shrines & Sightseeing</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Guruvayur Sree Krishna Temple & Punnathur Kottai:</strong> Holy shrine of Lord Guruvayurappan & Elephant Sanctuary with over 50 temple elephants.</li>
              <li><strong>Madurai Meenakshi Amman Temple & Nayakar Mahal:</strong> World-renowned Dravidian architectural marvel with towering gopurams & Vaigai river banks.</li>
              <li><strong>Trichy Srirangam Ranganathaswamy Temple:</strong> Largest functioning Hindu temple complex in the world on Kaveri River island, plus Rockfort Ucchi Pillayar shrine.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🛣️ Highway Conditions & Drive Comfort</h3>
            <p>Direct 4-lane high-speed national expressways (NH 44 to Madurai and NH 83 to Trichy). Ultra-smooth flat roads ideal for family pilgrimages.</p>
          </div>

          <div class="guide-section-box">
            <h3>⏱️ Temple Darshan Timings</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Guruvayur Temple:</strong> 3:00 AM – 12:30 PM & 4:30 PM – 9:15 PM</li>
              <li><strong>Madurai Meenakshi Temple:</strong> 5:00 AM – 12:30 PM & 4:00 PM – 10:00 PM</li>
              <li><strong>Srirangam Temple:</strong> 6:00 AM – 1:00 PM & 3:30 PM – 9:00 PM</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🍽️ Verified Highway Restaurants & Restrooms</h3>
            <div class="restroom-food-box">
              🧼 <strong>Hygienic Restrooms:</strong> Sree Annapoorna Highway Plazas & Murugan Idli Shop provide pristine washrooms.
            </div>
          </div>

          <div class="guide-section-box">
            <h3>💰 Complete Vehicle Tariff Breakdown</h3>
            <div class="price-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle Type</th>
                    <th>Single Shrine Drop</th>
                    <th>3-City 2-Day Package</th>
                    <th>Included Benefits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sedan (Dzire / Etios)</strong></td>
                    <td>₹3,800</td>
                    <td>₹8,800</td>
                    <td>Driver Allowance Included</td>
                  </tr>
                  <tr>
                    <td><strong>SUV (Maruti Ertiga / XL6)</strong></td>
                    <td>₹5,500</td>
                    <td>₹12,500</td>
                    <td>Spacious 6-Seater Family Car</td>
                  </tr>
                  <tr>
                    <td><strong>Premium SUV (Innova Crysta)</strong></td>
                    <td>₹7,200</td>
                    <td>₹16,200</td>
                    <td>Executive Comfort + Reclining Seats</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="blog-cta-banner" style="margin-top:24px;">
            <h3>Book Pilgrimage Temple Tour</h3>
            <a href="tel:9894020156" class="btn btn-yellow" style="padding:12px 24px;">📞 Call 9894020156</a>
          </div>
        </div>
      `
    },
    'kanyakumari-sunrise': {
      title: 'Kanyakumari Sunrise & Southern Coast Package',
      category: 'Southern Coast Special',
      duration: '2 Days / 1 Night',
      distance: '400 KM (6.5 Hours Drive)',
      startingPrice: '₹10,500',
      img: './public/assets/images/dest-mysore.webp',
      content: `
        <div class="tour-detail-container">
          <div class="tour-hero-header">
            <span class="blog-tag-badge">Southern Coast Special</span>
            <h1>Kanyakumari Sunrise & Southern Coast Package</h1>
            <p style="color:#e2e8f0; font-size:1.05rem;">Experience Vivekananda Rock Memorial, 133ft Thiruvalluvar Statue, Kanyakumari Devi Temple, and Triveni Sangam sunrise.</p>
          </div>

          <div class="tour-specs-strip">
            <div class="tour-spec-item"><span>Total Distance</span><span>400 KM (One Way)</span></div>
            <div class="tour-spec-item"><span>Drive Time</span><span>6.5 Hours</span></div>
            <div class="tour-spec-item"><span>Highway</span><span>NH 44 North-South Corridor</span></div>
            <div class="tour-spec-item"><span>Base Fare</span><span>₹10,500 Onwards</span></div>
          </div>

          <div class="guide-section-box">
            <h3>📍 On-The-Way Sightseeing Places</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Tirunelveli Thamirabarani River & Iruttukadai:</strong> Stop at Tirunelveli for world-famous hot wheat halwa.</li>
              <li><strong>Aralvaimozhi Windmill Farms:</strong> Hundreds of wind turbines along the mountain pass.</li>
              <li><strong>Suchindram Thanumalayan Temple:</strong> Famous 17th-century temple dedicated to the Trinity (Brahma, Vishnu, Shiva) with 18-ft Hanuman statue.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🛣️ Highway Conditions</h3>
            <p>Pristine NH 44 4-lane expressway direct from Coimbatore via Karur, Dindigul, Madurai, and Tirunelveli. Smooth high-speed driving.</p>
          </div>

          <div class="guide-section-box">
            <h3>⏱️ Timings & Highlights</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Sunrise at Triveni Sangam:</strong> 6:00 AM</li>
              <li><strong>Ferry to Vivekananda Rock Memorial:</strong> 8:00 AM – 4:00 PM</li>
              <li><strong>Kanyakumari Devi Temple:</strong> 4:30 AM – 12:30 PM & 4:00 PM – 8:30 PM</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>💰 Complete Vehicle Tariff Breakdown</h3>
            <div class="price-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle Type</th>
                    <th>2 Days / 1 Night Package Rate</th>
                    <th>Included Benefits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sedan (Dzire / Etios)</strong></td>
                    <td>₹10,500</td>
                    <td>Driver Batta + Toll Assistance Included</td>
                  </tr>
                  <tr>
                    <td><strong>SUV (Maruti Ertiga / XL6)</strong></td>
                    <td>₹14,800</td>
                    <td>6 Passenger Seats + Luggage Carrier</td>
                  </tr>
                  <tr>
                    <td><strong>Premium SUV (Innova Crysta)</strong></td>
                    <td>₹18,500</td>
                    <td>Captain Chairs + Highway Comfort</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="blog-cta-banner" style="margin-top:24px;">
            <h3>Book Kanyakumari Tour Package</h3>
            <a href="tel:9894020156" class="btn btn-yellow" style="padding:12px 24px;">📞 Call 9894020156</a>
          </div>
        </div>
      `
    },
    'wildlife-safari': {
      title: 'Mudumalai, Masinagudi, Wayanad & Calicut Safari Package',
      category: 'Wildlife & Safari',
      duration: '2 Days / 1 Night',
      distance: '115 KM to 200 KM',
      startingPrice: '₹4,200',
      img: './public/assets/images/dest-valparai.webp',
      content: `
        <div class="tour-detail-container">
          <div class="tour-hero-header">
            <span class="blog-tag-badge">Wildlife & Safari</span>
            <h1>Mudumalai, Masinagudi, Wayanad & Calicut Safari Package</h1>
            <p style="color:#e2e8f0; font-size:1.05rem;">Mudumalai Tiger Reserve jeep safaris, Banasura Sagar Dam, Thamarassery Churam 9 hairpin bends, and Calicut Beach.</p>
          </div>

          <div class="tour-specs-strip">
            <div class="tour-spec-item"><span>Destinations</span><span>Mudumalai, Masinagudi, Wayanad, Calicut</span></div>
            <div class="tour-spec-item"><span>Drive Time</span><span>3.5 to 5.5 Hours</span></div>
            <div class="tour-spec-item"><span>Night Ban</span><span>9:00 PM – 6:00 AM (Forest)</span></div>
            <div class="tour-spec-item"><span>Base Fare</span><span>₹4,200 Onwards</span></div>
          </div>

          <div class="guide-section-box">
            <h3>📍 On-The-Way Sightseeing Places</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Pykara Waterfalls & Dam:</strong> Scenic pine-surrounded river and waterfall stop.</li>
              <li><strong>Bandipur Tiger Reserve Border:</strong> Forest drive where spotted deer, peacocks, wild boars, and elephants are frequently spotted.</li>
              <li><strong>Thamarassery Churam (Wayand-Calicut Ghat Pass):</strong> Iconic 9 hairpin bends mountain pass offering dramatic valley vistas down to Kozhikode coast.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🛣️ Forest Checkpost Rules & Curve Guidance</h3>
            <div class="road-bends-warning">
              ⚠️ <strong>Forest Checkpost Night Travel Ban:</strong> Mudumalai and Bandipur forest checkposts are closed between 9:00 PM and 6:00 AM for wildlife safety. Plan departure before 3:00 PM.
            </div>
          </div>

          <div class="guide-section-box">
            <h3>🛕 Key Highlights & Safaris</h3>
            <ul style="margin-left:20px; line-height:1.8;">
              <li><strong>Mudumalai Elephant Safari & Theppakadu Elephant Camp:</strong> Interactive elephant feeding and forest bus safaris.</li>
              <li><strong>Masinagudi Jungle Jeep Drive:</strong> Off-road open jeep safaris along forest buffer zones.</li>
              <li><strong>Wayanad Banasura Sagar Dam & Edakkal Caves:</strong> India's largest earthen dam and ancient Neolithic cave carvings.</li>
              <li><strong>Calicut Beach & Sweet Meat Street (SM Street):</strong> Kozhikode beach sunset, authentic Malabar Halwa, and Paragon restaurant dining.</li>
            </ul>
          </div>

          <div class="guide-section-box">
            <h3>🍽️ Verified Highway Restaurants & Restrooms</h3>
            <div class="restroom-food-box">
              🧼 <strong>Hygienic Restrooms:</strong> Coffee County Wayanad & Paragon Restaurant Calicut offer clean washrooms.
            </div>
          </div>

          <div class="guide-section-box">
            <h3>💰 Complete Vehicle Tariff Breakdown</h3>
            <div class="price-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle Type</th>
                    <th>Oneway Drop</th>
                    <th>2 Days / 1 Night Tour</th>
                    <th>Included Benefits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sedan (Dzire / Etios)</strong></td>
                    <td>₹4,200</td>
                    <td>₹9,200</td>
                    <td>Driver Batta + Forest Permit Included</td>
                  </tr>
                  <tr>
                    <td><strong>SUV (Maruti Ertiga / XL6)</strong></td>
                    <td>₹6,500</td>
                    <td>₹12,800</td>
                    <td>Spacious 6-Seater + AC + Jungle Driver</td>
                  </tr>
                  <tr>
                    <td><strong>Premium SUV (Innova Crysta)</strong></td>
                    <td>₹8,500</td>
                    <td>₹16,500</td>
                    <td>Executive Comfort + Reclining Seats</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="blog-cta-banner" style="margin-top:24px;">
            <h3>Book Wildlife Safari & Beach Tour</h3>
            <a href="tel:9894020156" class="btn btn-yellow" style="padding:12px 24px;">📞 Call 9894020156</a>
          </div>
        </div>
      `
    }
  };

  realOpenDedicatedPage = function(pageKey, blogKey = null, packageKey = null) {
    if (!pageOverlay || !pageTitleEl || !pageContentEl) return;

    if (packageKey && TOUR_PACKAGES_DATA[packageKey]) {
      const pkg = TOUR_PACKAGES_DATA[packageKey];
      pageTitleEl.textContent = 'Tour Package Details';
      pageContentEl.innerHTML = pkg.content;
    } else if (blogKey && BLOG_DATA[blogKey]) {
      const blog = BLOG_DATA[blogKey];
      pageTitleEl.textContent = 'Travel Article';
      pageContentEl.innerHTML = blog.content;
    } else if (PAGE_TEMPLATES[pageKey]) {
      const tpl = PAGE_TEMPLATES[pageKey];
      pageTitleEl.textContent = tpl.title;
      pageContentEl.innerHTML = tpl.content;

      if (pageKey === 'blogs') {
        const blogsContainer = document.getElementById('blogs-full-list');
        if (blogsContainer) {
          let html = '';
          Object.keys(BLOG_DATA).forEach(bKey => {
            const b = BLOG_DATA[bKey];
            html += `
              <article class="blog-card" onclick="window.openBlogArticle('${bKey}')">
                <div class="blog-img-box">
                  <img src="${b.img}" alt="${b.title}" onerror="window.handleImgError(this, '${b.title.replace(/'/g, "\\'")}');" />
                  <span class="blog-tag-badge">${b.category}</span>
                </div>
                <div class="blog-content-box">
                  <div class="blog-meta-info">
                    <span>📅 ${b.date}</span> • <span>⏱️ ${b.readTime}</span>
                  </div>
                  <h3 class="blog-card-title">${b.title}</h3>
                  <div class="blog-read-btn"><span>Read Article</span> <span>→</span></div>
                </div>
              </article>
            `;
          });
          blogsContainer.innerHTML = html;
        }
      } else if (pageKey === 'tour-packages') {
        const modalPackagesContainer = document.getElementById('modal-packages-full-list');
        if (modalPackagesContainer) {
          let html = '';
          Object.keys(TOUR_PACKAGES_DATA).forEach(pkgKey => {
            const p = TOUR_PACKAGES_DATA[pkgKey];
            html += `
              <div class="tour-package-card" onclick="window.openTourPackageDetail('${pkgKey}')">
                <div class="package-img-wrap">
                  <img src="${p.img}" alt="${p.title}" onerror="window.handleImgError(this, '${p.title.replace(/'/g, "\\'")}');" />
                  <span class="package-badge-category">${p.category}</span>
                  <span class="package-duration-pill">⏱️ ${p.duration}</span>
                </div>
                <div class="package-body">
                  <h3 class="package-title">${p.title}</h3>
                  <div class="package-tagline">📍 ${p.distance}</div>
                  <div class="package-footer-bar">
                    <div class="package-price-wrap">
                      <span class="package-price-label">Starting Tariff</span>
                      <span class="package-price-val">${p.startingPrice}</span>
                    </div>
                    <button class="package-view-btn">View Details →</button>
                  </div>
                </div>
              </div>
            `;
          });
          modalPackagesContainer.innerHTML = html;
        }
      }
    } else {
      pageTitleEl.textContent = 'Get Cabs';
      pageContentEl.innerHTML = '<p>Page content under construction. Call 9894020156 for assistance.</p>';
    }

    pageOverlay.classList.add('active');
    pageOverlay.scrollTop = 0;
    if (mainMenu) mainMenu.classList.remove('active');
  }

  window.openBlogArticle = function(blogKey) {
    openDedicatedPage('blogs', blogKey);
  };

  window.openTourPackageDetail = function(packageKey) {
    openDedicatedPage('tour-packages', null, packageKey);
  };

  function closeDedicatedPage() {
    if (pageOverlay) pageOverlay.classList.remove('active');
  }

  if (pageCloseBtn) {
    pageCloseBtn.addEventListener('click', closeDedicatedPage);
  }

  // Bind click handlers to all data-open-page, data-open-blog, and data-open-package elements
  document.body.addEventListener('click', function(e) {
    const pageTarget = e.target.closest('[data-open-page]');
    const blogTarget = e.target.closest('[data-open-blog]');
    const packageTarget = e.target.closest('[data-open-package]');

    if (packageTarget) {
      e.preventDefault();
      const pkgKey = packageTarget.getAttribute('data-open-package');
      openDedicatedPage('tour-packages', null, pkgKey);
    } else if (pageTarget) {
      e.preventDefault();
      const pageKey = pageTarget.getAttribute('data-open-page');
      openDedicatedPage(pageKey);
    } else if (blogTarget) {
      e.preventDefault();
      const blogKey = blogTarget.getAttribute('data-open-blog');
      openDedicatedPage('blogs', blogKey);
    }
  });


  // Close modal on Escape key press
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && pageOverlay && pageOverlay.classList.contains('active')) {
      closeDedicatedPage();
    }
  });

  // 11. App Bottom Dock Navigation
  const dockBookBtn = document.getElementById('dock-book-btn');
  const dockAiBtn = document.getElementById('dock-ai-btn');
  const aiChatWindow = document.getElementById('ai-chat-window');
  const aiChatClose = document.getElementById('ai-chat-close');
  const chatMessagesEl = document.getElementById('chat-messages');
  const chatInputEl = document.getElementById('chat-user-input');
  const chatSendBtn = document.getElementById('chat-send-btn');

  if (dockBookBtn) {
    dockBookBtn.addEventListener('click', function() {
      const bookingSection = document.getElementById('booking-form-section') || document.querySelector('.booking-card');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const pickupInput = document.getElementById('pickup');
        if (pickupInput) pickupInput.focus();
      } else {
        window.location.hash = '#booking-form-section';
      }
    });
  }

  function toggleAiChat() {
    if (!aiChatWindow) return;
    aiChatWindow.classList.toggle('active');
    if (aiChatWindow.classList.contains('active')) {
      if (chatInputEl) chatInputEl.focus();
    }
  }

  if (dockAiBtn) dockAiBtn.addEventListener('click', toggleAiChat);
  if (aiChatClose) aiChatClose.addEventListener('click', toggleAiChat);

  // 12. Intelligent AI Chatbot Engine with Gemini & Google Search Grounding
  const aiChatHistory = [];

  function formatMarkdownToHtml(str) {
    if (!str) return '';
    let formatted = str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^### (.*$)/gim, '<h4 style="margin:6px 0; font-size:0.95rem;">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 style="margin:8px 0; font-size:1.05rem;">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 style="margin:10px 0; font-size:1.15rem;">$1</h2>')
      .replace(/^\* (.*$)/gim, '• $1<br>')
      .replace(/^- (.*$)/gim, '• $1<br>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
    return formatted;
  }

  window.sendAiQuery = async function(userText) {
    if (!userText || !userText.trim()) return;
    const text = userText.trim();
    appendChatMessage(text, 'user');
    if (chatInputEl) chatInputEl.value = '';

    // Show typing indicator
    const typingId = appendTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: aiChatHistory,
        }),
      });

      removeTypingIndicator(typingId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server status ${response.status}`);
      }

      const data = await response.json();
      let botHtml = formatMarkdownToHtml(data.text);

      // Append Google Search Grounding Sources if present
      if (data.sources && Array.isArray(data.sources) && data.sources.length > 0) {
        botHtml += `<div style="margin-top:10px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.15); font-size:0.75rem; color:#cbd5e1;">`;
        botHtml += `🔍 <strong style="color:var(--brand-yellow, #f59e0b);">Sources from Google Search:</strong><br>`;
        botHtml += `<ul style="margin:4px 0 0 14px; padding:0; list-style-type:disc;">`;
        data.sources.slice(0, 4).forEach((src) => {
          botHtml += `<li style="margin-bottom:2px;"><a href="${src.url}" target="_blank" rel="noopener noreferrer" style="color:#60a5fa; text-decoration:underline;">${src.title || src.url}</a></li>`;
        });
        botHtml += `</ul></div>`;
      }

      appendChatMessage(botHtml, 'bot');

      // Update history for multi-turn conversation
      aiChatHistory.push({ role: 'user', parts: [{ text }] });
      aiChatHistory.push({ role: 'model', parts: [{ text: data.text }] });

    } catch (err) {
      removeTypingIndicator(typingId);
      console.warn("Falling back to local knowledge base:", err);

      const fallbackMsg = generateAiResponse(text);
      appendChatMessage(fallbackMsg, 'bot');
    }
  };

  window.handleAiSend = function() {
    if (!chatInputEl) return;
    const val = chatInputEl.value.trim();
    if (val) {
      window.sendAiQuery(val);
    }
  };

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', window.handleAiSend);
  }
  if (chatInputEl) {
    chatInputEl.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        window.handleAiSend();
      }
    });
  }

  function appendChatMessage(textOrHtml, sender) {
    if (!chatMessagesEl) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    msgDiv.innerHTML = textOrHtml;
    chatMessagesEl.appendChild(msgDiv);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  function appendTypingIndicator() {
    if (!chatMessagesEl) return null;
    const id = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg bot';
    msgDiv.id = id;
    msgDiv.innerHTML = '🤖 <em>Get Cabs AI is thinking...</em>';
    chatMessagesEl.appendChild(msgDiv);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    return id;
  }

  function removeTypingIndicator(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function generateAiResponse(input) {
    const query = input.toLowerCase();

    // 1. Price Maths & Calculation Formulas
    if (query.includes('math') || query.includes('formula') || query.includes('how is') || query.includes('calculate') || query.includes('calculation') || query.includes('per km') || query.includes('km rate')) {
      return `
        <strong>📐 Get Cabs Official Fare Pricing:</strong><br><br>
        • <strong>Local City Taxi:</strong> Transparent upfront all-inclusive pricing based on exact route distance. Default AC enabled, zero peak surge charges.<br>
        • <strong>Oneway Trips:</strong> Fixed all-inclusive route fares for popular destinations, or transparent rate calculation based on trip distance.<br>
        • <strong>Round-Trip Outstation Rates:</strong> Budget sedan, spacious SUV, and luxury Crysta options available with zero hidden charges.<br>
        • <strong>Tolls & Parking:</strong> Paid directly at actuals with zero hidden commission.<br><br>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="tel:9894020156" class="btn btn-red" style="padding:6px 12px; font-size:0.78rem;">📞 Call 9894020156 for Quote</a>
          <button class="btn btn-yellow" style="padding:6px 12px; font-size:0.78rem;" onclick="openDedicatedPage('tariff')">📋 View Tariff Card</button>
        </div>
      `;
    }

    // 2. Ooty / Coonoor / Kotagiri / Nilgiris
    if (query.includes('ooty') || query.includes('nilgiri') || query.includes('coonoor') || query.includes('kotagiri')) {
      return `
        <strong>🌲 Coimbatore to Ooty & Nilgiris Hill Cab Details:</strong><br><br>
        • <strong>Distance & Time:</strong> 87 KM (2.5–3.5 Hours drive via Mettupalayam)<br>
        • <strong>Hairpin Bends:</strong> <strong>36 Hairpin Curves</strong> on the scenic ghat road<br>
        • <strong>E-Pass Requirement:</strong> Mandatory e-pass registration (pass.tnega.org) – drivers assist with checkposts<br>
        • <strong>Tariffs:</strong><br>
          &nbsp;&nbsp;🚗 <strong>Sedan (Dzire/Etios):</strong> Oneway Drop: <strong style="color:var(--brand-red);">₹3,500</strong> | Full Day Tour (220 KM): <strong style="color:var(--brand-red);">₹3,800</strong><br>
          &nbsp;&nbsp;🚙 <strong>SUV (Ertiga):</strong> Oneway: <strong style="color:var(--brand-red);">₹3,800</strong> | Tour: <strong style="color:var(--brand-red);">₹5,500</strong><br>
          &nbsp;&nbsp;🚐 <strong>Innova Crysta:</strong> Oneway: <strong style="color:var(--brand-red);">₹4,800</strong> | Tour: <strong style="color:var(--brand-red);">₹6,800</strong><br>
          &nbsp;&nbsp;📍 <strong>Coonoor / Kotagiri Oneway:</strong> <strong style="color:var(--brand-red);">₹2,900</strong> (70–83 KM)<br>
        • <strong>Sightseeing:</strong> Botanical Garden (7 AM–6:30 PM), Doddabetta Peak, Pykara Falls, Tea Estates<br><br>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="tel:9894020156" class="btn btn-red" style="padding:6px 12px; font-size:0.78rem;">📞 Call 9894020156</a>
          <button class="btn btn-yellow" style="padding:6px 12px; font-size:0.78rem;" onclick="window.prefillForm('Coimbatore', 'Ooty Bus Stand', 'oneway')">🚖 Book Ooty Cab</button>
        </div>
      `;
    }

    // 3. Munnar
    if (query.includes('munnar')) {
      return `
        <strong>🏞️ Coimbatore to Munnar Tea Hills & Waterfalls:</strong><br><br>
        • <strong>Distance & Time:</strong> 160 KM (4.5 Hours drive via Udumalpet & Marayoor)<br>
        • <strong>Checkpost Rules:</strong> Chinnar Forest checkpost open 6:00 AM – 9:00 PM (Night ban 9 PM–6 AM)<br>
        • <strong>Tariffs:</strong><br>
          &nbsp;&nbsp;🚗 <strong>Sedan (Dzire/Etios):</strong> Oneway: <strong style="color:var(--brand-red);">₹3,800</strong> | 2 Days / 1 Night Tour: <strong style="color:var(--brand-red);">₹6,500</strong><br>
          &nbsp;&nbsp;🚙 <strong>SUV (Ertiga):</strong> Oneway: <strong style="color:var(--brand-red);">₹5,800</strong> | 2D1N Tour: <strong style="color:var(--brand-red);">₹9,500</strong><br>
          &nbsp;&nbsp;🚐 <strong>Innova Crysta:</strong> Oneway: <strong style="color:var(--brand-red);">₹7,200</strong> | 2D1N Tour: <strong style="color:var(--brand-red);">₹12,500</strong><br>
        • <strong>Highlights:</strong> Cheeyappara Falls, Marayoor Sandalwood, Lakkam Falls, Eravikulam (Nilgiri Tahr), Mattupetty Dam<br><br>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="tel:9894020156" class="btn btn-red" style="padding:6px 12px; font-size:0.78rem;">📞 Call 9894020156</a>
          <button class="btn btn-yellow" style="padding:6px 12px; font-size:0.78rem;" onclick="window.openTourPackageDetail('munnar-hills')">🗺️ Munnar Details</button>
        </div>
      `;
    }

    // 4. Kodaikanal
    if (query.includes('kodaikanal') || query.includes('kodai')) {
      return `
        <strong>🏔️ Coimbatore to Kodaikanal (Princess of Hills):</strong><br><br>
        • <strong>Distance & Time:</strong> 175 KM (4.5 Hours drive via Batlagundu)<br>
        • <strong>Hairpin Bends:</strong> <strong>14 Hairpin Curves</strong> on smooth asphalt highway<br>
        • <strong>E-Pass Requirement:</strong> Mandatory e-pass required (pass.tnega.org)<br>
        • <strong>Tariffs:</strong><br>
          &nbsp;&nbsp;🚗 <strong>Sedan (Dzire/Etios):</strong> Oneway: <strong style="color:var(--brand-red);">₹4,200</strong> | 2 Days / 1 Night: <strong style="color:var(--brand-red);">₹6,800</strong><br>
          &nbsp;&nbsp;🚙 <strong>SUV (Ertiga):</strong> Oneway: <strong style="color:var(--brand-red);">₹6,200</strong> | 2D1N: <strong style="color:var(--brand-red);">₹9,800</strong><br>
          &nbsp;&nbsp;🚐 <strong>Innova Crysta:</strong> Oneway: <strong style="color:var(--brand-red);">₹7,800</strong> | 2D1N: <strong style="color:var(--brand-red);">₹12,800</strong><br>
        • <strong>Highlights:</strong> Silver Cascade Falls, Kodai Lake Boating, Coaker's Walk, Pillar Rocks, Kurinji Andavar Temple<br><br>
        <a href="tel:9894020156" class="btn btn-red" style="padding:6px 14px; font-size:0.8rem; display:inline-block;">📞 Call 9894020156 to Book</a>
      `;
    }

    // 5. Valparai
    if (query.includes('valparai')) {
      return `
        <strong>⛰️ Coimbatore to Valparai Tea Estate Special:</strong><br><br>
        • <strong>Distance & Route:</strong> 105 KM via Pollachi & Aliyar Dam<br>
        • <strong>Hairpin Bends:</strong> <strong>40 Hairpin Curves</strong> with panoramic tea valley views<br>
        • <strong>Tariffs:</strong> Oneway: <strong style="color:var(--brand-red);">₹2,799 - ₹3,500</strong> | Full Day Tour: <strong style="color:var(--brand-red);">₹4,500</strong> (Sedan)<br>
        • <strong>Highlights:</strong> Aliyar Dam Park, Monkey Falls, Carver Marsh Statue, Sholayar Dam, Nallamudi Poonjolai<br><br>
        <a href="tel:9894020156" class="btn btn-red" style="padding:6px 14px; font-size:0.8rem; display:inline-block;">📞 Call 9894020156 to Book</a>
      `;
    }

    // 6. Isha Yoga / Adiyogi / Vellingiri
    if (query.includes('isha') || query.includes('adiyogi') || query.includes('dhyanalinga') || query.includes('vellingiri') || query.includes('perur')) {
      return `
        <strong>🕉️ Coimbatore to Isha Yoga Center & 112ft Adiyogi Shiva:</strong><br><br>
        • <strong>Distance & Time:</strong> 30–33 KM (45 Minutes from City/Gandhipuram/Railway Stn)<br>
        • <strong>Gate Timings:</strong> 6:00 AM – 8:00 PM | <strong>Adiyogi 3D Laser Show:</strong> 7:00 PM – 7:15 PM Daily<br>
        • <strong>Tariffs:</strong><br>
          &nbsp;&nbsp;🚗 <strong>Oneway Drop:</strong> <strong style="color:var(--brand-red);">₹1,100 flat</strong> (Sedan AC)<br>
          &nbsp;&nbsp;🚗 <strong>Half-Day (Drop + 3-4 Hrs Wait & Return):</strong> <strong style="color:var(--brand-red);">₹1,200</strong><br>
          &nbsp;&nbsp;🚗 <strong>Full-Day City + Isha Package:</strong> <strong style="color:var(--brand-red);">₹1,800</strong> (Sedan) / ₹2,600 (Ertiga)<br>
        • <strong>Sightseeing Included:</strong> Perur Pateeswarar Temple (1000 yrs old), Dhyanalinga, Suryakund/Chandrakund, Kovai Kutralam Falls<br><br>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="tel:9894020156" class="btn btn-red" style="padding:6px 12px; font-size:0.78rem;">📞 Call 9894020156</a>
          <button class="btn btn-yellow" style="padding:6px 12px; font-size:0.78rem;" onclick="window.prefillForm('Coimbatore', 'Isha Yoga Center', 'oneway')">🚖 Book Isha Cab</button>
        </div>
      `;
    }

    // 7. Airport CJB
    if (query.includes('airport') || query.includes('cjb') || query.includes('peelamedu') || query.includes('flight')) {
      return `
        <strong>✈️ Coimbatore International Airport (CJB) Cab Services:</strong><br><br>
        • <strong>City Pickup / Drop:</strong> Gandhipuram, RS Puram, Peelamedu, Saravanampatti ₹499–₹650<br>
        • <strong>Airport to Tiruppur:</strong> <strong style="color:var(--brand-red);">₹1,700 flat</strong> (46 KM)<br>
        • <strong>Airport to Palakkad:</strong> <strong style="color:var(--brand-red);">₹2,200 flat</strong> (61 KM)<br>
        • <strong>Airport to Ooty:</strong> <strong style="color:var(--brand-red);">₹3,500</strong> (Direct mountain cab ready at arrival)<br>
        • <strong>Flight Delay Guarantee:</strong> Driver tracks flight status; zero waiting penalty if flight is delayed.<br><br>
        <a href="tel:9894020156" class="btn btn-red" style="padding:6px 14px; font-size:0.8rem; display:inline-block;">📞 Book 24/7 Airport Taxi (9894020156)</a>
      `;
    }

    // 8. Hourly & Day Rental Packages
    if (query.includes('hourly') || query.includes('rental') || query.includes('package') || query.includes('day package') || query.includes('10 hour') || query.includes('12 hour')) {
      return `
        <strong>⏱️ Get Cabs Hourly & Daily Rental Packages:</strong><br><br>
        • <strong>1 Hour Rental:</strong> <strong style="color:var(--brand-red);">₹350/hr</strong> (Includes 10 KM free; extra distance @ ₹25/KM)<br>
        • <strong>Package A (10 Hours / 100 KM):</strong> <strong style="color:var(--brand-red);">₹3,000 flat</strong> (Extra KM: ₹10/KM)<br>
        • <strong>Package B (12 Hours / 100 KM):</strong> <strong style="color:var(--brand-red);">₹3,500 flat</strong> (Extra hour: ₹150/hr)<br>
        • <strong>Includes:</strong> Fuel, AC vehicle, professional driver, multi-stop flexibility across Coimbatore city, textile shops, hospitals, colleges, temples.<br><br>
        <a href="tel:9894020156" class="btn btn-red" style="padding:6px 14px; font-size:0.8rem; display:inline-block;">📞 Call 9894020156 to Reserve Package</a>
      `;
    }

    // 9. Popular Drops & Intercity Routes
    if (query.includes('pollachi') || query.includes('palani') || query.includes('tirupur') || query.includes('tiruppur') || query.includes('erode') || query.includes('salem') || query.includes('madurai') || query.includes('bangalore') || query.includes('mysore') || query.includes('palakkad') || query.includes('sathyamangalam') || query.includes('annur') || query.includes('anaikatti') || query.includes('mettupalayam') || query.includes('mtp') || query.includes('dharapuram') || query.includes('yercaud') || query.includes('guruvayur') || query.includes('trichy') || query.includes('kanyakumari')) {
      return `
        <strong>🗺️ Official Fixed One-Way Drop Rates from Coimbatore:</strong><br><br>
        • <strong>Annur / Isha Yoga:</strong> ₹1,100 (30–33 KM)<br>
        • <strong>Anaikatti:</strong> ₹1,300 (30 KM)<br>
        • <strong>Mettupalayam (MTP):</strong> ₹1,400 (37 KM)<br>
        • <strong>Palladam / Sirumugai:</strong> ₹1,500 (40 KM)<br>
        • <strong>Pollachi / Avinashi:</strong> ₹1,600 (43 KM)<br>
        • <strong>Tiruppur / Palakkad:</strong> ₹1,900 (52–55 KM)<br>
        • <strong>Sathyamangalam / Udumalpet:</strong> ₹2,500 (70 KM)<br>
        • <strong>Coonoor / Kotagiri:</strong> ₹2,900 (70–83 KM)<br>
        • <strong>Dharapuram:</strong> ₹2,950 (85 KM)<br>
        • <strong>Erode:</strong> ₹3,500 (100 KM)<br>
        • <strong>Ooty Bus Stand:</strong> ₹3,500 (87 KM)<br>
        • <strong>Palani Murugan Temple:</strong> ₹3,900 (110 KM)<br>
        • <strong>Yercaud:</strong> ₹4,800 (195 KM Full Day)<br>
        • <strong>Bangalore:</strong> ₹7,499 (360 KM oneway)<br>
        • <strong>Mysore:</strong> ₹5,499 (200 KM oneway)<br><br>
        <button class="btn btn-red" style="padding:6px 12px; font-size:0.78rem;" onclick="openDedicatedPage('popular-routes')">🗺️ Browse All Routes</button>
      `;
    }

    // 10. Vehicles & Fleet
    if (query.includes('car') || query.includes('vehicle') || query.includes('innova') || query.includes('crysta') || query.includes('ertiga') || query.includes('sedan') || query.includes('swift') || query.includes('dzire') || query.includes('tempo') || query.includes('traveller') || query.includes('fleet')) {
      return `
        <strong>🚗 Get Cabs Coimbatore Fleet Options:</strong><br><br>
        • <strong>Hatchback (WagonR/Tiago):</strong> 4 Seater, 2 small bags. Ideal for city quick rides.<br>
        • <strong>Prime Sedan (Swift Dzire/Etios):</strong> 4 Seater, 3 medium bags, spacious trunk, default AC.<br>
        • <strong>Spacious SUV (Maruti Ertiga/XL6):</strong> 6 Seater + luggage carrier, great for family hill trips.<br>
        • <strong>Luxury SUV (Toyota Innova Crysta):</strong> 7 Seater, captain chairs, unmatched hill suspension.<br>
        • <strong>Tempo Traveller (12/14/18 Seater):</strong> Group tours, corporate trips, pushback AC seats.<br><br>
        <a href="tel:9894020156" class="btn btn-red" style="padding:6px 14px; font-size:0.8rem; display:inline-block;">📞 Call 9894020156 for Fleet Booking</a>
      `;
    }

    // 11. Policies, Cancellation, Refund, AC
    if (query.includes('cancel') || query.includes('refund') || query.includes('ac') || query.includes('e-pass') || query.includes('epass') || query.includes('pass') || query.includes('surge') || query.includes('night') || query.includes('policy')) {
      return `
        <strong>📋 Get Cabs Policies & Customer Guarantees:</strong><br><br>
        • <strong>100% Free Cancellation:</strong> Cancel anytime prior to driver dispatch with zero fee.<br>
        • <strong>Nominal Fee:</strong> Only ₹100 applies if cancelled after driver arrives at pickup location.<br>
        • <strong>Advance Booking Refunds:</strong> 100% full refund within 24 hours to your UPI/bank.<br>
        • <strong>Weather/Road Closures:</strong> 100% fee waiver for landslides or government mountain road bans.<br>
        • <strong>Air Conditioning:</strong> Enabled by default for all trips at no extra surcharge.<br>
        • <strong>Zero Surge:</strong> No peak multiplier or rain surcharge in Coimbatore.<br>
        • <strong>E-Pass Support:</strong> Drivers assist with Ooty / Kodaikanal TN e-pass checkposts.<br><br>
        <button class="btn btn-red" style="padding:6px 12px; font-size:0.78rem;" onclick="openDedicatedPage('cancellation-policy')">📄 Read Policy</button>
      `;
    }

    // 12. Offers & Discount
    if (query.includes('discount') || query.includes('spin') || query.includes('coupon') || query.includes('offer') || query.includes('promo')) {
      openDiscountModal();
      return `
        <strong>🎁 Spin & Win Discount Unlocked!</strong><br>
        I have opened our Spin & Win wheel. Use Coupon Code <strong style="color:var(--brand-red);">GET100</strong> for <strong>₹100 Off</strong> on your first outstation ride!
      `;
    }

    // 13. Contact & Booking
    if (query.includes('contact') || query.includes('number') || query.includes('phone') || query.includes('call') || query.includes('book') || query.includes('helpline') || query.includes('office')) {
      return `
        <strong>📞 Contact Get Cabs Coimbatore 24/7:</strong><br><br>
        • <strong>24/7 Hotline:</strong> <a href="tel:9894020156" style="color:var(--brand-red); font-weight:800; font-size:1.05rem;">9894020156</a><br>
        • <strong>WhatsApp:</strong> <a href="https://wa.me/919894020156?text=Hi%20Get%20Cabs,%20I%20want%20to%20book%20a%20cab" target="_blank" style="color:#25d366; font-weight:800;">Chat on WhatsApp (9894020156)</a><br>
        • <strong>Email:</strong> booking@getcabs.in<br>
        • <strong>Office:</strong> Gandhipuram Taxi Stand & Peelamedu Airport Rd, Coimbatore - 641001<br><br>
        ⚡ Cabs dispatched within <strong>5 to 10 minutes</strong> across Coimbatore!
      `;
    }

    // Default friendly full breakdown response
    return `
      <strong>👋 I am Get Cabs AI Assistant (Gemini Mini)!</strong><br><br>
      I know all pricing, routes, price maths, and fleet details of Get Cabs Coimbatore:<br>
      • <strong>Local City Taxi:</strong> Base ₹150 (first 2.5 KM) + ₹28–₹30/KM (Default AC, Zero Surge)<br>
      • <strong>Fixed One-Way Drops:</strong> Ooty (₹3,500), Pollachi (₹1,600), Palani (₹3,900), Isha Yoga (₹1,100), Erode (₹3,500), Munnar (₹3,800)<br>
      • <strong>Hourly Rentals:</strong> ₹350/hr (10 KM free) | 10 Hrs / 100 KM @ ₹3,000 | 12 Hrs @ ₹3,500<br>
      • <strong>Airport Drops (CJB):</strong> Tiruppur ₹1,700, Palakkad ₹2,200, City ₹499–₹650<br>
      • <strong>Price Maths:</strong> Oneway < 100 KM @ ₹17/KM roundtrip; Oneway > 130 KM @ ₹14/KM + ₹400 Batta<br><br>
      Ask me any route, vehicle, price calculation, or call <strong>[9894020156](tel:9894020156)</strong> for instant booking!
    `;
  }

  window.prefillForm = function(pickup, drop, mode = 'local') {
    if (aiChatWindow) aiChatWindow.classList.remove('active');
    const bookingSection = document.getElementById('booking-forms-wrapper') || document.querySelector('.booking-card');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Switch tab
    const targetTabBtn = document.querySelector(`.tab-btn[data-tab="${mode}"]`);
    if (targetTabBtn) {
      targetTabBtn.click();
    }

    if (mode === 'oneway') {
      const pEl = document.getElementById('oneway-pickup');
      const dEl = document.getElementById('oneway-drop');
      if (pEl && pickup) pEl.value = pickup;
      if (dEl && drop) dEl.value = drop;
    } else if (mode === 'outstation') {
      const pEl = document.getElementById('outstation-pickup');
      const dEl = document.getElementById('outstation-drop');
      if (pEl && pickup) pEl.value = pickup;
      if (dEl && drop) dEl.value = drop;
    } else {
      const pEl = document.getElementById('local-pickup');
      const dEl = document.getElementById('local-drop');
      if (pEl && pickup) pEl.value = pickup;
      if (dEl && drop) dEl.value = drop;
    }

    if (typeof updateAllEstimates === 'function') {
      updateAllEstimates();
    }
  };

  // 13. Spin & Win Discount Wheel Logic
  const discountModal = document.getElementById('discount-modal');
  const discountModalClose = document.getElementById('discount-modal-close');
  const spinWheelBtn = document.getElementById('spin-wheel-btn');
  const wheelGraphic = document.getElementById('wheel-graphic');
  const wheelResultMsg = document.getElementById('wheel-result-msg');

  function openDiscountModal() {
    if (discountModal) discountModal.classList.add('active');
  }

  if (discountModalClose) {
    discountModalClose.addEventListener('click', function() {
      discountModal.classList.remove('active');
    });
  }

  let hasSpun = false;
  if (spinWheelBtn) {
    spinWheelBtn.addEventListener('click', function() {
      if (hasSpun) {
        if (wheelResultMsg) {
          wheelResultMsg.innerHTML = '🎁 You already won! Use Coupon Code <strong style="color:var(--brand-red);">GET100</strong> for ₹100 Off.';
        }
        return;
      }

      const randomDegrees = 1440 + Math.floor(Math.random() * 360);
      if (wheelGraphic) {
        wheelGraphic.style.transform = `rotate(${randomDegrees}deg)`;
      }

      spinWheelBtn.disabled = true;
      spinWheelBtn.textContent = 'Spinning... 🎰';

      setTimeout(() => {
        hasSpun = true;
        spinWheelBtn.disabled = false;
        spinWheelBtn.textContent = '🎉 Coupon Code: GET100 Applied!';
        if (wheelResultMsg) {
          wheelResultMsg.innerHTML = '🎉 CONGRATS! You unlocked <strong style="color:var(--brand-red);">Coupon: GET100</strong> (Flat ₹100 Off on Oneway Ride!). Call 9894020156 or book now.';
        }
      }, 4000);
    });
  }

  } // End of initDeferredFeatures

  // Schedule deferred features when browser is idle (zero Total Blocking Time on load)
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initDeferredFeatures, { timeout: 1200 });
  } else {
    setTimeout(initDeferredFeatures, 60);
  }

  // Also initialize immediately if user interacts before idle
  ['scroll', 'touchstart', 'mousemove', 'click', 'keydown'].forEach(evt => {
    window.addEventListener(evt, initDeferredFeatures, { once: true, passive: true });
  });

}); // End of DOMContentLoaded

