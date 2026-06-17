import React, { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    dashboard: 'Dashboard', vehicles: 'Vehicles', expenses: 'Expenses', services: 'Services',
    tires: 'Tires', insurance: 'Insurance', kteo: 'KTEO', documents: 'Documents',
    notes: 'Notes', reminders: 'Reminders', reports: 'Reports', settings: 'Settings',
    add: 'Add', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel',
    search: 'Search', filter: 'Filter', all: 'All', active: 'Active', expired: 'Expired',
    date: 'Date', amount: 'Amount', notes_label: 'Notes', category: 'Category',
    cost: 'Cost', mileage: 'Mileage', status: 'Status', actions: 'Actions',
    confirm_delete: 'Are you sure you want to delete this?', no_data: 'No data yet',
    loading: 'Loading...', total: 'Total', monthly: 'Monthly', annual: 'Annual',
    view_all: 'View All', back: 'Back',
    welcome_back: 'Welcome Back', total_vehicles: 'Total Vehicles',
    monthly_expenses: 'Monthly Expenses', annual_expenses: 'Annual Expenses',
    upcoming_reminders: 'Upcoming Reminders', recent_expenses: 'Recent Expenses',
    recent_services: 'Recent Services', expiring_soon: 'Expiring Soon',
    quick_actions: 'Quick Actions', add_expense: 'Add Expense',
    add_service: 'Add Service', add_vehicle: 'Add Vehicle',
    vehicle_name: 'Vehicle Name', registration_number: 'Registration Number',
    vin_number: 'VIN / Chassis Number', make: 'Make', model: 'Model', year: 'Year',
    fuel_type: 'Fuel Type', engine_capacity: 'Engine Capacity', horsepower: 'Horsepower',
    color: 'Color', purchase_date: 'Purchase Date', purchase_price: 'Purchase Price',
    current_mileage: 'Current Mileage', vehicle_photo: 'Vehicle Photo',
    car: 'Car', motorcycle: 'Motorcycle', vehicle_details: 'Vehicle Details',
    gasoline: 'Gasoline', diesel: 'Diesel', electric: 'Electric', hybrid: 'Hybrid',
    lpg: 'LPG', cng: 'CNG',
    fuel: 'Fuel', service: 'Service', repairs: 'Repairs', tires_cat: 'Tires',
    insurance_cat: 'Insurance', kteo_cat: 'KTEO', tolls: 'Tolls',
    accessories: 'Accessories', other: 'Other',
    oil_change: 'Oil Change', filters: 'Filters', brake_service: 'Brake Service',
    battery_replacement: 'Battery Replacement', timing_belt: 'Timing Belt',
    ac_service: 'A/C Service', major_service: 'Major Service',
    service_center: 'Service Center', service_type: 'Service Type',
    service_history: 'Service History',
    tire_brand: 'Tire Brand', tire_model: 'Tire Model', tire_size: 'Tire Size',
    seasonal_type: 'Seasonal Type', installation_date: 'Installation Date',
    mileage_at_installation: 'Mileage at Installation',
    summer: 'Summer', winter: 'Winter', all_season: 'All Season',
    installation: 'Installation', rotation: 'Rotation', repair: 'Repair',
    replacement: 'Replacement',
    insurance_company: 'Insurance Company', policy_number: 'Policy Number',
    coverage_type: 'Coverage Type', start_date: 'Start Date',
    expiration_date: 'Expiration Date', basic: 'Basic', third_party: 'Third Party',
    comprehensive: 'Comprehensive', full: 'Full Coverage',
    days_remaining: 'days remaining',
    inspection_date: 'Inspection Date', result: 'Result', pass: 'Pass',
    minor_defects: 'Minor Defects', major_defects: 'Major Defects', fail: 'Fail',
    document_title: 'Document Title', document_category: 'Document Category',
    registration: 'Registration', service_invoice: 'Service Invoice',
    purchase: 'Purchase', warranty: 'Warranty', custom: 'Custom',
    upload_file: 'Upload File',
    title: 'Title', description: 'Description', priority: 'Priority',
    low: 'Low', medium: 'Medium', high: 'High', reminder_date: 'Reminder Date',
    overdue: 'Overdue', due_today: 'Due Today', upcoming: 'Upcoming', dismiss: 'Dismiss',
    expense_trends: 'Expense Trends', cost_per_vehicle: 'Cost Per Vehicle',
    category_breakdown: 'Category Breakdown', ownership_cost: 'Annual Ownership Cost',
    language: 'Language', theme: 'Theme', dark_mode: 'Dark Mode',
    light_mode: 'Light Mode', english: 'English', greek: 'Ελληνικά',
  },
  el: {
    dashboard: 'Πίνακας Ελέγχου', vehicles: 'Οχήματα', expenses: 'Έξοδα',
    services: 'Σέρβις', tires: 'Ελαστικά', insurance: 'Ασφάλεια', kteo: 'ΚΤΕΟ',
    documents: 'Έγγραφα', notes: 'Σημειώσεις', reminders: 'Υπενθυμίσεις',
    reports: 'Αναφορές', settings: 'Ρυθμίσεις',
    add: 'Προσθήκη', edit: 'Επεξεργασία', delete: 'Διαγραφή', save: 'Αποθήκευση',
    cancel: 'Ακύρωση', search: 'Αναζήτηση', filter: 'Φίλτρο', all: 'Όλα',
    active: 'Ενεργό', expired: 'Ληγμένο', date: 'Ημερομηνία', amount: 'Ποσό',
    notes_label: 'Σημειώσεις', category: 'Κατηγορία', cost: 'Κόστος',
    mileage: 'Χιλιόμετρα', status: 'Κατάσταση', actions: 'Ενέργειες',
    confirm_delete: 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό;',
    no_data: 'Δεν υπάρχουν δεδομένα', loading: 'Φόρτωση...', total: 'Σύνολο',
    monthly: 'Μηνιαία', annual: 'Ετήσια', view_all: 'Προβολή Όλων', back: 'Πίσω',
    welcome_back: 'Καλωσήρθατε', total_vehicles: 'Συνολικά Οχήματα',
    monthly_expenses: 'Μηνιαία Έξοδα', annual_expenses: 'Ετήσια Έξοδα',
    upcoming_reminders: 'Επερχόμενες Υπενθυμίσεις', recent_expenses: 'Πρόσφατα Έξοδα',
    recent_services: 'Πρόσφατα Σέρβις', expiring_soon: 'Λήγουν Σύντομα',
    quick_actions: 'Γρήγορες Ενέργειες', add_expense: 'Προσθήκη Εξόδου',
    add_service: 'Προσθήκη Σέρβις', add_vehicle: 'Προσθήκη Οχήματος',
    vehicle_name: 'Όνομα Οχήματος', registration_number: 'Αριθμός Κυκλοφορίας',
    vin_number: 'Αριθμός Πλαισίου', make: 'Μάρκα', model: 'Μοντέλο', year: 'Έτος',
    fuel_type: 'Τύπος Καυσίμου', engine_capacity: 'Κυβισμός',
    horsepower: 'Ιπποδύναμη', color: 'Χρώμα', purchase_date: 'Ημ/νία Αγοράς',
    purchase_price: 'Τιμή Αγοράς', current_mileage: 'Τρέχοντα Χιλιόμετρα',
    vehicle_photo: 'Φωτογραφία Οχήματος', car: 'Αυτοκίνητο',
    motorcycle: 'Μοτοσυκλέτα', vehicle_details: 'Στοιχεία Οχήματος',
    gasoline: 'Βενζίνη', diesel: 'Πετρέλαιο', electric: 'Ηλεκτρικό',
    hybrid: 'Υβριδικό', lpg: 'Υγραέριο', cng: 'Φυσικό Αέριο',
    fuel: 'Καύσιμα', service: 'Σέρβις', repairs: 'Επισκευές', tires_cat: 'Ελαστικά',
    insurance_cat: 'Ασφάλεια', kteo_cat: 'ΚΤΕΟ', tolls: 'Διόδια',
    accessories: 'Αξεσουάρ', other: 'Άλλο',
    oil_change: 'Αλλαγή Λαδιών', filters: 'Φίλτρα', brake_service: 'Σέρβις Φρένων',
    battery_replacement: 'Αλλαγή Μπαταρίας', timing_belt: 'Ιμάντας Χρονισμού',
    ac_service: 'Σέρβις A/C', major_service: 'Γενικό Σέρβις',
    service_center: 'Συνεργείο', service_type: 'Τύπος Σέρβις',
    service_history: 'Ιστορικό Σέρβις',
    tire_brand: 'Μάρκα Ελαστικών', tire_model: 'Μοντέλο Ελαστικών',
    tire_size: 'Διάσταση Ελαστικών', seasonal_type: 'Εποχιακός Τύπος',
    installation_date: 'Ημ/νία Τοποθέτησης',
    mileage_at_installation: 'Χλμ στην Τοποθέτηση',
    summer: 'Καλοκαιρινά', winter: 'Χειμερινά', all_season: 'Τεσσάρων Εποχών',
    installation: 'Τοποθέτηση', rotation: 'Εναλλαγή', repair: 'Επισκευή',
    replacement: 'Αντικατάσταση',
    insurance_company: 'Ασφαλιστική Εταιρεία', policy_number: 'Αριθμός Συμβολαίου',
    coverage_type: 'Τύπος Κάλυψης', start_date: 'Ημ/νία Έναρξης',
    expiration_date: 'Ημ/νία Λήξης', basic: 'Βασική', third_party: 'Τρίτων',
    comprehensive: 'Μικτή', full: 'Πλήρης Κάλυψη',
    days_remaining: 'ημέρες απομένουν',
    inspection_date: 'Ημ/νία Ελέγχου', result: 'Αποτέλεσμα', pass: 'Επιτυχία',
    minor_defects: 'Μικρές Ελλείψεις', major_defects: 'Σοβαρές Ελλείψεις',
    fail: 'Αποτυχία',
    document_title: 'Τίτλος Εγγράφου', document_category: 'Κατηγορία Εγγράφου',
    registration: 'Άδεια Κυκλοφορίας', service_invoice: 'Τιμολόγιο Σέρβις',
    purchase: 'Αγορά', warranty: 'Εγγύηση', custom: 'Προσαρμοσμένο',
    upload_file: 'Μεταφόρτωση Αρχείου',
    title: 'Τίτλος', description: 'Περιγραφή', priority: 'Προτεραιότητα',
    low: 'Χαμηλή', medium: 'Μεσαία', high: 'Υψηλή',
    reminder_date: 'Ημ/νία Υπενθύμισης',
    overdue: 'Εκπρόθεσμα', due_today: 'Λήγει Σήμερα', upcoming: 'Επερχόμενα',
    dismiss: 'Απόρριψη',
    expense_trends: 'Τάσεις Εξόδων', cost_per_vehicle: 'Κόστος ανά Όχημα',
    category_breakdown: 'Ανάλυση Κατηγοριών',
    ownership_cost: 'Ετήσιο Κόστος Ιδιοκτησίας',
    language: 'Γλώσσα', theme: 'Θέμα', dark_mode: 'Σκοτεινή Λειτουργία',
    light_mode: 'Φωτεινή Λειτουργία', english: 'English', greek: 'Ελληνικά',
  }
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => localStorage.getItem('app_locale') || 'en');

  const switchLocale = useCallback((newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('app_locale', newLocale);
  }, []);

  const t = useCallback((key) => {
    return translations[locale]?.[key] || translations.en[key] || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, switchLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}