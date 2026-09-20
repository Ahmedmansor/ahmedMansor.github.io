translations = {
  // Common text used across all pages
  common: {
    seeMore: "See More",
    seeLess: "See Less",
    backToHome: "Back to Home",
  },
  // Text specific to the index.html / home.html page
  indexPage: {
    pageTitle: "Home | Ahmed Mansour - Flutter Developer Portfolio",
    name: "Ahmed Mohamed Mansour",
    jobTitle: "Flutter Mobile Developer",
    bio: "Flutter Developer skilled in building responsive, high-performance mobile applications for both iOS and Android platforms. Proficient in Dart and Flutter, with a proven ability to deliver visually appealing and feature-rich apps. Regularly leverage AI tools to accelerate code writing and enhance problem-solving efficiency.",
    projectsTitle: "Featured Projects",
    contactMe: "Contact Me:",
    projectsData: [
      {
        title: "Linker EG",
        bigTitle: "LINKER EG",
        category: "Flutter & Cloud Platform",
        description:
          "An integrated platform for athletes and coaches to connect, showcase skills, and grow their sports careers.",
        thumbnail: "assets/images/project1-thumbnail.jpg",
        link: "linker.html",
        tags: [
          "Flutter",
          "Firebase",
          "Supabase",
          "Bloc",
          "GoRouter",
          "Dio",
          "GetIt & Injectable",
          "Freezed",
          "Geolocation",
          "Dart",
        ],
        viewProject: "View Project Details",
      },
      {
        title: "SemanticCut AI",
        bigTitle: "SEMANTIC CUT",
        category: "AI & Automated Pipeline",
        description:
          "An intelligent end-to-end Python & AI pipeline that automates viral multilingual short-form video production with Gemini & WhisperX.",
        thumbnail: "assets/images/semanticcut-thumbnail.jpg",
        link: "semantic-cut.html",
        tags: [
          "Python",
          "Google Gemini API",
          "Groq (Llama 3.3)",
          "WhisperX Large-v3",
          "FFmpeg",
          "Pydub",
          "Premiere XML",
          "AI Sound Design",
        ],
        viewProject: "View Project Details",
      },
    ],
  },
  // Text specific to the project1.html page
  project1Page: {
    playStoreSubtext: "GET IT ON / TRY IT LIVE",
    playStoreTitle: "Google Play",
    featureNavTitles: [
      "Secure and Easy Login and Logout System",
      "User Registration with Robust Validation",
      "The Complete User Journey: Guest, Player & Coach Views",
      "Advanced Search & Multi-Factor Filtering",
      "Full-Circle Application: From Player to Coach",
      "Core Interaction: Session Creation & Enrollment",
    ],
    pageTitle: "Project Details: Linker EG",
    headerTitle: "Linker EG",
    headerDescription:
      "Linker is an integrated platform for athletes, coaches, and sports enthusiasts to communicate, showcase skills, and grow their sports careers. Whether you are looking for a trainer, want to train, or promote your experience, Linker makes it easy in one place.",
    feature1Title: "✨ 1- Secure and Easy Login and Logout System",
    feature1Description:
      "The authentication process was designed to be seamless. Below are demonstrations of both a successful login and the clear error handling for incorrect data.",
    feature2Title: "📝 2- User Registration with Robust Validation",
    feature2Description:
      "Our registration process is designed to be user-friendly while ensuring data integrity. It guides new users through essential steps, incorporating real-time validation for a smooth onboarding experience.",
    feature3Title:
      "👤 3- The Complete User Journey: Guest, Player & Coach Views",
    feature3Description:
      "The app offers a distinct experience at every stage. It starts with a guest view for exploration, followed by specialized, role-based profiles for players and coaches after logging in, creating a tailored journey for each user.",
    feature3ComparisonTitle:
      "UI Across All Roles:<br />Guest, Player, and Coach",
    feature3ComparisonDescription:
      "This image provides a clear comparison of the three core views<br />the exploratory Guest interface, the simple Player profile, and the rich Coach profile.",
    feature4Title: "🔎 4- Advanced Search & Multi-Factor Filtering",
    feature4Description:
      "To empower users, the app includes a powerful search function to find coaches by name, complemented by a multi-layered filtering system. Users can refine results by sport, location, age group, and skill level, making it simple to find the perfect match.",
    feature5Title: "🚀 5- Full-Circle Application: From Player to Coach",
    feature5Description:
      "This feature demonstrates the complete, asynchronous workflow for a player to upgrade their account. It showcases a detailed application process, review by a separate admin panel, and the final transformation of the user's role and UI upon approval.",
    feature6Title: "🤝 6- Core Interaction: Session Creation & Enrollment",
    feature6Description:
      "This feature demonstrates the app's primary function: enabling coaches to offer training and allowing players to enroll. It showcases the complete interaction loop, from creation to enrollment, which is the heart of the Linker platform.",
    loginGalleryData: [
      {
        videoSrc: "assets/videos/linker-login-logout.mp4",
        caption:
          "<strong>Login and Logout.</strong><br>A user can enter their credentials and log in and log out successfully.",
      },
      {
        videoSrc: "assets/videos/linker-login-error.mp4",
        caption:
          "<strong>Error Handling: Invalid Credentials.</strong><br>The system provides immediate feedback for incorrect login attempts.",
      },
    ],
    registrationGalleryData: [
      {
        videoSrc: "assets/videos/linker-register-success-part1.mp4",
        caption:
          "<strong>Step 1: Account Creation & Phone Verification.</strong><br> Users securely enter their basic details (names, phone number, password), followed by an OTP for phone number confirmation.",
      },
      {
        videoSrc: "assets/videos/linker-register-success-part2.mp4",
        caption:
          "<strong>Step 2: Profile Completion & Email Validation.</strong><br> After phone verification, users complete their profile with email, birth date, and gender.",
      },
      {
        videoSrc: "assets/videos/linker-register-phone-exists-error.mp4",
        caption:
          "<strong>Error Handling: Existing Phone Number.</strong><br> The system prevents duplicate accounts by displaying an immediate error if a registered phone number is used.",
      },
      {
        videoSrc: "assets/videos/linker-register-email-exists-error.mp4",
        caption:
          "<strong>Error Handling: Existing Email.</strong><br> The system efficiently detects and prevents duplicate accounts by displaying an immediate error if an already registered email is used.",
      },
    ],
    profilesGalleryData: [
      {
        videoSrc: "assets/videos/linker-guest-view-exploration.mp4",
        caption:
          "<strong>The Guest Experience:</strong><br> Before logging in, users can explore the platform with clear calls-to-action to join or sign in.",
      },
      {
        videoSrc: "assets/videos/linker-player-profile-setup.mp4",
        caption:
          "<strong>The Player Experience:</strong><br> Players have a clean and focused profile, providing a simple and straightforward user experience.",
      },
      {
        videoSrc: "assets/videos/linker-coach-profile-setup.mp4",
        caption:
          "<strong>The Coach Experience:</strong><br> Coaches can build a rich, detailed profile to showcase their expertise, including a bio, qualifications, and experience.",
      },
    ],
    searchFilterGalleryData: [
      {
        videoSrc: "assets/videos/linker-search-sort.mp4",
        caption:
          "<strong>Live Search & Sort:</strong><br>Users can instantly find coaches by name and sort the results by criteria like rating or experience.",
      },
      {
        videoSrc: "assets/videos/linker-filtering.mp4",
        caption:
          "<strong>Multi-Layered Filtering:</strong><br>The experience can be refined by applying multiple filters like sport, location, and skill level to pinpoint the ideal coach.",
      },
      {
        videoSrc: "assets/videos/linker-empty-state.mp4",
        caption:
          '<strong>Helpful "No Results" State:</strong><br>When a search yields no results, a clear and friendly empty state screen is displayed to guide the user.',
      },
    ],
    becomeCoachGalleryData: [
      {
        videoSrc: "assets/videos/linker-become-coach-application.mp4",
        caption:
          "<strong>Step 1: The Application.</strong><br>A seamless, multi-step form allows players to apply for a coaching role, including secure document uploads for verification.",
      },
      {
        videoSrc: "assets/videos/linker-become-coach-admin-approval.mp4",
        caption:
          "<strong>Step 2: Admin Verification.</strong><br>A dedicated and secure admin panel is used to review applications and documents, ensuring the quality and safety of the coaching community.",
      },
      {
        videoSrc: "assets/videos/linker-become-coach-transformation.mp4",
        caption:
          "<strong>Step 3: The Account Upgrade.</strong><br>Upon admin approval, the user's account is instantly upgraded. Their UI transforms, and they unlock powerful new coach-specific features.",
      },
    ],
    sessionGalleryData: [
      {
        videoSrc: "assets/videos/linker-session-creation.mp4",
        caption:
          "<strong>Step 1: Coach Creates a Session.</strong><br>Coaches can effortlessly offer their services by creating and publishing detailed training sessions for players to discover.",
      },
      {
        videoSrc: "assets/videos/linker-session-enrollment.mp4",
        caption:
          "<strong>Step 2: Player Enrolls in the Session.</strong><br>Players can browse, view details, and seamlessly enroll in sessions, completing the core connection that the platform provides.",
      },
      {
        videoSrc: "assets/videos/linker-players-Joined.mp4",
        caption:
          "<strong>State Synchronization:</strong><br>Providing immediate confirmation for the coach, the session view is dynamically updated the moment a player enrolls. This real-time data handling ensures coaches always have an up-to-date roster of participants.",
    
      },
    ],
    staticImageData: {
      sessionSync: {
        caption:
          "<strong>State Synchronization:</strong><br>Providing immediate confirmation for the coach, the session view is dynamically updated the moment a player enrolls. This real-time data handling ensures coaches always have an up-to-date roster of participants.",
      },
    },
  },
  // Text specific to the semantic-cut.html page
  semanticCutPage: {
    pageTitle: "Project Details: SemanticCut AI",
    headerTitle: "SemanticCut AI: Automated Multilingual Video Production Pipeline",
    headerSubtitle: "Intelligent End-to-End AI Video Engineering System",
    headerDescription:
      "A cutting-edge Python & AI automation pipeline that cuts hours of manual video editing into minutes. It ingests raw episode video footage and a summarized text script, automatically producing high-retention multilingual short-form videos (Shorts/Reels) in 4 languages: English, Arabic, Spanish, and Portuguese.",
    problemTitle: "⚠️ The Challenge / Problem",
    problemDescription:
      "Manually editing and summarizing cartoon episodes demands hours of tedious work: slicing silences, millisecond subtitle alignment, scouring raw footage for the right scene to match each line, and engineering comedic sound effects.",
    solutionTitle: "💡 The Solution",
    solutionDescription:
      "This system converts raw episode footage + a summarized text script into an authentic, multi-track Adobe Premiere Pro project (XML) with a single command. It harnesses Google Gemini for conversational context understanding and semantic scene matching (Semantic Video Mapping), generates voiceovers in 4 languages, extracts millisecond-accurate synchronized captions via WhisperX, and overlays comedic sound effects automatically (AI SFX). The result? Viral-ready content with near-zero human intervention.",
    techStackHeading: "Technologies & Architecture Stack",
    demoVideoHeading: "🎬 Live Demonstration & Output Showcase",
    demoVideoDescription:
      "Watch the end-to-end automated workflow and the produced short-form content with multi-track Premiere Pro timeline alignment.",
    flowchartHeading: "🗺️ System Architecture & Workflow Pipeline",
    flowchartDescription:
      "Complete architectural diagram detailing data flow from raw inputs through WhisperX, Google Gemini, and Groq to the final Premiere XML multi-track assembly.",
    openFullDiagramBtn: "View Full High-Res Diagram",
    deepDiveHeading: "🔬 Technical Deep Dive (Hacker Breakdown)",
    deepDiveIntro:
      "🎬 Core Pipeline Concept: An architectural breakdown of how SemanticCut AI orchestrates audio processing, computer vision reasoning, and timeline XML generation.",
    stage1Title: "STAGE 1 · Raw Inputs & Ingestion",
    stage1Desc:
      "The system ingests the raw full-length video file (episode.mp4), text scripts across 4 target languages ([AR], [EN], [ES], [PT]), optional human studio recordings, cartoon sound effects library (bonk, boing, impacts), and the background music bed (BGM.wav).",
    stage2Title:
      "STAGE 2 · Raw Map Extraction & Timestamping (0_extract_raw_srt.py)",
    stage2Desc:
      "Utilizes WhisperX Large-v3 accelerated with float16 precision on an NVIDIA RTX 4070. Performs speech recognition and phoneme-level forced alignment on the raw video to construct raw_transcript.srt — the canonical spatial-temporal map of every dialogue and silence in the entire episode.",
    stage3Title:
      "STAGE 3 · Core Audio Engine & Multilingual Synchronization (auto_maker.py)",
    stage3Desc:
      "Three concurrent sub-engines guarantee rapid pacing and pitch-perfect sync: (3A) CapCut-Style Subtitle Scaling using Stable-Whisper for Arabic & WhisperX for other languages with mathematical speed-factor time division into sub_{lang}.srt and millisecond map sub_{lang}_sync.json. (3B) Fast & Snappy Voiceover with priority fallbacks to Google Gemini TTS tuned for Egyptian/character cadence, optimized through a Fast Pacing Engine (Pydub silence excision + FFmpeg speedup with pitch preservation). (3C) AI SFX Track driven by Groq API (Llama 3.3 70B) to classify comedic gags and punchlines, matching them with the sound library into SFX_Track_{lang}.wav.",
    stage4Title:
      "STAGE 4 · Semantic Video Mapping — The AI Brain (video_mapper.py)",
    stage4Desc:
      "The cognitive core of the system powered by Google Gemini — Shot Reasoning. Enforces three strict algorithmic heuristics: (1) Multi-episode trap rule to prevent context hallucination. (2) Hook rule (optimizing shot 0 for first 3-second viewer retention). (3) Action inference from context (aligning voiceover semantics with character physical gestures). Backed by a high-speed local cache (independent_langs_cache.json) to reuse matched visual sequences across all 4 languages instantly.",
    stage5Title: "STAGE 5 · XML Generation & Final Multi-Track Assembly",
    stage5Desc:
      "Synthesizes an industry-standard Adobe Premiere Pro XML sequence (23.976 FPS, 1080×1920 9:16 vertical shorts format). Generates a complete 5-layer timeline: Video Track V1 (cut and reframed episode shots), Video Track V2 (dynamic watermark overlay), Audio Track A1 (Voiceover boosted +5dB), Audio Track A2 (AI comedy SFX at -8dB), and Audio Track A3 (BGM bed at 0dB with speech ducking).",
    explainerHeading: "📺 Explainer Video & Deep Code Walkthrough",
    explainerDescription:
      "A comprehensive video walkthrough explaining the code structure, prompt engineering, and live Premiere XML timeline import.",
    watchOnVimeoBtn: "Watch Full Demo on Vimeo",
  },
};

// Alias for home.html page
translations.homePage = translations.indexPage;
