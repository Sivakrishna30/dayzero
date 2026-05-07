import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, SafeAreaView, StyleSheet, Text, View, ScrollView, Modal } from 'react-native';
import { syllabusData } from './syllabus';

export default function App() {
  const [page, setPage] = useState('home');
  const [resourceTab, setResourceTab] = useState('planner');
  const [selectedExam, setSelectedExam] = useState(null); 
  const [selectedLanguage, setSelectedLanguage] = useState('tamil');
  const [prepLevel, setPrepLevel] = useState(null); 
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [subTab, setSubTab] = useState('prelims'); 
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isIntermediateSetupDone, setIsIntermediateSetupDone] = useState(false);

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
        { label: 'Prelims (Qualifying)', value: '300 Marks' },
        { label: 'Mains (Written)', value: '750 Marks' },
        { label: 'Interview', value: '100 Marks' },
      ],
      cutoffs: [
        { label: 'General (GT)', value: '204–211 Marks' },
        { label: 'BC / MBC', value: '186–204 Marks' },
        { label: 'SC / ST', value: '160–199 Marks' },
        { label: 'Mains Safe Score', value: '450+ Marks' },
      ],
      successFactors: [
        { label: 'Total Vacancies', value: 'Higher vacancies lower the cut-off.' },
        { label: 'Difficulty Level', value: 'A tougher paper reduces the expected score.' },
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
        { label: 'Prelims (Common)', value: '300 Marks' },
        { label: 'Mains (Descriptive)', value: '300 Marks' },
        { label: 'Interview (Grp 2)', value: '40 Marks' },
      ],
      cutoffs: [
        { label: 'UR / General', value: '158–168 Marks' },
        { label: 'BC / MBC', value: '150–162 Marks' },
        { label: 'SC / ST', value: '135–155 Marks' },
        { label: 'BC (Muslim)', value: '145–152 Marks' },
      ],
      successFactors: [
        { label: 'Paper Toughness', value: 'Directly impacts safe score targets' },
        { label: 'Interview Gap', value: 'Selection depends on Mains + Oral Test' },
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
        { label: 'Single Paper', value: '300 Marks' },
        { label: 'Part A (Tamil)', value: '150 Marks' },
        { label: 'Part B (GS+Apti)', value: '150 Marks' },
      ],
      cutoffs: [
        { label: 'General (OC)', value: '165–175 Qs' },
        { label: 'BC / MBC', value: '160–170 Qs' },
        { label: 'SC / ST', value: '145–160 Qs' },
        { label: 'Min. Qualify', value: '90 Marks' },
      ],
      successFactors: [
        { label: 'High Competition', value: 'VAO/JA posts require maximum accuracy' },
        { label: 'Tamil Rule', value: 'You must score at least 40% (60 Marks) in Part A (Tamil) for Part B to be evaluated.' },
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
    let units = Array.isArray(data) ? data : (data[subTab] || []);
    
    // Group 2 Prelims language filtering
    if (selectedExam === 'group2' && subTab === 'prelims') {
      return units.filter(unit => {
        if (unit.part === 'Part C') {
          return unit.lang === selectedLanguage;
        }
        return true;
      });
    }
    
    return units;
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

  const totalTopics = selectedExam && syllabusData[selectedExam]
    ? (Array.isArray(syllabusData[selectedExam]) 
        ? syllabusData[selectedExam].reduce((acc, unit) => acc + unit.topics.length, 0)
        : (syllabusData[selectedExam].prelims.reduce((acc, unit) => acc + unit.topics.length, 0) + 
           syllabusData[selectedExam].mains.reduce((acc, unit) => acc + unit.topics.length, 0)))
    : 0;

  const currentProgress = totalTopics > 0 
    ? Math.round((completedTopics.length / totalTopics) * 100) 
    : 0;

  const [strategyView, setStrategyView] = useState('ordered'); // 'ordered' or 'attack'

  const getTargetMarks = () => {
    if (selectedExam === 'group1') return subTab === 'prelims' ? 220 : 550;
    if (selectedExam === 'group2') return subTab === 'prelims' ? 175 : 190;
    if (selectedExam === 'group4') return 185;
    return 0;
  };

  const calculateCurrentScore = () => {
    const syllabus = getActiveSyllabus();
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Watermarks removed as requested */}

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
              style={[styles.examOption, selectedExam === 'group1' && styles.examOptionSelected]}
            >
              <Text style={styles.examOptionLabel}>TNPSC Group 1</Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedExam('group2')}
              style={[styles.examOption, selectedExam === 'group2' && styles.examOptionSelected]}
            >
              <Text style={styles.examOptionLabel}>TNPSC Group 2 / 2A</Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedExam('group4')}
              style={[styles.examOption, selectedExam === 'group4' && styles.examOptionSelected]}
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
            
            <Pressable onPress={() => setSelectedExam(null)} style={styles.modalButtonSecondary}>
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
            {(Array.isArray(syllabusData[selectedExam]) 
                ? syllabusData[selectedExam] 
                : [...(syllabusData[selectedExam]?.prelims || []), ...(syllabusData[selectedExam]?.mains || [])]
             ).map((unit) => {
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
            <View style={styles.titleRow}>
              <Text style={styles.title}>DayZero</Text>
              <View style={styles.mvpBadge}>
                <Text style={styles.mvpText}>MVP</Text>
              </View>
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

            <View style={styles.heroFooter}>
              <Text style={styles.eyebrow}>Phase 1: The Siege</Text>
            </View>

            <Pressable onPress={() => setPage('progress')} style={styles.homeProgressBox}>
              <View style={styles.homeProgressHeader}>
                <Text style={styles.homeProgressTitle}>Syllabus Progress</Text>
                <Text style={styles.homeProgressValue}>{currentProgress}%</Text>
              </View>
              <View style={styles.homeProgressBar}>
                <View style={[styles.homeProgressFill, { width: `${currentProgress}%` }]} />
              </View>
              <Text style={styles.progressHint}>Next up: {getTodayTopic()}</Text>
            </Pressable>
          </View>

          {prepLevel === 'pro' ? (
            <Pressable onPress={() => setPage('testSeries')} style={styles.mainActionPanel}>
              <Text style={styles.mainActionLabel}>EXAM SERIES</Text>
              <Text style={styles.mainActionTitle}>Take Full-Length Mock Test</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => setPage('strategy')} style={styles.mainActionPanel}>
              <Text style={styles.mainActionLabel}>STRATEGY HUB</Text>
              <Text style={styles.mainActionTitle}>Your Precision Attack Plan</Text>
            </Pressable>
          )}



          <View style={styles.strategyHighlightBox}>
            <View style={styles.strategyHeader}>
              <Text style={styles.strategyTitle}>Today's Focus: Top 3 Units</Text>
              <Pressable onPress={() => setPage('strategy')}>
                <Text style={styles.viewAllLink}>Full Strategy →</Text>
              </Pressable>
            </View>
            
            {sortedStrategyUnits.slice(0, 3).map((unit, idx) => (
              <View key={unit.id} style={styles.strategyUnitMini}>
                <View style={styles.unitRank}>
                  <Text style={styles.unitRankText}>{idx + 1}</Text>
                </View>
                <Text style={styles.unitNameMini} numberOfLines={1}>{unit.title}</Text>
                <Text style={styles.unitMarksMini}>{unit.weightage || unit.marks}</Text>
              </View>
            ))}
          </View>


          <View style={{height: 150}} />
        </ScrollView>
      ) : page === 'strategy' ? (
        <View style={styles.page}>
          <View style={styles.topBar}>
            <Pressable onPress={() => setPage('home')} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={[styles.infoCard, {flex: 1, marginTop: 0, marginBottom: 10}]}>
            <View style={styles.strategyHeaderRow}>
              <View style={{flex: 1}}>
                <Text style={styles.infoEyebrow}>Strategy</Text>
                <Text style={styles.infoTitle}>{strategyView === 'attack' ? 'Your Attack Plan' : 'Priority Units'}</Text>
              </View>
              <Pressable 
                onPress={() => setStrategyView(strategyView === 'attack' ? 'ordered' : 'attack')}
                style={styles.strategyToggleBtn}
              >
                <Text style={styles.strategyToggleBtnText}>{strategyView === 'attack' ? 'Show List' : 'Analyze Plan'}</Text>
              </Pressable>
            </View>

            {subTab === 'mains' ? (
              <View style={styles.mainsPlaceholder}>
                <Text style={styles.mainsPlaceholderTitle}>🚧 Under Development</Text>
                <Text style={styles.mainsPlaceholderText}>Strategy is currently optimized for Prelims. Mains-specific attack plans are being prepared.</Text>
              </View>
            ) : strategyView === 'attack' ? (
              <View style={styles.attackPlanContainer}>
                <View style={styles.attackStatsRow}>
                  <View style={styles.attackStatItem}>
                    <Text style={styles.attackStatLabel}>TARGET</Text>
                    <Text style={styles.attackStatValue}>{targetMarks} / 300</Text>
                  </View>
                  <View style={styles.attackStatItem}>
                    <Text style={styles.attackStatLabel}>SECURED</Text>
                    <Text style={styles.attackStatValue}>{currentScore}</Text>
                  </View>
                  <View style={styles.attackStatItem}>
                    <Text style={styles.attackStatLabel}>GAP</Text>
                    <Text style={[styles.attackStatValue, { color: markGap > 0 ? '#eb7828' : '#59a13f' }]}>{markGap}</Text>
                  </View>
                </View>

                <View style={styles.attackAdviceBox}>
                  <Text style={styles.attackAdviceTitle}>🛡️ The Siege Strategy</Text>
                  <Text style={styles.attackAdviceText}>
                    {markGap > 0 
                      ? `You need ${markGap} more marks to hit the safe zone. Focus on high-weightage units below to bridge the gap.`
                      : "Target achieved! You are in the safe zone. Maintain revision to stay sharp."}
                  </Text>
                </View>

                <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
                   {sortedStrategyUnits
                     .filter(unit => unit.topics.some(t => !completedTopics.includes(t)))
                     .map((unit, idx) => (
                       <View key={unit.id} style={styles.attackUnitItem}>
                         <Text style={styles.attackUnitTitle}>{unit.title}</Text>
                         <Text style={styles.attackUnitWeight}>{unit.weightage} remaining</Text>
                         <View style={styles.attackActionRow}>
                           <Text style={styles.attackActionHint}>Suggestion: {parseFloat(unit.weightage) > 15 ? 'Deep Dive' : 'Minimalist'}</Text>
                         </View>
                       </View>
                     ))
                   }
                   <View style={{height: 40}} />
                </ScrollView>
              </View>
            ) : (
              <View style={{flex: 1}}>
                <Text style={styles.infoText}>Units ordered by weightage. Target high-scoring areas first.</Text>
                


                <ScrollView style={{marginTop: 10, flex: 1}} showsVerticalScrollIndicator={false}>
                  {sortedStrategyUnits.map((unit, index) => (
                    <View key={unit.id} style={styles.strategyUnit}>
                      <Text style={styles.strategyUnitTitle}>{index + 1}. {unit.title}</Text>
                      <Text style={styles.strategyUnitMarks}>Weightage: {unit.weightage}</Text>
                    </View>
                  ))}
                  <View style={{height: 40}} />
                </ScrollView>
                
                <View style={styles.targetMarksBoxFixed}>
                  <Text style={styles.targetMarksTitleLarge}>Target: {targetMarks} / 300 Marks</Text>
                  <Text style={styles.targetMarksSub}>Highest previous cutoff + 10 marks safety buffer.</Text>
                </View>
              </View>
            )}
            <Text style={styles.phase2Note}>🛡️ Mains specific strategy will be unlocked in phase 2.</Text>
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
            {selectedExam !== 'group4' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 }}>
                <View style={styles.subTabContainer}>
                  <Pressable onPress={() => setSubTab('prelims')} style={[styles.subTab, subTab === 'prelims' && styles.activeSubTab]}>
                    <Text style={[styles.subTabText, subTab === 'prelims' && styles.activeSubTabText]}>Prelims</Text>
                  </Pressable>
                  <Pressable onPress={() => setSubTab('mains')} style={[styles.subTab, subTab === 'mains' && styles.activeSubTab]}>
                    <Text style={[styles.subTabText, subTab === 'mains' && styles.activeSubTabText]}>Mains</Text>
                  </Pressable>
                </View>

                {selectedExam === 'group2' && subTab === 'prelims' && (
                  <View style={styles.langToggleContainer}>
                    <Pressable onPress={() => setSelectedLanguage('tamil')} style={[styles.langBtn, selectedLanguage === 'tamil' && styles.langBtnActive]}>
                      <Text style={[styles.langBtnText, selectedLanguage === 'tamil' && styles.langBtnTextActive]}>தமிழ்</Text>
                    </Pressable>
                    <Pressable onPress={() => setSelectedLanguage('english')} style={[styles.langBtn, selectedLanguage === 'english' && styles.langBtnActive]}>
                      <Text style={[styles.langBtnText, selectedLanguage === 'english' && styles.langBtnTextActive]}>ENG</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
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
            <Text style={styles.resourcesTitle}>Resources</Text>
            <View style={styles.tabContainer}>
              <Pressable
                onPress={() => setResourceTab('planner')}
                style={[styles.tab, resourceTab === 'planner' && styles.activeTab]}
              >
                <Text style={[styles.tabText, resourceTab === 'planner' && styles.activeTabText]}>Planner</Text>
              </Pressable>
              <Pressable
                onPress={() => setResourceTab('syllabus')}
                style={[styles.tab, resourceTab === 'syllabus' && styles.activeTab]}
              >
                <Text style={[styles.tabText, resourceTab === 'syllabus' && styles.activeTabText]}>Syllabus</Text>
              </Pressable>
              <Pressable
                onPress={() => setResourceTab('info')}
                style={[styles.tab, resourceTab === 'info' && styles.activeTab]}
              >
                <Text style={[styles.tabText, resourceTab === 'info' && styles.activeTabText]}>Exam Info</Text>
              </Pressable>
              <Pressable
                onPress={() => setResourceTab('about')}
                style={[styles.tab, resourceTab === 'about' && styles.activeTab]}
              >
                <Text style={[styles.tabText, resourceTab === 'about' && styles.activeTabText]}>About</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView style={styles.resourceContent} showsVerticalScrollIndicator={false}>
            {resourceTab === 'syllabus' && selectedExam === 'group2' && (
              <View style={[styles.langToggleContainer, { alignSelf: 'flex-end', marginRight: 16, marginBottom: 12 }]}>
                <Pressable onPress={() => setSelectedLanguage('tamil')} style={[styles.langBtn, selectedLanguage === 'tamil' && styles.langBtnActive]}>
                  <Text style={[styles.langBtnText, selectedLanguage === 'tamil' && styles.langBtnTextActive]}>தமிழ்</Text>
                </Pressable>
                <Pressable onPress={() => setSelectedLanguage('english')} style={[styles.langBtn, selectedLanguage === 'english' && styles.langBtnActive]}>
                  <Text style={[styles.langBtnText, selectedLanguage === 'english' && styles.langBtnTextActive]}>ENG</Text>
                </Pressable>
              </View>
            )}
            {resourceTab === 'planner' ? (
              <View>
                <Text style={styles.sectionTitle}>{activeExamInfo?.name} Schedule</Text>
                {annualPlannerData
                  .filter(item => {
                    if (selectedExam === 'group1') return item.id === 2;
                    if (selectedExam === 'group2') return item.id === 4;
                    if (selectedExam === 'group4') return item.id === 6;
                    return false;
                  })
                  .map((item) => (
                    <View key={item.id} style={styles.plannerCard}>
                      <View style={styles.plannerBadge}>
                        <Text style={styles.plannerBadgeText}>{item.duration}</Text>
                      </View>
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
              </View>
            ) : resourceTab === 'syllabus' ? (
              <View>
                <Text style={styles.sectionTitle}>{activeExamInfo?.name} Syllabus</Text>
                {selectedExam !== 'group4' && (
                  <View style={styles.subTabContainer}>
                    <Pressable onPress={() => setSubTab('prelims')} style={[styles.subTab, subTab === 'prelims' && styles.activeSubTab]}>
                      <Text style={[styles.subTabText, subTab === 'prelims' && styles.activeSubTabText]}>Prelims</Text>
                    </Pressable>
                    <Pressable onPress={() => setSubTab('mains')} style={[styles.subTab, subTab === 'mains' && styles.activeSubTab]}>
                      <Text style={[styles.subTabText, subTab === 'mains' && styles.activeSubTabText]}>Mains</Text>
                    </Pressable>
                  </View>
                )}
                {activeSyllabus.map((unit) => (
                  <View key={unit.id} style={styles.collapsibleCard}>
                    <Pressable
                      onPress={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}
                      style={styles.collapsibleHeader}
                    >
                      <View style={{flex: 1}}>
                        <Text style={styles.collapsibleTitle}>{unit.title}</Text>
                        <Text style={styles.collapsibleMarks}>{unit.weightage || unit.marks}</Text>
                      </View>
                      <View style={[styles.arrow, expandedUnit === unit.id && styles.arrowExpanded]} />
                    </Pressable>
                    {expandedUnit === unit.id && (
                      <View style={styles.collapsibleBody}>
                        {unit.topics.map((topic, idx) => (
                          <View key={idx} style={styles.topicItemRead}>
                            <Text style={styles.topicTextRead}>• {topic}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : resourceTab === 'info' ? (
              <View>
                {activeInfo && (
                  <View>
                    {renderInfoSection('Exam Pattern', activeInfo.pattern)}
                    {renderInfoSection('Expected Cut-offs', activeInfo.cutoffs)}
                    {renderInfoSection('Key Details', activeInfo.details)}
                  </View>
                )}
              </View>
            ) : (
              <View>
                <Text style={styles.sectionTitle}>Exam Overview</Text>
                <View style={styles.aboutManifestoCard}>
                   <Text style={styles.aboutTextBold}>{activeInfo?.name} Analysis</Text>
                   <Text style={styles.aboutText}>{activeInfo?.description}</Text>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Success Factors</Text>
                <View style={styles.aboutManifestoCard}>
                  {activeInfo?.successFactors.map((item, idx) => (
                    <Text key={idx} style={styles.infoTextSmall}>• <Text style={styles.textBold}>{item.label}:</Text> {item.value}</Text>
                  ))}
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

      {/* THE PRO SWITCH MODAL (RESTORED) */}
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
                If we chase multiple horses, we may not catch even one. Focus on one exam to get more improvement.
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
      <Text style={[styles.navText, page === 'resources' ? styles.navTextActive : styles.navTextInactive]}>Resources</Text>
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
  safeArea: { flex: 1, backgroundColor: '#f4d72d' },
  page: { flex: 1, paddingHorizontal: 22, paddingTop: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4d72d' },
  loadingText: { color: '#2f5e1f', fontSize: 18, fontWeight: '800' },
  
  // BACKGROUND WORDS (RESTORED)
  bgWord: { position: 'absolute', zIndex: 0 },
  wordTopLeft: { top: 72, left: 18 },
  wordBottomRight: { bottom: 80, right: 18 },
  bgWordText: { color: 'rgba(0,0,0,0.03)', fontSize: 70, fontWeight: '900', letterSpacing: -2 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, zIndex: 10 },
  topBarSpacer: { width: 40 },
  heroWrap: {
    backgroundColor: '#fff',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(98, 160, 73, 0.18)',
    zIndex: 2,
  },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  title: { color: '#4aa332', fontSize: 52, fontWeight: '900', letterSpacing: -1 },
  mvpBadge: { backgroundColor: '#eb7828', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, transform: [{ translateY: -20 }] },
  mvpText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  statusBoard: { marginTop: 20, width: '100%', alignItems: 'center' },
  examBadgeLarge: { backgroundColor: 'rgba(89, 161, 63, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 12 },
  examBadgeTextLarge: { color: '#2f5e1f', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  countdownContainer: { alignItems: 'center' },
  countdownValue: { color: '#1a3a12', fontSize: 72, fontWeight: '900', lineHeight: 72 },
  countdownLabel: { color: '#6e9e5a', fontSize: 12, fontWeight: '800', letterSpacing: 4, marginTop: -4 },
  homeProgressBox: { width: '100%', marginTop: 20 },
  homeProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  homeProgressTitle: { color: '#6e9e5a', fontSize: 11, fontWeight: '800' },
  homeProgressValue: { color: '#2f5e1f', fontSize: 16, fontWeight: '900' },
  homeProgressBar: { height: 8, backgroundColor: 'rgba(89, 161, 63, 0.1)', borderRadius: 4, overflow: 'hidden' },
  homeProgressFill: { height: '100%', backgroundColor: '#59a13f' },
  heroFooter: { marginTop: 12 },
  eyebrow: { color: '#5d993f', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  strategyHighlightBox: { marginTop: 20, backgroundColor: 'rgba(255, 242, 170, 0.86)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(98, 160, 73, 0.18)' },
  strategyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  strategyTitle: { color: '#2f5e1f', fontSize: 14, fontWeight: '800' },
  viewAllLink: { color: '#59a13f', fontSize: 12, fontWeight: '700' },
  strategyUnitMini: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 14, marginBottom: 8 },
  unitRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(89, 161, 63, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  unitRankText: { color: '#59a13f', fontSize: 12, fontWeight: '800' },
  unitNameMini: { flex: 1, color: '#333', fontSize: 13, fontWeight: '600' },
  unitMarksMini: { color: '#666', fontSize: 11, fontWeight: '700' },
  resourcesButton: { backgroundColor: '#59a13f', paddingVertical: 18, borderRadius: 24, alignItems: 'center', marginTop: 10 },
  resourcesButtonText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  activeExamHeader: { backgroundColor: 'rgba(255, 249, 219, 0.9)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeExamHeaderText: { color: '#447332', fontSize: 14, fontWeight: '800' },
  switchIcon: { width: 0, height: 0, borderTopWidth: 5, borderLeftWidth: 5, borderRightWidth: 5, borderTopColor: '#59a13f', borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  guestBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255, 249, 219, 0.9)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  guestDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#59a13f' },
  guestBadgeText: { color: '#447332', fontSize: 14, fontWeight: '800' },
  backButton: { backgroundColor: 'rgba(255, 249, 219, 0.9)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  backButtonText: { color: '#447332', fontSize: 14, fontWeight: '800' },
  infoCard: { marginTop: 20, backgroundColor: 'rgba(255, 246, 194, 0.9)', borderRadius: 30, padding: 24 },
  infoTitle: { color: '#2f5e1f', fontSize: 30, fontWeight: '800', marginBottom: 16 },
  infoText: { color: '#426834', fontSize: 16, lineHeight: 24, marginBottom: 12 },
  onboardingContainer: { flex: 1, justifyContent: 'center' },
  onboardingEyebrow: { color: '#59a13f', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 },
  onboardingTitle: { color: '#2f5e1f', fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  onboardingText: { color: '#6e9e5a', fontSize: 16, textAlign: 'center', marginBottom: 30 },
  examOption: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(89, 161, 63, 0.1)' },
  examOptionSelected: { borderColor: '#59a13f', backgroundColor: 'rgba(89, 161, 63, 0.05)' },
  examOptionLabel: { color: '#2f5e1f', fontSize: 18, fontWeight: '800' },
  levelOption: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(89, 161, 63, 0.1)' },
  levelOptionTitle: { color: '#2f5e1f', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  levelOptionDesc: { color: '#6e9e5a', fontSize: 14 },
  modalButtonSecondary: { paddingVertical: 16, alignItems: 'center' },
  modalButtonSecondaryText: { color: '#6e9e5a', fontSize: 14, fontWeight: '700' },
  
  // QUOTE WRAPPER (RESTORED)
  quoteWrapper: { marginTop: 40, paddingHorizontal: 20, alignItems: 'center' },
  quoteText: { color: '#6e9e5a', fontSize: 14, fontWeight: '700', fontStyle: 'italic', textAlign: 'center', lineHeight: 22 },

  onboardingTitleSmall: { color: '#2f5e1f', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  onboardingTextSmall: { color: '#6e9e5a', fontSize: 14, marginBottom: 20 },
  checklistScroll: { flex: 1 },
  checklistCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16 },
  checklistUnitTitle: { color: '#59a13f', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12 },
  checkItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#59a13f', marginRight: 12 },
  checkboxChecked: { backgroundColor: '#59a13f' },
  checkText: { color: '#333', fontSize: 14, fontWeight: '600' },
  checkTextDone: { textDecorationLine: 'line-through', color: '#999' },
  finishButton: { backgroundColor: '#59a13f', paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  finishButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  strategyUnit: { backgroundColor: '#fff', borderRadius: 20, padding: 22, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(89, 161, 63, 0.08)' },
  strategyUnitTitle: { color: '#333', fontSize: 18, fontWeight: '700' },
  strategyUnitMarks: { color: '#59a13f', fontSize: 14, fontWeight: '800', marginTop: 4 },
  targetMarksBox: { backgroundColor: 'rgba(89, 161, 63, 0.05)', borderRadius: 16, padding: 16, alignItems: 'center' },
  targetMarksTitle: { color: '#2f5e1f', fontSize: 16, fontWeight: '800' },
  targetMarksSub: { color: '#6e9e5a', fontSize: 12 },
  subTabContainer: { flexDirection: 'row', backgroundColor: 'rgba(89, 161, 63, 0.05)', borderRadius: 12, padding: 4, marginBottom: 10 },
  subTab: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  activeSubTab: { backgroundColor: '#fff' },
  subTabText: { color: '#6e9e5a', fontSize: 13, fontWeight: '700' },
  activeSubTabText: { color: '#2f5e1f' },
  resourcesHeader: { marginTop: 10, alignItems: 'center' },
  resourcesTitle: { color: '#2f5e1f', fontSize: 28, fontWeight: '800' },
  tabContainer: { flexDirection: 'row', gap: 10, marginTop: 16 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  activeTab: { backgroundColor: '#59a13f' },
  tabText: { color: '#6e9e5a', fontSize: 13, fontWeight: '700' },
  activeTabText: { color: '#fff' },
  resourceContent: { flex: 1, marginTop: 20 },
  sectionTitle: { color: '#2f5e1f', fontSize: 18, fontWeight: '800', marginBottom: 16 },
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
  cutoffCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  cutoffRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  cutoffLabel: { color: '#666', fontSize: 14 },
  cutoffValue: { color: '#2f5e1f', fontSize: 14, fontWeight: '800' },
  aboutCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 20 },
  aboutTextBold: { color: '#2f5e1f', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  aboutText: { color: '#444', fontSize: 15, lineHeight: 22 },
  infoCardInline: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 20 },
  infoTextSmall: { color: '#426834', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  textBold: { fontWeight: '700' },
  testCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16 },
  testTitle: { color: '#2f5e1f', fontSize: 18, fontWeight: '800' },
  testMeta: { color: '#6e9e5a', fontSize: 14, marginBottom: 16 },
  startTestButton: { backgroundColor: '#59a13f', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  startTestButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  comingSoonBox: { padding: 30, alignItems: 'center' },
  comingSoonText: { color: '#999', fontSize: 14 },
  
  // MODAL STYLES (RESTORED PRO VERSION)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(26, 58, 18, 0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 32, padding: 28, borderWidth: 2, borderColor: 'rgba(89, 161, 63, 0.2)' },
  modalHeader: { alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: '#1a3a12', fontSize: 24, fontWeight: '900', marginBottom: 8 },
  wisdomCard: { backgroundColor: 'rgba(235, 120, 40, 0.05)', borderRadius: 24, padding: 22, marginBottom: 28, borderWidth: 1, borderColor: 'rgba(235, 120, 40, 0.15)', borderStyle: 'dashed' },
  wisdomText: { color: '#eb7828', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 24, fontStyle: 'italic' },
  switchTitle: { color: '#6e9e5a', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  examOptionModal: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  examOptionLabelSmall: { color: '#2f5e1f', fontSize: 16, fontWeight: '800' },
   examOptionSelectedOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(89, 161, 63, 0.08)', borderRadius: 16 },
  modalButtonPrimary: { backgroundColor: '#59a13f', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  aboutManifestoCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 16 },
  aboutManifestoCardSecondary: { backgroundColor: 'rgba(255, 242, 170, 0.4)', borderRadius: 24, padding: 24, marginBottom: 16 },
  manifestoTitle: { color: '#2f5e1f', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  manifestoText: { color: '#444', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  modalBackButton: { marginBottom: 16 },
  modalBackButtonText: { color: '#59a13f', fontSize: 14, fontWeight: '700' },

  textSeparator: { height: 1, backgroundColor: 'rgba(66, 104, 52, 0.15)', marginVertical: 12 },
  plannerCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(89, 161, 63, 0.1)' },
  plannerBadge: { backgroundColor: 'rgba(235, 120, 40, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  plannerBadgeText: { color: '#eb7828', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  plannerName: { color: '#1a3a12', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  plannerDates: { flexDirection: 'row', justifyContent: 'space-between' },
  dateBlock: { flex: 1 },
  dateLabel: { color: '#6e9e5a', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  dateValue: { color: '#2f5e1f', fontSize: 16, fontWeight: '900' },

  progressHint: { color: '#59a13f', fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 8, opacity: 0.8 },
  progressHeader: { marginBottom: 20 },
  progressPageTitle: { color: '#1a3a12', fontSize: 28, fontWeight: '900' },
  progressPageSub: { color: '#6e9e5a', fontSize: 14, marginTop: 4 },
  progressStatsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 16, backgroundColor: '#fff', padding: 16, borderRadius: 16 },
  progressStatText: { color: '#444', fontSize: 14, fontWeight: '700' },
  progressStatPercent: { color: '#59a13f', fontSize: 24, fontWeight: '900' },
  topicItemRead: { paddingVertical: 8 },
  topicTextRead: { color: '#444', fontSize: 14, lineHeight: 20 },

  strategyHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  strategyToggleBtn: { backgroundColor: 'rgba(89, 161, 63, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  strategyToggleBtnText: { color: '#59a13f', fontSize: 12, fontWeight: '800' },
  attackPlanContainer: { flex: 1 },
  attackStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, backgroundColor: 'rgba(89, 161, 63, 0.05)', padding: 16, borderRadius: 20 },
  attackStatItem: { alignItems: 'center' },
  attackStatLabel: { color: '#6e9e5a', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  attackStatValue: { color: '#1a3a12', fontSize: 20, fontWeight: '900' },
  attackAdviceBox: { backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(89, 161, 63, 0.1)' },
  attackAdviceTitle: { color: '#1a3a12', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  attackAdviceText: { color: '#444', fontSize: 13, lineHeight: 18 },
  attackUnitItem: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(89, 161, 63, 0.08)' },
  attackUnitTitle: { color: '#1a3a12', fontSize: 16, fontWeight: '800' },
  attackUnitWeight: { color: '#6e9e5a', fontSize: 14, fontWeight: '700' },
  attackActionRow: { marginTop: 6 },
  attackActionHint: { color: '#eb7828', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  mainsPlaceholder: { backgroundColor: 'rgba(235, 120, 40, 0.05)', padding: 24, borderRadius: 24, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(235, 120, 40, 0.2)', marginTop: 20 },
  mainsPlaceholderTitle: { color: '#eb7828', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  mainsPlaceholderText: { color: '#444', fontSize: 14, textAlign: 'center', lineHeight: 20 },

  setupUnit: { marginBottom: 24 },
  setupUnitHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  setupUnitTitle: { color: '#2f5e1f', fontSize: 16, fontWeight: '800' },
  setupCheckbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#59a13f', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  setupCheckboxActive: { backgroundColor: '#59a13f' },
  setupCheckboxInner: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#fff' },
  setupTopicsPanel: { backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  setupTopicRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  setupCheckboxMini: { width: 18, height: 18, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(89, 161, 63, 0.2)', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  setupCheckboxInnerMini: { width: 8, height: 8, borderRadius: 2, backgroundColor: '#fff' },
  
  langToggleContainer: { flexDirection: 'row', backgroundColor: 'rgba(89, 161, 63, 0.05)', borderRadius: 10, padding: 3 },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  langBtnActive: { backgroundColor: '#59a13f' },
  langBtnText: { fontSize: 11, fontWeight: '800', color: '#6e9e5a' },
  langBtnTextActive: { color: '#fff' },
  
  setupTopicText: { color: '#444', fontSize: 14, fontWeight: '600' },
  setupTopicTextCompleted: { color: '#bbb', textDecorationLine: 'line-through' },
  phase2Note: { color: '#6e9e5a', fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
  setupFooterFixed: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 22, backgroundColor: '#f4d72d', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },

  targetMarksBoxFixed: { backgroundColor: '#1a3a12', borderRadius: 20, padding: 16, alignItems: 'center', marginTop: 12 },
  targetMarksTitleLarge: { color: '#fff', fontSize: 20, fontWeight: '900' },
  setupBtn: { backgroundColor: '#59a13f', paddingVertical: 18, borderRadius: 24, alignItems: 'center' },
  setupBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  lockIcon: { fontSize: 40, marginBottom: 12 },
  lockedTestCard: { backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 24, padding: 40, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)' },
  lockedTitle: { color: '#1a3a12', fontSize: 18, fontWeight: '900', marginBottom: 8 },
  lockedText: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 20 },

  examSeriesFullBtn: { backgroundColor: '#1a3a12', padding: 20, borderRadius: 24, marginTop: 12 },
  examSeriesLabel: { color: '#6e9e5a', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  examSeriesTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 4 },

  mainActionPanel: { backgroundColor: '#59a13f', padding: 24, borderRadius: 28, marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  mainActionLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  mainActionTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },

  navBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 12, paddingBottom: 34, borderTopWidth: 1, borderTopColor: 'rgba(89, 161, 63, 0.12)', justifyContent: 'space-around', zIndex: 100, borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 20 },
  navItem: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  navItemActive: { backgroundColor: 'rgba(89, 161, 63, 0.08)' },
  navText: { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  navTextActive: { color: '#1a3a12', fontWeight: '900' },
  navTextInactive: { color: '#8eb37d' },

  buttonPressed: { opacity: 0.6 },
  clearButton: { marginTop: 20, backgroundColor: 'rgba(235, 70, 70, 0.1)', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  clearButtonText: { color: '#a32a2a', fontSize: 14, fontWeight: '800' },
});
