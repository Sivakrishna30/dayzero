// Notification data extracted from TNPSC Group 1 Notification No.05/2026 (23.06.2026)
// This file contains structured data for eligibility validation and vacancy display

export const notificationData = {
  group1: {
    notificationNo: '05/2026',
    advertisementNo: '736',
    notificationDate: '23.06.2026',
    applyStart: '30.06.2026',
    applyEnd: '29.07.2026',
    correctionWindow: { start: '02.08.2026', end: '04.08.2026' },
    prelimsDate: '06.09.2026',
    prelimsTime: '09:30 AM to 12:30 PM',
    mainsDate: 'Will be announced later',
    
    posts: [
      {
        code: 1001,
        name: 'Deputy Collector',
        service: 'Tamil Nadu Civil Service',
        vacancies: 12,
        note: 'including Backlog vacancy',
        payLevel: 22,
        ageMin: 21,
        ageMax: {
          others: 34,
          sc_st_mbc_bc: 39
        },
        ageMaxWithBL: {
          others: 35,
          sc_st_mbc_bc: 40
        },
        education: 'Any Degree',
        visionStandard: 'Standard III or better',
        pwdCategories: ['LV', 'HH', 'LD (with mobility)', 'LD (others)', 'CP', 'LC', 'DF', 'AC', 'SLD', 'MD']
      },
      {
        code: 1003,
        name: 'Assistant Commissioner (Commercial Taxes)',
        service: 'Tamil Nadu Commercial Taxes Service',
        vacancies: 2,
        payLevel: 22,
        ageMin: 21,
        ageMax: {
          others: 35,
          sc_st_mbc_bc: 40
        },
        education: 'Any Degree (B.Com + BL preferred)',
        visionStandard: 'Standard III or better',
        pwdCategories: ['VI', 'LV', 'HH', 'HI', 'LD', 'LD (others)', 'CP', 'LC', 'DF', 'AC', 'MuD', 'ASD', 'SLD', 'MD', 'MI']
      },
      {
        code: 1004,
        name: 'Deputy Registrar of Co-operative Societies',
        service: 'Tamil Nadu Co-operative Service',
        vacancies: 3,
        note: 'including shortfall vacancies',
        payLevel: 22,
        ageMin: 21,
        ageMax: {
          others: 34,
          sc_st_mbc_bc: 39
        },
        education: 'Any Degree',
        visionStandard: 'Standard III or better',
        pwdCategories: ['LV', 'HI', 'HH', 'LD', 'LD (others)', 'CP', 'DF', 'AC']
      },
      {
        code: 1005,
        name: 'District Registrar',
        service: 'Tamil Nadu Registration Service',
        vacancies: 8,
        payLevel: 22,
        ageMin: 21,
        ageMax: {
          others: 34,
          sc_st_mbc_bc: 39
        },
        education: 'Any Degree',
        visionStandard: 'Standard III or better',
        pwdCategories: ['LV', 'HH', 'LD', 'LD (others)', 'CP', 'DF', 'AC']
      },
      {
        code: 1946,
        name: 'Assistant Commissioner of Labour',
        service: 'Tamil Nadu Labour Service',
        vacancies: 1,
        payLevel: 22,
        ageMin: 21,
        ageMax: {
          others: 34,
          sc_st_mbc_bc: 39
        },
        education: 'Any Degree (Freedom fighter family preference)',
        visionStandard: 'Standard III or better',
        pwdCategories: ['LV', 'HH', 'LD', 'LD (others)', 'CP', 'LC', 'DF', 'AC', 'MuD']
      }
    ],

    totalVacancies: 26,

    reservation: {
      SC_ST: { percentage: 19, label: 'SC / ST' },
      BC: { percentage: 26.5, label: 'Backward Classes' },
      BCM: { percentage: 3.5, label: 'Backward Class (Muslim)' },
      MBC_DC: { percentage: 20, label: 'Most Backward Classes / DC' },
      Others: { percentage: 31, label: 'General Turn (Others)' }
    },

    womenReservation: 30, // 30% of vacancies for women

    pwdReservation: 4, // 4% across categories

    ageConcession: {
      SC_ST_MBC_BC: { maxAge: 39, maxAgeWithBL: 40 },
      PWD: { additionalYears: 10 },
      ExServicemen: { additionalYears: null }, // varies
      DestituteWidow: { maxAge: 50 }
    },

    examPattern: {
      prelims: {
        subjects: [
          { name: 'General Studies', standard: 'Degree', questions: 175, marks: 300 },
          { name: 'Aptitude and Mental Ability', standard: 'SSLC', questions: 25, marks: 0 }
        ],
        totalQuestions: 200,
        totalMarks: 300,
        duration: '3 hours',
        minQualifyingMarks: { sc_st_mbc_bc: 90, others: 120 },
        type: 'Objective (OMR)',
        languages: ['Tamil', 'English']
      },
      mains: {
        papers: [
          { name: 'Paper I - Tamil Eligibility Test', marks: 100, duration: '3 hours', type: 'Descriptive', language: 'Tamil', minQualifying: { sc_st_mbc_bc: 40, others: 40 } },
          { name: 'Paper II - General Studies I', marks: 250, duration: '3 hours', type: 'Descriptive', languages: ['Tamil', 'English'] },
          { name: 'Paper III - General Studies II', marks: 250, duration: '3 hours', type: 'Descriptive', languages: ['Tamil', 'English'] },
          { name: 'Paper IV - General Studies III', marks: 250, duration: '3 hours', type: 'Descriptive', languages: ['Tamil', 'English'] }
        ],
        totalMarks: 850, // Paper II+III+IV (750) + Interview (100)
        interviewMarks: 100
      }
    },

    eligibilityRules: {
      ageCalculationDate: '01.07.2026',
      tamilKnowledge: 'SSLC with Tamil OR studied in Tamil medium OR passed 2nd Class Language Test (Full Test) in Tamil',
      educationRule: 'Degree on or before notification date (23.06.2026). Final year students can apply for prelims but must produce degree proof for mains.',
      educationOrder: 'SSLC + HSC/Diploma + UG Degree + PG Degree (if applicable)',
      employedCandidates: 'Must inform employer and produce No Objection Certificate',
      criminalCases: 'Must declare pending/registered criminal cases with FIR copy',
      restriction: 'Others with 5+ years of govt service are not eligible'
    },

    feeStructure: {
      prelimsFee: 100,
      mainsFee: 200,
      feeExemption: {
        SC: 'Full exemption',
        SCA: 'Full exemption',
        ST: 'Full exemption',
        PWD: 'Full exemption',
        DestituteWidow: 'Full exemption',
        ExServicemen: '2 free chances',
        BC: '3 free chances',
        BCM: '3 free chances',
        MBC_DC: '3 free chances'
      }
    },

    examCenters: [
      'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Chidambaram',
      'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
      'Nagercoil', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
      'Nagapattinam', 'Namakkal', 'Perambalur', 'Pudukkottai', 'Ramanathapuram',
      'Ranipet', 'Salem', 'Karaikudi', 'Tenkasi', 'Thanjavur', 'The Nilgiris',
      'Theni', 'Thiruvallur', 'Thiruvannamalai', 'Thiruvarur', 'Thoothukudi',
      'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Vellore',
      'Villupuram', 'Virudhunagar'
    ]
  }
};

// Helper function to calculate age from DOB
export function calculateAge(dob, referenceDate = '01.07.2026') {
  const [d, m, y] = dob.split('.').map(Number);
  const [rd, rm, ry] = referenceDate.split('.').map(Number);
  const birthDate = new Date(y, m - 1, d);
  const refDate = new Date(ry, rm - 1, rd);
  let age = refDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = refDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Helper function to check eligibility
export function checkEligibility(examType, userData) {
  const exam = notificationData[examType];
  if (!exam) return { eligible: false, reasons: ['Exam not found'] };

  const reasons = [];
  let eligible = true;

  // Age check
  const age = calculateAge(userData.dob);
  const ageMax = exam.posts[0].ageMax;
  const maxAge = userData.community === 'others' ? ageMax.others : ageMax.sc_st_mbc_bc;
  
  if (age < 21) {
    eligible = false;
    reasons.push(`Minimum age is 21 years. Your age: ${age} years`);
  } else if (age > maxAge) {
    // Check age concessions
    let hasConcession = false;
    if (userData.isPWD && age <= maxAge + 10) {
      hasConcession = true;
    }
    if (userData.isExServiceman && age <= maxAge + 3) {
      hasConcession = true;
    }
    if (userData.isDestituteWidow && age <= 50) {
      hasConcession = true;
    }
    if (!hasConcession) {
      eligible = false;
      reasons.push(`Maximum age is ${maxAge} years for your category. Your age: ${age} years`);
    }
  }

  // Education check
  if (!userData.hasDegree) {
    eligible = false;
    reasons.push('A Degree (UG) is mandatory for all posts');
  }

  // Tamil knowledge check
  if (!userData.hasTamilKnowledge) {
    eligible = false;
    reasons.push('Adequate knowledge of Tamil is required (SSLC with Tamil / Tamil medium / 2nd Class Language Test)');
  }

  // Community check
  const validCommunities = ['sc', 'sca', 'st', 'bc', 'bcm', 'mbc_dc', 'others'];
  if (!validCommunities.includes(userData.community)) {
    eligible = false;
    reasons.push('Invalid community category');
  }

  // Employment restriction
  if (userData.community === 'others' && userData.govtServiceYears >= 5) {
    eligible = false;
    reasons.push('Others category candidates with 5+ years of government service are not eligible');
  }

  return { eligible, reasons, age, maxAge };
}

// Helper to calculate estimated vacancies by category
export function calculateVacancies(examType, community, gender) {
  const exam = notificationData[examType];
  if (!exam) return null;

  const total = exam.totalVacancies;
  const reservation = exam.reservation;
  const womenPercent = exam.womenReservation;

  let categoryVacancies = 0;
  if (community === 'sc') categoryVacancies = Math.round(total * reservation.SC.percentage / 100);
  else if (community === 'sca') categoryVacancies = Math.round(total * reservation.SCA.percentage / 100);
  else if (community === 'st') categoryVacancies = Math.round(total * reservation.ST.percentage / 100);
  else if (community === 'bc') categoryVacancies = Math.round(total * reservation.BC.percentage / 100);
  else if (community === 'bcm') categoryVacancies = Math.round(total * reservation.BCM.percentage / 100);
  else if (community === 'mbc_dc') categoryVacancies = Math.round(total * reservation.MBC_DC.percentage / 100);
  else categoryVacancies = Math.round(total * reservation.Others.percentage / 100);

  const womenVacancies = Math.round(categoryVacancies * womenPercent / 100);

  return {
    totalVacancies: total,
    categoryVacancies,
    womenVacancies,
    generalVacancies: categoryVacancies - womenVacancies,
    byPost: exam.posts.map(post => ({
      name: post.name,
      total: post.vacancies,
      estimated: Math.round(post.vacancies * categoryVacancies / total)
    }))
  };
}