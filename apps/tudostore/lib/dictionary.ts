//lib\dictionary.ts
import "server-only";
import type { Locale } from "@/middleware";

// Definimos el tipo para nuestros diccionarios
export type Dictionary = {

  


  ctaSection: {
    title: string;
    description: string;
    freeTrialButton: string;
    viewPlansButton: string;
    noCommitment: string;
  };

  featureSection: {
    features: {
      icon: string;
      title: string;
      description: string;
    }[];
  };

  navbar: {
    searchClasses: string;
    pricing: string;
    about: string;
    login: string;
    signup: string;
    business: string;
  };

  searchClasses: {
    meta: {
      title: string;
      description: string;
    };
    filterBar: {
      location: string;
      searchLocation: string;
      searching: string;
      noLocationsFound: string;
      fitness: string;
      activities: string;
      facilities: string;
      distance: string;
      distanceRange: string;
      km: string;
      gymsIn: string;
      gymsAndFitness: string;
    };
    resultsPanel: {
      noResultsFound: string;
      selectLocation: string;
      adjustFilters: string;
      clearFilters: string;
      resultsFound: string;
    };
    map: {
      searchInArea: string;
      loadingMap: string;
      loadingResources: string;
      currentArea: string;
    };
    constants: {
      fitnessOptions: string[];
      activitiesOptions: string[];
      facilitiesOptions: string[];
    };
  };

  aboutpage: {
    metadata: {
      title: string;
      description: string;
    };
    madeToMove: {
      title: string;
      subtitle: string;
      paragraph1: string;
      paragraph2: string;
      paragraph3: string;
    };
    noStrings: {
      title: string;
      subtitle: string;
      paragraph1: string;
      paragraph2: string;
    };
    makeItHappen: {
      title: string;
      subtitle: string;
      paragraph1: string;
      paragraph2: string;
      paragraph3: string;
      discoverLink: string;
    };
  };

  business: {
    partnership: {
      title1: string;
      title2: string;
      title3: string;
      becomePartner: string;
      companiesText: string;
    };
    benefits: {
      title: string;
      titleHighlight: string;
      description: string;
      benefits: string[];
    };
    testimonials: {
      title: string;
      titleHighlight: string;
      description: string;
      testimonials: Array<{
        quote: string;
        author: string;
        position: string;
      }>;
    };
    cta: {
      title: string;
      titleHighlight: string;
      description: string;
      buttonText: string;
    };
  };

  pricing: {
    pricingHero: {
      title: string;
      description: string;
      monthlyButton: string;
      annualButton: string;
    };
  };

  saveMoney: {
    title: string;
    description: string;
    tryNowButton: string;
    yogaClass: string;
    day: string;
    time: string;
    instructor: string;
    credits: string;
    saveLabel: string;
    reserveButton: string;
  };
  howCredits: {
    title: string;
    description: string;
    yoga: string;
    pilates: string;
    hiit: string;
    spa: string;
    example: {
      title: string;
      description: string;
      hotYoga: string;
      strengthTraining: string;
      meditation: string;
      pilates: string;
      total: string;
    };
  };
  faq: {
    title: string;
    description: string;
    questions: {
      howItWorks: {
        question: string;
        answer: string;
      };
      cancelSubscription: {
        question: string;
        answer: string;
      };
      creditsExpire: {
        question: string;
        answer: string;
      };
      changePlan: {
        question: string;
        answer: string;
      };
      bookClass: {
        question: string;
        answer: string;
      };
      cancellationPolicy: {
        question: string;
        answer: string;
      };
      additionalFees: {
        question: string;
        answer: string;
      };
      shareCredits: {
        question: string;
        answer: string;
      };
    };
    stillQuestions: {
      title: string;
      description: string;
      contactButton: string;
    };
  };

  register: {
    title: string;
    description: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    terms: string;
    termsLink: string;
    privacyLink: string;
    termsAnd: string;
    signUpButton: string;
    haveAccount: string;
    logIn: string;
  };

  login: {
    title: string;
    description: string;
    email: string;
    password: string;
    forgotPassword: string;
    loginButton: string;
    noAccount: string;
    signUp: string;
  };

  hero: {
    title: string;
    slogan: string;
    bookClass: string;
    startHere: string;
  };

  discover: {
    title: string;
    description: string;
    fitness: {
      title: string;
      description: string;
      link: string;
    };
    wellness: {
      title: string;
      description: string;
      link: string;
    };
    beauty: {
      title: string;
      description: string;
      link: string;
    };
  };

  about: {
    title: string;
    subtitle: string;
    story: string;
    vision: {
      title: string;
      description: string;
    };
    team: {
      title: string;
      description: string;
    };
    values: {
      title: string;
      items: Array<{
        title: string;
        description: string;
      }>;
    };
    cta: string;
  };
};

// Importamos los diccionarios de forma dinámica
const dictionaries = {
  en: () =>
    import("@/dictionaries/en.json").then(
      (module) => module.default
    ) as Promise<Dictionary>,
  es: () =>
    import("@/dictionaries/es.json").then(
      (module) => module.default
    ) as Promise<Dictionary>,
};

export const getDictionary = async (locale: Locale) => {
  // Asegurar que locale es una clave válida (en | es)
  const safeLocale = locale in dictionaries ? locale : "en";
  return dictionaries[safeLocale as keyof typeof dictionaries]();
};
