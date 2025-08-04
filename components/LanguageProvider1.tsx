import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';

export type LanguageCode = 'en' | 'ru' | 'es' | 'fr' | 'de';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const availableLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

// Переводы для всего приложения
const translations: Record<LanguageCode, any> = {
  en: {
    common: {
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
    },
    today: {
      title: 'Good day, beautiful soul 🌸',
      subtitle: 'Take it one step at a time',
      subtitleSnoozed: 'You\'re taking a gentle break today',
      snoozeToday: 'Snooze Today',
      resumeToday: 'Resume Today',
      tinyVictories: 'Tiny Victories',
      morningRoutine: 'Morning Routine',
      eveningRoutine: 'Evening Routine',
      todaysProgress: 'Today\'s Progress',
      morning: 'Morning',
      evening: 'Evening',
      addNewStep: 'Add New Step',
      editStep: 'Edit Step',
      enterGentleStep: 'Enter a gentle step...',
      addStep: 'Add Step',
      deleteStep: 'Delete Step',
      deleteStepConfirm: 'Are you sure you want to delete this step?',
      defaultMorning: {
        stretch: 'Gentle stretch or movement',
        breathing: 'Mindful breathing (2 minutes)',
        intention: 'Set one gentle intention for today',
      },
      defaultEvening: {
        reflect: 'Reflect on one positive moment',
        selfCare: 'Gentle self-care activity',  
        prepare: 'Prepare for tomorrow with kindness',
      },
    },
    settings: {
      title: 'Settings & About ⚙️',
      appPreferences: 'App Preferences',
      messyMode: {
        title: 'Messy mode',
        description: 'Shuffle colors of the current theme',
      },
      language: {
        title: 'Language',
        currently: 'Currently',
        selectLanguage: 'Select Language',
      },
      account: 'Account',
      connectGoogle: {
        title: 'Connect Google Account',
        description: 'Sync progress and tasks',
      },
      manageProfile: {
        title: 'Manage Profile',
        description: 'View or edit user details',
      },
      contactSupport: 'Contact & Support',
      contactCreator: {
        title: 'Contact the Creator',
        description: 'Text me',
      },
      supportApp: {
        title: 'Support this app',
        description: 'Send a magical donation 💰',
      },
    },
  },
  ru: {
    common: {
      cancel: 'Отмена',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Изменить',
      add: 'Добавить',
      close: 'Закрыть',
      confirm: 'Подтвердить',
      yes: 'Да',
      no: 'Нет',
    },
    today: {
      title: 'Доброго дня, прекрасная душа 🌸',
      subtitle: 'Делай шаг за шагом',
      subtitleSnoozed: 'Сегодня ты мягко отдыхаешь',
      snoozeToday: 'Отложить на сегодня',
      resumeToday: 'Продолжить сегодня',
      tinyVictories: 'Маленькие победы',
      morningRoutine: 'Утренняя рутина',
      eveningRoutine: 'Вечерняя рутина',
      todaysProgress: 'Прогресс сегодня',
      morning: 'Утро',
      evening: 'Вечер',
      addNewStep: 'Добавить новый шаг',
      editStep: 'Изменить шаг',
      enterGentleStep: 'Введите мягкий шаг...',
      addStep: 'Добавить шаг',
      deleteStep: 'Удалить шаг',
      deleteStepConfirm: 'Вы уверены, что хотите удалить этот шаг?',
      defaultMorning: {
        stretch: 'Мягкая растяжка или движение',
        breathing: 'Осознанное дыхание (2 минуты)',
        intention: 'Поставь одно мягкое намерение на сегодня',
      },
      defaultEvening: {
        reflect: 'Подумай об одном позитивном моменте',
        selfCare: 'Мягкая забота о себе',
        prepare: 'Подготовься к завтрашнему дню с добротой',
      },
    },
    settings: {
      title: 'Детали и настройки ⚙️',
      appPreferences: 'Настройки',
      messyMode: {
        title: 'Хаотичный режим',
        description: 'Перемешать цвета текущей темы',
      },
      language: {
        title: 'Язык',
        currently: 'Текущий',
        selectLanguage: 'Выбрать язык',
      },
      account: 'Аккаунт',
      connectGoogle: {
        title: 'Подключить Google аккаунт',
        description: 'Синхронизировать прогресс и задачи',
      },
      manageProfile: {
        title: 'Управление профилем',
        description: 'Просмотр и редактирование данных',
      },
      contactSupport: 'Контакты и поддержка',
      contactCreator: {
        title: 'Связаться с создателем',
        description: 'Напишите мне',
      },
      supportApp: {
        title: 'Поддержать приложение',
        description: 'Отправить магическое пожертвование 💰',
      },
    },
  },
  es: {
    common: {
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Añadir',
      close: 'Cerrar',
      confirm: 'Confirmar',
      yes: 'Sí',
      no: 'No',
    },
    today: {
      title: 'Buen día, alma hermosa 🌸',
      subtitle: 'Ve paso a paso',
      subtitleSnoozed: 'Te estás tomando un descanso suave hoy',
      snoozeToday: 'Aplazar hoy',
      resumeToday: 'Reanudar hoy',
      tinyVictories: 'Pequeñas victorias',
      morningRoutine: 'Rutina matutina',
      eveningRoutine: 'Rutina nocturna',
      todaysProgress: 'Progreso de hoy',
      morning: 'Mañana',
      evening: 'Noche',
      addNewStep: 'Añadir nuevo paso',
      editStep: 'Editar paso',
      enterGentleStep: 'Introduce un paso suave...',
      addStep: 'Añadir paso',
      deleteStep: 'Eliminar paso',
      deleteStepConfirm: '¿Estás seguro de que quieres eliminar este paso?',
      defaultMorning: {
        stretch: 'Estiramiento suave o movimiento',
        breathing: 'Respiración consciente (2 minutos)',
        intention: 'Establece una intención suave para hoy',
      },
      defaultEvening: {
        reflect: 'Reflexiona sobre un momento positivo',
        selfCare: 'Actividad suave de autocuidado',
        prepare: 'Prepárate para mañana con bondad',
      },
    },
    settings: {
      title: 'Configuración y Acerca de ⚙️',
      appPreferences: 'Preferencias de la aplicación',
      messyMode: {
        title: 'Modo caótico',
        description: 'Mezclar colores del tema actual',
      },
      language: {
        title: 'Idioma',
        currently: 'Actual',
        selectLanguage: 'Seleccionar idioma',
      },
      account: 'Cuenta',
      connectGoogle: {
        title: 'Conectar cuenta de Google',
        description: 'Sincronizar progreso y tareas',
      },
      manageProfile: {
        title: 'Gestionar perfil',
        description: 'Ver o editar detalles del usuario',
      },
      contactSupport: 'Contacto y soporte',
      contactCreator: {
        title: 'Contactar al creador',
        description: 'Escríbeme',
      },
      supportApp: {
        title: 'Apoyar esta aplicación',
        description: 'Enviar una donación mágica 💰',
      },
    },
  },
  fr: {
    common: {
      cancel: 'Annuler',
      save: 'Sauvegarder',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      close: 'Fermer',
      confirm: 'Confirmer',
      yes: 'Oui',
      no: 'Non',
    },
    today: {
      title: 'Bonne journée, belle âme 🌸',
      subtitle: 'Prends-le étape par étape',
      subtitleSnoozed: 'Tu prends une pause douce aujourd\'hui',
      snoozeToday: 'Reporter aujourd\'hui',
      resumeToday: 'Reprendre aujourd\'hui',
      tinyVictories: 'Petites victoires',
      morningRoutine: 'Routine matinale',
      eveningRoutine: 'Routine du soir',
      todaysProgress: 'Progrès d\'aujourd\'hui',
      morning: 'Matin',
      evening: 'Soir',
      addNewStep: 'Ajouter une nouvelle étape',
      editStep: 'Modifier l\'étape',
      enterGentleStep: 'Entrez une étape douce...',
      addStep: 'Ajouter l\'étape',
      deleteStep: 'Supprimer l\'étape',
      deleteStepConfirm: 'Êtes-vous sûr de vouloir supprimer cette étape?',
      defaultMorning: {
        stretch: 'Étirement doux ou mouvement',
        breathing: 'Respiration consciente (2 minutes)',
        intention: 'Fixe une intention douce pour aujourd\'hui',
      },
      defaultEvening: {
        reflect: 'Réfléchis à un moment positif',
        selfCare: 'Activité douce de soin de soi',
        prepare: 'Prépare-toi pour demain avec bienveillance',
      },
    },
    settings: {
      title: 'Paramètres et À propos ⚙️',
      appPreferences: 'Préférences de l\'application',
      messyMode: {
        title: 'Mode désordonné',
        description: 'Mélanger les couleurs du thème actuel',
      },
      language: {
        title: 'Langue',
        currently: 'Actuellement',
        selectLanguage: 'Sélectionner la langue',
      },
      account: 'Compte',
      connectGoogle: {
        title: 'Connecter le compte Google',
        description: 'Synchroniser les progrès et les tâches',
      },
      manageProfile: {
        title: 'Gérer le profil',
        description: 'Voir ou modifier les détails de l\'utilisateur',
      },
      contactSupport: 'Contact et support',
      contactCreator: {
        title: 'Contacter le créateur',
        description: 'Écrivez-moi',
      },
      supportApp: {
        title: 'Soutenir cette application',
        description: 'Envoyer un don magique 💰',
      },
    },
  },
  de: {
    common: {
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      close: 'Schließen',
      confirm: 'Bestätigen',
      yes: 'Ja',
      no: 'Nein',
    },
    today: {
      title: 'Guten Tag, schöne Seele 🌸',
      subtitle: 'Nimm es Schritt für Schritt',
      subtitleSnoozed: 'Du machst heute eine sanfte Pause',
      snoozeToday: 'Heute verschieben',
      resumeToday: 'Heute fortsetzen',
      tinyVictories: 'Kleine Siege',
      morningRoutine: 'Morgenroutine',
      eveningRoutine: 'Abendroutine',
      todaysProgress: 'Heutiger Fortschritt',
      morning: 'Morgen',
      evening: 'Abend',
      addNewStep: 'Neuen Schritt hinzufügen',
      editStep: 'Schritt bearbeiten',
      enterGentleStep: 'Geben Sie einen sanften Schritt ein...',
      addStep: 'Schritt hinzufügen',
      deleteStep: 'Schritt löschen',
      deleteStepConfirm: 'Sind Sie sicher, dass Sie diesen Schritt löschen möchten?',
      defaultMorning: {
        stretch: 'Sanfte Dehnung oder Bewegung',
        breathing: 'Achtsames Atmen (2 Minuten)',
        intention: 'Setze eine sanfte Absicht für heute',
      },
      defaultEvening: {
        reflect: 'Denke über einen positiven Moment nach',
        selfCare: 'Sanfte Selbstfürsorge-Aktivität',
        prepare: 'Bereite dich mit Güte auf morgen vor',
      },
    },
    settings: {
      title: 'Einstellungen & Über ⚙️',
      appPreferences: 'App-Einstellungen',
      messyMode: {
        title: 'Chaotischer Modus',
        description: 'Farben des aktuellen Themas mischen',
      },
      language: {
        title: 'Sprache',
        currently: 'Aktuell',
        selectLanguage: 'Sprache auswählen',
      },
      account: 'Konto',
      connectGoogle: {
        title: 'Google-Konto verbinden',
        description: 'Fortschritt und Aufgaben synchronisieren',
      },
      manageProfile: {
        title: 'Profil verwalten',
        description: 'Benutzerdaten anzeigen oder bearbeiten',
      },
      contactSupport: 'Kontakt & Support',
      contactCreator: {
        title: 'Ersteller kontaktieren',
        description: 'Schreiben Sie mir',
      },
      supportApp: {
        title: 'Diese App unterstützen',
        description: 'Eine magische Spende senden 💰',
      },
    },
  },
};

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (path: string, params?: Record<string, any>) => string;
  availableLanguages: Language[];
  getCurrentLanguage: () => Language;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
        setCurrentLanguage(savedLanguage as LanguageCode);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (language: LanguageCode) => {
    try {
      setCurrentLanguage(language);
      await AsyncStorage.setItem('selectedLanguage', language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Функция для получения переводов по пути (например: "today.title" или "common.save")
  const t = (path: string, params?: Record<string, any>): string => {
    const keys = path.split('.');
    let value: any = translations[currentLanguage];
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return `Missing translation: ${path}`;
          }
        }
        break;
      }
    }
    
    if (typeof value !== 'string') {
      return `Invalid translation path: ${path}`;
    }
    
    // Simple parameter replacement
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return params[key] !== undefined ? String(params[key]) : match;
      });
    }
    
    return value;
  };

  const getCurrentLanguage = (): Language => {
    return availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        availableLanguages,
        getCurrentLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};