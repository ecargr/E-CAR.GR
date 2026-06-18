/**
 * Comprehensive car makes and models database.
 * Grouped for display, each make has a list of common models.
 */

export const carMakes = [
  // European - German
  { make: 'Audi', country: 'Germany' },
  { make: 'BMW', country: 'Germany' },
  { make: 'Mercedes-Benz', country: 'Germany' },
  { make: 'Opel', country: 'Germany' },
  { make: 'Porsche', country: 'Germany' },
  { make: 'Volkswagen', country: 'Germany' },

  // European - French
  { make: 'Citroën', country: 'France' },
  { make: 'Peugeot', country: 'France' },
  { make: 'Renault', country: 'France' },

  // European - Italian
  { make: 'Alfa Romeo', country: 'Italy' },
  { make: 'Ferrari', country: 'Italy' },
  { make: 'Fiat', country: 'Italy' },
  { make: 'Lamborghini', country: 'Italy' },
  { make: 'Lancia', country: 'Italy' },
  { make: 'Maserati', country: 'Italy' },

  // European - British
  { make: 'Aston Martin', country: 'UK' },
  { make: 'Bentley', country: 'UK' },
  { make: 'Jaguar', country: 'UK' },
  { make: 'Land Rover', country: 'UK' },
  { make: 'Lotus', country: 'UK' },
  { make: 'Mini', country: 'UK' },
  { make: 'Rolls-Royce', country: 'UK' },

  // European - Other
  { make: 'SEAT', country: 'Spain' },
  { make: 'Škoda', country: 'Czech Republic' },
  { make: 'Volvo', country: 'Sweden' },
  { make: 'Saab', country: 'Sweden' },

  // Japanese
  { make: 'Daihatsu', country: 'Japan' },
  { make: 'Honda', country: 'Japan' },
  { make: 'Infiniti', country: 'Japan' },
  { make: 'Lexus', country: 'Japan' },
  { make: 'Mazda', country: 'Japan' },
  { make: 'Mitsubishi', country: 'Japan' },
  { make: 'Nissan', country: 'Japan' },
  { make: 'Subaru', country: 'Japan' },
  { make: 'Suzuki', country: 'Japan' },
  { make: 'Toyota', country: 'Japan' },

  // Korean
  { make: 'Hyundai', country: 'South Korea' },
  { make: 'Kia', country: 'South Korea' },
  { make: 'SsangYong', country: 'South Korea' },

  // American
  { make: 'Buick', country: 'USA' },
  { make: 'Cadillac', country: 'USA' },
  { make: 'Chevrolet', country: 'USA' },
  { make: 'Chrysler', country: 'USA' },
  { make: 'Dodge', country: 'USA' },
  { make: 'Ford', country: 'USA' },
  { make: 'GMC', country: 'USA' },
  { make: 'Jeep', country: 'USA' },
  { make: 'Lincoln', country: 'USA' },
  { make: 'Ram', country: 'USA' },
  { make: 'Tesla', country: 'USA' },

  // Electric / New brands
  { make: 'BYD', country: 'China' },
  { make: 'Polestar', country: 'Sweden' },
  { make: 'Rivian', country: 'USA' },
  { make: 'Lucid', country: 'USA' },
];

// Models grouped by make
export const carModelsByMake = {
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'e-tron', 'e-tron GT', 'TT', 'R8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM', 'Z4', 'i3', 'i4', 'i5', 'i7', 'iX', 'iX1', 'iX2', 'iX3', 'M2', 'M3', 'M4', 'M5', 'M8', 'X5 M', 'X6 M'],
  'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'EQV', 'SL', 'SLK', 'AMG GT', 'AMG One', 'V-Class', 'Vito', 'Sprinter'],
  'Opel': ['Corsa', 'Astra', 'Insignia', 'Grandland', 'Crossland', 'Mokka', 'Combo', 'Zafira', 'Vivaro', 'Rocks-e', 'Frontera'],
  'Porsche': ['718 Boxster', '718 Cayman', '911', 'Panamera', 'Macan', 'Cayenne', 'Taycan', 'Cayman', 'Boxster'],
  'Volkswagen': ['Golf', 'Polo', 'Tiguan', 'T-Roc', 'T-Cross', 'Passat', 'Arteon', 'Touran', 'Touareg', 'ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID.Buzz', 'Caddy', 'Transporter', 'Up!', 'Scirocco', 'Sharan'],

  'Citroën': ['C1', 'C3', 'C4', 'C5', 'C5 Aircross', 'C3 Aircross', 'C4 Cactus', 'Berlingo', 'Spacetourer', 'Jumpy', 'e-C4'],
  'Peugeot': ['108', '208', '308', '408', '508', '2008', '3008', '5008', 'Partner', 'Rifter', 'Traveller', 'e-208', 'e-2008', 'e-308'],
  'Renault': ['Clio', 'Megane', 'Talisman', 'Captur', 'Kadjar', 'Austral', 'Arkana', 'Espace', 'Scenic', 'Kangoo', 'Trafic', 'Zoe', 'Twingo', 'Megane E-Tech', 'Rafale'],

  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale', 'Giulietta', 'Mito'],
  'Ferrari': ['296 GTB', 'Roma', 'SF90 Stradale', '812 Superfast', 'F8 Tributo', 'Portofino', 'Purosangue', 'Daytona SP3'],
  'Fiat': ['500', 'Panda', 'Tipo', '500X', '500L', 'Doblo', 'Fiorino', 'Egea'],
  'Lamborghini': ['Huracán', 'Revuelto', 'Urus', 'Aventador'],
  'Lancia': ['Ypsilon', 'Delta', 'Flavia'],
  'Maserati': ['Ghibli', 'Quattroporte', 'Levante', 'Grecale', 'MC20', 'GranTurismo'],

  'Aston Martin': ['DB11', 'DB12', 'Vantage', 'DBS', 'DBX', 'Valhalla', 'Valkyrie'],
  'Bentley': ['Bentayga', 'Continental GT', 'Flying Spur', 'Bacalar'],
  'Jaguar': ['XE', 'XF', 'XJ', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Discovery', 'Discovery Sport', 'Defender'],
  'Lotus': ['Emira', 'Evija', 'Eletre', 'Emeya'],
  'Mini': ['Cooper', 'Cooper S', 'Countryman', 'Clubman', 'Cabrio', 'John Cooper Works'],
  'Rolls-Royce': ['Phantom', 'Ghost', 'Wraith', 'Dawn', 'Cullinan', 'Spectre'],

  'SEAT': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco', 'Mii', 'Cupra Formentor', 'Cupra Born', 'Cupra Leon', 'Cupra Ateca'],
  'Škoda': ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq', 'Scala'],
  'Volvo': ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60', 'V90', 'C40', 'EX30', 'EX90', 'EX40'],
  'Saab': ['9-3', '9-5', '9-7X'],

  'Daihatsu': ['Terios', 'Sirion', 'Copen', 'Cuore', 'YRV'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Jazz', 'Fit', 'City', 'Pilot', 'Insight', 'e', 'e:Ny1', 'NSX', 'S2000'],
  'Infiniti': ['Q30', 'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX60', 'QX80'],
  'Lexus': ['CT', 'IS', 'ES', 'GS', 'LS', 'LC', 'RC', 'UX', 'NX', 'RX', 'RZ', 'LX', 'LBX'],
  'Mazda': ['2', '3', '6', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-60', 'CX-80', 'CX-90', 'MX-5', 'MX-30'],
  'Mitsubishi': ['Mirage', 'Space Star', 'Lancer', 'ASX', 'Eclipse Cross', 'Outlander', 'Pajero', 'L200', 'Triton'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Ariya', 'Leaf', 'GT-R', '370Z', 'Navara', 'Pathfinder', 'Murano', 'Note'],
  'Subaru': ['Impreza', 'WRX', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'BRZ', 'Solterra', 'Ascent', 'XV'],
  'Suzuki': ['Swift', 'Ignis', 'Baleno', 'S-Cross', 'Vitara', 'Jimny', 'Across', 'Swace', 'Grand Vitara'],
  'Toyota': ['Aygo', 'Yaris', 'Corolla', 'Camry', 'Avensis', 'C-HR', 'RAV4', 'Highlander', 'Land Cruiser', 'Hilux', 'Proace', 'Supra', 'GR86', 'bZ4X', 'Prius', 'Yaris Cross', 'Corolla Cross'],

  'Hyundai': ['i10', 'i20', 'i30', 'Elantra', 'Sonata', 'Kona', 'Tucson', 'Santa Fe', 'Palisade', 'Bayon', 'Ioniq', 'Ioniq 5', 'Ioniq 6', 'Kona Electric', 'Staria', 'Stargazer'],
  'Kia': ['Picanto', 'Rio', 'Stonic', 'Ceed', 'Proceed', 'XCeed', 'Sportage', 'Sorento', 'Carnival', 'EV6', 'EV9', 'Niro', 'Niro EV', 'Soul', 'Telluride'],
  'SsangYong': ['Tivoli', 'Korando', 'Rexton', 'Musso', 'Torres'],

  'Buick': ['Encore', 'Encore GX', 'Envision', 'Enclave', 'LaCrosse'],
  'Cadillac': ['CT4', 'CT5', 'XT4', 'XT5', 'XT6', 'Escalade', 'Lyriq', 'Celestiq'],
  'Chevrolet': ['Spark', 'Aveo', 'Cruze', 'Malibu', 'Camaro', 'Corvette', 'Trax', 'Trailblazer', 'Equinox', 'Blazer', 'Traverse', 'Tahoe', 'Suburban', 'Silverado', 'Bolt', 'Bolt EUV', 'Volt'],
  'Chrysler': ['300', 'Pacifica', 'Voyager', 'Crossfire', 'PT Cruiser'],
  'Dodge': ['Challenger', 'Charger', 'Durango', 'Hornet', 'Ram'],
  'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Fusion', 'Mustang', 'Puma', 'EcoSport', 'Kuga', 'Explorer', 'Edge', 'Ranger', 'F-150', 'Bronco', 'Maverick', 'Mustang Mach-E', 'Tourneo', 'Transit'],
  'GMC': ['Terrain', 'Acadia', 'Yukon', 'Sierra', 'Canyon', 'Hummer EV'],
  'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator', 'Avenger', 'Wagoneer'],
  'Lincoln': ['Corsair', 'Nautilus', 'Aviator', 'Navigator'],
  'Ram': ['1500', '2500', '3500', 'ProMaster'],
  'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'],

  'BYD': ['Atto 3', 'Dolphin', 'Seal', 'Han', 'Tang', 'Song Plus', 'Yuan Plus'],
  'Polestar': ['2', '3', '4', '5'],
  'Rivian': ['R1T', 'R1S'],
  'Lucid': ['Air', 'Gravity'],
};

// Generic models for makes without a specific list
export const genericModels = [
  'Base', 'Sport', 'Comfort', 'Luxury', 'Premium', 'Business', 'Elegance',
  'GT', 'GTI', 'RS', 'AMG', 'S-Line', 'M-Sport', 'R-Line', 'ST-Line',
];

// Motorcycle makes
export const motorcycleMakes = [
  { make: 'Aprilia', country: 'Italy' },
  { make: 'Benelli', country: 'Italy' },
  { make: 'BMW Motorrad', country: 'Germany' },
  { make: 'CFMoto', country: 'China' },
  { make: 'Ducati', country: 'Italy' },
  { make: 'Harley-Davidson', country: 'USA' },
  { make: 'Honda', country: 'Japan' },
  { make: 'Husqvarna', country: 'Sweden' },
  { make: 'Indian', country: 'USA' },
  { make: 'Kawasaki', country: 'Japan' },
  { make: 'KTM', country: 'Austria' },
  { make: 'MV Agusta', country: 'Italy' },
  { make: 'Moto Guzzi', country: 'Italy' },
  { make: 'Piaggio', country: 'Italy' },
  { make: 'Royal Enfield', country: 'India' },
  { make: 'Suzuki', country: 'Japan' },
  { make: 'SYM', country: 'Taiwan' },
  { make: 'Triumph', country: 'UK' },
  { make: 'Vespa', country: 'Italy' },
  { make: 'Yamaha', country: 'Japan' },
  { make: 'Zero Motorcycles', country: 'USA' },
];

// Motorcycle models by make
export const motorcycleModelsByMake = {
  'Aprilia': ['RS 660', 'RSV4', 'Tuono', 'Tuareg', 'Shiver', 'Dorsoduro'],
  'Benelli': ['TRK 502', 'Leonino', 'Imperiale', 'BN 125', '302R'],
  'BMW Motorrad': ['R 1250 GS', 'R 1250 RT', 'R 18', 'S 1000 RR', 'F 850 GS', 'F 900 R', 'G 310 R', 'G 310 GS', 'K 1600', 'CE 04'],
  'Ducati': ['Panigale', 'Monster', 'Multistrada', 'Scrambler', 'Diavel', 'Streetfighter', 'Supersport', 'Hypermotard', 'DesertX'],
  'Harley-Davidson': ['Sportster', 'Softail', 'Touring', 'CVO', 'Fat Boy', 'Iron 883', 'Road King', 'Street Glide', 'Pan America', 'Nightster'],
  'Honda': ['CBR', 'CBF', 'CB', 'CRF', 'Africa Twin', 'X-ADV', 'Forza', 'SH', 'PCX', 'Gold Wing', 'Rebel', 'CB500F', 'NC750X', 'Transalp', 'NT1100'],
  'Husqvarna': ['Vitpilen', 'Svartpilen', 'Norden', 'TE', 'FE', '701', '501'],
  'Indian': ['Scout', 'Chief', 'Chieftain', 'Springfield', 'Pursuit', 'FTR'],
  'Kawasaki': ['Ninja', 'Z', 'Versys', 'Vulcan', 'KX', 'KLX', 'H2', 'Z900', 'Z650', 'Z400', 'Z125'],
  'KTM': ['Duke', 'RC', 'Adventure', 'Super Duke', 'EXC', 'Super Adventure', '890 Duke', '390 Duke', '1290 Super Duke'],
  'MV Agusta': ['Brutale', 'F3', 'Superveloce', 'Turismo Veloce', 'Dragster'],
  'Moto Guzzi': ['V7', 'V9', 'V85 TT', 'California', 'Stelvio', 'V100 Mandello'],
  'Piaggio': ['Beverly', 'Medley', 'Liberty', 'MP3'],
  'Royal Enfield': ['Classic', 'Bullet', 'Interceptor', 'Continental GT', 'Himalayan', 'Meteor', 'Super Meteor', 'Hunter', 'Scram 411'],
  'Suzuki': ['GSX-R', 'GSX-S', 'V-Strom', 'SV', 'Hayabusa', 'Katana', 'Boulevard', 'DR-Z', 'GSX-8S', 'GSX-8R'],
  'SYM': ['Symphony', 'Jet', 'Fiddle', 'Maxsym', 'Cruisym', 'Joymax'],
  'Triumph': ['Street Triple', 'Speed Triple', 'Tiger', 'Bonneville', 'Thruxton', 'Rocket 3', 'Scrambler', 'Trident', 'Speed 400'],
  'Vespa': ['Primavera', 'GTS', 'Sprint', 'LX', '946', 'Elettrica', 'Sei Giorni'],
  'Yamaha': ['MT', 'YZF', 'Tracer', 'Ténéré', 'XMAX', 'NMAX', 'TMAX', 'Bolt', 'MT-07', 'MT-09', 'MT-10', 'YZF-R1', 'YZF-R7', 'Tracer 9', 'Tracer 7'],
  'Zero Motorcycles': ['SR', 'SR/F', 'SR/S', 'DSR', 'FX', 'FXE'],
};

/**
 * Get makes based on vehicle type
 */
export function getMakesByType(type = 'car') {
  if (type === 'motorcycle') return motorcycleMakes.map(m => m.make);
  return carMakes.map(m => m.make);
}

/**
 * Get models for a specific make
 */
export function getModelsForMake(make, type = 'car') {
  if (type === 'motorcycle') {
    return motorcycleModelsByMake[make] || [];
  }
  return carModelsByMake[make] || [];
}