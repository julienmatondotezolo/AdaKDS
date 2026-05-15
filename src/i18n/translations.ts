export type Locale = 'en' | 'fr' | 'nl';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'fr', 'nl'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  nl: 'Nederlands',
};

type Dict = Record<string, string>;

const en: Dict = {
  'header.live': 'LIVE',

  'columns.new': 'New',
  'columns.process': 'Process',
  'columns.ready': 'Ready',
  'columns.served': 'Served',

  'empty.new': 'No new orders',
  'empty.process': 'No orders in process',
  'empty.ready': 'No orders ready',
  'empty.served': 'No orders served',

  'card.start': 'Start',
  'card.finish': 'Finish',
  'card.serve': 'Serve Order',
  'card.orders': 'orders',
  'card.min': 'min',

  'customer.walkin': 'Walk-in',
  'customer.takeaway': 'Takeaway',
  'customer.delivery': 'Delivery',

  'footer.undo': 'Undo Last Action',

  'loading.title': 'Loading Kitchen Display',
  'loading.subtitle': 'Fetching orders...',

  'error.connection.title': 'Connection Error',
  'error.retry': 'Retry',

  'warning.disconnected': 'Disconnected from server — orders may not update in real-time',

  'settings.title': 'Settings',
  'settings.profile': 'Profile',
  'settings.stations': 'Stations',
  'settings.preferences': 'Preferences',
  'settings.language': 'Language',
  'settings.language.system': 'System (auto-detect)',
  'settings.language.description': 'Choose the display language for the kitchen display. By default it follows your browser language.',
  'settings.signout': 'Sign Out',
};

const fr: Dict = {
  'header.live': 'EN DIRECT',

  'columns.new': 'Nouveau',
  'columns.process': 'En cours',
  'columns.ready': 'Prêt',
  'columns.served': 'Servi',

  'empty.new': 'Aucune nouvelle commande',
  'empty.process': 'Aucune commande en cours',
  'empty.ready': 'Aucune commande prête',
  'empty.served': 'Aucune commande servie',

  'card.start': 'Démarrer',
  'card.finish': 'Terminer',
  'card.serve': 'Servir',
  'card.orders': 'commandes',
  'card.min': 'min',

  'customer.walkin': 'Sans réservation',
  'customer.takeaway': 'À emporter',
  'customer.delivery': 'Livraison',

  'footer.undo': 'Annuler la dernière action',

  'loading.title': 'Chargement de l’écran cuisine',
  'loading.subtitle': 'Récupération des commandes...',

  'error.connection.title': 'Erreur de connexion',
  'error.retry': 'Réessayer',

  'warning.disconnected': 'Déconnecté du serveur — les commandes peuvent ne pas se mettre à jour en temps réel',

  'settings.title': 'Paramètres',
  'settings.profile': 'Profil',
  'settings.stations': 'Stations',
  'settings.preferences': 'Préférences',
  'settings.language': 'Langue',
  'settings.language.system': 'Système (détection automatique)',
  'settings.language.description': 'Choisissez la langue d’affichage de l’écran cuisine. Par défaut, elle suit la langue du navigateur.',
  'settings.signout': 'Déconnexion',
};

const nl: Dict = {
  'header.live': 'LIVE',

  'columns.new': 'Nieuw',
  'columns.process': 'In behandeling',
  'columns.ready': 'Klaar',
  'columns.served': 'Geserveerd',

  'empty.new': 'Geen nieuwe bestellingen',
  'empty.process': 'Geen bestellingen in behandeling',
  'empty.ready': 'Geen bestellingen klaar',
  'empty.served': 'Geen bestellingen geserveerd',

  'card.start': 'Start',
  'card.finish': 'Voltooien',
  'card.serve': 'Serveren',
  'card.orders': 'bestellingen',
  'card.min': 'min',

  'customer.walkin': 'Inloop',
  'customer.takeaway': 'Afhalen',
  'customer.delivery': 'Bezorging',

  'footer.undo': 'Laatste actie ongedaan maken',

  'loading.title': 'Keukenscherm laden',
  'loading.subtitle': 'Bestellingen ophalen...',

  'error.connection.title': 'Verbindingsfout',
  'error.retry': 'Opnieuw proberen',

  'warning.disconnected': 'Verbinding met server verbroken — bestellingen worden mogelijk niet in realtime bijgewerkt',

  'settings.title': 'Instellingen',
  'settings.profile': 'Profiel',
  'settings.stations': 'Stations',
  'settings.preferences': 'Voorkeuren',
  'settings.language': 'Taal',
  'settings.language.system': 'Systeem (automatisch detecteren)',
  'settings.language.description': 'Kies de weergavetaal voor het keukenscherm. Standaard volgt het de taal van uw browser.',
  'settings.signout': 'Afmelden',
};

export const TRANSLATIONS: Record<Locale, Dict> = { en, fr, nl };

export type TranslationKey = keyof typeof en;
