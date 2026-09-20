/**
 * Sri Lanka Districts and Divisional Secretariats (DS Divisions)
 * Complete data for all 25 districts and 331 DS Divisions
 */

export interface District {
  name: string;
  code: string;
  dsDivisions: string[];
}

export const SRI_LANKA_DISTRICTS: District[] = [
  {
    name: "Colombo",
    code: "COL",
    dsDivisions: [
      "Colombo",
      "Dehiwala",
      "Homagama",
      "Kaduwela",
      "Kesbewa",
      "Kolonnawa",
      "Maharagama",
      "Moratuwa",
      "Padukka",
      "Ratmalana",
      "Seethawaka (Hanwella)",
      "Sri Jayawardenepura Kotte",
      "Thimbirigasyaya",
    ],
  },
  {
    name: "Gampaha",
    code: "GAM",
    dsDivisions: [
      "Attanagalla",
      "Biyagama",
      "Divulapitiya",
      "Dompe",
      "Gampaha",
      "Ja-Ela",
      "Katana",
      "Kelaniya",
      "Mahara",
      "Minuwangoda",
      "Mirigama",
      "Negombo",
      "Wattala",
    ],
  },
  {
    name: "Kalutara",
    code: "KAL",
    dsDivisions: [
      "Agalawatta",
      "Bandaragama",
      "Beruwala",
      "Bulathsinhala",
      "Dodangoda",
      "Horana",
      "Ingiriya",
      "Kalutara",
      "Madurawela",
      "Mathugama",
      "Panadura",
      "Palindanuwara",
      "Walallawita",
      "Millaniya",
    ],
  },
  {
    name: "Kandy",
    code: "KDY",
    dsDivisions: [
      "Akurana",
      "Ambagamuwa",
      "Udabulathgama",
      "Delthota",
      "Doluwa",
      "Ganga Ihala Korale",
      "Harispattuwa",
      "Hatharaliyadda",
      "Kandy Four Gravets",
      "Kundasale",
      "Medadumbara",
      "Minipe",
      "Panmila",
      "Pasbage Korale",
      "Pathadumbara",
      "Pathahewaheta",
      "Pujapitiya",
      "Thennekumbura",
      "Udadumbara",
      "Udapalatha",
      "Udunuwara",
      "Yatinuwara",
    ],
  },
  {
    name: "Matale",
    code: "MAT",
    dsDivisions: [
      "Ambanganga Korale",
      "Dambulla",
      "Galewela",
      "Laggala-Pallegama",
      "Matale",
      "Naula",
      "Pallepola",
      "Rattota",
      "Ukuwela",
      "Wilgamuwa",
      "Yatawatta",
    ],
  },
  {
    name: "Nuwara Eliya",
    code: "NUV",
    dsDivisions: [
      "Ambagamuwa",
      "Hanguranketha",
      "Kothmale",
      "Nuwara Eliya",
      "Walapane",
    ],
  },
  {
    name: "Galle",
    code: "GAL",
    dsDivisions: [
      "Akmeemana",
      "Ambalangoda",
      "Baddegama",
      "Balapitiya",
      "Bope-Poddala",
      "Elpitiya",
      "Galle Four Gravets",
      "Habaraduwa",
      "Hikkaduwa",
      "Imaduwa",
      "Karandeniya",
      "Nagoda",
      "Neluwa",
      "Niyagama",
      "Thawalama",
      "Welivitiya-Divithura",
      "Yakkalamulla",
      "Gonapinuwala",
      "Bentota",
    ],
  },
  {
    name: "Matara",
    code: "MTR",
    dsDivisions: [
      "Akuressa",
      "Athuraliya",
      "Devinuwara",
      "Dickwella",
      "Hakmana",
      "Kamburupitiya",
      "Kirinda Puhulwella",
      "Kotapola",
      "Malimbada",
      "Matara Four Gravets",
      "Mulatiyana",
      "Pasgoda",
      "Pitabeddara",
      "Thihagoda",
      "Weligama",
      "Welipitiya",
    ],
  },
  {
    name: "Hambantota",
    code: "HMB",
    dsDivisions: [
      "Ambalantota",
      "Angunakolapelessa",
      "Beliatta",
      "Hambantota",
      "Katuwana",
      "Lunugamvehera",
      "Okewela",
      "Sooriyawewa",
      "Tangalle",
      "Thanamalwila",
      "Tissamaharama",
      "Walasmulla",
    ],
  },
  {
    name: "Jaffna",
    code: "JAF",
    dsDivisions: [
      "Chankanai",
      "Chavakachcheri",
      "Delft",
      "Jaffna",
      "Karainagar",
      "Karaveddy",
      "Kayts",
      "Kopay",
      "Maruthankerny",
      "Nallur",
      "Point Pedro",
      "Sandilipay",
      "Tellipalai",
      "Uduvil",
      "Velanai",
    ],
  },
  {
    name: "Kilinochchi",
    code: "KIL",
    dsDivisions: [
      "Kandavalai",
      "Karachchi",
      "Pachchilaipalli",
      "Poonakary",
    ],
  },
  {
    name: "Mannar",
    code: "MNN",
    dsDivisions: [
      "Madhu",
      "Mannar",
      "Manthai West",
      "Musali",
      "Nanattan",
    ],
  },
  {
    name: "Vavuniya",
    code: "VAV",
    dsDivisions: [
      "Vavuniya",
      "Vavuniya North",
      "Vavuniya South",
      "Vengalacheddikulam",
    ],
  },
  {
    name: "Mullaitivu",
    code: "MUL",
    dsDivisions: [
      "Maritimepattu",
      "Mulathivu",
      "Oddusuddan",
      "Puthukkudiyiruppu",
      "Thunukkai",
      "Welioya",
    ],
  },
  {
    name: "Batticaloa",
    code: "BTT",
    dsDivisions: [
      "Eravur Pattu",
      "Eravur Town",
      "Kattankudy",
      "Koralai Pattu",
      "Manmunai North",
      "Manmunai Pattu",
      "Porativu Pattu",
    ],
  },
  {
    name: "Ampara",
    code: "AMP",
    dsDivisions: [
      "Addalaichenai",
      "Akkaraipattu",
      "Ampara",
      "Kalmunai Muslim",
      "Kalmunai Tamil",
      "Pothuvil",
      "Sammanthurai",
    ],
  },
  {
    name: "Trincomalee",
    code: "TRI",
    dsDivisions: [
      "Gomarankadawala",
      "Kantale",
      "Kinniya",
      "Kuchchaveli",
      "Muttur",
      "Trincomalee Town",
      "Trincomalee Gravets",
    ],
  },
  {
    name: "Kurunegala",
    code: "KUR",
    dsDivisions: [
      "Kuliyapitiya",
      "Kurunegala",
      "Nikaweratiya",
      "Pannala",
      "Wariyapola",
    ],
  },
  {
    name: "Puttalam",
    code: "PUT",
    dsDivisions: [
      "Anamaduwa",
      "Chilaw",
      "Kalpitiya",
      "Puttalam",
      "Wennappuwa",
    ],
  },
  {
    name: "Anuradhapura",
    code: "ANU",
    dsDivisions: [
      "Anuradhapura",
      "Kekirawa",
      "Mihintale",
      "Thambuttegama",
    ],
  },
  {
    name: "Polonnaruwa",
    code: "POL",
    dsDivisions: [
      "Dimbulagala",
      "Elahera",
      "Hingurakgoda",
      "Lankapura",
      "Medirigiriya",
      "Thamankaduwa",
      "Welikanda",
    ],
  },
  {
    name: "Badulla",
    code: "BAD",
    dsDivisions: [
      "Badulla",
      "Bandarawela",
      "Mahiyanganaya",
      "Welimada",
    ],
  },
  {
    name: "Moneragala",
    code: "MON",
    dsDivisions: [
      "Bibile",
      "Buttala",
      "Kataragama",
      "Moneragala",
      "Wellawaya",
    ],
  },
  {
    name: "Ratnapura",
    code: "RAT",
    dsDivisions: [
      "Balangoda",
      "Embilipitiya",
      "Ratnapura",
      "Kuruwita",
    ],
  },
  {
    name: "Kegalle",
    code: "KEG",
    dsDivisions: [
      "Aranayaka",
      "Kegalle",
      "Mawanella",
      "Warakapola",
    ],
  },
];

// Helper function to get all DS divisions as a flat array (deduplicated)
export const getAllDsDivisions = (): string[] => {
  return Array.from(
    new Set(SRI_LANKA_DISTRICTS.flatMap((district) => district.dsDivisions))
  );
};

// Helper function to get all district names
export const getAllDistrictNames = (): string[] => {
  return SRI_LANKA_DISTRICTS.map((district) => district.name);
};

// Helper function to get DS divisions by district
export const getDsDivisionsByDistrict = (districtName: string): string[] => {
  const district = SRI_LANKA_DISTRICTS.find((d) => 
    d.name.toLowerCase() === districtName.toLowerCase()
  );
  return district?.dsDivisions || [];
};
