translations = {
  // Common text used across all pages
  common: {
    seeMore: "See More",
    seeLess: "See Less",
    backToHome: "Back to Home",
  },
  // Text specific to the index.html page
  indexPage: {
    pageTitle: "Ahmed Mansour | Flutter Developer Portfolio",
    name: "Ahmed Mohamed Mansour",
    jobTitle: "Flutter Mobile Developer",
    bio: "Flutter Developer skilled in building responsive, high-performance mobile applications for both iOS and Android platforms. Proficient in Dart and Flutter, with a proven ability to deliver visually appealing and feature-rich apps. Regularly leverage AI tools to accelerate code writing and enhance problem-solving efficiency.",
    projectsTitle: "My Projects",
    contactMe: "Contact Me:",
    projectsData: [
      {
        title: "Linker EG",
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
          "Image Picker",
          "SharedPreferences",
          "Shimmer",
          "dart",
          "Geolocation",
          "Functional Programming (Dartz)",
          "SMS Autofill",
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
};
