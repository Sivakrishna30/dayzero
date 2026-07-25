import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, SafeAreaView, StyleSheet, Text, View, ScrollView, Modal, Platform, TextInput, TouchableOpacity, Dimensions, Image } from 'react-native';
import { syllabusData } from './syllabus';
import { notificationData, calculateAge, checkEligibility, calculateVacancies } from './notificationData';

const { width: screenWidth } = Dimensions.get('window');

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('tamil');
  const [prepLevel, setPrepLevel] = useState(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [subTab, setSubTab] = useState('prelims');
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isIntermediateSetupDone, setIsIntermediateSetupDone] = useState(false);
  const [eligibilityForm, setEligibilityForm] = useState({
    dob: '',
    community: 'others',
    hasDegree: false,
    hasTamilKnowledge: false,
    isPWD: false,
    isExServiceman: false,
    isDestituteWidow: false,
    govtServiceYears: 0,
    gender: 'male'
  });
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [showVacancyCalc, setShowVacancyCalc] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDay, setDatePickerDay] = useState(1);
  const [datePickerMonth, setDatePickerMonth] = useState(1);
  const [datePickerYear, setDatePickerYear] = useState(2000);
  const [selectedCommunityFilter, setSelectedCommunityFilter] = useState('others');
  const [showCommunityFilter, setShowCommunityFilter] = useState(false);

  const annualPlannerData = [
    { id: 1, name: 'Combined Technical Services (Non-Interview)', notify: '20.05.2026', exam: '03.08.2026', duration: '7 Days' },
    { id: 2, name: 'Combined Civil Services – I (Group I)', notify: '23.06.2026', exam: '06.09.2026', duration: '1 Day' },
    { id: 3, name: 'Combined Technical Services (Diploma / ITI)', notify: '07.07.2026', exam: '20.09.2026', duration: '7 Days' },
    { id: 4, name: 'Combined Civil Services – II (Group II / IIA)', notify: '11.08.2026', exam: '25.10.2026', duration: '1 Day' },
    { id: 5, name: 'Combined Technical Services (Interview)', notify: '31.08.2026', exam: '14.11.2026', duration: '4 Days' },
    { id: 6, name: 'Combined Civil Services – IV (Group IV)', notify: '06.10.2026', exam: '20.12.2026', duration: '1 Day' },
  ];

  const examConfig = {
    group1: {
      id: 2,
      type: 'group1',
      name: 'Combined Civil Services – I (Group I)',
      examDate: '06.09.2026',
      notifyDate: '23.06.2026',
      description: 'The TNPSC Group 1 exam is the most prestigious state civil service exam in Tamil Nadu, used to recruit for high-level posts like Deputy Collector and Deputy Superintendent of Police (DSP).',
      pattern: [
        { label: 'Prelims (Qualifying)', questions: '200', marks: '300', marksPerQ: '1.5', negative: 'No', duration: '2 Hours' },
      ],
      patternNote: 'Mains: 750 Marks (Descriptive)\nInterview: 100 Marks (Personality Test)',
      cutoffs: [
        { label: 'General (GT)', value: '204–211 Marks' },
        { label: 'BC / MBC', value: '186–204 Marks' },
        { label: 'SC / ST', value: '160–199 Marks' },
      ],
      details: [
        { label: 'PSTM Preference', value: 'Usually lower than General' },
        { label: 'Target', value: 'Focus on maximum accuracy' },
      ]
    },
    group2: {
      id: 4,
      type: 'group2',
      name: 'Combined Civil Services – II (Group II / IIA)',
      examDate: '25.10.2026',
      notifyDate: '11.08.2026',
      description: 'The TNPSC Group 2 and 2A exams follow a tiered selection process consisting of a Preliminary exam followed by a Mains exam. Group 2 (Interview posts) includes an Oral Test (Interview), while Group 2A (Non-interview posts) selection is based solely on written marks.',
      pattern: [
        { label: 'Prelims (Common)', questions: '200', marks: '300', marksPerQ: '1.5', negative: 'No', duration: '2 Hours' },
      ],
      patternNote: 'Mains: 300 Marks (Descriptive, 3 Hours)\nInterview (Grp 2): 40 Marks (Oral Test)',
      cutoffs: [
        { label: 'UR / General', value: '158–168 Marks' },
        { label: 'BC / MBC', value: '150–162 Marks' },
        { label: 'SC / ST', value: '135–155 Marks' },
        { label: 'BC (Muslim)', value: '145–152 Marks' },
      ],
      details: [
        { label: 'Tamil Medium', value: 'Lower required Marks for PSTM' },
        { label: 'Non-Interview', value: 'Based solely on Written Marks' },
      ]
    },
    group4: {
      id: 6,
      type: 'group4',
      name: 'Combined Civil Services – IV (Group IV)',
      examDate: '20.12.2026',
      notifyDate: '06.10.2026',
      description: 'The TNPSC Group 4 exam is a single-stage competitive exam used to recruit for entry-level government positions like Village Administrative Officer (VAO), Junior Assistant, Typist, and Bill Collector. Selection is based purely on your written score and document verification.',
      pattern: [
        { label: 'Single Paper', questions: '200', marks: '300', marksPerQ: '1.5', negative: 'No', duration: '2 Hours' },
      ],
      patternNote: 'Part A (Tamil): 100 Qs, 150 Marks\nPart B (GS+Apti): 100 Qs, 150 Marks',
      cutoffs: [
        { label: 'General (OC)', value: '165–175 Qs' },
        { label: 'BC / MBC', value: '160–170 Qs' },
        { label: 'SC / ST', value: '145–160 Qs' },
      ],
      details: [
        { label: 'Tamil Rule', value: 'Min. 40% (60 Marks) Mandatory' },
        { label: 'Post Preference', value: 'Typist/Steno usually lower' },
      ]
    }
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [d, m, y] = dateStr.split('.').map(Number);
    return new Date(y, m - 1, d);
  };

  const activeExamInfo = examConfig[selectedExam] || null;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const getDaysToExam = () => {
    if (!activeExamInfo) return 0;
    const examDateObj = parseDate(activeExamInfo.examDate);
    if (!examDateObj) return 0;
    const diffTime = examDateObj - todayStart;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysToExam = getDaysToExam();

  const getActiveSyllabus = () => {
    if (!selectedExam) return [];
    const data = syllabusData[selectedExam];
    if (!data) return [];

    if (data.prelims && data.prelims.parts) {
      let allUnits = [];
      const parts = data.prelims.parts;
      Object.keys(parts).forEach(key => {
        const part = parts[key];
        if (part.units) {
          allUnits = allUnits.concat(part.units);
        }
      });
      return allUnits;
    }

    return Array.isArray(data) ? data : (data.prelims || []);
  };

  const activeSyllabus = getActiveSyllabus();

  const toggleUnit = (unitTitle, unitTopics) => {
    const allCompleted = unitTopics.every(t => completedTopics.includes(t));
    if (allCompleted) {
      setCompletedTopics(completedTopics.filter(t => !unitTopics.includes(t)));
    } else {
      const newTopics = [...new Set([...completedTopics, ...unitTopics])];
      setCompletedTopics(newTopics);
    }
  };

  const parseWeightage = (w) => {
    if (!w) return 0;
    const match = w.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const sortedStrategyUnits = [...activeSyllabus].sort((a, b) => {
    const wA = a.weightage || a.marks || '';
    const wB = b.weightage || b.marks || '';
    return parseWeightage(wB) - parseWeightage(wA);
  });

  const totalTopics = activeSyllabus.reduce((acc, unit) => acc + (unit.topics ? unit.topics.length : 0), 0);

  const currentProgress = totalTopics > 0
    ? Math.round((completedTopics.length / totalTopics) * 100)
    : 0;

  const [strategyView, setStrategyView] = useState('ordered');

  const getTargetMarks = () => {
    if (selectedExam === 'group1') return 220;
    if (selectedExam === 'group2') return 175;
    if (selectedExam === 'group4') return 185;
    return 0;
  };

  const calculateCurrentScore = () => {
    const syllabus = activeSyllabus;
    let score = 0;
    syllabus.forEach(unit => {
      const unitTopics = unit.topics;
      const completedInUnit = unitTopics.filter(t => completedTopics.includes(t)).length;
      if (completedInUnit > 0) {
        const weightString = unit.weightage || unit.marks || '0';
        const weightMatch = weightString.match(/(\d+(\.\d+)?)/);
        const unitWeight = weightMatch ? parseFloat(weightMatch[0]) : 0;
        score += (completedInUnit / unitTopics.length) * unitWeight;
      }
    });
    return Math.round(score * 10) / 10;
  };
  const targetMarks = getTargetMarks();
  const currentScore = calculateCurrentScore();
  const markGap = Math.max(0, targetMarks - currentScore);

  const getTodayTopic = () => {
    const syllabus = getActiveSyllabus();
    for (const unit of syllabus) {
      const pending = unit.topics.find(t => !completedTopics.includes(t));
      if (pending) return pending;
    }
    return "Syllabus Completed!";
  };

  const activeInfo = activeExamInfo;

  // Helper: Generate calendar days for the date picker
  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

  // Community filter options
  const communityFilterOptions = [
    { value: 'all', label: 'Overall (Default)' },
    { value: 'sc', label: 'SC' },
    { value: 'sca', label: 'SCA' },
    { value: 'st', label: 'ST' },
    { value: 'bc', label: 'BC' },
    { value: 'bcm', label: 'BCM' },
    { value: 'mbc_dc', label: 'MBC/DC' },
    { value: 'others', label: 'General' },
  ];

  // Helper: Get vacancy number for a post based on selected filter
  const getFilteredVacancy = (post, filter) => {
    const res = notificationData.group1.reservation;
    const total = post.vacancies;
    if (filter === 'all') return total;
    const mapping = {
      sc: res.SC.percentage,
      sca: res.SCA.percentage,
      st: res.ST.percentage,
      bc: res.BC.percentage,
      bcm: res.BCM.percentage,
      mbc_dc: res.MBC_DC.percentage,
      others: res.Others.percentage,
    };
    return Math.round(total * (mapping[filter] || 0) / 100);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('dayzero_user_data');
        if (savedData !== null) {
          const { selectedExam: savedExam, completedTopics: savedTopics, prepLevel: savedPrep, isIntermediateSetupDone: savedSetup } = JSON.parse(savedData);
          if (savedExam) setSelectedExam(savedExam);
          if (savedTopics) setCompletedTopics(savedTopics);
          if (savedPrep) setPrepLevel(savedPrep);
          if (savedSetup) setIsIntermediateSetupDone(savedSetup);
        }
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setIsDataLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      const saveData = async () => {
        try {
          const dataToSave = JSON.stringify({
            selectedExam,
            completedTopics,
            prepLevel,
            isIntermediateSetupDone
          });
          await AsyncStorage.setItem('dayzero_user_data', dataToSave);
        } catch (e) {
          console.error('Failed to save data', e);
        }
      };
      saveData();
    }
  }, [selectedExam, completedTopics, prepLevel, isDataLoaded, isIntermediateSetupDone]);

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      setSelectedExam(null);
      setCompletedTopics([]);
      setPrepLevel(null);
      setIsIntermediateSetupDone(false);
      setPage('home');
    } catch (e) {
      console.error('Failed to clear data');
    }
  };

  const toggleTopic = (topic) => {
    if (completedTopics.includes(topic)) {
      setCompletedTopics(completedTopics.filter(t => t !== topic));
    } else {
      setCompletedTopics([...completedTopics, topic]);
    }
  };

  const renderInfoSection = (title, data) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.cutoffCard}>
        {data.map((item, idx) => (
          <View key={idx} style={styles.cutoffRow}>
            <Text style={styles.cutoffLabel}>{item.label}</Text>
            <Text style={styles.cutoffValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {!isDataLoaded ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading DayZero...</Text>
        </View>
      ) : selectedExam === null ? (
        <View style={styles.page}>
          <View style={styles.onboardingContainer}>
            <Text style={styles.onboardingEyebrow}>Welcome to DayZero</Text>
            <Text style={styles.onboardingTitle}>Select your focus</Text>
            <Text style={styles.onboardingText}>
              Pick the exam you are aiming for. We'll tailor your strategy accordingly.
            </Text>

            <Pressable
              onPress={() => setSelectedExam('group1')}
              style={({ pressed }) => [
                styles.examOption,
                selectedExam === 'group1' && styles.examOptionSelected,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.examOptionLabel}>TNPSC Group 1</Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedExam('group2')}
              style={({ pressed }) => [
                styles.examOption,
                selectedExam === 'group2' && styles.examOptionSelected,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.examOptionLabel}>TNPSC Group 2 / 2A</Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedExam('group4')}
              style={({ pressed }) => [
                styles.examOption,
                selectedExam === 'group4' && styles.examOptionSelected,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.examOptionLabel}>TNPSC Group 4</Text>
            </Pressable>

            <View style={styles.quoteWrapper}>
              <Text style={styles.quoteText}>"Be like a horse with blinders. Lock your eyes on one target."</Text>
            </View>
          </View>
        </View>
      ) : prepLevel === null ? (
        <View style={styles.page}>
          <View style={styles.onboardingContainer}>
            <Text style={styles.onboardingEyebrow}>{activeExamInfo?.name}</Text>
            <Text style={styles.onboardingTitle}>Where are you now?</Text>

            <Pressable
              onPress={() => {
                setPrepLevel('beginner');
                setPage('home');
              }}
              style={({ pressed }) => [
                styles.levelOption,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.levelOptionTitle}>Beginner</Text>
              <Text style={styles.levelOptionDesc}>Starting from scratch (0% progress)</Text>
            </Pressable>

            <Pressable
              onPress={() => setPrepLevel('intermediate')}
              style={({ pressed }) => [
                styles.levelOption,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.levelOptionTitle}>Intermediate</Text>
              <Text style={styles.levelOptionDesc}>Already started. Select completed topics.</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setPrepLevel('pro');
                setPage('home');
              }}
              style={({ pressed }) => [
                styles.levelOption,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.levelOptionTitle}>Exam Ready</Text>
              <Text style={styles.levelOptionDesc}>Finished syllabus. Need test series.</Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedExam(null)}
              style={({ pressed }) => [
                styles.modalButtonSecondary,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.modalButtonSecondaryText}>← Change Exam</Text>
            </Pressable>
          </View>
        </View>
      ) : (prepLevel === 'intermediate' && !isIntermediateSetupDone) ? (
        <View style={styles.page}>
          <View style={styles.topBar}>
            <Pressable onPress={() => setPrepLevel(null)} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={styles.onboardingEyebrow}>PHASE 1: THE SIEGE</Text>
            <Text style={styles.onboardingTitleSmall}>What have you completed?</Text>
            <Text style={styles.onboardingTextSmall}>Select the units/topics you are 100% sure of.</Text>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {(() => {
              const data = syllabusData[selectedExam];
              if (!data) return [];
              if (data.prelims && data.prelims.parts) {
                let allUnits = [];
                const parts = data.prelims.parts;
                Object.keys(parts).forEach(key => {
                  const part = parts[key];
                  if (part.units) {
                    allUnits = allUnits.concat(part.units);
                  }
                });
                return allUnits;
              }
              if (Array.isArray(data)) return data;
              return data.prelims || [];
            })().map((unit) => {
              const isUnitFullyCompleted = unit.topics.every(t => completedTopics.includes(t));
              return (
                <View key={unit.id} style={styles.setupUnit}>
                  <View style={styles.setupTopicsPanel}>
                    <Pressable onPress={() => toggleUnit(unit.title, unit.topics)} style={({pressed}) => [styles.setupUnitHeader, pressed && styles.buttonPressed]}>
                      <View style={[styles.setupCheckbox, isUnitFullyCompleted && styles.setupCheckboxActive]}>
                        {isUnitFullyCompleted && <View style={styles.setupCheckboxInner} />}
                      </View>
                      <Text style={styles.setupUnitTitle}>{unit.title}</Text>
                    </Pressable>
                    <View style={styles.textSeparator} />
                    {unit.topics.map((topic) => (
                      <Pressable key={topic} onPress={() => toggleTopic(topic)} style={({pressed}) => [styles.setupTopicRow, pressed && styles.buttonPressed]}>
                        <View style={[styles.setupCheckboxMini, completedTopics.includes(topic) && styles.setupCheckboxActive]}>
                          {completedTopics.includes(topic) && <View style={styles.setupCheckboxInnerMini} />}
                        </View>
                        <Text style={[styles.setupTopicText, completedTopics.includes(topic) && styles.setupTopicTextCompleted]}>{topic}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
            <View style={{ height: 100 }} />
          </ScrollView>
          <View style={styles.setupFooterFixed}>
            <Pressable
              onPress={() => {
                setIsIntermediateSetupDone(true);
                setPage('home');
              }}
              style={({pressed}) => [styles.setupBtn, pressed && styles.buttonPressed]}
            >
              <Text style={styles.setupBtnText}>Save & Start Journey</Text>
            </Pressable>
          </View>
        </View>
      ) : page === 'home' ? (
        <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <Pressable
              onPress={() => setShowSwitchModal(true)}
              style={({ pressed }) => [
                styles.activeExamHeader,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.activeExamHeaderText}>
                {selectedExam === 'group1' ? 'Group 1' : selectedExam === 'group2' ? 'Group 2' : selectedExam === 'group4' ? 'Group 4' : 'Select Exam'}
              </Text>
              <View style={styles.switchIcon} />
            </Pressable>
            <Pressable
              onPress={() => setPage('guest')}
              style={({ pressed }) => [
                styles.guestBadge,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.guestBadgeText}>Guest mode</Text>
            </Pressable>
          </View>

          <View style={styles.heroWrap}>
            <Image source={require('./assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
            <View style={styles.titleRow}>
              <Text style={styles.title}>DayZero</Text>
            </View>

            <View style={styles.statusBoard}>
              <View style={styles.examBadgeLarge}>
                <Text style={styles.examBadgeTextLarge}>{activeExamInfo?.name || 'Select Exam'}</Text>
              </View>

              <View style={styles.countdownContainer}>
                <Text style={styles.countdownValue}>{daysToExam}</Text>
                <Text style={styles.countdownLabel}>DAYS TO GO</Text>
              </View>
            </View>

            {/* Merged Progress + Strategy Hub card */}
            <Pressable onPress={() => setPage('progress')} style={styles.homeProgressBox}>
              <View style={styles.homeProgressHeader}>
                <Text style={styles.homeProgressTitle}>Syllabus Progress</Text>
                <Text style={styles.homeProgressValue}>{currentProgress}%</Text>
              </View>
              <View style={styles.homeProgressBar}>
                <View style={[styles.homeProgressFill, { width: `${currentProgress}%` }]} />
              </View>
              <View style={styles.homeDashboardRow}>
                <View style={styles.homeDashboardItem}>
                  <Text style={styles.homeDashboardLabel}>SECURED MARKS</Text>
                  <Text style={styles.homeDashboardValue}>{currentScore} Marks</Text>
                </View>
                <View style={styles.homeDashboardItemRight}>
                  <Text style={styles.homeDashboardLabel}>TARGET MARKS</Text>
                  <Text style={styles.homeDashboardValueTarget}>{targetMarks} / 300</Text>
                </View>
              </View>
            </Pressable>

            {/* Strategy Hub embedded below marks */}
            <Pressable
              onPress={() => setPage(prepLevel === 'pro' ? 'testSeries' : 'strategy')}
              style={styles.homeStrategyLink}
            >
              <View>
                <Text style={styles.homeStrategyLinkLabel}>
                  {prepLevel === 'pro' ? 'EXAM SERIES' : 'STRATEGY HUB'}
                </Text>
                <Text style={styles.homeStrategyLinkTitle}>
                  {prepLevel === 'pro' ? 'Take Full-Length Mock Test' : 'Your Precision Attack Plan →'}
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={{height: 100}} />
        </ScrollView>
      ) : page === 'strategy' ? (
        <View style={styles.page}>
          <View style={styles.topBar}>
            <Pressable onPress={() => setPage('home')} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.strategyContainer}>
            <View style={styles.strategyHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoEyebrow}>Strategy</Text>
                <Text style={styles.strategyTitle}>Your Precision Attack Plan</Text>
              </View>
            </View>

            <View style={styles.attackAdviceBox}>
              <Text style={styles.attackAdviceTitle}>The Siege Strategy</Text>
              <Text style={styles.attackAdviceText}>
                Focus on the high-weightage priority units below to maximize your score and reach your target safe zone.
              </Text>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {sortedStrategyUnits.map((unit, index) => {
                const isPending = unit.topics.some(t => !completedTopics.includes(t));
                const suggestion = parseFloat(unit.weightage) > 15 ? 'Deep Dive' : 'Minimalist';
                return (
                  <View key={unit.id} style={styles.attackUnitItem}>
                    <Text style={styles.attackUnitTitle}>{index + 1}. {unit.title}</Text>
                    <Text style={styles.attackUnitWeight}>
                      Weightage: {unit.weightage} {isPending ? '(Pending)' : '(Completed)'}
                    </Text>
                    <View style={styles.attackActionRow}>
                      <Text style={styles.attackActionHint}>Suggestion: {suggestion}</Text>
                    </View>
                  </View>
                );
              })}

              <View style={styles.targetMarksBoxFixed}>
                <Text style={styles.targetMarksTitleLarge}>
                  Target: <Text style={styles.targetMarksRed}>{targetMarks} / 300 Marks</Text>
                </Text>
                <Text style={styles.targetMarksSub}>Highest previous cutoff + 10 marks safety buffer.</Text>
              </View>

              <Text style={styles.phase2Note}>Mains specific strategy will be unlocked in phase 2.</Text>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      ) : page === 'progress' ? (
        <View style={styles.page}>
          <View style={styles.topBar}>
            <Pressable onPress={() => setPage('home')} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressPageTitle}>Update Progress</Text>
            <Text style={styles.progressPageSub}>Mark topics you have completed to update your score.</Text>

            <View style={styles.progressStatsRow}>
               <Text style={styles.progressStatText}>{completedTopics.length} / {totalTopics} Topics</Text>
               <Text style={styles.progressStatPercent}>{currentProgress}%</Text>
            </View>
          </View>

          <ScrollView style={styles.resourceContent} showsVerticalScrollIndicator={false}>
            {activeSyllabus.map((unit) => (
              <View key={unit.id} style={styles.collapsibleCard}>
                <Pressable
                  onPress={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}
                  style={styles.collapsibleHeader}
                >
                  <View style={{flex: 1}}>
                    <Text style={styles.collapsibleTitle}>{unit.title}</Text>
                  </View>
                  <View style={[styles.arrow, expandedUnit === unit.id && styles.arrowExpanded]} />
                </Pressable>
                {expandedUnit === unit.id && (
                  <View style={styles.collapsibleBody}>
                    {unit.topics.map((topic, idx) => (
                      <Pressable key={idx} style={styles.topicItem} onPress={() => toggleTopic(topic)}>
                        <View style={[styles.topicCheckbox, completedTopics.includes(topic) && styles.topicCheckboxChecked]} />
                        <Text style={[styles.topicText, completedTopics.includes(topic) && styles.topicTextCompleted]}>{topic}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            ))}
            <View style={{ height: 120 }} />
          </ScrollView>
        </View>
      ) : page === 'resources' ? (
        <View style={styles.page}>
          <View style={styles.topBar}>
            <Pressable onPress={() => setPage('home')} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.resourcesHeader}>
            <Text style={styles.resourcesTitle}>Exam Info</Text>
          </View>

          <ScrollView style={styles.resourceContent} showsVerticalScrollIndicator={false}>
            {/* About This Exam */}
            <Text style={styles.sectionTitle}>About This Exam</Text>
            <View style={styles.aboutManifestoCard}>
              <Text style={styles.aboutText}>{activeInfo?.description}</Text>
            </View>

            {/* Exam Schedule */}
            <Text style={styles.sectionTitle}>Exam Schedule</Text>
            {annualPlannerData
              .filter(item => {
                if (selectedExam === 'group1') return item.id === 2;
                if (selectedExam === 'group2') return item.id === 4;
                if (selectedExam === 'group4') return item.id === 6;
                return false;
              })
              .map((item) => (
                <View key={item.id} style={styles.plannerCard}>
                  <Text style={styles.plannerName}>{item.name}</Text>
                  <View style={styles.plannerDates}>
                    <View style={styles.dateBlock}>
                      <Text style={styles.dateLabel}>NOTIFICATION</Text>
                      <Text style={styles.dateValue}>{item.notify}</Text>
                    </View>
                    <View style={styles.dateBlock}>
                      <Text style={styles.dateLabel}>EXAM DATE</Text>
                      <Text style={styles.dateValue}>{item.exam}</Text>
                    </View>
                  </View>
                </View>
              ))}

            {/* Exam Pattern */}
            {activeInfo && (
              <View>
                <Text style={styles.sectionTitle}>Exam Pattern</Text>
              <View style={styles.patternCardContainer}>
                  {/* Unified table header for Prelims */}
                  <View style={styles.patternTableHeader}>
                    <Text style={styles.patternTableHeaderText}>Prelims</Text>
                  </View>
                  {activeInfo.pattern.map((item, idx) => (
                    <View key={idx} style={styles.patternCard}>
                      <Text style={styles.patternCardLabel}>{item.label}</Text>
                      <View style={styles.patternCardRow}>
                        <Text style={styles.patternCardKey}>Questions:</Text>
                        <Text style={styles.patternCardValue}>{item.questions}</Text>
                      </View>
                      <View style={styles.patternCardRow}>
                        <Text style={styles.patternCardKey}>Total Marks:</Text>
                        <Text style={styles.patternCardValue}>{item.marks}</Text>
                      </View>
                      <View style={styles.patternCardRow}>
                        <Text style={styles.patternCardKey}>Duration:</Text>
                        <Text style={styles.patternCardValue}>{item.duration || '-'}</Text>
                      </View>
                      <View style={styles.patternCardRow}>
                        <Text style={styles.patternCardKey}>Negative Marking:</Text>
                        <Text style={styles.patternCardValue}>{item.negative === 'No' ? 'No' : item.negative}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                {activeInfo.patternNote && (
                  <View style={styles.patternSubTableContainer}>
                    <View style={styles.patternTableHeader}>
                      <Text style={styles.patternTableHeaderText}>
                        {selectedExam === 'group4' ? 'Paper Pattern Details' : 'Mains and Interview Details'}
                      </Text>
                    </View>
                    {activeInfo.patternNote.split('\n').map((noteLine, idx) => {
                      const parts = noteLine.split(':');
                      const stage = parts[0] ? parts[0].trim() : '';
                      const details = parts[1] ? parts[1].trim() : '';
                      return (
                        <View key={idx} style={styles.patternSubTableRow}>
                          <Text style={styles.patternSubTableStageCell}>{stage}</Text>
                          <Text style={styles.patternSubTableDetailsCell}>{details}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* Expected Cut-offs */}
            {activeInfo && (
              <View>
                <Text style={styles.sectionTitle}>Expected Cut-offs</Text>
                <View style={styles.cutoffCard}>
                  {activeInfo.cutoffs.map((item, idx) => (
                    <View key={idx} style={styles.cutoffRow}>
                      <Text style={styles.cutoffLabel}>{item.label}</Text>
                      <Text style={styles.cutoffValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Eligibility Details - Group 1 */}
            {selectedExam === 'group1' && (
              <View>
                <Text style={styles.sectionTitle}>Eligibility Details</Text>
                <Text style={styles.infoTextSmall}>As per Notification No.05/2026 (Date: 23.06.2026)</Text>

                <View style={styles.eligibilityDetailsList}>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>1. Age</Text>
                    <Text style={styles.eligibilityDetailValue}>21 to 34 years (Others) / 39 years (SC/ST/MBC/BC) as on 01.07.2026</Text>
                  </View>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>2. Education</Text>
                    <Text style={styles.eligibilityDetailValue}>UG Degree (any discipline) on or before 23.06.2026</Text>
                  </View>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>3. Tamil</Text>
                    <Text style={styles.eligibilityDetailValue}>Tamil as a language (SSLC/HSC/Degree) OR studied in Tamil medium</Text>
                  </View>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>4. Age Concession</Text>
                    <Text style={styles.eligibilityDetailValue}>SC/ST/MBC/BC: up to 39 years | PWD: +10 years | Destitute Widow: up to 50 years</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Post-wise Vacancies</Text>
                <Text style={styles.infoTextSmall}>Total vacancies: {notificationData.group1.totalVacancies} (Notification No.05/2026)</Text>

                <View style={styles.vacancyTableContainer}>
                  <View style={styles.vacancyTableHeader}>
                    <Text style={styles.vacancyTablePostHeader}>Post</Text>
                    <Text style={styles.vacancyTableCountHeader}>Vacancies</Text>
                  </View>
                  {notificationData.group1.posts.map((post) => (
                    <View key={post.code} style={styles.vacancyTableRow}>
                      <Text style={styles.vacancyTablePostCell} numberOfLines={2}>
                        {post.name}
                      </Text>
                      <Text style={styles.vacancyTableCountCell}>
                        {post.vacancies}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.vacancyTableRow}>
                    <Text style={styles.vacancyTablePostCellBold}>TOTAL</Text>
                    <Text style={styles.vacancyTableCountCellBold}>
                      {notificationData.group1.totalVacancies}
                    </Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Reservation Details</Text>
                <View style={styles.reservationTableContainer}>
                  <View style={styles.reservationTableHeader}>
                    <Text style={styles.reservationCategoryHeader}>Category</Text>
                    <Text style={styles.reservationPercentageHeader}>%</Text>
                    <Text style={styles.reservationVacancyHeader}>Vacancies</Text>
                  </View>
                  {Object.entries(notificationData.group1.reservation).map(([key, res]) => {
                    const vacancyCount = Math.round(notificationData.group1.totalVacancies * res.percentage / 100);
                    return (
                      <View key={key} style={styles.reservationTableRow}>
                        <Text style={styles.reservationCategoryCell}>{res.label}</Text>
                        <Text style={styles.reservationPercentageCell}>{res.percentage}%</Text>
                        <Text style={styles.reservationVacancyCell}>{vacancyCount}</Text>
                      </View>
                    );
                  })}
                  <View style={styles.reservationTotalRow}>
                    <Text style={styles.reservationTotalCategory}>TOTAL</Text>
                    <Text style={styles.reservationTotalValue}>-</Text>
                    <Text style={styles.reservationTotalValue}>{notificationData.group1.totalVacancies}</Text>
                  </View>
                </View>
                
                {/* Additional Reservations - Below Table */}
                <View style={styles.additionalReservationBox}>
                  <Text style={styles.additionalReservationText}>
                    <Text style={styles.additionalReservationLabel}>Women Reservation:</Text> {notificationData.group1.womenReservation}% (Women will be considered as a separate category)
                  </Text>
                  <Text style={styles.additionalReservationText}>
                    <Text style={styles.additionalReservationLabel}>PWD Reservation:</Text> {notificationData.group1.pwdReservation}% (Persons with Benchmark Disabilities)
                  </Text>
                  <Text style={styles.additionalReservationText}>
                    <Text style={styles.additionalReservationLabel}>PSTM Preference:</Text> Persons studied in Tamil Medium (Priority over general candidates)
                  </Text>
                </View>

                <Text style={styles.sectionTitle}>Fee Details</Text>
                <View style={styles.communityVacancyContainer}>
                  <View style={styles.communityVacancyRow}>
                    <Text style={styles.communityVacancyLabel}>Application Fee</Text>
                    <Text style={styles.communityVacancyValue}>₹100 (Prelims) + ₹200 (Mains)</Text>
                  </View>
                  <View style={styles.communityVacancyRow}>
                    <Text style={styles.communityVacancyLabel}>Fee Exemption</Text>
                    <Text style={styles.communityVacancyValue}>SC/ST/PWD: Full | BC: 3 chances | Others: No exemption</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Eligibility Details - Group 2 */}
            {selectedExam === 'group2' && (
              <View>
                <Text style={styles.sectionTitle}>Eligibility Details</Text>
                <Text style={styles.infoTextSmall}>As per Notification No.04/2026 (Date: 11.08.2026)</Text>

                <View style={styles.eligibilityDetailsList}>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>1. Age</Text>
                    <Text style={styles.eligibilityDetailValue}>18 to 32 years (Others) / 37 years (SC/ST/MBC/BC) as on 01.07.2026</Text>
                  </View>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>2. Education</Text>
                    <Text style={styles.eligibilityDetailValue}>UG Degree (any discipline) on or before 11.08.2026</Text>
                  </View>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>3. Tamil</Text>
                    <Text style={styles.eligibilityDetailValue}>Tamil as a language (SSLC/HSC/Degree) OR studied in Tamil medium</Text>
                  </View>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>4. Age Concession</Text>
                    <Text style={styles.eligibilityDetailValue}>SC/ST/MBC/BC: up to 37 years | PWD: +10 years | Destitute Widow: up to 45 years</Text>
                  </View>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>5. Note</Text>
                    <Text style={styles.eligibilityDetailValue}>Group 2A (Non-interview posts) - No interview, selection based on written marks only</Text>
                  </View>
                </View>

                <View style={styles.textSeparator} />

                <Text style={styles.sectionTitle}>Fee Details</Text>
                <View style={styles.communityVacancyContainer}>
                  <View style={styles.communityVacancyRow}>
                    <Text style={styles.communityVacancyLabel}>Application Fee</Text>
                    <Text style={styles.communityVacancyValue}>₹100 (Prelims) + ₹150 (Mains)</Text>
                  </View>
                  <View style={styles.communityVacancyRow}>
                    <Text style={styles.communityVacancyLabel}>Fee Exemption</Text>
                    <Text style={styles.communityVacancyValue}>SC/ST/PWD: Full | BC: 3 chances | Others: No exemption</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Eligibility Details - Group 4 */}
            {selectedExam === 'group4' && (
              <View>
                <Text style={styles.sectionTitle}>Eligibility Details</Text>
                <Text style={styles.infoTextSmall}>As per Notification No.06/2026 (Date: 06.10.2026)</Text>

                <View style={styles.eligibilityDetailsList}>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>1. Age</Text>
                    <Text style={styles.eligibilityDetailValue}>18 to 30 years (Others) / 35 years (SC/ST/MBC/BC) as on 01.07.2026</Text>
                  </View>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>2. Education</Text>
                    <Text style={styles.eligibilityDetailValue}>SSLC / HSC / Diploma / Degree (as per post requirement)</Text>
                  </View>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>3. Tamil</Text>
                    <Text style={styles.eligibilityDetailValue}>Must have studied Tamil in SSLC or HSC (mandatory for all posts)</Text>
                  </View>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>4. Age Concession</Text>
                    <Text style={styles.eligibilityDetailValue}>SC/ST/MBC/BC: up to 35 years | PWD: +10 years | Destitute Widow: up to 40 years</Text>
                  </View>
                  <View style={styles.eligibilityDetailItem}>
                    <Text style={styles.eligibilityDetailLabel}>5. Important Note</Text>
                    <Text style={styles.eligibilityDetailValue}>Minimum 40% marks (60 marks) in Tamil paper is mandatory for selection</Text>
                  </View>
                </View>

                <View style={styles.textSeparator} />

                <Text style={styles.sectionTitle}>Fee Details</Text>
                <View style={styles.communityVacancyContainer}>
                  <View style={styles.communityVacancyRow}>
                    <Text style={styles.communityVacancyLabel}>Application Fee</Text>
                    <Text style={styles.communityVacancyValue}>₹100 (Single Exam)</Text>
                  </View>
                  <View style={styles.communityVacancyRow}>
                    <Text style={styles.communityVacancyLabel}>Fee Exemption</Text>
                    <Text style={styles.communityVacancyValue}>SC/ST/PWD: Full | BC/MBC: No exemption | Others: No exemption</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={{ height: 120 }} />
          </ScrollView>
        </View>
      ) : page === 'testSeries' ? (
        <View style={styles.page}>
          <View style={styles.topBar}>
            <Pressable onPress={() => setPage('home')} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <View style={styles.topBarSpacer} />
          </View>
          <ScrollView style={styles.resourceContent} showsVerticalScrollIndicator={false}>
             {(prepLevel === 'pro' || currentScore >= targetMarks) ? (
               <View style={styles.testCard}>
                  <Text style={styles.testTitle}>Full Mock Test #1</Text>
                  <Text style={styles.testMeta}>200 Qs • 3 Hours</Text>
                  <Pressable style={styles.startTestButton}><Text style={styles.startTestButtonText}>Start</Text></Pressable>
               </View>
             ) : (
               <View style={styles.lockedTestCard}>
                 <Text style={styles.lockIcon}>🔒</Text>
                 <Text style={styles.lockedTitle}>Mock Test Locked</Text>
                 <Text style={styles.lockedText}>Achieve your Siege Target of {targetMarks} Marks to unlock full-length mock tests.</Text>
               </View>
             )}
             <View style={styles.comingSoonBox}><Text style={styles.comingSoonText}>Topic-wise practice tests coming soon!</Text></View>
             <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      ) : (
        <View style={styles.page}>
          <View style={styles.topBar}>
            <Pressable onPress={() => setPage('home')} style={styles.backButton}><Text style={styles.backButtonText}>Back</Text></Pressable>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Guest Mode</Text>
            <Text style={styles.infoText}>You are currently using DayZero in Guest Mode. All your progress is stored locally on this device.</Text>
            <Text style={styles.infoText}>Please note: If you clear the app data or uninstall the app, your progress will be lost.</Text>
            <View style={styles.textSeparator} />
            <Text style={styles.infoText}>Cloud sync and sign-in options are planned for the next major release.</Text>
            <Pressable onPress={clearAllData} style={styles.clearButton}><Text style={styles.clearButtonText}>Reset All Progress</Text></Pressable>
          </View>
        </View>
      )}

      {/* CALENDAR DATE PICKER MODAL */}
      <Modal visible={showDatePicker} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            <Text style={styles.infoTextSmall}>Age must be 21-34 (others) / 39 (SC/ST/MBC/BC) as on 01.07.2026</Text>

            {/* Calendar-style date input */}
            <View style={styles.calendarPickerContainer}>
              <View style={styles.calendarInputRow}>
                <TextInput
                  style={[styles.calendarInput, { flex: 1, marginRight: 8 }]}
                  value={String(datePickerDay)}
                  onChangeText={(t) => setDatePickerDay(t ? parseInt(t) : 1)}
                  placeholder="DD"
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.calendarSeparator}>/</Text>
                <TextInput
                  style={[styles.calendarInput, { flex: 1, marginHorizontal: 8 }]}
                  value={String(datePickerMonth)}
                  onChangeText={(t) => setDatePickerMonth(t ? parseInt(t) : 1)}
                  placeholder="MM"
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.calendarSeparator}>/</Text>
                <TextInput
                  style={[styles.calendarInput, { flex: 1, marginLeft: 8 }]}
                  value={String(datePickerYear)}
                  onChangeText={(t) => setDatePickerYear(t ? parseInt(t) : 2000)}
                  placeholder="YYYY"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>

              {/* Calendar grid for day selection */}
              <View style={styles.calendarGridContainer}>
                <Text style={styles.calendarGridTitle}>
                  {(() => {
                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    return `${monthNames[datePickerMonth - 1]} ${datePickerYear}`;
                  })()}
                </Text>

                <View style={styles.calendarWeekHeader}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <Text key={d} style={styles.calendarWeekDay}>{d}</Text>
                  ))}
                </View>

                <View style={styles.calendarDaysGrid}>
                  {(() => {
                    const year = datePickerYear;
                    const month = datePickerMonth;
                    const daysInMonth = getDaysInMonth(year, month);
                    const firstDay = new Date(year, month - 1, 1).getDay();

                    const cells = [];
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<View key={`empty-${i}`} style={styles.calendarDayCell} />);
                    }
                    for (let d = 1; d <= daysInMonth; d++) {
                      const isToday = d === datePickerDay && month === today.getMonth() + 1 && year === today.getFullYear();
                      const isSelected = d === datePickerDay;
                      cells.push(
                        <Pressable
                          key={d}
                          onPress={() => setDatePickerDay(d)}
                          style={[
                            styles.calendarDayCell,
                            isToday && styles.calendarDayToday,
                            isSelected && styles.calendarDaySelected
                          ]}
                        >
                          <Text style={[
                            styles.calendarDayText,
                            isToday && styles.calendarDayTextToday,
                            isSelected && styles.calendarDayTextSelected
                          ]}>
                            {d}
                          </Text>
                        </Pressable>
                      );
                    }
                    return cells;
                  })()}
                </View>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => {
                  const dd = String(datePickerDay).padStart(2, '0');
                  const mm = String(datePickerMonth).padStart(2, '0');
                  const yy = String(datePickerYear);
                  setEligibilityForm({...eligibilityForm, dob: `${dd}.${mm}.${yy}`});
                  setEligibilityResult(null);
                  setShowVacancyCalc(false);
                  setShowDatePicker(false);
                }}
                style={styles.checkEligibilityBtn}
              >
                <Text style={styles.checkEligibilityBtnText}>Set Date</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowDatePicker(false)}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* THE PRO SWITCH MODAL */}
      <Modal visible={showSwitchModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable onPress={() => setShowSwitchModal(false)} style={styles.modalBackButton}>
               <Text style={styles.modalBackButtonText}>← Back to Home</Text>
            </Pressable>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Focus is Key</Text>
            </View>
            <View style={styles.wisdomCard}>
              <Text style={styles.wisdomText}>
                If we chase multiple horses, we may not catch even one. Focus on one exam to get better results.
              </Text>
            </View>

            <Text style={styles.switchTitle}>Switch Target Exam:</Text>
            {['group1', 'group2', 'group4'].map(ex => (
              <Pressable
                key={ex}
                onPress={() => { setSelectedExam(ex); setShowSwitchModal(false); }}
                style={[styles.examOptionModal, selectedExam === ex && styles.examOptionSelected]}
              >
                <Text style={styles.examOptionLabelSmall}>{examConfig[ex].name}</Text>
                {selectedExam === ex && <View style={styles.examOptionSelectedOverlay} />}
              </Pressable>
            ))}

            <Pressable onPress={() => setShowSwitchModal(false)} style={styles.modalButtonPrimary}>
              <Text style={styles.modalButtonPrimaryText}>Keep Current Focus</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

        {selectedExam !== null && prepLevel !== null && (prepLevel !== 'intermediate' || isIntermediateSetupDone) && page !== 'guest' && page !== 'strategy' && (
  <View style={styles.navBar}>
    <Pressable onPress={() => setPage('home')} style={({pressed}) => [styles.navItem, page === 'home' && styles.navItemActive, pressed && styles.buttonPressed]}>
      <Text style={[styles.navText, page === 'home' ? styles.navTextActive : styles.navTextInactive]}>Home</Text>
    </Pressable>
    <Pressable onPress={() => setPage('resources')} style={({pressed}) => [styles.navItem, page === 'resources' && styles.navItemActive, pressed && styles.buttonPressed]}>
      <Text style={[styles.navText, page === 'resources' ? styles.navTextActive : styles.navTextInactive]}>Exam Info</Text>
    </Pressable>
    <Pressable onPress={() => setPage('testSeries')} style={({pressed}) => [styles.navItem, page === 'testSeries' && styles.navItemActive, pressed && styles.buttonPressed]}>
      <Text style={[styles.navText, page === 'testSeries' ? styles.navTextActive : styles.navTextInactive]}>Tests</Text>
    </Pressable>
  </View>
)}


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a3a12' },
  page: { flex: 1, paddingHorizontal: 22, paddingTop: 16, backgroundColor: '#1a3a12' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a3a12' },
  loadingText: { color: '#f4d72d', fontSize: 18, fontWeight: '800' },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, zIndex: 10 },
  topBarSpacer: { width: 40 },
  heroWrap: {
    backgroundColor: '#f4d72d',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#d4af37',
    zIndex: 2,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  title: { color: '#1a3a12', fontSize: 52, fontWeight: '900', letterSpacing: -1 },
  logoImage: { width: 180, height: 180, marginBottom: 0 },
  statusBoard: { marginTop: 20, width: '100%', alignItems: 'center' },
  examBadgeLarge: { backgroundColor: 'rgba(26, 58, 18, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#d4af37' },
  examBadgeTextLarge: { color: '#1a3a12', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  countdownContainer: { alignItems: 'center' },
  countdownValue: { color: '#1a3a12', fontSize: 72, fontWeight: '900', lineHeight: 72 },
  countdownLabel: { color: '#8b7355', fontSize: 12, fontWeight: '800', letterSpacing: 4, marginTop: -4 },
  homeProgressBox: { width: '100%', marginTop: 20, backgroundColor: '#1a3a12', borderRadius: 20, padding: 16, borderWidth: 2, borderColor: '#d4af37' },
  homeProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  homeProgressTitle: { color: '#f4d72d', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  homeProgressValue: { color: '#f4d72d', fontSize: 20, fontWeight: '900' },
  homeProgressBar: { height: 10, backgroundColor: 'rgba(244, 215, 45, 0.2)', borderRadius: 5, overflow: 'hidden' },
  homeDashboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(244, 215, 45, 0.2)',
  },
  homeDashboardItem: { alignItems: 'flex-start' },
  homeDashboardItemRight: { alignItems: 'flex-end' },
  homeDashboardLabel: { color: '#8b7355', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  homeDashboardValue: { color: '#f4d72d', fontSize: 16, fontWeight: '900' },
  homeDashboardValueTarget: { color: '#eb7828', fontSize: 16, fontWeight: '900' },
  homeProgressFill: { height: '100%', backgroundColor: '#d4af37' },
  heroFooter: { marginTop: 12 },
  eyebrow: { color: '#8b7355', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  activeExamHeader: { backgroundColor: '#f4d72d', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: '#d4af37' },
  activeExamHeaderText: { color: '#1a3a12', fontSize: 14, fontWeight: '800' },
  switchIcon: { width: 0, height: 0, borderTopWidth: 5, borderLeftWidth: 5, borderRightWidth: 5, borderTopColor: '#d4af37', borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  guestBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f4d72d', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 2, borderColor: '#d4af37' },
  guestBadgeText: { color: '#1a3a12', fontSize: 14, fontWeight: '800' },
  backButton: { backgroundColor: '#f4d72d', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 2, borderColor: '#d4af37' },
  backButtonText: { color: '#1a3a12', fontSize: 14, fontWeight: '800' },
  infoCard: { marginTop: 20, backgroundColor: '#f4d72d', borderRadius: 30, padding: 24, borderWidth: 3, borderColor: '#d4af37' },
  infoTitle: { color: '#1a3a12', fontSize: 30, fontWeight: '800', marginBottom: 16 },
  infoText: { color: '#1a3a12', fontSize: 16, lineHeight: 24, marginBottom: 12 },
  onboardingContainer: { flex: 1, justifyContent: 'center' },
  onboardingEyebrow: { color: '#d4af37', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 },
  onboardingTitle: { color: '#f4d72d', fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  onboardingText: { color: '#f4d72d', fontSize: 16, textAlign: 'center', marginBottom: 30 },
  examOption: {
    backgroundColor: '#f4d72d',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#d4af37',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  examOptionSelected: {
    borderColor: '#fff',
    backgroundColor: '#ffe54e',
  },
  examOptionLabel: {
    color: '#1a3a12',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  levelOption: {
    backgroundColor: '#f4d72d',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#d4af37',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  levelOptionTitle: {
    color: '#1a3a12',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  levelOptionDesc: {
    color: '#2f5e1f',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  modalButtonSecondary: {
    backgroundColor: '#f4d72d',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#d4af37',
  },
  modalButtonSecondaryText: {
    color: '#1a3a12',
    fontSize: 14,
    fontWeight: '800',
  },
  quoteWrapper: {
    marginTop: 28,
    backgroundColor: 'rgba(235, 120, 40, 0.1)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(235, 120, 40, 0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  quoteText: {
    color: '#eb7828',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
  },
  onboardingTitleSmall: { color: '#f4d72d', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  onboardingTextSmall: { color: '#f4d72d', fontSize: 14, marginBottom: 20 },
  strategyUnit: { backgroundColor: 'rgba(26, 58, 18, 0.7)', borderRadius: 20, padding: 22, marginBottom: 16, borderWidth: 2, borderColor: '#d4af37' },
  strategyUnitTitle: { color: '#f4d72d', fontSize: 18, fontWeight: '700' },
  strategyUnitMarks: { color: '#d4af37', fontSize: 14, fontWeight: '800', marginTop: 4 },
  subTabContainer: { flexDirection: 'row', backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 12, padding: 4, marginBottom: 10 },
  subTab: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  activeSubTab: { backgroundColor: '#d4af37' },
  subTabText: { color: '#f4d72d', fontSize: 13, fontWeight: '700' },
  activeSubTabText: { color: '#1a3a12' },
  resourcesHeader: { marginTop: 10, alignItems: 'center' },
  resourcesTitle: { color: '#f4d72d', fontSize: 28, fontWeight: '800' },
  tabContainer: { flexDirection: 'row', gap: 10, marginTop: 16 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  activeTab: { backgroundColor: '#59a13f' },
  tabText: { color: '#6e9e5a', fontSize: 13, fontWeight: '700' },
  activeTabText: { color: '#fff' },
  resourceContent: { flex: 1, marginTop: 20 },
  sectionTitle: { color: '#f4d72d', fontSize: 18, fontWeight: '800', marginTop: 22, marginBottom: 12 },
  collapsibleCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  collapsibleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  collapsibleTitle: { color: '#333', fontSize: 15, fontWeight: '700' },
  collapsibleMarks: { color: '#59a13f', fontSize: 11, fontWeight: '800' },
  arrow: { width: 8, height: 8, borderRightWidth: 2, borderBottomWidth: 2, borderColor: '#59a13f', transform: [{ rotate: '45deg' }] },
  arrowExpanded: { transform: [{ rotate: '-135deg' }] },
  collapsibleBody: { padding: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  topicItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  topicCheckbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#59a13f', marginRight: 10 },
  topicCheckboxChecked: { backgroundColor: '#59a13f' },
  topicText: { color: '#444', fontSize: 14 },
  topicTextCompleted: { textDecorationLine: 'line-through', color: '#aaa' },
  cutoffCard: { backgroundColor: '#fef9e7', borderRadius: 16, padding: 16, borderWidth: 2, borderColor: '#e8cc5a' },
  cutoffRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  cutoffLabel: { color: '#666', fontSize: 14 },
  cutoffValue: { color: '#1a3a12', fontSize: 14, fontWeight: '800' },
  aboutTextBold: { color: '#1a3a12', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  aboutText: { color: '#444', fontSize: 15, fontWeight: '600', lineHeight: 24 },
  infoTextSmall: { color: '#f4d72d', fontSize: 14, fontWeight: '600', lineHeight: 22, marginBottom: 10 },
  textBold: { fontWeight: '700' },
  testCard: { backgroundColor: '#f4d72d', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 3, borderColor: '#d4af37' },
  testTitle: { color: '#2f5e1f', fontSize: 18, fontWeight: '800' },
  testMeta: { color: '#6e9e5a', fontSize: 14, marginBottom: 16 },
  startTestButton: { backgroundColor: '#59a13f', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  startTestButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  comingSoonBox: { padding: 30, alignItems: 'center' },
  comingSoonText: { color: '#999', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(26, 58, 18, 0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 32, padding: 28, borderWidth: 2, borderColor: 'rgba(89, 161, 63, 0.2)' },
  modalHeader: { alignItems: 'center', marginBottom: 12 },
  modalTitle: { color: '#1a3a12', fontSize: 24, fontWeight: '900', marginBottom: 8 },
  wisdomCard: { backgroundColor: 'rgba(235, 120, 40, 0.05)', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(235, 120, 40, 0.15)', borderStyle: 'dashed' },
  wisdomText: { color: '#eb7828', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 22 },
  switchTitle: { color: '#6e9e5a', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  examOptionModal: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  examOptionLabelSmall: { color: '#2f5e1f', fontSize: 16, fontWeight: '800' },
  examOptionSelectedOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(89, 161, 63, 0.08)', borderRadius: 16 },
  modalButtonPrimary: { backgroundColor: '#59a13f', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  aboutManifestoCard: { backgroundColor: '#fef9e7', borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 2, borderColor: '#e8cc5a' },
  modalBackButton: { marginBottom: 16 },
  modalBackButtonText: { color: '#59a13f', fontSize: 14, fontWeight: '700' },
  textSeparator: { height: 1, backgroundColor: 'rgba(66, 104, 52, 0.15)', marginVertical: 12 },
  plannerCard: { backgroundColor: '#fef9e7', borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 2, borderColor: '#e8cc5a' },
  plannerBadge: { backgroundColor: 'rgba(235, 120, 40, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  plannerBadgeText: { color: '#eb7828', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  plannerName: { color: '#1a3a12', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  plannerDates: { flexDirection: 'row', justifyContent: 'space-between' },
  dateBlock: { flex: 1 },
  dateLabel: { color: '#8b7355', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  dateValue: { color: '#2f5e1f', fontSize: 16, fontWeight: '900' },
  strategyContainer: { flex: 1 },
  strategyHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  infoEyebrow: { color: '#d4af37', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  strategyTitle: { color: '#f4d72d', fontSize: 28, fontWeight: '900', marginTop: 2 },
  strategyToggleBtn: { backgroundColor: '#f4d72d', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 2, borderColor: '#d4af37' },
  strategyToggleBtnText: { color: '#1a3a12', fontSize: 13, fontWeight: '800' },
  attackPlanContainer: { flex: 1 },
  attackStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, backgroundColor: '#fef9e7', padding: 16, borderRadius: 20, borderWidth: 2, borderColor: '#e8cc5a' },
  attackStatItem: { alignItems: 'center', flex: 1 },
  attackStatLabel: { color: '#5a4a1a', fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  attackStatValue: { color: '#1a3a12', fontSize: 22, fontWeight: '900' },
  attackAdviceBox: { backgroundColor: '#fef9e7', padding: 18, borderRadius: 20, marginBottom: 16, borderWidth: 2, borderColor: '#e8cc5a' },
  attackAdviceTitle: { color: '#1a3a12', fontSize: 16, fontWeight: '900', marginBottom: 6 },
  attackAdviceText: { color: '#4a4a2a', fontSize: 14, lineHeight: 22, fontWeight: '600' },
  attackUnitItem: { backgroundColor: '#fef9e7', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 2, borderColor: '#e8cc5a' },
  attackUnitTitle: { color: '#1a3a12', fontSize: 16, fontWeight: '800', lineHeight: 22 },
  attackUnitWeight: { color: '#2f5e1f', fontSize: 14, fontWeight: '800', marginTop: 4 },
  attackActionRow: { marginTop: 6 },
  attackActionHint: { color: '#eb7828', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  strategySubtext: { color: '#f4d72d', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  strategyUnit: { backgroundColor: '#fef9e7', borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 2, borderColor: '#e8cc5a' },
  strategyUnitTitle: { color: '#1a3a12', fontSize: 16, fontWeight: '800', lineHeight: 22 },
  strategyUnitMarks: { color: '#2f5e1f', fontSize: 14, fontWeight: '800', marginTop: 4 },
  targetMarksBoxFixed: { backgroundColor: '#fef9e7', borderRadius: 20, padding: 18, alignItems: 'center', marginTop: 12, borderWidth: 2, borderColor: '#e8cc5a' },
  targetMarksTitleLarge: { color: '#1a3a12', fontSize: 18, fontWeight: '900' },
  targetMarksRed: { color: '#eb7828', fontWeight: '900' },
  targetMarksSub: { color: '#2f5e1f', fontSize: 13, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  phase2Note: { color: '#f4d72d', fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 14, fontStyle: 'italic' },
  setupFooterFixed: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 22, backgroundColor: '#f4d72d', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  setupBtn: { backgroundColor: '#59a13f', paddingVertical: 18, borderRadius: 24, alignItems: 'center' },
  setupBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  lockIcon: { fontSize: 40, marginBottom: 12 },
  lockedTestCard: { backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 24, padding: 40, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)' },
  lockedTitle: { color: '#1a3a12', fontSize: 18, fontWeight: '900', marginBottom: 8 },
  lockedText: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  mainActionPanel: { backgroundColor: '#59a13f', padding: 24, borderRadius: 28, marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  mainActionLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  mainActionTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  homeStrategyLink: {
    marginTop: 14,
    backgroundColor: 'rgba(26, 58, 18, 0.55)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 215, 45, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeStrategyLinkLabel: {
    color: 'rgba(244, 215, 45, 0.7)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  homeStrategyLinkTitle: {
    color: '#f4d72d',
    fontSize: 15,
    fontWeight: '800',
  },
  navBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: '#1a3a12',
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(244, 215, 45, 0.15)',
    justifyContent: 'space-around',
    zIndex: 100,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
  },
  navItem: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  navItemActive: { backgroundColor: 'rgba(244, 215, 45, 0.12)' },
  navText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  navTextActive: { color: '#f4d72d', fontWeight: '900' },
  navTextInactive: { color: 'rgba(244, 215, 45, 0.45)' },
  buttonPressed: { opacity: 0.6 },
  clearButton: { marginTop: 20, backgroundColor: 'rgba(235, 70, 70, 0.1)', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  clearButtonText: { color: '#a32a2a', fontSize: 14, fontWeight: '800' },

  // ELIGIBILITY & VACANCY STYLES
  eligibilitySection: { marginTop: 24, backgroundColor: 'rgba(244, 215, 45, 0.12)', borderRadius: 24, padding: 20, borderWidth: 2, borderColor: '#d4af37' },
  eligibilityForm: { marginTop: 12 },
  formLabel: { color: '#2f5e1f', fontSize: 13, fontWeight: '800', marginBottom: 8, marginTop: 12 },
  formHint: { color: '#6e9e5a', fontSize: 11, marginBottom: 8, lineHeight: 16 },
  formNote: { color: '#999', fontSize: 11, fontStyle: 'italic', marginTop: 6, lineHeight: 16 },
  formInput: { backgroundColor: 'rgba(89, 161, 63, 0.05)', borderRadius: 12, padding: 14, fontSize: 15, color: '#333', borderWidth: 1, borderColor: 'rgba(89, 161, 63, 0.15)' },
  dobPickerBtn: { backgroundColor: 'rgba(89, 161, 63, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(89, 161, 63, 0.15)', alignItems: 'center' },
  dobPickerBtnText: { color: '#2f5e1f', fontSize: 15, fontWeight: '700' },
  vacancyMatrix: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#eee', marginBottom: 12 },
  postCardRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  postNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  postNameText: {
    color: '#2f5e1f',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  postCodeText: {
    color: '#999',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 8,
  },
  postVacancyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(89, 161, 63, 0.05)',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  postVacancyLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  postVacancyValue: {
    color: '#1a3a12',
    fontSize: 18,
    fontWeight: '900',
  },
  communityFilterBtn: {
    backgroundColor: 'rgba(89, 161, 63, 0.05)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(89, 161, 63, 0.15)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  communityFilterBtnText: {
    color: '#2f5e1f',
    fontSize: 14,
    fontWeight: '700',
  },
  communityFilterBtnArrow: {
    color: '#59a13f',
    fontSize: 12,
    fontWeight: '800',
  },
  communityFilterDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
    overflow: 'hidden',
  },
  communityFilterOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  communityFilterOptionSelected: {
    backgroundColor: 'rgba(89, 161, 63, 0.08)',
  },
  communityFilterOptionText: {
    color: '#444',
    fontSize: 13,
    fontWeight: '600',
  },
  communityFilterOptionTextSelected: {
    color: '#2f5e1f',
    fontWeight: '800',
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 14, flexWrap: 'wrap' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#59a13f', marginRight: 12 },
  checkboxChecked: { backgroundColor: '#59a13f' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  checkboxLabel: { color: '#444', fontSize: 14, fontWeight: '600', marginLeft: 10, flex: 1, flexWrap: 'wrap', lineHeight: 20 },
  checkEligibilityBtn: { backgroundColor: '#59a13f', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  checkEligibilityBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  eligibilityResult: { marginTop: 16, padding: 16, borderRadius: 16 },
  eligibleCard: { backgroundColor: 'rgba(89, 161, 63, 0.1)' },
  notEligibleCard: { backgroundColor: 'rgba(235, 70, 70, 0.08)' },
  eligibilityResultTitle: { color: '#1a3a12', fontSize: 18, fontWeight: '900', marginBottom: 8 },
  eligibilityDetail: { color: '#444', fontSize: 14, marginBottom: 4 },
  eligibilityReason: { color: '#666', fontSize: 13, marginBottom: 2, lineHeight: 18 },
  vacancySection: { marginTop: 20 },
  vacancyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  vacancyLabel: { color: '#666', fontSize: 14, fontWeight: '600' },
  vacancyValue: { color: '#1a3a12', fontSize: 16, fontWeight: '900' },
  ageWarning: { color: '#eb7828', fontSize: 12, fontWeight: '700', marginTop: 6 },
  ageOk: { color: '#59a13f', fontSize: 12, fontWeight: '700', marginTop: 6 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  resetBtn: { flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  resetBtnText: { color: '#666', fontSize: 16, fontWeight: '800' },

  // CALENDAR DATE PICKER STYLES
  calendarPickerContainer: { marginTop: 12 },
  calendarInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarInput: {
    backgroundColor: 'rgba(89, 161, 63, 0.05)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: 'rgba(89, 161, 63, 0.15)',
    textAlign: 'center',
  },
  calendarSeparator: {
    color: '#666',
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 2,
  },
  calendarGridContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  calendarGridTitle: {
    color: '#2f5e1f',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  calendarWeekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarWeekDay: {
    color: '#6e9e5a',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    flex: 1,
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCell: {
    width: `${100/7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  calendarDayText: {
    color: '#444',
    fontSize: 13,
    fontWeight: '500',
  },
  calendarDayToday: {
    backgroundColor: 'rgba(235, 120, 40, 0.15)',
    borderRadius: 20,
  },
  calendarDayTextToday: {
    color: '#eb7828',
    fontWeight: '800',
  },
  calendarDaySelected: {
    backgroundColor: '#59a13f',
    borderRadius: 20,
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: '800',
  },

  // ELIGIBILITY DETAILS (STATIC)
  eligibilityDetailsList: {
    backgroundColor: '#fef9e7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e8cc5a',
  },
  eligibilityDetailItem: {
    marginBottom: 12,
  },
  eligibilityDetailLabel: {
    color: '#2f5e1f',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  eligibilityDetailValue: {
    color: '#444',
    fontSize: 14,
    lineHeight: 20,
  },

  // VACANCY TABLE (2 COLUMNS)
  vacancyTableContainer: {
    backgroundColor: '#fef9e7',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e8cc5a',
  },
  vacancyTableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 58, 18, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  vacancyTablePostHeader: {
    flex: 3,
    color: '#1a3a12',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  vacancyTableCountHeader: {
    flex: 1,
    color: '#1a3a12',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  vacancyTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  vacancyTablePostCell: {
    flex: 3,
    color: '#444',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  vacancyTableCountCell: {
    flex: 1,
    color: '#666',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  vacancyTablePostCellBold: {
    flex: 3,
    color: '#1a3a12',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'left',
  },
  vacancyTableCountCellBold: {
    flex: 1,
    color: '#1a3a12',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },

  // RESERVATION TABLE (3 COLUMNS)
  reservationTableContainer: {
    backgroundColor: '#fef9e7',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e8cc5a',
  },
  reservationTableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 58, 18, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  reservationCategoryHeader: {
    flex: 3,
    color: '#1a3a12',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  reservationPercentageHeader: {
    flex: 1,
    color: '#1a3a12',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  reservationVacancyHeader: {
    flex: 1,
    color: '#1a3a12',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  reservationTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reservationCategoryCell: {
    flex: 3,
    color: '#444',
    fontSize: 13,
    fontWeight: '600',
  },
  reservationPercentageCell: {
    flex: 1,
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  reservationVacancyCell: {
    flex: 1,
    color: '#1a3a12',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  reservationTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(89, 161, 63, 0.05)',
  },
  reservationTotalCategory: {
    flex: 3,
    color: '#1a3a12',
    fontSize: 13,
    fontWeight: '800',
  },
  reservationTotalValue: {
    flex: 1,
    color: '#1a3a12',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },

  // ADDITIONAL RESERVATION BOX
  additionalReservationBox: {
    backgroundColor: '#fef9e7',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 2,
    borderColor: '#e8cc5a',
  },
  additionalReservationText: {
    color: '#333',
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 8,
  },
  additionalReservationLabel: {
    color: '#1a3a12',
    fontSize: 13,
    fontWeight: '800',
  },

  // EXAM PATTERN CARD (VERTICAL)
  patternCardContainer: {
    backgroundColor: '#fef9e7',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e8cc5a',
    marginBottom: 14,
  },
  // Unified table section header used across all tables
  patternTableHeader: {
    backgroundColor: 'rgba(26, 58, 18, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e8cc5a',
  },
  patternTableHeaderText: {
    color: '#1a3a12',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  patternCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  patternCardLabel: {
    color: '#1a3a12',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  patternCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  patternCardKey: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  patternCardValue: {
    color: '#1a3a12',
    fontSize: 13,
    fontWeight: '800',
  },

  // PATTERN SUB TABLE
  patternSubTableContainer: {
    backgroundColor: '#fef9e7',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e8cc5a',
    marginTop: 14,
  },
  patternSubTableHeader: {
    backgroundColor: 'rgba(26, 58, 18, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37',
  },
  patternSubTitleText: {
    color: '#1a3a12',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  patternSubTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  patternSubTableStageCell: {
    color: '#1a3a12',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  patternSubTableDetailsCell: {
    color: '#2f5e1f',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1.5,
  },

  // COMMUNITY VACANCY ROWS
  communityVacancyContainer: {
    backgroundColor: '#fef9e7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e8cc5a',
  },
  communityVacancyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  communityVacancyRowLast: {
    borderBottomWidth: 0,
  },
  communityVacancyLabel: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  communityVacancyValue: {
    color: '#1a3a12',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
    flex: 1,
  },

  // PROGRESS PAGE STYLES
  progressHeader: {
    backgroundColor: '#fef9e7',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e8cc5a',
  },
  progressPageTitle: {
    color: '#1a3a12',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  progressPageSub: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  progressStatText: {
    color: '#1a3a12',
    fontSize: 16,
    fontWeight: '800',
  },
  progressStatPercent: {
    color: '#d4af37',
    fontSize: 24,
    fontWeight: '900',
  },
});