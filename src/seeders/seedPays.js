const mongoose = require('mongoose');
const { Pays } = require('../pays/models/pays.model');
const { DB_MONGO_HOST, MONGO_DATABASE, DB_MONGO_PORT, DB_MONGO_USER, DB_MONGO_PASSWORD } = require('../config/connection');

const countries = [
    {
        "code": "AF",
        "nom": "Afghanistan",
        "capitale": "Kabul",
        "continent": "Asia",
        "devise": "AFN",
        "fuseau_horaire": "UTC+04:30"
    },
    {
        "code": "ZA",
        "nom": "Afrique du Sud",
        "capitale": "Pretoria",
        "continent": "Africa",
        "devise": "ZAR",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "AX",
        "nom": "Ahvenanmaa",
        "capitale": "Mariehamn",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "AL",
        "nom": "Albanie",
        "capitale": "Tirana",
        "continent": "Europe",
        "devise": "ALL",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "DZ",
        "nom": "Algérie",
        "capitale": "Algiers",
        "continent": "Africa",
        "devise": "DZD",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "DE",
        "nom": "Allemagne",
        "capitale": "Berlin",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "AD",
        "nom": "Andorre",
        "capitale": "Andorra la Vella",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "AO",
        "nom": "Angola",
        "capitale": "Luanda",
        "continent": "Africa",
        "devise": "AOA",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "AI",
        "nom": "Anguilla",
        "capitale": "The Valley",
        "continent": "Americas",
        "devise": "XCD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "AQ",
        "nom": "Antarctique",
        "capitale": "",
        "continent": "Antarctic",
        "devise": "",
        "fuseau_horaire": "UTC-03:00"
    },
    {
        "code": "AG",
        "nom": "Antigua-et-Barbuda",
        "capitale": "Saint John's",
        "continent": "Americas",
        "devise": "XCD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "SA",
        "nom": "Arabie Saoudite",
        "capitale": "Riyadh",
        "continent": "Asia",
        "devise": "SAR",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "AR",
        "nom": "Argentine",
        "capitale": "Buenos Aires",
        "continent": "Americas",
        "devise": "ARS",
        "fuseau_horaire": "UTC-03:00"
    },
    {
        "code": "AM",
        "nom": "Arménie",
        "capitale": "Yerevan",
        "continent": "Asia",
        "devise": "AMD",
        "fuseau_horaire": "UTC+04:00"
    },
    {
        "code": "AW",
        "nom": "Aruba",
        "capitale": "Oranjestad",
        "continent": "Americas",
        "devise": "AWG",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "AU",
        "nom": "Australie",
        "capitale": "Canberra",
        "continent": "Oceania",
        "devise": "AUD",
        "fuseau_horaire": "UTC+05:00"
    },
    {
        "code": "AT",
        "nom": "Autriche",
        "capitale": "Vienna",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "AZ",
        "nom": "Azerbaïdjan",
        "capitale": "Baku",
        "continent": "Asia",
        "devise": "AZN",
        "fuseau_horaire": "UTC+04:00"
    },
    {
        "code": "BS",
        "nom": "Bahamas",
        "capitale": "Nassau",
        "continent": "Americas",
        "devise": "BSD",
        "fuseau_horaire": "UTC-05:00"
    },
    {
        "code": "BH",
        "nom": "Bahreïn",
        "capitale": "Manama",
        "continent": "Asia",
        "devise": "BHD",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "BD",
        "nom": "Bangladesh",
        "capitale": "Dhaka",
        "continent": "Asia",
        "devise": "BDT",
        "fuseau_horaire": "UTC+06:00"
    },
    {
        "code": "BB",
        "nom": "Barbade",
        "capitale": "Bridgetown",
        "continent": "Americas",
        "devise": "BBD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "BE",
        "nom": "Belgique",
        "capitale": "Brussels",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "BZ",
        "nom": "Belize",
        "capitale": "Belmopan",
        "continent": "Americas",
        "devise": "BZD",
        "fuseau_horaire": "UTC-06:00"
    },
    {
        "code": "BJ",
        "nom": "Bénin",
        "capitale": "Porto-Novo",
        "continent": "Africa",
        "devise": "XOF",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "BM",
        "nom": "Bermudes",
        "capitale": "Hamilton",
        "continent": "Americas",
        "devise": "BMD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "BT",
        "nom": "Bhoutan",
        "capitale": "Thimphu",
        "continent": "Asia",
        "devise": "BTN",
        "fuseau_horaire": "UTC+06:00"
    },
    {
        "code": "BY",
        "nom": "Biélorussie",
        "capitale": "Minsk",
        "continent": "Europe",
        "devise": "BYN",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "MM",
        "nom": "Birmanie",
        "capitale": "Naypyidaw",
        "continent": "Asia",
        "devise": "MMK",
        "fuseau_horaire": "UTC+06:30"
    },
    {
        "code": "BO",
        "nom": "Bolivie",
        "capitale": "Sucre",
        "continent": "Americas",
        "devise": "BOB",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "BA",
        "nom": "Bosnie-Herzégovine",
        "capitale": "Sarajevo",
        "continent": "Europe",
        "devise": "BAM",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "BW",
        "nom": "Botswana",
        "capitale": "Gaborone",
        "continent": "Africa",
        "devise": "BWP",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "BR",
        "nom": "Brésil",
        "capitale": "Brasília",
        "continent": "Americas",
        "devise": "BRL",
        "fuseau_horaire": "UTC-05:00"
    },
    {
        "code": "BN",
        "nom": "Brunei",
        "capitale": "Bandar Seri Begawan",
        "continent": "Asia",
        "devise": "BND",
        "fuseau_horaire": "UTC+08:00"
    },
    {
        "code": "BG",
        "nom": "Bulgarie",
        "capitale": "Sofia",
        "continent": "Europe",
        "devise": "BGN",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "BF",
        "nom": "Burkina Faso",
        "capitale": "Ouagadougou",
        "continent": "Africa",
        "devise": "XOF",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "BI",
        "nom": "Burundi",
        "capitale": "Gitega",
        "continent": "Africa",
        "devise": "BIF",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "KH",
        "nom": "Cambodge",
        "capitale": "Phnom Penh",
        "continent": "Asia",
        "devise": "KHR",
        "fuseau_horaire": "UTC+07:00"
    },
    {
        "code": "CM",
        "nom": "Cameroun",
        "capitale": "Yaoundé",
        "continent": "Africa",
        "devise": "XAF",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "CA",
        "nom": "Canada",
        "capitale": "Ottawa",
        "continent": "Americas",
        "devise": "CAD",
        "fuseau_horaire": "UTC-08:00"
    },
    {
        "code": "CL",
        "nom": "Chili",
        "capitale": "Santiago",
        "continent": "Americas",
        "devise": "CLP",
        "fuseau_horaire": "UTC-06:00"
    },
    {
        "code": "CN",
        "nom": "Chine",
        "capitale": "Beijing",
        "continent": "Asia",
        "devise": "CNY",
        "fuseau_horaire": "UTC+08:00"
    },
    {
        "code": "CY",
        "nom": "Chypre",
        "capitale": "Nicosia",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "VA",
        "nom": "Cité du Vatican",
        "capitale": "Vatican City",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "CO",
        "nom": "Colombie",
        "capitale": "Bogotá",
        "continent": "Americas",
        "devise": "COP",
        "fuseau_horaire": "UTC-05:00"
    },
    {
        "code": "KM",
        "nom": "Comores",
        "capitale": "Moroni",
        "continent": "Africa",
        "devise": "KMF",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "CG",
        "nom": "Congo",
        "capitale": "Brazzaville",
        "continent": "Africa",
        "devise": "XAF",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "CD",
        "nom": "Congo (Rép. dém.)",
        "capitale": "Kinshasa",
        "continent": "Africa",
        "devise": "CDF",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "KP",
        "nom": "Corée du Nord",
        "capitale": "Pyongyang",
        "continent": "Asia",
        "devise": "KPW",
        "fuseau_horaire": "UTC+09:00"
    },
    {
        "code": "KR",
        "nom": "Corée du Sud",
        "capitale": "Seoul",
        "continent": "Asia",
        "devise": "KRW",
        "fuseau_horaire": "UTC+09:00"
    },
    {
        "code": "CR",
        "nom": "Costa Rica",
        "capitale": "San José",
        "continent": "Americas",
        "devise": "CRC",
        "fuseau_horaire": "UTC-06:00"
    },
    {
        "code": "CI",
        "nom": "Côte d'Ivoire",
        "capitale": "Yamoussoukro",
        "continent": "Africa",
        "devise": "XOF",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "HR",
        "nom": "Croatie",
        "capitale": "Zagreb",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "CU",
        "nom": "Cuba",
        "capitale": "Havana",
        "continent": "Americas",
        "devise": "CUC",
        "fuseau_horaire": "UTC-05:00"
    },
    {
        "code": "CW",
        "nom": "Curaçao",
        "capitale": "Willemstad",
        "continent": "Americas",
        "devise": "ANG",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "DK",
        "nom": "Danemark",
        "capitale": "Copenhagen",
        "continent": "Europe",
        "devise": "DKK",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "DJ",
        "nom": "Djibouti",
        "capitale": "Djibouti",
        "continent": "Africa",
        "devise": "DJF",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "DM",
        "nom": "Dominique",
        "capitale": "Roseau",
        "continent": "Americas",
        "devise": "XCD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "EG",
        "nom": "Égypte",
        "capitale": "Cairo",
        "continent": "Africa",
        "devise": "EGP",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "AE",
        "nom": "Émirats arabes unis",
        "capitale": "Abu Dhabi",
        "continent": "Asia",
        "devise": "AED",
        "fuseau_horaire": "UTC+04:00"
    },
    {
        "code": "EC",
        "nom": "Équateur",
        "capitale": "Quito",
        "continent": "Americas",
        "devise": "USD",
        "fuseau_horaire": "UTC-06:00"
    },
    {
        "code": "ER",
        "nom": "Érythrée",
        "capitale": "Asmara",
        "continent": "Africa",
        "devise": "ERN",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "ES",
        "nom": "Espagne",
        "capitale": "Madrid",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "EE",
        "nom": "Estonie",
        "capitale": "Tallinn",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "US",
        "nom": "États-Unis",
        "capitale": "Washington, D.C.",
        "continent": "Americas",
        "devise": "USD",
        "fuseau_horaire": "UTC-12:00"
    },
    {
        "code": "ET",
        "nom": "Éthiopie",
        "capitale": "Addis Ababa",
        "continent": "Africa",
        "devise": "ETB",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "FJ",
        "nom": "Fidji",
        "capitale": "Suva",
        "continent": "Oceania",
        "devise": "FJD",
        "fuseau_horaire": "UTC+12:00"
    },
    {
        "code": "FI",
        "nom": "Finlande",
        "capitale": "Helsinki",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "FR",
        "nom": "France",
        "capitale": "Paris",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC-10:00"
    },
    {
        "code": "GA",
        "nom": "Gabon",
        "capitale": "Libreville",
        "continent": "Africa",
        "devise": "XAF",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "GM",
        "nom": "Gambie",
        "capitale": "Banjul",
        "continent": "Africa",
        "devise": "GMD",
        "fuseau_horaire": "UTC+00:00"
    },
    {
        "code": "GE",
        "nom": "Géorgie",
        "capitale": "Tbilisi",
        "continent": "Asia",
        "devise": "GEL",
        "fuseau_horaire": "UTC+04:00"
    },
    {
        "code": "GS",
        "nom": "Géorgie du Sud-et-les Îles Sandwich du Sud",
        "capitale": "King Edward Point",
        "continent": "Antarctic",
        "devise": "GBP",
        "fuseau_horaire": "UTC-02:00"
    },
    {
        "code": "GH",
        "nom": "Ghana",
        "capitale": "Accra",
        "continent": "Africa",
        "devise": "GHS",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "GI",
        "nom": "Gibraltar",
        "capitale": "Gibraltar",
        "continent": "Europe",
        "devise": "GIP",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "GR",
        "nom": "Grèce",
        "capitale": "Athens",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "GD",
        "nom": "Grenade",
        "capitale": "St. George's",
        "continent": "Americas",
        "devise": "XCD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "GL",
        "nom": "Groenland",
        "capitale": "Nuuk",
        "continent": "Americas",
        "devise": "DKK",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "GP",
        "nom": "Guadeloupe",
        "capitale": "Basse-Terre",
        "continent": "Americas",
        "devise": "EUR",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "GU",
        "nom": "Guam",
        "capitale": "Hagåtña",
        "continent": "Oceania",
        "devise": "USD",
        "fuseau_horaire": "UTC+10:00"
    },
    {
        "code": "GT",
        "nom": "Guatemala",
        "capitale": "Guatemala City",
        "continent": "Americas",
        "devise": "GTQ",
        "fuseau_horaire": "UTC-06:00"
    },
    {
        "code": "GG",
        "nom": "Guernesey",
        "capitale": "St. Peter Port",
        "continent": "Europe",
        "devise": "GBP",
        "fuseau_horaire": "UTC+00:00"
    },
    {
        "code": "GN",
        "nom": "Guinée",
        "capitale": "Conakry",
        "continent": "Africa",
        "devise": "GNF",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "GQ",
        "nom": "Guinée équatoriale",
        "capitale": "Ciudad de la Paz",
        "continent": "Africa",
        "devise": "XAF",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "GW",
        "nom": "Guinée-Bissau",
        "capitale": "Bissau",
        "continent": "Africa",
        "devise": "XOF",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "GY",
        "nom": "Guyana",
        "capitale": "Georgetown",
        "continent": "Americas",
        "devise": "GYD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "GF",
        "nom": "Guyane",
        "capitale": "Cayenne",
        "continent": "Americas",
        "devise": "EUR",
        "fuseau_horaire": "UTC-03:00"
    },
    {
        "code": "HT",
        "nom": "Haïti",
        "capitale": "Port-au-Prince",
        "continent": "Americas",
        "devise": "HTG",
        "fuseau_horaire": "UTC-05:00"
    },
    {
        "code": "HN",
        "nom": "Honduras",
        "capitale": "Tegucigalpa",
        "continent": "Americas",
        "devise": "HNL",
        "fuseau_horaire": "UTC-06:00"
    },
    {
        "code": "HK",
        "nom": "Hong Kong",
        "capitale": "City of Victoria",
        "continent": "Asia",
        "devise": "HKD",
        "fuseau_horaire": "UTC+08:00"
    },
    {
        "code": "HU",
        "nom": "Hongrie",
        "capitale": "Budapest",
        "continent": "Europe",
        "devise": "HUF",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "BV",
        "nom": "Île Bouvet",
        "capitale": "",
        "continent": "Antarctic",
        "devise": "",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "CX",
        "nom": "Île Christmas",
        "capitale": "Flying Fish Cove",
        "continent": "Oceania",
        "devise": "AUD",
        "fuseau_horaire": "UTC+07:00"
    },
    {
        "code": "IM",
        "nom": "Île de Man",
        "capitale": "Douglas",
        "continent": "Europe",
        "devise": "GBP",
        "fuseau_horaire": "UTC+00:00"
    },
    {
        "code": "MU",
        "nom": "Île Maurice",
        "capitale": "Port Louis",
        "continent": "Africa",
        "devise": "MUR",
        "fuseau_horaire": "UTC+04:00"
    },
    {
        "code": "NF",
        "nom": "Île Norfolk",
        "capitale": "Kingston",
        "continent": "Oceania",
        "devise": "AUD",
        "fuseau_horaire": "UTC+11:30"
    },
    {
        "code": "KY",
        "nom": "Îles Caïmans",
        "capitale": "George Town",
        "continent": "Americas",
        "devise": "KYD",
        "fuseau_horaire": "UTC-05:00"
    },
    {
        "code": "CC",
        "nom": "Îles Cocos",
        "capitale": "West Island",
        "continent": "Oceania",
        "devise": "AUD",
        "fuseau_horaire": "UTC+06:30"
    },
    {
        "code": "CK",
        "nom": "Îles Cook",
        "capitale": "Avarua",
        "continent": "Oceania",
        "devise": "CKD",
        "fuseau_horaire": "UTC-10:00"
    },
    {
        "code": "CV",
        "nom": "Îles du Cap-Vert",
        "capitale": "Praia",
        "continent": "Africa",
        "devise": "CVE",
        "fuseau_horaire": "UTC-01:00"
    },
    {
        "code": "FO",
        "nom": "Îles Féroé",
        "capitale": "Tórshavn",
        "continent": "Europe",
        "devise": "DKK",
        "fuseau_horaire": "UTC+00:00"
    },
    {
        "code": "HM",
        "nom": "Îles Heard-et-MacDonald",
        "capitale": "",
        "continent": "Antarctic",
        "devise": "",
        "fuseau_horaire": "UTC+05:00"
    },
    {
        "code": "FK",
        "nom": "Îles Malouines",
        "capitale": "Stanley",
        "continent": "Americas",
        "devise": "FKP",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "MP",
        "nom": "Îles Mariannes du Nord",
        "capitale": "Saipan",
        "continent": "Oceania",
        "devise": "USD",
        "fuseau_horaire": "UTC+10:00"
    },
    {
        "code": "MH",
        "nom": "Îles Marshall",
        "capitale": "Majuro",
        "continent": "Oceania",
        "devise": "USD",
        "fuseau_horaire": "UTC+12:00"
    },
    {
        "code": "UM",
        "nom": "Îles mineures éloignées des États-Unis",
        "capitale": "Washington DC",
        "continent": "Americas",
        "devise": "USD",
        "fuseau_horaire": "UTC-11:00"
    },
    {
        "code": "PN",
        "nom": "Îles Pitcairn",
        "capitale": "Adamstown",
        "continent": "Oceania",
        "devise": "NZD",
        "fuseau_horaire": "UTC-08:00"
    },
    {
        "code": "SB",
        "nom": "Îles Salomon",
        "capitale": "Honiara",
        "continent": "Oceania",
        "devise": "SBD",
        "fuseau_horaire": "UTC+11:00"
    },
    {
        "code": "TC",
        "nom": "Îles Turques-et-Caïques",
        "capitale": "Cockburn Town",
        "continent": "Americas",
        "devise": "USD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "VG",
        "nom": "Îles Vierges britanniques",
        "capitale": "Road Town",
        "continent": "Americas",
        "devise": "USD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "VI",
        "nom": "Îles Vierges des États-Unis",
        "capitale": "Charlotte Amalie",
        "continent": "Americas",
        "devise": "USD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "IN",
        "nom": "Inde",
        "capitale": "New Delhi",
        "continent": "Asia",
        "devise": "INR",
        "fuseau_horaire": "UTC+05:30"
    },
    {
        "code": "ID",
        "nom": "Indonésie",
        "capitale": "Jakarta",
        "continent": "Asia",
        "devise": "IDR",
        "fuseau_horaire": "UTC+07:00"
    },
    {
        "code": "IQ",
        "nom": "Irak",
        "capitale": "Baghdad",
        "continent": "Asia",
        "devise": "IQD",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "IR",
        "nom": "Iran",
        "capitale": "Tehran",
        "continent": "Asia",
        "devise": "IRR",
        "fuseau_horaire": "UTC+03:30"
    },
    {
        "code": "IE",
        "nom": "Irlande",
        "capitale": "Dublin",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "IS",
        "nom": "Islande",
        "capitale": "Reykjavik",
        "continent": "Europe",
        "devise": "ISK",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "IL",
        "nom": "Israël",
        "capitale": "Jerusalem",
        "continent": "Asia",
        "devise": "ILS",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "IT",
        "nom": "Italie",
        "capitale": "Rome",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "JM",
        "nom": "Jamaïque",
        "capitale": "Kingston",
        "continent": "Americas",
        "devise": "JMD",
        "fuseau_horaire": "UTC-05:00"
    },
    {
        "code": "JP",
        "nom": "Japon",
        "capitale": "Tokyo",
        "continent": "Asia",
        "devise": "JPY",
        "fuseau_horaire": "UTC+09:00"
    },
    {
        "code": "JE",
        "nom": "Jersey",
        "capitale": "Saint Helier",
        "continent": "Europe",
        "devise": "GBP",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "JO",
        "nom": "Jordanie",
        "capitale": "Amman",
        "continent": "Asia",
        "devise": "JOD",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "KZ",
        "nom": "Kazakhstan",
        "capitale": "Astana",
        "continent": "Asia",
        "devise": "KZT",
        "fuseau_horaire": "UTC+05:00"
    },
    {
        "code": "KE",
        "nom": "Kenya",
        "capitale": "Nairobi",
        "continent": "Africa",
        "devise": "KES",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "KG",
        "nom": "Kirghizistan",
        "capitale": "Bishkek",
        "continent": "Asia",
        "devise": "KGS",
        "fuseau_horaire": "UTC+06:00"
    },
    {
        "code": "KI",
        "nom": "Kiribati",
        "capitale": "South Tarawa",
        "continent": "Oceania",
        "devise": "AUD",
        "fuseau_horaire": "UTC+12:00"
    },
    {
        "code": "XK",
        "nom": "Kosovo",
        "capitale": "Pristina",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "KW",
        "nom": "Koweït",
        "capitale": "Kuwait City",
        "continent": "Asia",
        "devise": "KWD",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "LA",
        "nom": "Laos",
        "capitale": "Vientiane",
        "continent": "Asia",
        "devise": "LAK",
        "fuseau_horaire": "UTC+07:00"
    },
    {
        "code": "LS",
        "nom": "Lesotho",
        "capitale": "Maseru",
        "continent": "Africa",
        "devise": "LSL",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "LV",
        "nom": "Lettonie",
        "capitale": "Riga",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "LB",
        "nom": "Liban",
        "capitale": "Beirut",
        "continent": "Asia",
        "devise": "LBP",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "LR",
        "nom": "Liberia",
        "capitale": "Monrovia",
        "continent": "Africa",
        "devise": "LRD",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "LY",
        "nom": "Libye",
        "capitale": "Tripoli",
        "continent": "Africa",
        "devise": "LYD",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "LI",
        "nom": "Liechtenstein",
        "capitale": "Vaduz",
        "continent": "Europe",
        "devise": "CHF",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "LT",
        "nom": "Lituanie",
        "capitale": "Vilnius",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "LU",
        "nom": "Luxembourg",
        "capitale": "Luxembourg",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "MO",
        "nom": "Macao",
        "capitale": "",
        "continent": "Asia",
        "devise": "MOP",
        "fuseau_horaire": "UTC+08:00"
    },
    {
        "code": "MK",
        "nom": "Macédoine du Nord",
        "capitale": "Skopje",
        "continent": "Europe",
        "devise": "MKD",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "MG",
        "nom": "Madagascar",
        "capitale": "Antananarivo",
        "continent": "Africa",
        "devise": "MGA",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "MY",
        "nom": "Malaisie",
        "capitale": "Kuala Lumpur",
        "continent": "Asia",
        "devise": "MYR",
        "fuseau_horaire": "UTC+08:00"
    },
    {
        "code": "MW",
        "nom": "Malawi",
        "capitale": "Lilongwe",
        "continent": "Africa",
        "devise": "MWK",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "MV",
        "nom": "Maldives",
        "capitale": "Malé",
        "continent": "Asia",
        "devise": "MVR",
        "fuseau_horaire": "UTC+05:00"
    },
    {
        "code": "ML",
        "nom": "Mali",
        "capitale": "Bamako",
        "continent": "Africa",
        "devise": "XOF",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "MT",
        "nom": "Malte",
        "capitale": "Valletta",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "MA",
        "nom": "Maroc",
        "capitale": "Rabat",
        "continent": "Africa",
        "devise": "MAD",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "MQ",
        "nom": "Martinique",
        "capitale": "Fort-de-France",
        "continent": "Americas",
        "devise": "EUR",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "MR",
        "nom": "Mauritanie",
        "capitale": "Nouakchott",
        "continent": "Africa",
        "devise": "MRU",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "YT",
        "nom": "Mayotte",
        "capitale": "Mamoudzou",
        "continent": "Africa",
        "devise": "EUR",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "MX",
        "nom": "Mexique",
        "capitale": "Mexico City",
        "continent": "Americas",
        "devise": "MXN",
        "fuseau_horaire": "UTC-08:00"
    },
    {
        "code": "FM",
        "nom": "Micronésie",
        "capitale": "Palikir",
        "continent": "Oceania",
        "devise": "USD",
        "fuseau_horaire": "UTC+10:00"
    },
    {
        "code": "MD",
        "nom": "Moldavie",
        "capitale": "Chișinău",
        "continent": "Europe",
        "devise": "MDL",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "MC",
        "nom": "Monaco",
        "capitale": "Monaco",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "MN",
        "nom": "Mongolie",
        "capitale": "Ulan Bator",
        "continent": "Asia",
        "devise": "MNT",
        "fuseau_horaire": "UTC+07:00"
    },
    {
        "code": "ME",
        "nom": "Monténégro",
        "capitale": "Podgorica",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "MS",
        "nom": "Montserrat",
        "capitale": "Plymouth",
        "continent": "Americas",
        "devise": "XCD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "MZ",
        "nom": "Mozambique",
        "capitale": "Maputo",
        "continent": "Africa",
        "devise": "MZN",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "NA",
        "nom": "Namibie",
        "capitale": "Windhoek",
        "continent": "Africa",
        "devise": "NAD",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "NR",
        "nom": "Nauru",
        "capitale": "Yaren",
        "continent": "Oceania",
        "devise": "AUD",
        "fuseau_horaire": "UTC+12:00"
    },
    {
        "code": "NP",
        "nom": "Népal",
        "capitale": "Kathmandu",
        "continent": "Asia",
        "devise": "NPR",
        "fuseau_horaire": "UTC+05:45"
    },
    {
        "code": "NI",
        "nom": "Nicaragua",
        "capitale": "Managua",
        "continent": "Americas",
        "devise": "NIO",
        "fuseau_horaire": "UTC-06:00"
    },
    {
        "code": "NE",
        "nom": "Niger",
        "capitale": "Niamey",
        "continent": "Africa",
        "devise": "XOF",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "NG",
        "nom": "Nigéria",
        "capitale": "Abuja",
        "continent": "Africa",
        "devise": "NGN",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "NU",
        "nom": "Niue",
        "capitale": "Alofi",
        "continent": "Oceania",
        "devise": "NZD",
        "fuseau_horaire": "UTC-11:00"
    },
    {
        "code": "NO",
        "nom": "Norvège",
        "capitale": "Oslo",
        "continent": "Europe",
        "devise": "NOK",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "NC",
        "nom": "Nouvelle-Calédonie",
        "capitale": "Nouméa",
        "continent": "Oceania",
        "devise": "XPF",
        "fuseau_horaire": "UTC+11:00"
    },
    {
        "code": "NZ",
        "nom": "Nouvelle-Zélande",
        "capitale": "Wellington",
        "continent": "Oceania",
        "devise": "NZD",
        "fuseau_horaire": "UTC-11:00"
    },
    {
        "code": "OM",
        "nom": "Oman",
        "capitale": "Muscat",
        "continent": "Asia",
        "devise": "OMR",
        "fuseau_horaire": "UTC+04:00"
    },
    {
        "code": "UG",
        "nom": "Ouganda",
        "capitale": "Kampala",
        "continent": "Africa",
        "devise": "UGX",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "UZ",
        "nom": "Ouzbékistan",
        "capitale": "Tashkent",
        "continent": "Asia",
        "devise": "UZS",
        "fuseau_horaire": "UTC+05:00"
    },
    {
        "code": "PK",
        "nom": "Pakistan",
        "capitale": "Islamabad",
        "continent": "Asia",
        "devise": "PKR",
        "fuseau_horaire": "UTC+05:00"
    },
    {
        "code": "PW",
        "nom": "Palaos (Palau)",
        "capitale": "Ngerulmud",
        "continent": "Oceania",
        "devise": "USD",
        "fuseau_horaire": "UTC+09:00"
    },
    {
        "code": "PS",
        "nom": "Palestine",
        "capitale": "Ramallah",
        "continent": "Asia",
        "devise": "EGP",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "PA",
        "nom": "Panama",
        "capitale": "Panama City",
        "continent": "Americas",
        "devise": "PAB",
        "fuseau_horaire": "UTC-05:00"
    },
    {
        "code": "PG",
        "nom": "Papouasie-Nouvelle-Guinée",
        "capitale": "Port Moresby",
        "continent": "Oceania",
        "devise": "PGK",
        "fuseau_horaire": "UTC+10:00"
    },
    {
        "code": "PY",
        "nom": "Paraguay",
        "capitale": "Asunción",
        "continent": "Americas",
        "devise": "PYG",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "NL",
        "nom": "Pays-Bas",
        "capitale": "Amsterdam",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "BQ",
        "nom": "Pays-Bas caribéens",
        "capitale": "Kralendijk",
        "continent": "Americas",
        "devise": "USD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "PE",
        "nom": "Pérou",
        "capitale": "Lima",
        "continent": "Americas",
        "devise": "PEN",
        "fuseau_horaire": "UTC-05:00"
    },
    {
        "code": "PH",
        "nom": "Philippines",
        "capitale": "Manila",
        "continent": "Asia",
        "devise": "PHP",
        "fuseau_horaire": "UTC+08:00"
    },
    {
        "code": "PL",
        "nom": "Pologne",
        "capitale": "Warsaw",
        "continent": "Europe",
        "devise": "PLN",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "PF",
        "nom": "Polynésie française",
        "capitale": "Papeetē",
        "continent": "Oceania",
        "devise": "XPF",
        "fuseau_horaire": "UTC-10:00"
    },
    {
        "code": "PR",
        "nom": "Porto Rico",
        "capitale": "San Juan",
        "continent": "Americas",
        "devise": "USD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "PT",
        "nom": "Portugal",
        "capitale": "Lisbon",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC-01:00"
    },
    {
        "code": "QA",
        "nom": "Qatar",
        "capitale": "Doha",
        "continent": "Asia",
        "devise": "QAR",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "CF",
        "nom": "République centrafricaine",
        "capitale": "Bangui",
        "continent": "Africa",
        "devise": "XAF",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "DO",
        "nom": "République dominicaine",
        "capitale": "Santo Domingo",
        "continent": "Americas",
        "devise": "DOP",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "RE",
        "nom": "Réunion",
        "capitale": "Saint-Denis",
        "continent": "Africa",
        "devise": "EUR",
        "fuseau_horaire": "UTC+04:00"
    },
    {
        "code": "RO",
        "nom": "Roumanie",
        "capitale": "Bucharest",
        "continent": "Europe",
        "devise": "RON",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "GB",
        "nom": "Royaume-Uni",
        "capitale": "London",
        "continent": "Europe",
        "devise": "GBP",
        "fuseau_horaire": "UTC-08:00"
    },
    {
        "code": "RU",
        "nom": "Russie",
        "capitale": "Moscow",
        "continent": "Europe",
        "devise": "RUB",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "RW",
        "nom": "Rwanda",
        "capitale": "Kigali",
        "continent": "Africa",
        "devise": "RWF",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "EH",
        "nom": "Sahara Occidental",
        "capitale": "El Aaiún",
        "continent": "Africa",
        "devise": "DZD",
        "fuseau_horaire": "UTC+00:00"
    },
    {
        "code": "BL",
        "nom": "Saint-Barthélemy",
        "capitale": "Gustavia",
        "continent": "Americas",
        "devise": "EUR",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "KN",
        "nom": "Saint-Christophe-et-Niévès",
        "capitale": "Basseterre",
        "continent": "Americas",
        "devise": "XCD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "SM",
        "nom": "Saint-Marin",
        "capitale": "City of San Marino",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "MF",
        "nom": "Saint-Martin",
        "capitale": "Marigot",
        "continent": "Americas",
        "devise": "EUR",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "SX",
        "nom": "Saint-Martin",
        "capitale": "Philipsburg",
        "continent": "Americas",
        "devise": "ANG",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "PM",
        "nom": "Saint-Pierre-et-Miquelon",
        "capitale": "Saint-Pierre",
        "continent": "Americas",
        "devise": "EUR",
        "fuseau_horaire": "UTC-03:00"
    },
    {
        "code": "VC",
        "nom": "Saint-Vincent-et-les-Grenadines",
        "capitale": "Kingstown",
        "continent": "Americas",
        "devise": "XCD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "SH",
        "nom": "Sainte-Hélène, Ascension et Tristan da Cunha",
        "capitale": "Jamestown",
        "continent": "Africa",
        "devise": "GBP",
        "fuseau_horaire": "UTC+00:00"
    },
    {
        "code": "LC",
        "nom": "Sainte-Lucie",
        "capitale": "Castries",
        "continent": "Americas",
        "devise": "XCD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "SV",
        "nom": "Salvador",
        "capitale": "San Salvador",
        "continent": "Americas",
        "devise": "USD",
        "fuseau_horaire": "UTC-06:00"
    },
    {
        "code": "WS",
        "nom": "Samoa",
        "capitale": "Apia",
        "continent": "Oceania",
        "devise": "WST",
        "fuseau_horaire": "UTC+13:00"
    },
    {
        "code": "AS",
        "nom": "Samoa américaines",
        "capitale": "Pago Pago",
        "continent": "Oceania",
        "devise": "USD",
        "fuseau_horaire": "UTC-11:00"
    },
    {
        "code": "ST",
        "nom": "São Tomé et Príncipe",
        "capitale": "São Tomé",
        "continent": "Africa",
        "devise": "STN",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "SN",
        "nom": "Sénégal",
        "capitale": "Dakar",
        "continent": "Africa",
        "devise": "XOF",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "RS",
        "nom": "Serbie",
        "capitale": "Belgrade",
        "continent": "Europe",
        "devise": "RSD",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "SC",
        "nom": "Seychelles",
        "capitale": "Victoria",
        "continent": "Africa",
        "devise": "SCR",
        "fuseau_horaire": "UTC+04:00"
    },
    {
        "code": "SL",
        "nom": "Sierra Leone",
        "capitale": "Freetown",
        "continent": "Africa",
        "devise": "SLE",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "SG",
        "nom": "Singapour",
        "capitale": "Singapore",
        "continent": "Asia",
        "devise": "SGD",
        "fuseau_horaire": "UTC+08:00"
    },
    {
        "code": "SK",
        "nom": "Slovaquie",
        "capitale": "Bratislava",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "SI",
        "nom": "Slovénie",
        "capitale": "Ljubljana",
        "continent": "Europe",
        "devise": "EUR",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "SO",
        "nom": "Somalie",
        "capitale": "Mogadishu",
        "continent": "Africa",
        "devise": "SOS",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "SD",
        "nom": "Soudan",
        "capitale": "Khartoum",
        "continent": "Africa",
        "devise": "SDG",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "SS",
        "nom": "Soudan du Sud",
        "capitale": "Juba",
        "continent": "Africa",
        "devise": "SSP",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "LK",
        "nom": "Sri Lanka",
        "capitale": "Sri Jayawardenepura Kotte",
        "continent": "Asia",
        "devise": "LKR",
        "fuseau_horaire": "UTC+05:30"
    },
    {
        "code": "SE",
        "nom": "Suède",
        "capitale": "Stockholm",
        "continent": "Europe",
        "devise": "SEK",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "CH",
        "nom": "Suisse",
        "capitale": "Bern",
        "continent": "Europe",
        "devise": "CHF",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "SR",
        "nom": "Surinam",
        "capitale": "Paramaribo",
        "continent": "Americas",
        "devise": "SRD",
        "fuseau_horaire": "UTC-03:00"
    },
    {
        "code": "SJ",
        "nom": "Svalbard et Jan Mayen",
        "capitale": "Longyearbyen",
        "continent": "Europe",
        "devise": "NOK",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "SZ",
        "nom": "Swaziland",
        "capitale": "Mbabane",
        "continent": "Africa",
        "devise": "SZL",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "SY",
        "nom": "Syrie",
        "capitale": "Damascus",
        "continent": "Asia",
        "devise": "SYP",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "TJ",
        "nom": "Tadjikistan",
        "capitale": "Dushanbe",
        "continent": "Asia",
        "devise": "TJS",
        "fuseau_horaire": "UTC+05:00"
    },
    {
        "code": "TW",
        "nom": "Taïwan",
        "capitale": "Taipei",
        "continent": "Asia",
        "devise": "TWD",
        "fuseau_horaire": "UTC+08:00"
    },
    {
        "code": "TZ",
        "nom": "Tanzanie",
        "capitale": "Dodoma",
        "continent": "Africa",
        "devise": "TZS",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "TD",
        "nom": "Tchad",
        "capitale": "N'Djamena",
        "continent": "Africa",
        "devise": "XAF",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "CZ",
        "nom": "Tchéquie",
        "capitale": "Prague",
        "continent": "Europe",
        "devise": "CZK",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "TF",
        "nom": "Terres australes et antarctiques françaises",
        "capitale": "Port-aux-Français",
        "continent": "Antarctic",
        "devise": "EUR",
        "fuseau_horaire": "UTC+05:00"
    },
    {
        "code": "IO",
        "nom": "Territoire britannique de l'océan Indien",
        "capitale": "Diego Garcia",
        "continent": "Africa",
        "devise": "USD",
        "fuseau_horaire": "UTC+06:00"
    },
    {
        "code": "TH",
        "nom": "Thaïlande",
        "capitale": "Bangkok",
        "continent": "Asia",
        "devise": "THB",
        "fuseau_horaire": "UTC+07:00"
    },
    {
        "code": "TL",
        "nom": "Timor oriental",
        "capitale": "Dili",
        "continent": "Asia",
        "devise": "USD",
        "fuseau_horaire": "UTC+09:00"
    },
    {
        "code": "TG",
        "nom": "Togo",
        "capitale": "Lomé",
        "continent": "Africa",
        "devise": "XOF",
        "fuseau_horaire": "UTC"
    },
    {
        "code": "TK",
        "nom": "Tokelau",
        "capitale": "Fakaofo",
        "continent": "Oceania",
        "devise": "NZD",
        "fuseau_horaire": "UTC+13:00"
    },
    {
        "code": "TO",
        "nom": "Tonga",
        "capitale": "Nuku'alofa",
        "continent": "Oceania",
        "devise": "TOP",
        "fuseau_horaire": "UTC+13:00"
    },
    {
        "code": "TT",
        "nom": "Trinité-et-Tobago",
        "capitale": "Port of Spain",
        "continent": "Americas",
        "devise": "TTD",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "TN",
        "nom": "Tunisie",
        "capitale": "Tunis",
        "continent": "Africa",
        "devise": "TND",
        "fuseau_horaire": "UTC+01:00"
    },
    {
        "code": "TM",
        "nom": "Turkménistan",
        "capitale": "Ashgabat",
        "continent": "Asia",
        "devise": "TMT",
        "fuseau_horaire": "UTC+05:00"
    },
    {
        "code": "TR",
        "nom": "Turquie",
        "capitale": "Ankara",
        "continent": "Asia",
        "devise": "TRY",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "TV",
        "nom": "Tuvalu",
        "capitale": "Funafuti",
        "continent": "Oceania",
        "devise": "AUD",
        "fuseau_horaire": "UTC+12:00"
    },
    {
        "code": "UA",
        "nom": "Ukraine",
        "capitale": "Kyiv",
        "continent": "Europe",
        "devise": "UAH",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "UY",
        "nom": "Uruguay",
        "capitale": "Montevideo",
        "continent": "Americas",
        "devise": "UYU",
        "fuseau_horaire": "UTC-03:00"
    },
    {
        "code": "VU",
        "nom": "Vanuatu",
        "capitale": "Port Vila",
        "continent": "Oceania",
        "devise": "VUV",
        "fuseau_horaire": "UTC+11:00"
    },
    {
        "code": "VE",
        "nom": "Venezuela",
        "capitale": "Caracas",
        "continent": "Americas",
        "devise": "VES",
        "fuseau_horaire": "UTC-04:00"
    },
    {
        "code": "VN",
        "nom": "Viêt Nam",
        "capitale": "Hanoi",
        "continent": "Asia",
        "devise": "VND",
        "fuseau_horaire": "UTC+07:00"
    },
    {
        "code": "WF",
        "nom": "Wallis-et-Futuna",
        "capitale": "Mata-Utu",
        "continent": "Oceania",
        "devise": "XPF",
        "fuseau_horaire": "UTC+12:00"
    },
    {
        "code": "YE",
        "nom": "Yémen",
        "capitale": "Sana'a",
        "continent": "Asia",
        "devise": "YER",
        "fuseau_horaire": "UTC+03:00"
    },
    {
        "code": "ZM",
        "nom": "Zambie",
        "capitale": "Lusaka",
        "continent": "Africa",
        "devise": "ZMW",
        "fuseau_horaire": "UTC+02:00"
    },
    {
        "code": "ZW",
        "nom": "Zimbabwe",
        "capitale": "Harare",
        "continent": "Africa",
        "devise": "ZWL",
        "fuseau_horaire": "UTC+02:00"
    }
];

async function seedPays() {
    try {
        let dbUrl = process.env.MONGO_URI;
        if (!dbUrl) {
            if (DB_MONGO_USER && DB_MONGO_PASSWORD) {
                dbUrl = `mongodb://${DB_MONGO_USER}:${DB_MONGO_PASSWORD}@${DB_MONGO_HOST}:${DB_MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`;
            } else {
                dbUrl = `mongodb://${DB_MONGO_HOST}:${DB_MONGO_PORT}/${MONGO_DATABASE}`;
            }
        }

        console.log(`Connexion à MongoDB pour le seeding des pays...`);
        await mongoose.connect(dbUrl, { family: 4 });

        console.log("Nettoyage de la collection acl_pays...");
        await Pays.deleteMany({});

        console.log(`Insertion de ${countries.length} pays...`);
        await Pays.insertMany(countries);

        console.log("Seeding des pays terminé !");
        process.exit(0);
    } catch (error) {
        console.error("Erreur seeding pays:", error);
        process.exit(1);
    }
}

seedPays();
