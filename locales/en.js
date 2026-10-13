/**
 * EgoHabits - English Locale
 * 1:1 copy matching original design guidelines
 */
module.exports = {
  common: {
    appName: "EgoHabits",
    appSlogan: "Small habits. Room to grow.",
    back: "Back",
    confirm: "Confirm",
    cancel: "Cancel",
    save: "Save"
  },
  tabs: {
    today: "Today",
    habits: "Habits",
    week: "Week",
    you: "You"
  },
  today: {
    dateSub: "EGOHABITS / ",
    greeting: "Hey, Avery.",
    heroTitle: "Start\nsmall.",
    heroSub: "Three habits.\nYour own pace.",
    getStarted: "Get started",
    sectionTitle: "A little care, today"
  },
  habits: {
    libraryTitle: "HABIT LIBRARY",
    libraryHeadline: "Make room for a habit.",
    filterAll: "All",
    filterMove: "Move",
    filterRest: "Rest",
    filterFocus: "Focus",
    
    // Items
    water: {
      name: "Drink water",
      amount: "1 glass",
      cardTitle: "Take a water break",
      cardSub: "1 glass · Ready when you are"
    },
    outside: {
      name: "Step outside",
      amount: "10 minutes",
      cardTitle: "Step outside",
      cardSub: "10 min · A breath of fresh air"
    },
    read: {
      name: "Read a little",
      amount: "5 pages",
      cardTitle: "Read a few pages",
      cardSub: "5 pages · Time for a story"
    },
    eyes: {
      name: "Rest your eyes",
      amount: "2 minutes",
      cardTitle: "Rest your eyes",
      cardSub: "2 min · A quiet pause"
    },
    task: {
      name: "One quiet task",
      amount: "15 minutes",
      cardTitle: "One quiet task",
      cardSub: "15 min · Gentle focus"
    },
    breathe: {
      name: "Breathe slowly",
      amount: "1 minute",
      cardTitle: "Breathe slowly",
      cardSub: "1 min · Inhale and exhale"
    }
  },
  detail: {
    common: {
      tag: "HABIT DETAILS",
      guideTitle: "Keep it easy",
      metricAmountLabel: "Amount",
      metricRhythmLabel: "Your rhythm",
      rhythmDaily: "Daily",
      logButton: "Log this habit",
      alreadyLogged: "Completed for today",
      heroTitle: "One small step.\nJust for you.",
      heroSub: "Take a gentle pause,\nand begin.",
      step1Title: "Find a quiet moment",
      step1Desc: "Choose a time that feels calm.",
      step2Title: "Do a little, gently",
      step2Desc: "No need to overdo it.",
      step3Title: "Mark it done",
      step3Desc: "A small action, remembered."
    },
    water: {
      headline: "A little water break.",
      heroTitle: "One glass.\nA small reset.",
      heroSub: "Pause for a sip,\nthen carry on.",
      logButton: "Log one glass",
      step1Title: "Fill your favorite glass",
      step1Desc: "Keep it close while you work.",
      step2Title: "Take a moment to pause",
      step2Desc: "Sip at a pace that feels good.",
      step3Title: "Mark this little habit",
      step3Desc: "One small action, remembered."
    },
    outside: {
      headline: "Fresh air, easy steps.",
      heroTitle: "Step out.\nBreathe in.",
      heroSub: "Ten minutes outside,\nto clear your head.",
      logButton: "Log my walk",
      step1Title: "Put on your shoes",
      step1Desc: "No special gear needed.",
      step2Title: "Walk at your own pace",
      step2Desc: "Around the block is enough.",
      step3Title: "Notice the air",
      step3Desc: "One deep breath, then done."
    },
    read: {
      headline: "A few quiet pages.",
      heroTitle: "Open a book.\nDrift a little.",
      heroSub: "Five pages is plenty,\na small escape.",
      logButton: "Log my pages",
      step1Title: "Pick your book",
      step1Desc: "Any book, any page to start.",
      step2Title: "Read without rush",
      step2Desc: "No deadlines, just the story.",
      step3Title: "Bookmark and rest",
      step3Desc: "Close it gently when you are done."
    },
    module: {
      breathing: "Start breathing practice",
      timer: "Start the session"
    }
  },
  complete: {
    common: {
      tag: "HABIT COMPLETE",
      headline: "One small step, done.",
      metricLabel: "A little care, counted.",
      cardTitle: "Nicely done.",
      cardSub: "Another gentle moment, remembered.",
      btnBack: "Back to today",
      btnViewWeek: "View my week",
      footerText: "Small habits. Room to grow."
    },
    water: {
      tag: "WATER BREAK / COMPLETE",
      headline: "One small sip, done.",
      cardTitle: "That was your first habit.",
      cardSub: "Two more small moments are waiting.\nThere is no rush to do them all."
    },
    outside: {
      tag: "STEP OUT / COMPLETE",
      headline: "A breath of fresh air, done.",
      cardTitle: "You moved, gently.",
      cardSub: "A little walk can change the whole day."
    },
    read: {
      tag: "READ / COMPLETE",
      headline: "A few pages, done.",
      cardTitle: "You made time for a story.",
      cardSub: "Little by little, the pages add up."
    }
  },
  breath: {
    tag: "BREATHING",
    headline: "Choose your rhythm.",
    current: "In use",
    start: "Start practice",
    phases: {
      inhale: "Breathe in",
      inhaleAgain: "Breathe in again",
      hold: "Hold",
      exhale: "Breathe out"
    },
    player: {
      remaining: "remaining",
      rounds: "rounds",
      end: "End practice",
      ready: "Get comfortable, then start.",
      duration: "Duration"
    },
    durations: {
      s30: "30 sec",
      m1: "1 min",
      m3: "3 min",
      m5: "5 min",
      m10: "10 min"
    },
    mode: {
      box: { name: "Box breathing", desc: "Steady and grounding.", pattern: "4 - 4 - 4 - 4" },
      relax: { name: "Relax breathing", desc: "Calm the nervous system.", pattern: "4 - 7 - 8" },
      resonance: { name: "Resonance", desc: "An even, coherent rhythm.", pattern: "5.5 - 5.5" },
      sigh: { name: "Physiological sigh", desc: "A long, slow release.", pattern: "in - in - out" },
      wimhof: { name: "Wim Hof", desc: "Energizing breathing rounds.", pattern: "30 breaths x 3" },
      free: { name: "Free breathing", desc: "Your own rhythm.", pattern: "Custom" }
    },
    disclaimer: "Stop if you feel lightheaded, and breathe gently."
  },
  session: {
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    end: "End session",
    complete: "Session complete",
    eyes: { name: "Rest your eyes", hint: "Close your eyes and let go." },
    task: { name: "One quiet task", hint: "Focus on one small thing." }
  },
  week: {
    headline: "Your week, growing.",
    completedLabel: "small habits completed",
    milestoneTitle: "A week of\nshowing up.",
    milestoneDays: "Seven days.\nYour own steady rhythm.",
    breakdownTitle: "What made your week",
    catWater: "Water breaks",
    catMove: "Move + focus",
    unitTimes: "habits"
  },
  you: {
    tag: "MAKE A LITTLE ROOM FOR YOU",
    headline: "Your space",
    userName: "Avery Lane",
    userHandle: "@averytakesitsteady",
    statCompleted: "28",
    statCompletedLabel: "habits completed",
    statStreak: "7",
    statStreakLabel: "days in a row",
    milestoneSection: "A little milestone",
    badgeTitle: "Steady starter",
    badgeDesc: "Seven days of making space for yourself.",
    settingsSection: "On your own terms",
    gentleReminders: "Gentle reminders",
    preferences: "Your preferences",
    
    // Preferences modal / sub
    prefTitle: "Preferences",
    language: "Language",
    languageEn: "English",
    languageZh: "中文 (Chinese)",
    theme: "Theme mode",
    themeAuto: "Follow system",
    themeLight: "Light (Cream)",
    themeDark: "Dark (Olive)",
    clearData: "Clear all data",
    clearConfirmContent: "All local data will be deleted (check-ins, preferences and module settings). This cannot be undone.",
    clearDone: "All data cleared"
  }
};
