import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, FlatList, Pressable, TextInput, Modal, Animated } from 'react-native';
import { Ionicons, AntDesign, FontAwesome, Foundation } from 'react-native-vector-icons';
import { firebaseConfig, addDoc, collection, db, getDocs, query, where, setDoc, getFirestore } from '../../Firebase/firebaseConfig';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { AuthContext } from '../../context/AuthProvider';
import logo4 from '../../assets/RMJ logo for flag transparent.png'
import { projectExtensionFirestore, projectExtensionFirebase, projectExtensionStorage } from '../../Firebase/firebaseConfig';
import { getStorage, ref, listAll, getDownloadURL, } from 'firebase/storage';

const StickyHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQueryWorld, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQueryWorld.trim() !== '') {
      // Navigate to SearchCar.js with the searchQuery as a route parameter
      navigate(`/SearchCar/${searchQueryWorld}`);
    }
  };
  const [scrollY] = useState(new Animated.Value(0));
  //BREAKPOINT
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  useEffect(() => {
    const handleDimensionsChange = ({ window }) => {
      setScreenWidth(window.width);
    };

    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

    return () => subscription.remove();
  }, []);


  return (

    <Animated.View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: '#aaa',
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        backgroundColor: 'lightblue',
        justifyContent: 'center',
        backgroundColor: '#fff', // Background color // Gradient effect (won't work in React Native) // CSS gradient
        zIndex: 1000,
        transform: [
          {
            translateY: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, -100],
              extrapolate: 'clamp'
            })
          }
        ]
      }}
    >
      <View style={{ flexDirection: 'row', flex: 1, }}>
        <TouchableOpacity onPress={() => navigate('/')} style={{ flex: 1, justifyContent: 'center', }}>
          <Image source={{ uri: logo4 }} style={{ flex: 1, resizeMode: 'contain', aspectRatio: 1 }} />
        </TouchableOpacity>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#f4f4f4',
          borderWidth: 0.5,
          padding: 5,
          borderRadius: 5,
          margin: 20,
          flex: 3
        }}>
          <AntDesign name="search1" size={30} style={{ margin: 5, color: 'gray' }} />
          <TextInput
            placeholder='Search by make, model, or keyword'
            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, flex: 3, fontSize: 20 }}
            textAlignVertical='center'
            placeholderTextColor={'gray'}
            onChangeText={text => setSearchQuery(text)}
            onSubmitEditing={handleSearch}// Call handleSearch with the entered text
          />
        </View>
        {user ? (
          <>
            <View style={{ margin: 20, borderWidth: 1, borderRadius: 5, }}>
              <TouchableOpacity onPress={() => navigate(`/Profile`)} style={{ justifyContent: 'center', flex: 1, marginHorizontal: 10, paddingHorizontal: 10 }}>
                <Text>Profile</Text>
              </TouchableOpacity>
            </View>
            <View style={{ margin: 20, borderWidth: 1, borderRadius: 5, marginLeft: -10 }}>
              <TouchableOpacity onPress={logout} style={{ justifyContent: 'center', flex: 1, marginHorizontal: 10, paddingHorizontal: 10 }}>
                <Text >Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={{ margin: 20, borderWidth: 1, borderRadius: 5, }}>
              <TouchableOpacity onPress={() => navigate(`/SignUp`)} style={{ justifyContent: 'center', flex: 1, marginHorizontal: 10, paddingHorizontal: 10 }}>
                <Text>Sign Up</Text>
              </TouchableOpacity>
            </View>
            <View style={{ margin: 20, borderWidth: 1, borderRadius: 5, marginLeft: -10 }}>
              <TouchableOpacity onPress={() => navigate(`/LoginForm`)} style={{ justifyContent: 'center', flex: 1, marginHorizontal: 10, paddingHorizontal: 10 }}>
                <Text >Log In</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
};


const SearchCountry = () => {
  //countries and ports
  const [isActive, setIsActive] = useState(false);
  const [isActivePort, setIsActivePort] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedPorts, setSelectedPorts] = useState(null);
  const searchQuery = useRef('');
  const [filteredData, setFilteredData] = useState(countryData);
  const countryData = [
    {
      id: '1',
      name: 'Afghanistan',
      ports: ['Port A', 'Port B', 'Port C'],
    },
    {
      id: '2',
      name: 'Albania',
      ports: [],
    },
    {
      id: '3',
      name: 'Algeria',
      ports: [],
    },
    {
      id: '4',
      name: 'Andorra',
      ports: [],
    },
    {
      id: '5',
      name: 'Angola',
      ports: [],
    },
    {
      id: '6',
      name: 'Antigua and Barbuda',
      ports: ['St. Johns'],
    },
    {
      id: '7',
      name: 'Argentina',
      ports: [],
    },
    {
      id: '8',
      name: 'Armenia',
      ports: ['Poti'],
    },
    {
      id: '9',
      name: 'Australia',
      ports: ['Brisbane'],
    },
    {
      id: '10',
      name: 'Austria',
      ports: [],
    },
    {
      id: '11',
      name: 'Azerbaijan',
      ports: [],
    },
    {
      id: '12',
      name: 'Bahamas',
      ports: ['Nassau', 'Freeport(Bahamas)'],
    },
    {
      id: '13',
      name: 'Bahrain',
      ports: [],
    },
    {
      id: '14',
      name: 'Bangladesh',
      ports: [],
    },
    {
      id: '15',
      name: 'Barbados',
      ports: [],
    },
    {
      id: '16',
      name: 'Belarus',
      ports: [],
    },
    {
      id: '17',
      name: 'Belgium',
      ports: [],
    },
    {
      id: '18',
      name: 'Belize',
      ports: [],
    },
    {
      id: '19',
      name: 'Benin',
      ports: ['Cotnou'],
    },
    {
      id: '20',
      name: 'Bhutan',
      ports: [],
    },
    {
      id: '21',
      name: 'Bolivia',
      ports: [],
    },
    {
      id: '22',
      name: 'Bosnia and Herzegovina',
      ports: [],
    },
    {
      id: '23',
      name: 'Botswana',
      ports: ['Durban'],
    },
    {
      id: '24',
      name: 'Brazil',
      ports: [],
    },
    {
      id: '25',
      name: 'Brunei',
      ports: [],
    },
    {
      id: '26',
      name: 'Bulgaria',
      ports: [],
    },
    {
      id: '27',
      name: 'Burkina Faso',
      ports: ['Abidjan', 'Tema', 'Lome', 'Cotonou'],
    },
    {
      id: '28',
      name: 'Burundi',
      ports: ['Dar es Salaam', 'Durban', 'Maputo'],
    },
    {
      id: '29',
      name: 'Cabo Verde',
      ports: [],
    },
    {
      id: '30',
      name: 'Cambodia',
      ports: [],
    },
    {
      id: '31',
      name: 'Cameroon',
      ports: ['Doula'],
    },
    {
      id: '32',
      name: 'Canada',
      ports: ['New Westminster'],
    },
    {
      id: '33',
      name: 'Central African Republic',
      ports: [],
    },
    {
      id: '34',
      name: 'Chad',
      ports: [],
    },
    {
      id: '35',
      name: 'Chile',
      ports: [],
    },
    {
      id: '36',
      name: 'China',
      ports: [],
    },
    {
      id: '37',
      name: 'Colombia',
      ports: [],
    },
    {
      id: '38',
      name: 'Comoros',
      ports: [],
    },
    {
      id: '39',
      name: 'Congo',
      ports: [],
    },
    {
      id: '40',
      name: 'Costa Rica',
      ports: [],
    },
    {
      id: '41',
      name: 'Croatia',
      ports: [],
    },
    {
      id: '42',
      name: 'Cuba',
      ports: [],
    },
    {
      id: '43',
      name: 'Cyprus',
      ports: ['Limassol'],
    },
    {
      id: '44',
      name: 'Czech Republic (Czechia)',
      ports: [],
    },
    {
      id: '45',
      name: 'Dominican Republic Congo (DR)',
      ports: ['Mombasa', 'Durban', 'Dar es Salaam'],
    },
    {
      id: '46',
      name: 'Denmark',
      ports: [],
    },
    {
      id: '47',
      name: 'Djibouti',
      ports: [],
    },
    {
      id: '48',
      name: 'Dominica',
      ports: [],
    },
    {
      id: '49',
      name: 'Dominican Republic',
      ports: [],
    },
    {
      id: '50',
      name: 'Ecuador',
      ports: [],
    },
    {
      id: '51',
      name: 'Egypt',
      ports: [],
    },
    {
      id: '52',
      name: 'El Salvador',
      ports: [],
    },
    {
      id: '53',
      name: 'Equatorial Guinea',
      ports: [],
    },
    {
      id: '54',
      name: 'Eritrea',
      ports: [],
    },
    {
      id: '55',
      name: 'Estonia',
      ports: [],
    },
    {
      id: '56',
      name: 'Eswatini',
      ports: [],
    },
    {
      id: '57',
      name: 'Ethiopia',
      ports: ['Djibouti'],
    },
    {
      id: '58',
      name: 'Fiji',
      ports: ['Suva'],
    },
    {
      id: '59',
      name: 'Finland',
      ports: ['Hanko'],
    },
    {
      id: '60',
      name: 'France',
      ports: [],
    },
    {
      id: '61',
      name: 'Gabon',
      ports: [],
    },
    {
      id: '62',
      name: 'Gambia',
      ports: [],
    },
    {
      id: '63',
      name: 'Georgia',
      ports: [],
    },
    {
      id: '64',
      name: 'Germany',
      ports: [],
    },
    {
      id: '65',
      name: 'Ghana',
      ports: ['Dar es Salaam', 'Durban'],
    },
    {
      id: '66',
      name: 'Greece',
      ports: [],
    },
    {
      id: '67',
      name: 'Grenada',
      ports: ['St. George'],
    },
    {
      id: '68',
      name: 'Guatemala',
      ports: ['Quetzal'],
    },
    {
      id: '69',
      name: 'Guinea',
      ports: ['Conakry'],
    },
    {
      id: '70',
      name: 'Guinea-Bissau',
      ports: [],
    },
    {
      id: '71',
      name: 'Guyana',
      ports: [],
    },
    {
      id: '72',
      name: 'Haiti',
      ports: ['Port-au-Prince'],
    },
    {
      id: '73',
      name: 'Holy See',
      ports: [],
    },
    {
      id: '74',
      name: 'Honduras',
      ports: [],
    },
    {
      id: '75',
      name: 'Hungary',
      ports: [],
    },
    {
      id: '76',
      name: 'Iceland',
      ports: [],
    },
    {
      id: '77',
      name: 'India',
      ports: [],
    },
    {
      id: '78',
      name: 'Indonesia',
      ports: ['Georgetown/Guyana'],
    },
    {
      id: '79',
      name: 'Iran',
      ports: [],
    },
    {
      id: '80',
      name: 'Iraq',
      ports: [],
    },
    {
      id: '81',
      name: 'Ireland',
      ports: ['Dublin'],
    },
    {
      id: '82',
      name: 'Israel',
      ports: [],
    },
    {
      id: '83',
      name: 'Italy',
      ports: [],
    },
    {
      id: '84',
      name: 'Jamaica',
      ports: ['Kingston'],
    },
    {
      id: '85',
      name: 'Japan',
      ports: [],
    },
    {
      id: '86',
      name: 'Jordan',
      ports: [],
    },
    {
      id: '87',
      name: 'Kazakhstan',
      ports: [],
    },
    {
      id: '88',
      name: 'Kenya',
      ports: ['Mombasa'],
    },
    {
      id: '89',
      name: 'Kiribati',
      ports: [],
    },
    {
      id: '90',
      name: 'Korea (North)',
      ports: [],
    },
    {
      id: '91',
      name: 'Korea (South)',
      ports: [],
    },
    {
      id: '92',
      name: 'Kosovo',
      ports: [],
    },
    {
      id: '93',
      name: 'Kuwait',
      ports: [],
    },
    {
      id: '94',
      name: 'Kyrgyzstan',
      ports: ['Bishkek'],
    },
    {
      id: '95',
      name: 'Laos',
      ports: [],
    },
    {
      id: '96',
      name: 'Latvia',
      ports: [],
    },
    {
      id: '97',
      name: 'Lebanon',
      ports: [],
    },
    {
      id: '98',
      name: 'Lesotho',
      ports: ['Durban'],
    },
    {
      id: '99',
      name: 'Liberia',
      ports: ['Mombasa', 'Monrovia'],
    },
    {
      id: '100',
      name: 'Libya',
      ports: [],
    },
    {
      id: '101',
      name: 'Liechtenstein',
      ports: [],
    },
    {
      id: '102',
      name: 'Lithuania',
      ports: [],
    },
    {
      id: '103',
      name: 'Luxembourg',
      ports: [],
    },
    {
      id: '104',
      name: 'Madagascar',
      ports: ['Tamatave'],
    },
    {
      id: '105',
      name: 'Malawi',
      ports: ['Dar es Salam', 'Durban'],
    },
    {
      id: '106',
      name: 'Malaysia',
      ports: [],
    },
    {
      id: '107',
      name: 'Maldives',
      ports: ['Colombo', 'Male'],
    },
    {
      id: '108',
      name: 'Mali',
      ports: ['Abidjan'],
    },
    {
      id: '109',
      name: 'Malta',
      ports: [],
    },
    {
      id: '110',
      name: 'Marshall Islands',
      ports: [],
    },
    {
      id: '111',
      name: 'Mauritania',
      ports: [],
    },
    {
      id: '112',
      name: 'Mauritius',
      ports: [],
    },
    {
      id: '113',
      name: 'Mexico',
      ports: [],
    },
    {
      id: '114',
      name: 'Micronesia',
      ports: ['Chuuk', 'Pohnpei', 'Yap'],
    },
    {
      id: '115',
      name: 'Moldova',
      ports: [],
    },
    {
      id: '116',
      name: 'Monaco',
      ports: [],
    },
    {
      id: '117',
      name: 'Mongolia',
      ports: [],
    },
    {
      id: '118',
      name: 'Montenegro',
      ports: [],
    },
    {
      id: '119',
      name: 'Morocco',
      ports: [],
    },
    {
      id: '120',
      name: 'Mozambique',
      ports: ['Maputo', 'Dar es Salaam', 'Durban', 'Boma'],
    },
    {
      id: '121',
      name: 'Myanmar',
      ports: [],
    },
    {
      id: '122',
      name: 'Namibia',
      ports: ['Durban'],
    },
    {
      id: '123',
      name: 'Nauru',
      ports: [],
    },
    {
      id: '124',
      name: 'Nepal',
      ports: [],
    },
    {
      id: '125',
      name: 'Netherlands',
      ports: [],
    },
    {
      id: '126',
      name: 'New Zealand',
      ports: ['Auckland', 'Wellington'],
    },
    {
      id: '127',
      name: 'Nicaragua',
      ports: [],
    },
    {
      id: '128',
      name: 'Niger',
      ports: [],
    },
    {
      id: '129',
      name: 'Nigeria',
      ports: ['Lagos'],
    },
    {
      id: '130',
      name: 'North Macedonia',
      ports: [],
    },
    {
      id: '131',
      name: 'Norway',
      ports: [],
    },
    {
      id: '132',
      name: 'Oman',
      ports: [],
    },
    {
      id: '133',
      name: 'Pakistan',
      ports: ['Karachi'],
    },
    {
      id: '134',
      name: 'Palau',
      ports: ['Koror'],
    },
    {
      id: '135',
      name: 'Palestine',
      ports: [],
    },
    {
      id: '136',
      name: 'Panama',
      ports: [],
    },
    {
      id: '137',
      name: 'Papua New Guinea',
      ports: ['Port Moresby', 'Lae'],
    },
    {
      id: '138',
      name: 'Paraguay',
      ports: ['Iquique'],
    },
    {
      id: '139',
      name: 'Peru',
      ports: [],
    },
    {
      id: '140',
      name: 'Philippines',
      ports: [],
    },
    {
      id: '141',
      name: 'Poland',
      ports: [],
    },
    {
      id: '142',
      name: 'Portugal',
      ports: [],
    },
    {
      id: '143',
      name: 'Qatar',
      ports: [],
    },
    {
      id: '144',
      name: 'Romania',
      ports: [],
    },
    {
      id: '145',
      name: 'Russia',
      ports: [],
    },
    {
      id: '146',
      name: 'Rwanda',
      ports: ['Mombasa'],
    },
    {
      id: '147',
      name: 'Saint Kitts & Nevis',
      ports: ['Basseterre'],
    },
    {
      id: '148',
      name: 'Saint Lucia',
      ports: ['Port Castries'],
    },
    {
      id: '149',
      name: 'Saint Vincent and the Grenadines',
      ports: ['Kingstown'],
    },
    {
      id: '150',
      name: 'Samoa',
      ports: ['Apia'],
    },
    {
      id: '151',
      name: 'San Marino',
      ports: [],
    },
    {
      id: '152',
      name: 'Sao Tome & Principe',
      ports: [],
    },
    {
      id: '153',
      name: 'Saudi Arabia',
      ports: [],
    },
    {
      id: '154',
      name: 'Senegal',
      ports: [],
    },
    {
      id: '155',
      name: 'Serbia',
      ports: [],
    },
    {
      id: '156',
      name: 'Seychelles',
      ports: [],
    },
    {
      id: '157',
      name: 'Sierra Leone',
      ports: ['Conakry'],
    },
    {
      id: '158',
      name: 'Singapore',
      ports: [],
    },
    {
      id: '159',
      name: 'Slovakia',
      ports: [],
    },
    {
      id: '160',
      name: 'Slovenia',
      ports: [],
    },
    {
      id: '161',
      name: 'Solomon Islands',
      ports: ['Honiara'],
    },
    {
      id: '162',
      name: 'Somalia',
      ports: ['Mombasa', 'Djibouti'],
    },
    {
      id: '163',
      name: 'South Africa',
      ports: ['Durban'],
    },
    {
      id: '164',
      name: 'South Sudan',
      ports: ['Mombasa'],
    },
    {
      id: '165',
      name: 'Spain',
      ports: [],
    },
    {
      id: '166',
      name: 'Sri Lanka',
      ports: [],
    },
    {
      id: '167',
      name: 'Sudan',
      ports: ['Mombasa'],
    },
    {
      id: '168',
      name: 'Suriname',
      ports: ['Paramaribo'],
    },
    {
      id: '169',
      name: 'Sweden',
      ports: ['Gotenburg'],
    },
    {
      id: '170',
      name: 'Switzerland',
      ports: [],
    },
    {
      id: '171',
      name: 'Syria',
      ports: [],
    },
    {
      id: '172',
      name: 'Taiwan',
      ports: [],
    },
    {
      id: '173',
      name: 'Tajikistan',
      ports: [],
    },
    {
      id: '174',
      name: 'Tanzania',
      ports: ['Mombasa', 'Dar es Salaam'],
    },
    {
      id: '175',
      name: 'Thailand',
      ports: ['Laemchabang'],
    },
    {
      id: '176',
      name: 'Timor-Leste',
      ports: [],
    },
    {
      id: '177',
      name: 'Togo',
      ports: [],
    },
    {
      id: '178',
      name: 'Tonga',
      ports: ['Nukualofa'],
    },
    {
      id: '179',
      name: 'Trinidad and Tobago',
      ports: ['Port of Spain'],
    },
    {
      id: '180',
      name: 'Tunisia',
      ports: [],
    },
    {
      id: '181',
      name: 'Turkey',
      ports: ['Derince'],
    },
    {
      id: '182',
      name: 'Turkmenistan',
      ports: [],
    },
    {
      id: '183',
      name: 'Tuvalu',
      ports: [],
    },
    {
      id: '184',
      name: 'Uganda',
      ports: ['Mombasa', 'Dar es Salaam'],
    },
    {
      id: '185',
      name: 'Ukraine',
      ports: [],
    },
    {
      id: '186',
      name: 'United Arab Emirates',
      ports: ['Jebel Ali'],
    },
    {
      id: '187',
      name: 'United Kingdom',
      ports: ['Southampton'],
    },
    {
      id: '188',
      name: 'United States of America',
      ports: ['Freeport(USA)'],
    },
    {
      id: '189',
      name: 'Uruguay',
      ports: [],
    },
    {
      id: '190',
      name: 'Uzbekistan',
      ports: [],
    },
    {
      id: '191',
      name: 'Vanuatu',
      ports: [],
    },
    {
      id: '192',
      name: 'Venezuela',
      ports: [],
    },
    {
      id: '193',
      name: 'Vietnam',
      ports: [],
    },
    {
      id: '194',
      name: 'Yemen',
      ports: [],
    },
    {
      id: '195',
      name: 'Zambia',
      ports: ['Dar es Salaam', 'Durban', 'Maputo'],
    },
    {
      id: '196',
      name: 'Zimbabwe',
      ports: ['Dar es Salaam', 'Durban', 'Mombasa', 'Boma'],
    },
    {
      id: '197',
      name: 'Anguilla',
      ports: ['Philipsburg'],
    },
    {
      id: '198',
      name: 'Aruba',
      ports: ['Aruba'],
    },
    {
      id: '199',
      name: 'Cayman Islands',
      ports: ['Georgetown/Cayman'],
    },
    {
      id: '200',
      name: 'Montserrat',
      ports: ['Philipsburg'],
    },
    {
      id: '201',
      name: 'Netherlands Antilles',
      ports: ['Aruba', 'Curacao', 'Philipsburg', 'Bonaire'],
    },
    {
      id: '202',
      name: 'Swaziland',
      ports: ['Durban', 'Maputo'],
    },


  ];
  //useEffect event handler
  const componentRefPort = useRef(null);
  const componentRef = useRef(null);
  const inputRef = useRef(null);
  const styles = StyleSheet.create({
    container: {
      paddingTop: "60px",
      margin: 'auto'
    },
    containerBox: {
      justifyContent: 'center',
      borderRadius: 5,
    },
    categoryContainer: {
      marginBottom: 20,
    },
    category: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    specificationItem: {
      fontSize: 16,
      marginBottom: 5,
    },
    category: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,

    },
    rowContainer: {
      flexDirection: 'row',
      marginBottom: 5,
    },
    columnContainer: {

      paddingHorizontal: 5
    },
    createButton: {
      backgroundColor: 'blue',
      color: 'white',
      padding: 10,
      borderRadius: 5,
    },


  });
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click occurred outside the component
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsActive(false);
      }
      if (componentRefPort.current &&
        !componentRefPort.current.contains(event.target)) {
        setIsActivePort(false);
      }
    };

    // Add the event listener when the component mounts
    document.addEventListener('click', handleClickOutside);

    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  //mouse anywehre click
  const handleSearchInput = (text) => {
    searchQuery.current = text;

    // Filter countries based on the search query
    const filteredCountries = countryData.filter(data =>
      data.name.toLowerCase().startsWith(text.toLowerCase())
    );

    // Set the filtered countries as the new data for FlatList
    setFilteredData(filteredCountries);
  };

  useEffect(() => {
    const searchCountries = (text) => {
      if (text.trim() === '') {
        setFilteredData([]);
        return;
      }

      const filteredCountries = countryData.filter((country) =>
        country.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(filteredCountries);
    };

    const debounceSearch = setTimeout(() => {
      searchCountries(searchQuery.current);
    }, -1);

    return () => clearTimeout(debounceSearch);
  }, []);
  const isHovered = useRef(null);

  const renderCountries = ({ item }) => {

    const handleHoverIn = () => {
      isHovered.current = item.name;
    };
    const handleHoverOut = () => {
      isHovered.current = null;
    };
    return (
      <Pressable
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}

        style={({ pressed, hovered }) => [
          {
            opacity: pressed ? 0.5 : 1,
            backgroundColor: hovered ? '#b0c4ff' : null
          },

        ]}

        onPress={() => handleCountrySelection(item)}>
        <View style={{
          flexDirection: 'column', marginTop: 5, // Add the spacing/marginTop between each country item
          paddingVertical: 10, // Optional: add padding for better visual separation between items
          paddingHorizontal: 10,
          width: '100%',

        }}>
          <Text>{item.name}</Text>
        </View>
      </Pressable>
    )
  };


  const handleCountrySelection = (selectedCountry) => {
    setSelectedCountry(selectedCountry);
    setSelectedPorts(selectedCountry.ports[0]);
    searchQuery.current = '';
    setIsActive(false);
  };

  const noPortsMessage = 'Nearest Port';
  const handlePortTouch = (port) => {

    setIsActivePort(false);
    // Check if the port is already selected
    const isPortSelected = selectedPorts === port;

    // Toggle the selection based on the current state

    setSelectedPorts(port); // Select the port


  };



  const handleClear = () => {
    searchQuery.current = '';
    setSelectedCountry('');
    setFilteredData(countryData);
  }
  //countries and ports ends here
  return (
    <View>
      {/*COUNTRY PICKER*/}
      <View style={{ paddingRight: 5, marginTop: 5, justifyContent: 'center', alignSelf: ' center', width: '100%' }}>
        <View style={{ backgroundColor: 'white', borderWidth: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', height: 'auto', }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 'auto',
                fontSize: 22,
                borderRadius: 7,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 25,
                width: '100%',
                padding: 10,
                zIndex: isActive ? 20 : 1,
              }}
              ref={componentRef}
              onPress={() => { setIsActive(!isActive), setIsActivePort(false) }}
            >
              <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                <Text>{selectedCountry ? selectedCountry.name : 'Select Country'}</Text>
              </View>
              <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                <TouchableOpacity onPress={handleClear}>
                  <AntDesign name="close" size={15} />
                </TouchableOpacity>
                <AntDesign
                  name="down"
                  size={15}
                  style={[
                    { transitionDuration: '0.3s' },
                    isActive && {
                      transform: [{ rotate: '180deg' }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>

          </View>
          {isActive && (
            <>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: '#fff',
                borderWidth: 0.5,
                borderColor: '#000',
                height: 40,
                borderRadius: 5,
                margin: 5,
              }}>
                <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                <TextInput
                  ref={inputRef}
                  placeholder='Search'
                  value={searchQuery.current}
                  onChangeText={handleSearchInput}
                  style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                  textAlignVertical='center'
                  placeholderTextColor={'gray'}
                />
              </View>
              <View style={{ height: 200, zIndex: 10, elevation: 5 }}>
                <FlatList
                  data={searchQuery.current !== '' ? filteredData : countryData}
                  renderItem={renderCountries}
                  keyExtractor={(item) => item.id}// Replace 'id' with the unique key property in your country data
                  showsVerticalScrollIndicator={false} // Hide the vertical scroll bar

                />
              </View>
            </>
          )}

        </View>
      </View>
      <Text>Nearest Port</Text>
      {/*PORT PICKER*/}
      <View style={{ paddingRight: 5, marginTop: 5, justifyContent: 'center', alignSelf: ' center', width: '100%' }}>
        <View style={{ backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', height: 'auto' }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 'auto',
                fontSize: 22,
                borderRadius: 7,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 25,
                width: '100%',
                padding: 10,
              }}
              ref={componentRefPort}
              onPress={() => { setIsActivePort(!isActivePort), setIsActive(false) }}
              disabled={!selectedCountry}
            >
              <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                <Text>
                  {selectedCountry ? selectedPorts ? selectedPorts : 'Nearest Port' : 'Select Ports'}
                </Text>
              </View>
              <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>

                <AntDesign
                  name="down"
                  size={15}
                  style={[
                    { transitionDuration: '0.3s' },
                    isActivePort && {
                      transform: [{ rotate: '180deg' }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>

          </View>
          {isActivePort && (
            <View style={{
              padding: 10,
              backgroundColor: '#fff',
              borderRadius: 7,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.1,
              shadowRadius: 25,
            }}>

              <View style={{ height: 200 }}>
                {selectedCountry && (
                  <View>
                    {selectedCountry && (
                      <View>
                        {selectedCountry.ports.length === 0 ? (
                          <TouchableOpacity onPress={() => handlePortTouch()}>
                            <Text>{noPortsMessage}</Text>
                          </TouchableOpacity>
                        ) : (
                          selectedCountry.ports.map((port) => (

                            <TouchableOpacity key={port} onPress={() => handlePortTouch(port)}>
                              <View style={{
                                flexDirection: 'column', marginTop: 5, // Add the spacing/marginTop between each country item
                                paddingVertical: 10, // Optional: add padding for better visual separation between items

                                width: '100%'
                              }}>
                                <Text>{port}</Text>
                              </View>
                            </TouchableOpacity>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}

        </View>
      </View>
    </View>
  )
};

//get the data from carls datanbase sample
const GetDataFeature = () => {

  const { carId } = useParams();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  useEffect(() => {
    const handleDimensionsChange = ({ window }) => {
      setScreenWidth(window.width);
    };

    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

    return () => subscription.remove();
  }, []);
  const [featureStatusSafety, setFeatureStatusSafety] = useState(false);
  const [featureStatusComfort, setFeatureStatusComfort] = useState(false);
  const [featureStatusInterior, setFeatureStatusInterior] = useState(false);
  const [featureStatusExterior, setFeatureStatusExterior] = useState(false);
  const [featureStatusSelling, setFeatureStatusSelling] = useState(false);
  const vehicleId = carId;


  // Define allData before using it
  const featureData = [
    {
      category: 'Safety System',
      data: [
        { name: 'Anti-Lock Braking System (ABS)', value: featureStatusSafety.SafetySystemAnBrSy },
        { name: 'Driver Airbag', value: featureStatusSafety.SafetySystemDrAi },
        { name: 'Passenger Airbag', value: featureStatusSafety.SafetySystemPaAi },
        { name: 'Safety Airbag', value: featureStatusSafety.SafetySystemSiAi }
      ]
    },
    {
      category: 'Comfort',
      data: [
        { name: 'Air Conditioner (Front)', value: featureStatusComfort.ComfortAiCoFr }, // Initialize with null
        { name: 'Air Conditioner (Rear)', value: featureStatusComfort.ComfortAiCoRe },
        { name: 'AM/FM Radio', value: featureStatusComfort.ComfortAMFMRa },
        { name: 'AM/FM Stereo', value: featureStatusComfort.ComfortAMFMSt },
        { name: 'CD Player', value: featureStatusComfort.ComfortCDPl },
        { name: 'CD Changer', value: featureStatusComfort.ComfortCDCh },
        { name: 'Cruise Speed Control', value: featureStatusComfort.ComfortCrSpCo },
        { name: 'Digital Speedometer', value: featureStatusComfort.ComfortDiSp },
        { name: 'DVD Player', value: featureStatusComfort.ComfortDVDPl },
        { name: 'Hard Disk Drive', value: featureStatusComfort.ComfortHDD },
        { name: 'Navigation System (GPS)', value: featureStatusComfort.ComfortNaSyGPS },
        { name: 'Power Steering', value: featureStatusComfort.ComfortPoSt },
        { name: 'Premium Audio System', value: featureStatusComfort.ComfortPrAuSy },
        { name: 'Remote Keyless System', value: featureStatusComfort.ComfortReKeSy },
        { name: 'Tilt Steering Wheel', value: featureStatusComfort.ComfortTiStWh },
      ],
    },
    {
      category: 'Interior',
      data: [
        { name: 'Leather Seats', value: featureStatusInterior.InteriorLeSe },
        { name: 'Power Door Locks', value: featureStatusInterior.InteriorPoDoLo },
        { name: 'Power Mirrors', value: featureStatusInterior.InteriorPoMi },
        { name: 'Power Seats', value: featureStatusInterior.InteriorPose },
        { name: 'Power Windows', value: featureStatusInterior.InteriorPoWi },
        { name: 'Rear Window Defroster', value: featureStatusInterior.InteriorReWiDe },
        { name: 'Rear Window Wiper', value: featureStatusInterior.InteriorReWiWi },
        { name: 'Third Row Seats', value: featureStatusInterior.InteriorThRoSe },
        { name: 'Tinted Glass', value: featureStatusInterior.InteriorTiGl }
      ]
    },
    {
      category: 'Exterior',
      data: [
        { name: 'Alloy Wheels', value: featureStatusExterior.ExteriorAlWh },
        { name: 'Power Sliding Door', value: featureStatusExterior.ExteriorPoSlDo },
        { name: 'Sunroof', value: featureStatusExterior.ExteriorSuRo }
      ]
    },
    {
      category: 'Selling Points',
      data: [
        { name: 'Customized Wheels', value: featureStatusSelling.SellingPointsCuWh },
        { name: 'Fully Loaded', value: featureStatusSelling.SellingPointsFuLo },
        { name: 'Maintenance History Available', value: featureStatusSelling.SellingPointsMaHiAv },
        { name: 'Brand New Tires', value: featureStatusSelling.SellingPointsBrNeTi },
        { name: 'No Accident History', value: featureStatusSelling.SellingPointsNoAcHi },
        { name: 'Non-Smoking Previous Owner', value: featureStatusSelling.SellingPointsNoSmPrOw },
        { name: 'One Owner History', value: featureStatusSelling.SellingPointsOnOwHi },
        { name: 'Performance-Rated Tires', value: featureStatusSelling.SellingPointsPeRaTi },
        { name: 'Repainted Body', value: featureStatusSelling.SellingPointsReBo },
        { name: 'Turbo Engine', value: featureStatusSelling.SellingPointsTuEn },
        { name: 'Upgraded Audio System', value: featureStatusSelling.SellingPointsUpAuSy }
      ]
    }
    // Add more categories and their features as needed
  ];

  const renderVehicleFeaturesCategory = ({ item }) => {
    const styles = StyleSheet.create({
      container: {
        paddingTop: "60px",
        margin: 'auto',
      },
      containerBox: {
        justifyContent: 'center',
        borderRadius: 5,
        alignItems: 'flex-start',
      },
      categoryContainer: {
        marginBottom: 20,
      },
      category: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      specificationItem: {
        fontSize: 16,
        marginBottom: 5,
      },
      category: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      rowContainer: {
        flexDirection: 'row',
        marginBottom: 5,
      },
      columnContainer: {
        paddingHorizontal: 5,
      },
      createButton: {
        backgroundColor: 'blue',
        color: 'white',
        padding: 10,
        borderRadius: 5,
      },
    });

    // Create rows with four items in each row
    const numColumns = screenWidth < 768 ? 2 : 4;
    const rows = [];

    for (let i = 0; i < item.data.length; i += numColumns) {
      const rowData = item.data.slice(i, i + numColumns);
      rows.push(
        <View key={i} style={styles.rowContainer}>
          {rowData.map((feature, index) => (
            <View key={index} style={[styles.columnContainer, { width: screenWidth < 768 ? '50%' : '25%' }]}>
              <View>
                <TouchableOpacity
                  style={{
                    backgroundColor: feature.value ? '#7b9cff' : '#fff',
                    borderWidth: 1,
                    borderColor: feature.value ? '#7b9cff' : '#706E6E',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 40,
                    marginBottom: 5,
                    maxWidth: '100%',
                    margin: 5,
                    padding: 2,
                  }}
                >
                  <Text adjustsFontSizeToFit numberOfLines={2} style={{ textAlign: 'center', color: feature.value ? 'white' : '#706E6E', fontSize: 12, fontWeight: '600' }}>{feature.name}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.categoryContainer}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 10,
          color: '#706E6E'
        }}>{item.category}</Text>
        {rows}
      </View>
    );
  };

  useEffect(() => {
    const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', vehicleId);
    const unsubscribe = onSnapshot(vehicleDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();

          if (data && data.comfort) {
            setFeatureStatusComfort(data.comfort);
            // Update state with comfortData
          }
          if (data && data.safetySystem) {
            setFeatureStatusSafety(data.safetySystem);
          }
          if (data && data.interior) {
            setFeatureStatusInterior(data.interior)
          }
          if (data && data.exterior) {
            setFeatureStatusExterior(data.exterior)
          }
          if (data && data.sellingPoints) {
            setFeatureStatusSelling(data.sellingPoints)
          }
        } else {
          console.log('Document does not exist.');
        }
      },
      (error) => {
        console.error('Error getting document:', error);
      }
    );

    // Return a cleanup function to unsubscribe from the snapshot listener when the component unmounts
    return () => unsubscribe();
  }, []);


  return (
    <View>
      <View style={{ width: '100%', paddingRight: 5, height: 50, padding: 5, flexDirection: 'row', alignItems: 'center', backgroundColor: '#7b9cff', paddingLeft: 10 }} >
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 22 }}>Features</Text>
        </View>
      </View>
      <FlatList
        data={featureData}
        renderItem={renderVehicleFeaturesCategory}
        keyExtractor={(item, index) => `${item.category}-${index}`}
      />
    </View>
  );
};
const GetDataSpecifications = () => {

  const { carId } = useParams();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  useEffect(() => {
    const handleDimensionsChange = ({ window }) => {
      setScreenWidth(window.width);
    };

    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

    return () => subscription.remove();
  }, []);
  const vehicleId = carId;
  const [vehicleData, setVehicleData] = useState({});

  const specsData = [
    {
      category: 'Full Vehicle Specifications',
      data: [
        { name: 'Make', value: vehicleData.make },
        { name: 'Model', value: vehicleData.model },
        { name: 'Registration Year', value: `${vehicleData.regYear} / ${vehicleData.regMonth}` },
        { name: 'Reference Number', value: vehicleData.referenceNumber },
        { name: 'Chassis/Frame Number', value: vehicleData.chassisNumber },
        { name: 'Model Code', value: vehicleData.modelCode },
        { name: 'Engine Code', value: vehicleData.engineCode }
      ]
    },
    {
      category: 'Engine and Perfomance',
      data: [
        { name: 'Engine Displacement (cc)', value: `${vehicleData.engineDisplacement}cc` },
        { name: 'Steering', value: vehicleData.steering },
        { name: 'Mileage', value: `${vehicleData.mileage} km` },
        { name: 'Transmission', value: vehicleData.transmission },
        { name: 'External Color', value: vehicleData.exteriorColor }
      ]
    },
    {
      category: 'Interior and Seating',
      data: [
        { name: 'Number of Seats', value: vehicleData.numberOfSeats },
        { name: 'Doors', value: vehicleData.doors }
      ]
    },
    {
      category: 'Fuel and Drivetrain',
      data: [
        { name: 'Fuel', value: vehicleData.fuel },
        { name: 'Drive Type', value: vehicleData.driveType },
      ],

    },
    {
      category: 'Dimensions and Weight',
      data: [
        { name: 'Dimension', value: `${vehicleData.dimensionLength}cm x ${vehicleData.dimensionWidth}cm x ${vehicleData.dimensionHeight}cm (${vehicleData.dimensionCubicMeters}m³) ` },
        { name: 'Weight', value: `${vehicleData.weight}kg` }
      ]
    },
    {
      category: 'Body Type',
      data: [
        { name: 'Body Type', value: vehicleData.bodyType },
      ]
    }
  ]

  useEffect(() => {
    const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', vehicleId);
    const unsubscribe = onSnapshot(vehicleDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setVehicleData(data);
        } else {
          console.log('Document does not exist');
          return (
            <View style={{ justifyContent: 'center' }}>
              <Text>NO VIEW HERE!</Text>
            </View>
          )
        }
      },
      (error) => {
        console.error('Error getting document', error);
      }
    );
    return () => unsubscribe();

  }, []);

  const [imageUrls, setImageUrls] = useState({});


  useEffect(() => {
    const folderRef = ref(projectExtensionStorage, vehicleData.referenceNumber);
    // Function to fetch the first image URL for a folder
    const fetchImageURL = async (folderRef) => {
      try {
        // List all items (images) in the folder
        const result = await listAll(folderRef);

        if (result.items.length > 0) {
          // Get the download URL for the first image in the folder
          const imageUrl = await getDownloadURL(result.items[0]);
          // Update the imageUrls state with the new URL
          setImageUrls((prevImageUrls) => ({
            ...prevImageUrls,
            [vehicleData.referenceNumber]: imageUrl,
          }));

        } else {
          // If the folder is empty, you can add a placeholder URL or handle it as needed
        }
      } catch (error) {
        console.error('Error listing images for folder', vehicleData.referenceNumber, ':', error);
      }
    };

    // Fetch image URL for the vehicleData's referenceNumber
    fetchImageURL(folderRef);
  }, [vehicleData.referenceNumber]);
  const renderSpecificationItem = ({ item }) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, backgroundColor: '#7b9cff', padding: 10, margin: 5, }}>
          <Text style={[styles.specificationItem, { color: 'white' }]}>{item.name}</Text>
        </View>
        <View style={{ flex: 1, padding: 10, margin: 5, borderWidth: 1, borderColor: '#706E6E' }}>
          <Text style={{ fontSize: 16, color: '#706E6E' }}>{item.value || 'N/A'}</Text>
        </View>
      </View>
    );
  };

  const renderSpecificationCategory = ({ item }) => {
    return (
      <View style={[styles.categoryContainer]}>
        <View style={{ backgroundColor: '#7b9cff', padding: 10, marginBottom: 5 }}>
          <Text style={[styles.category, { color: 'white' }]}>{item.category}</Text>
        </View>
        <FlatList
          data={item.data}
          renderItem={renderSpecificationItem}
          keyExtractor={(specItem) => specItem.name}
        />
      </View>
    );
  };

  return (
    <View>
      <FlatList
        data={specsData}
        renderItem={renderSpecificationCategory}
        keyExtractor={(item) => item.category}
      />
    </View>
  )

};


const MakeAChat = ({ carId, carName, userEmail }) => {
  //MAKE MODAL
  const { login } = useContext(AuthContext);
  //SEND INQUIRY
  const [modalVisible, setModalVisible] = useState(false);
  const [alreadyInquiredModalVisible, setAlreadyInquiredModalVisible] = useState(false);
  // Function to open the modal
  const openModal = () => {
    setModalVisible(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false);
  };
  const openAlreadyInquiredModal = () => {
    setAlreadyInquiredModalVisible(true);
  };

  // Function to close the "Already Inquired" modal
  const closeAlreadyInquiredModal = () => {
    setAlreadyInquiredModalVisible(false);
  };

  useEffect(() => {
    // Check if userEmail is available before proceeding
    if (userEmail) {
      // Fetch user transactions only when userEmail is available
      const fetchUserTransactions = async () => {
        try {
          const transactionsSnapshot = await getDocs(collection(projectExtensionFirestore, 'accounts', userEmail, 'transactions'));
          const transactionsDataArray = transactionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserTransactions(transactionsDataArray);
        } catch (error) {
          console.log('Error fetching user transactions:', error);
        }
      };
      // Call the fetchUserTransactions function to populate userTransactions
      fetchUserTransactions();
    }
  }, [userEmail]);
  //MAKE MODAL HERE
  const navigate = useNavigate(); // Use the useNavigate hook here

  const [carData, setCarData] = useState([]);
  console.log('CHECK THE CHASSIS:', carData.chassisNumber);
  const [carRefNumber, setCarRefNumber] = useState('');
  useEffect(() => {
    const fetchRefNumber = async () => {
      const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);
      try {
        const vehicleDoc = await getDoc(vehicleDocRef);
        if (vehicleDoc.exists()) {
          const vehicleData = vehicleDoc.data();
          setCarRefNumber(vehicleData.referenceNumber);
        }
      } catch (error) {
        console.error('Error fetching vehicle data: ', error);
      }
    };
    if (carId) {
      fetchRefNumber();
    }
  }, [carId])
  //FETCH CAR DATA
  useEffect(() => {
    const fetchCarData = async () => {
      const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);
      try {
        const vehicleDoc = await getDoc(vehicleDocRef);
        if (vehicleDoc.exists()) {
          const vehicleData = vehicleDoc.data();
          setCarData(vehicleData);
        } else {
          // Vehicle data not found, set a specific message or data
          navigate('/vehicle-not-found');// You can set a custom message or data here
        }
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
        // Handle the error, e.g., display an error message.
      }
    };

    if (carId) {
      fetchCarData();
    }
  }, [carId]);
  const [userTransactions, setUserTransactions] = useState([]);
  const handleCreateConversation = async () => {
    //MAKE INQUIRY
    if (!userEmail) {
      // If not logged in, redirect to the login form
      navigate('/LoginForm');
      return;
    }
    if (!carData) {
      console.error('Invalid product data or missing id:', carData);
      return; // Exit the function to prevent further errors
    }

    const productIdString = carId;
    console.log('CAR ID: ', productIdString);
    // Check if the product is already in the user's transactions
    const userEmailAddress = userEmail; // Replace this with the actual user's email
    if (!userEmailAddress) {
      console.error('User email address is not available.');
      return;
    }

    try {
      const transactionRefExtension = doc(collection(projectExtensionFirestore, 'accounts', userEmailAddress, 'transactions'), productIdString);
      const transactionRef = doc(collection(db, 'accounts', userEmailAddress, 'transactions'), productIdString);
      const transactionDoc = await getDoc(transactionRef);
      const transacionDocExtension = await getDoc(transactionRefExtension);

      if (transactionDoc.exists()) {
        console.log('Product is already in transactions.');
        // Show the modal indicating that the user has already inquired about this product
        openAlreadyInquiredModal();
        return; // Add this line to exit the function
      }
      if (transacionDocExtension.exists()) {
        openAlreadyInquiredModal();
        return;
      }

      // If the product is not already in transactions, add it
      setUserTransactions((prevTransactions) => [...prevTransactions, carData]);

      // Add the product to the "Transactions" collection in Firebase
      await setDoc(transactionRef, {
        ...carData,
        productId: productIdString, // Add the productId field to store the ID of the product
      });
      await setDoc(transactionRefExtension, {
        ...carData,
        productId: productIdString,

      });
      const timestamp = new Date(); // Get the current date and time

      const year = timestamp.getFullYear();
      const month = timestamp.toLocaleString('default', { month: 'short' }); // Get the month abbreviation (e.g., Oct)
      const day = timestamp.getDate().toString().padStart(2, '0');

      const hours = timestamp.getHours().toString().padStart(2, '0');
      const minutes = timestamp.getMinutes().toString().padStart(2, '0');
      const seconds = timestamp.getSeconds().toString().padStart(2, '0');

      const formattedTimestampString = `${month} ${day}, ${year} at ${hours}:${minutes}:${seconds}`;
      const chatId = `chat_${carId}_${userEmail}`;
      // Create a new message document in the chat conversation with the formatted timestamp as the document ID
      const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'), formattedTimestampString);


      const messageData = {
        sender: userEmail, // Sender's email
        text: `You are now inquiring with this product.`,
        timestamp: serverTimestamp(),
      };

      // Set the message data in the new message document
      await setDoc(newMessageDocExtension, messageData);



      console.log('Product added to transactions successfully!');
      // Show the main modal indicating that the inquiry was successful
      openModal();
    } catch (error) {
      console.error('Error checking or adding product to transactions:', error);
    }

    //MAKE CHAT HERE
    // Constant recipientEmail
    const recipientEmail = ['marc@realmotor.jp', 'yamazaki@carcon-net.com'];

    // Validate recipientEmail and create a new chat conversation in Firestore
    const firestore = getFirestore();

    // Generate a unique chat ID using a combination of carId and userEmail
    const chatId = `chat_${carId}_${userEmail}`;

    // Reference the chats collection
    const chatsCollection = collection(firestore, 'chats');
    const chatsCollectionExtension = collection(projectExtensionFirestore, 'chats');
    const chassisNumber = carData.chassisNumber;
    const year = carData.regYear;
    const model = carData.model;
    // Create a new document within the chats collection with the generated chatId
    await setDoc(doc(chatsCollection, chatId), {
      participants:
      {
        salesRep: recipientEmail,
        customer: userEmail,
      },
      vehicle: {
        carId,
        carName,
        carRefNumber,
        chassisNumber,
        year,
        model
      },
      stepIndicator: {
        value: 1,
        stepStatus: "Negotiation"
      }


    });
    await setDoc(doc(chatsCollectionExtension, chatId), {
      participants:
      {
        salesRep: recipientEmail,
        customer: userEmail,
      },
      vehicle: {
        carId,
        carName,
        carRefNumber,
        chassisNumber,
        year,
        model
      },
      stepIndicator: {
        value: 1,
        stepStatus: "Negotiation"
      }
    });

    // Navigate to the ChatScreen with the chat ID
    const path = `/ProfileFormChatGroup/${chatId}`;

    // // Use navigation to navigate to the specified path
    navigate(path);


    //I'LL COME BACK TO THIS SO THAT IT WILL GO TO CHAT
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => handleCreateConversation(carId, carName)}
        style={{
          backgroundColor: '#FA4D4D', justifyContent: 'center',
          alignItems: 'center',
          height: 40,
          shadowColor: '#000', // Set the shadow color for iOS
          shadowOffset: { width: 0, height: 4 }, // Set the shadow offset (y = 4)
          shadowOpacity: 0.25, // Set the shadow opacity (25%)
          shadowRadius: 4,
        }}>
        <Text style={{ textAlign: 'center', color: 'white' }}>Send Inquiry</Text>
      </TouchableOpacity>
      {/* "Already Inquired" modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alreadyInquiredModalVisible}
        onRequestClose={closeAlreadyInquiredModal}
      >
        <TouchableOpacity
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          activeOpacity={1}
          onPress={closeAlreadyInquiredModal}
        >
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              You've already inquired about this vehicle.
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 20 }}>
              Please review your inquiry history in your profile.
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#007BFF', padding: 10, borderRadius: 5 }}
              onPress={() => {
                closeAlreadyInquiredModal();
                navigate('/ProfileFormTransaction');
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Go to Profile</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};


const ProductDetailScreen = () => {

  const { carId } = useParams();
  const navigate = useNavigate();
  const [carData, setCarData] = useState({});
  const { userEmail } = useContext(AuthContext);
  const [userTransactions, setUserTransactions] = useState([]);

  //SEND INQUIRY
  const [modalVisible, setModalVisible] = useState(false);
  const [alreadyInquiredModalVisible, setAlreadyInquiredModalVisible] = useState(false);
  // Function to open the modal
  const openModal = () => {
    setModalVisible(true);
  };
  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false);
  };
  const openAlreadyInquiredModal = () => {
    setAlreadyInquiredModalVisible(true);
  };

  // Function to close the "Already Inquired" modal
  const closeAlreadyInquiredModal = () => {
    setAlreadyInquiredModalVisible(false);
  };

  useEffect(() => {
    // Check if userEmail is available before proceeding
    if (userEmail) {
      // Fetch user transactions only when userEmail is available
      const fetchUserTransactions = async () => {
        try {
          const transactionsSnapshot = await getDocs(collection(db, 'accounts', userEmail, 'transactions'));
          const transactionsSnapshotExtension = await getDocs(collection(projectExtensionFirestore, 'accounts', userEmail, 'transactions'));
          const transactionsDataArray = transactionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          const transactionsDataArrayExtension = transactionsSnapshotExtension.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setUserTransactions(transactionsDataArray);
          setUserTransactions(transactionsDataArrayExtension);
        } catch (error) {
          console.log('Error fetching user transactions:', error);
        }
      };
      // Call the fetchUserTransactions function to populate userTransactions
      fetchUserTransactions();
    }
  }, [userEmail]);

  // const handleSendInquiry = async () => {
  //   if (!carData) {
  //     console.error('Invalid product data or missing id:', carData);
  //     return; // Exit the function to prevent further errors
  //   }

  //   const productIdString = carData.id.toString();

  //   // Check if the product is already in the user's transactions
  //   const userEmailAddress = userEmail; // Replace this with the actual user's email
  //   if (!userEmailAddress) {
  //     console.error('User email address is not available.');
  //     return;
  //   }

  //   try {
  //     const transactionRef = doc(collection(db, 'accounts', userEmailAddress, 'transactions'), productIdString);
  //     const transactionDoc = await getDoc(transactionRef);

  //     if (transactionDoc.exists()) {
  //       console.log('Product is already in transactions.');
  //       // Show the modal indicating that the user has already inquired about this product
  //       openAlreadyInquiredModal();
  //     } else {
  //       // If the product is not already in transactions, add it
  //       setUserTransactions((prevTransactions) => [...prevTransactions, carData]);

  //       // Add the product to the "Transactions" collection in Firebase
  //       await setDoc(transactionRef, {
  //         ...carData,
  //         productId: productIdString, // Add the productId field to store the ID of the product
  //       });

  //       console.log('Product added to transactions successfully!');
  //       // Show the main modal indicating that the inquiry was successful
  //       openModal();
  //     }
  //   } catch (error) {
  //     console.error('Error checking or adding product to transactions:', error);
  //   }
  // };
  //SEND INQUIRY ENDS HERE

  //FAVORITES
  const [userFavorites, setUserFavorites] = useState([]);
  useEffect(() => {
    // Check if userEmail is available before proceeding
    if (userEmail) {
      // Fetch user favorites only when userEmail is available
      const fetchUserFavorites = async () => {
        try {
          const favoritesSnapshot = await getDocs(collection(db, 'accounts', userEmail, 'favoriteLists'));
          const favoritesDataArray = favoritesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserFavorites(favoritesDataArray);
        } catch (error) {
          console.log('Error fetching user favorites:', error);
        }
      };
      // Call the fetchUserFavorites function to populate userFavorites
      fetchUserFavorites();
    }
  }, [userEmail]);

  const handleAddToFavorite = async () => {
    if (!carData) {
      console.error('Invalid car data or missing id:', carData);
      return; // Exit the function to prevent further errors
    }

    const carIdString = carData.id.toString();

    // Check if the car is already in the user's favorites
    const isAlreadyFavorite = userFavorites.some((favorite) => favorite.id === carData.id);

    console.log('Selected Car:', carData); // Log the selected car

    const userEmailAddress = userEmail; // Replace this with the actual user's email
    if (!userEmailAddress) {
      console.error('User email address is not available.');
      return;
    }

    if (isAlreadyFavorite) {
      // If the car is already in favorites, remove it from the userFavorites state
      const updatedFavorites = userFavorites.filter((favorite) => favorite.id !== carData.id);
      setUserFavorites(updatedFavorites);
      // Remove the car from the "favoriteLists" subcollection in Firebase
      try {
        await deleteDoc(doc(collection(db, 'accounts', userEmailAddress, 'favoriteLists', carIdString)));
        console.log('Car removed from favorites successfully!');
      } catch (error) {
        console.error('Error removing car from favorites:', error);
      }
    } else {
      // If the car is not in favorites, add it to the userFavorites state
      setUserFavorites((prevFavorites) => [...prevFavorites, carData]);
      // Add the car to the "favoriteLists" subcollection in Firebase
      try {
        await setDoc(doc(collection(db, 'accounts', userEmailAddress, 'favoriteLists'), carIdString), {
          ...carData,
          carId: carIdString, // Add the carId field to store the ID of the car
        });
        console.log('Car added to favorites successfully!');
      } catch (error) {
        console.error('Error adding car to favorites:', error);
      }
    }
  };
  //FAVORITES ENDS HERE

  //FETCH CAR DATA
  useEffect(() => {
    const fetchCarData = async () => {
      const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);

      try {
        const vehicleDoc = await getDoc(vehicleDocRef);
        if (vehicleDoc.exists()) {
          const vehicleData = vehicleDoc.data();
          setCarData(vehicleData);
        } else {
          // Vehicle data not found, set a specific message or data
          navigate('/vehicle-not-found');// You can set a custom message or data here
        }
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
        // Handle the error, e.g., display an error message.
      }
    };

    if (carId) {
      fetchCarData();
    }
  }, [carId]); // Empty dependency array to ensure it runs only once


  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  useEffect(() => {
    const handleDimensionsChange = ({ window }) => {
      setScreenWidth(window.width);
    };

    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

    return () => subscription.remove();
  }, []);
  //BREAKPOINT
  //save screen


  //save screen


  //COMMENTS TO CARS HERE
  const [commentsListData, setCommentsListData] = useState([]);
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const carCommentsRef = collection(db, 'carComments');
    const querySnapshot = await getDocs(carCommentsRef);

    const commentsData = [];
    querySnapshot.forEach((doc) => {
      const { ratings, comments } = doc.data();
      commentsData.push({
        id: doc.id,
        ratings,
        comments,
      });
    });

    setCommentsListData(commentsData);
  };
  const renderComments = ({ item }) => {

    return (
      <View>
        <View style={{ width: '100%', height: 1, backgroundColor: '#aaa', alignSelf: 'center', marginVertical: 10 }} />
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text key={star}>{item.ratings >= star ? '⭐' : '☆'}</Text>
            ))}
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text>3 days ago</Text>
          </View>

        </View>
        <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
          <Text style={{ color: '#ccc' }}>by Customer Name</Text><Text style={{ fontSize: 12, color: '#4CAF50' }}> Verified Purchaser</Text>
        </View>
        <View style={{ margin: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>{item.comments}</Text>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: '#aaa', fontWeight: '600' }}>Sample Car Name</Text>
          <Text>IMAGE HERE</Text>
        </View>
        {/* <View style={{backgroundColor:'#7b9cff', marginTop: 10}}>
        <Text>REAL MOTOR RESPONSE REPRESENTATIVE</Text>
        <Text>COMMENT OF THE REPRESENTATIVE HERE</Text>
        </View> */}
        <View style={{ marginTop: 5 }}>
          <Text>LIKES HERE</Text>
        </View>
      </View>
    )
  }
  //make comments for cars
  const CarRatingComment = () => {
    const [rating, setRating] = useState(1);
    const commentText = useRef(null);

    // const commentText = useCallback(() => {
    //   commentRef.current.setNativeProps({text: ''});
    // }, [])

    const submitRatingAndComment = () => {

      const carCommentsRef = collection(db, 'carComments');

      addDoc(carCommentsRef, {
        ratings: rating,
        comments: commentText.current.value
      })
        .then(() => {
          console.log('Rating and comment submitted successfully!');
          // Clear the input fields after successful submission
          setRating(1);
          commentText.current.value = "";
        })
        .catch((error) => {
          console.error('Error submitting rating and comment:', error);
        });
    }
    const handleStarPress = (selectedRating) => {
      setRating(selectedRating);
      console.log(selectedRating);
    };

    return (
      <View>
        <View style={{ padding: 5 }} >
          <View style={{ flexDirection: 'row' }}>
            <Text>Rating:</Text>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleStarPress(star)}

              >
                <Text>{rating >= star ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ backgroundColor: '#ccc', }}>
            <TextInput
              style={{ padding: 5 }}
              multiline
              numberOfLines={4}
              ref={commentText}
              placeholder='Leave a comment on the car'
              onChangeText={text => commentText.current.value = text}
            />
          </View>
        </View>
        <View style={{ alignSelf: 'flex-end', marginVertical: 10 }}>
          <Pressable
            onPress={submitRatingAndComment}
            style={({ pressed }) => [
              {
                borderWidth: 1,
                borderColor: pressed ? '#95b0ff' : '#fff', // Change the borderColor when pressed
                justifyContent: 'center',
                alignItems: 'center',
                height: 40,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                // Add more styles as needed
              },
              pressed && { backgroundColor: '#fff' }, // Change the background color when pressed
            ]}>
            <Text>SUBMIT</Text>
          </Pressable>
        </View>
      </View>
    );
  };
  //make comments for cars here **

  const [vehicleData, setVehicleData] = useState({});
  useEffect(() => {
    const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);
    const unsubscribe = onSnapshot(vehicleDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setVehicleData(data);
        } else {
          console.log('Document does not exist');
          return (
            <View style={{ justifyContent: 'center' }}>
              <Text>NO VIEW HERE!</Text>
            </View>
          )
        }
      },
      (error) => {
        console.error('Error getting document', error);
      }
    );
    return () => unsubscribe();

  }, []);

  const [imageUrl, setImageUrl] = useState('');
  useEffect(() => {
    const folderRef = ref(projectExtensionStorage, vehicleData.stockID);

    // Function to fetch the first image URL for a folder
    const fetchImageURL = async (folderRef) => {
      try {
        // List all items (images) in the folder
        const result = await listAll(folderRef);

        if (result.items.length > 0) {
          // Get the download URL for the first image in the folder
          const imageUrl = await getDownloadURL(result.items[0]);
          // Update the imageUrl state with the new URL
          setImageUrl(imageUrl);
        } else {
          // If the folder is empty, you can add a placeholder URL or handle it as needed
        }
      } catch (error) {
        console.error('Error listing images for folder', vehicleData.stockID, ':', error);
      }
    };

    // Fetch image URL for the vehicleData's referenceNumber
    fetchImageURL(folderRef);
  }, [vehicleData.stockID]);

  const [allImageUrl, setAllImageUrl] = useState([]);
  useEffect(() => {
    const folderRef = ref(projectExtensionStorage, vehicleData.stockID);
    const fetchAllImageUrl = async () => {
      try {
        const result = await listAll(folderRef);
        const urls = await Promise.all(result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return url;
        }));
        setAllImageUrl(urls);
      } catch (error) {
        console.error('Error listing images for folder: ', error);
      }
    };
    fetchAllImageUrl(folderRef);
  }, [vehicleData.stockID])

  const renderImage = ({ item }) => (
    <Image
      source={{ uri: item }}
      style={{
        flex: 1, // Take up all available space within the parent container
        aspectRatio: 1, // Maintain aspect ratio (square images)
        margin: 5, // Add margin between images
        width: '100%',
        height: 150,
        resizeMode: 'cover' // Add border radius to images for rounded corners
      }}
    />
  );
  const scrollViewRef = useRef(null);

  const scrollToTop = () => {
    scrollViewRef.current.scrollTo({ y: 0, animated: true });
  };
  useEffect(() => {
    scrollToTop();
  }, []);
  //flatlist specs
  return (
    <View style={{ height: '100vh' }}>
      <StickyHeader />
      <ScrollView ref={scrollViewRef} contentContainerStyle={{ alignItems: screenWidth <= 768 ? null : 'center', width: '100%', }}>
        <View>
          <View style={[{ flexDirection: screenWidth > 768 ? 'row' : 'column', width: screenWidth > 1280 ? 1188 : '100%', alignItems: 'flex-start' }, styles.containerBox]}>
            <View style={[{ width: screenWidth > 1280 ? 712 : '100%' }, { flex: screenWidth <= 768 ? 3 : 1 }]}>

              <View
                style={{
                  marginBottom: 10,
                  aspectRatio: screenWidth > 768 ? 1.3 : 1.4,
                }}
              >
                <Image source={{ uri: imageUrl }} style={{ flex: 1, resizeMode: 'cover', }} />
              </View>

              <View style={{ backgroundColor: '#fff', width: '100%', maxWidth: 800, alignSelf: 'center' }}>
                <FlatList
                  data={allImageUrl}
                  renderItem={renderImage}
                  keyExtractor={(item) => item}
                  horizontal={true}
                  contentContainerStyle={{ flexGrow: 1 }} // Allow content to grow and fill the available space
                />
              </View>
            </View>

            <View style={[{ width: screenWidth > 1280 ? 476 : '40%', padding: 10, marginRight: 'auto' }, { width: screenWidth <= 768 ? '100%' : '40%' }]}>
              <View style={{ width: '100%', padding: 5, flex: 1 }}>
                <Text style={{ fontSize: 26, fontWeight: '700', marginBottom: 10 }}>{carData.carName}</Text>
                <Text style={{ fontSize: 16, color: '#aaa' }}>{carData.carDescription}</Text>
                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', marginRight: 5, marginBottom: 10 }}>
                    <FontAwesome name="star-o" size={20} />
                    <FontAwesome name="star-o" size={20} />
                    <FontAwesome name="star-o" size={20} />
                    <FontAwesome name="star-o" size={20} />
                    <FontAwesome name="star-o" size={20} />
                  </View>
                  {/* <TouchableOpacity onPress={() => handleAddToFavorite(carData.id)}>
                    <Text style={{ fontWeight: '600', fontSize: 18, marginRight: 10 }}>{userFavorites.some((favorite) => favorite.id === carData.id) ? 'UNFAVORITE' : 'FAVORITE'}</Text>
                  </TouchableOpacity> */}
                </View>
                <View style={{ backgroundColor: '#7b9cff', padding: 10, justifyContent: 'center', marginBottom: 10 }}>
                  <Text>Vehicle Price (FOB): </Text>
                  <Text>Total Estimated Price: </Text>
                  <View style={{ height: 1, backgroundColor: '#aaa', marginVertical: 10 }} />
                  <View style={{ flexDirection: screenWidth > 768 ? 'row' : 'column', width: '100%' }}>
                    <View style={{ flex: 1 }}>

                      <SearchCountry />

                    </View>
                    <View style={{ flex: screenWidth > 768 ? 1 : null, marginTop: screenWidth > 768 ? 0 : 20, }}>
                      <Text>Additional</Text>

                      <TouchableOpacity style={{
                        borderWidth: 1, borderColor: '#FA4D4D', justifyContent: 'center', alignItems: 'center', height: 40,
                        shadowColor: '#000', // Set the shadow color for iOS
                        shadowOffset: { width: 0, height: 4 }, // Set the shadow offset (y = 4)
                        shadowOpacity: 0.25, // Set the shadow opacity (25%)
                        shadowRadius: 4,
                        marginBottom: 5
                      }}>
                        <Text style={{ textAlign: 'center', color: 'white' }}>Insurance</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{
                        borderWidth: 1, borderColor: '#FA4D4D', justifyContent: 'center', alignItems: 'center', height: 40,
                      }}>
                        <Text style={{ textAlign: 'center', color: 'white' }}>Inspection</Text>
                      </TouchableOpacity>

                    </View>
                  </View>
                  <View>
                    <Text>Add a message:</Text>
                    <TextInput
                      multiline
                      numberOfLines={4}
                      style={{ backgroundColor: 'white', borderWidth: 1, borderColor: 'black', padding: 5 }}
                    />
                  </View>
                  <View style={{ flexDirection: screenWidth > 992 ? 'row' : 'column', justifyContent: 'space-between', marginTop: 10 }}>
                    <View style={{ width: screenWidth > 992 ? '70%' : '100%' }}>
                      <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                        <AntDesign name="checksquareo" size={20} />
                        <Text> I would like to get exclusive deals and others sent to me via email</Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <AntDesign name="checksquareo" size={20} />
                        <Text> I agree to Privacy Policy and Terms of Agreement</Text>
                      </View>
                    </View>
                    <View style={{ width: screenWidth > 992 ? '30%' : '100%', justifyContent: 'center', marginTop: screenWidth > 992 ? 0 : 10 }}>
                      <MakeAChat carId={carId} carName={carData.carName} userEmail={userEmail} />
                    </View>

                  </View>
                </View>
              </View>
            </View>


          </View>
          <View style={[{ flexDirection: screenWidth > 768 ? 'row' : 'column', width: screenWidth > 1280 ? 1188 : '100%', alignItems: 'flex-start' }, styles.containerBox]}>
            <View style={[{ width: screenWidth > 1280 ? 594 : '50%', padding: 10, marginRight: 'auto' }, { width: screenWidth <= 768 ? '100%' : '50%' }]}>
              <View style={{ width: '100%', }}>
                <GetDataSpecifications />
              </View>
            </View>
            <View style={[{ width: screenWidth > 1280 ? 594 : '50%', padding: 10, marginRight: 'auto' }, { width: screenWidth <= 768 ? '100%' : '50%' }]}>
              <View style={{ width: '100%' }}>
                <GetDataFeature />
              </View>
            </View>
          </View>
          {/* <View style={[{ boxShadow: '0 2px 10px rgba(3, 3, 3, 0.2)', width: screenWidth > 1280 ? 1188 : '100%', alignItems: 'flex-start' }, styles.containerBox]}>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>Reviews & Ratings of Sample Car</Text>
          <View style={{ width: '90%', height: 1, backgroundColor: '#aaa', alignSelf: 'center', marginVertical: 10 }} />

          {screenWidth < 768 ? (
            <View style={{ width: '90%', alignSelf: 'center', }}>
              <View style={{ flexDirection: 'row', width: '100%' }}>
                <View style={{ width: '30%' }}>
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 40 }}>4.8</Text><Text style={{ color: '#ccc', marginTop: 20 }}>/5</Text>
                    </View>
                    <Text>Ratings</Text>
                  </View>
                </View>
                <View style={{ width: '70%', justifyContent: 'center' }}>
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', margin: 5 }}>
                    <Text style={{ marginRight: 10, fontSize: 15 }}>5</Text>
                    <FontAwesome name="star-o" size={20} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1, height: 8, backgroundColor: '#ccf2ff', borderRadius: 12, margin: -5 }} />
                  </View>
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', margin: 5 }}>
                    <Text style={{ marginRight: 10, fontSize: 15 }}>4</Text>
                    <FontAwesome name="star-o" size={20} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1, height: 8, backgroundColor: '#ccf2ff', borderRadius: 12, margin: -5 }} />
                  </View>
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', margin: 5 }}>
                    <Text style={{ marginRight: 10, fontSize: 15 }}>3</Text>
                    <FontAwesome name="star-o" size={20} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1, height: 8, backgroundColor: '#ccf2ff', borderRadius: 12, margin: -5 }} />
                  </View>
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', margin: 5 }}>
                    <Text style={{ marginRight: 10, fontSize: 15 }}>2</Text>
                    <FontAwesome name="star-o" size={20} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1, height: 8, backgroundColor: '#ccf2ff', borderRadius: 12, margin: -5 }} />
                  </View>
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', margin: 5 }}>
                    <Text style={{ marginRight: 10, fontSize: 15 }}>1</Text>
                    <FontAwesome name="star-o" size={20} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1, height: 8, backgroundColor: '#ccf2ff', borderRadius: 12, margin: -5 }} />
                  </View>
                </View>

              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', marginHorizontal: 10, flexWrap: 'wrap', width: '100%' }}>
                  <View style={{ borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', width: 70, height: 25, marginRight: 10 }}>
                    <Text>All</Text>
                  </View>
                  <View style={{ borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', width: 120, height: 25, marginRight: 10 }}>
                    <Text>With Contents</Text>
                  </View>
                  <View style={{ borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', width: 70, height: 25, marginRight: 10, flexDirection: 'row' }}>
                    <FontAwesome name="star-o" size={20} /><Text>5</Text>
                  </View>
                  <View style={{ borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', width: 70, height: 25, marginRight: 10, flexDirection: 'row' }}>
                    <FontAwesome name="star-o" size={20} /><Text>4</Text>
                  </View>
                  <View style={{ borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', width: 70, height: 25, marginRight: 10, flexDirection: 'row' }}>
                    <FontAwesome name="star-o" size={20} /><Text>3</Text>
                  </View>
                  <View style={{ borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', width: 70, height: 25, marginRight: 10, flexDirection: 'row' }}>
                    <FontAwesome name="star-o" size={20} /><Text>2</Text>
                  </View>
                  <View style={{ borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', width: 70, height: 25, marginRight: 10, flexDirection: 'row' }}>
                    <FontAwesome name="star-o" size={20} /><Text>1</Text>
                  </View>
                </View>
              </ScrollView>

            </View>
          )
            :
            (
              <View style={{ flexDirection: 'row', alignSelf: 'center', width: '90%' }}>
                <View style={{ width: '30%' }}>
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 40 }}>4.8</Text><Text style={{ color: '#ccc', marginTop: 20 }}>/5</Text>
                    </View>
                    <Text>Ratings</Text>
                    <View style={{ flexDirection: 'row', margin: 5 }}>
                      <FontAwesome name="star-o" size={20} />
                      <FontAwesome name="star-o" size={20} />
                      <FontAwesome name="star-o" size={20} />
                      <FontAwesome name="star-o" size={20} />
                      <FontAwesome name="star-o" size={20} />
                    </View>
                  </View>
                </View>
                <View style={{ width: '70%' }}>
                  <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <View style={{ flex: 1, marginRight: 5 }}>
                      <Pressable
                        style={{
                          padding: 10,
                          backgroundColor: '#fff',
                          borderRadius: 7,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 10 },
                          shadowOpacity: 0.1,
                          shadowRadius: 25,
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Text>All</Text>
                      </Pressable>
                    </View>
                    <View style={{ flex: 1, marginLeft: 5 }}>
                      <Pressable
                        style={{
                          padding: 10,
                          backgroundColor: '#fff',
                          borderRadius: 7,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 10 },
                          shadowOpacity: 0.1,
                          shadowRadius: 25,
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Text> With contents</Text>
                      </Pressable>

                    </View>
                    <View style={{ flex: 1, marginLeft: 5 }}>
                      <Pressable
                        style={{
                          padding: 10,
                          backgroundColor: '#fff',
                          borderRadius: 7,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 10 },
                          shadowOpacity: 0.1,
                          shadowRadius: 25,
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FontAwesome name="star-o" size={20} /><Text style={{ fontSize: 15 }}> 5</Text>
                      </Pressable>

                    </View>
                    <View style={{ flex: 1, marginLeft: 5 }}>
                      <Pressable
                        style={{
                          padding: 10,
                          backgroundColor: '#fff',
                          borderRadius: 7,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 10 },
                          shadowOpacity: 0.1,
                          shadowRadius: 25,
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FontAwesome name="star-o" size={20} /><Text style={{ fontSize: 15 }}> 4</Text>
                      </Pressable>

                    </View>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, marginRight: 5 }}>
                      <Pressable
                        style={{
                          padding: 10,
                          backgroundColor: '#fff',
                          borderRadius: 7,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 10 },
                          shadowOpacity: 0.1,
                          shadowRadius: 25,
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FontAwesome name="star-o" size={20} /><Text style={{ fontSize: 15 }}> 3</Text>
                      </Pressable>
                    </View>
                    <View style={{ flex: 1, marginLeft: 5 }}>
                      <Pressable
                        style={{
                          padding: 10,
                          backgroundColor: '#fff',
                          borderRadius: 7,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 10 },
                          shadowOpacity: 0.1,
                          shadowRadius: 25,
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FontAwesome name="star-o" size={20} /><Text style={{ fontSize: 15 }}> 2</Text>
                      </Pressable>
                    </View>
                    <View style={{ flex: 1, marginLeft: 5 }}>
                      <Pressable
                        style={{
                          padding: 10,
                          backgroundColor: '#fff',
                          borderRadius: 7,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 10 },
                          shadowOpacity: 0.1,
                          shadowRadius: 25,
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FontAwesome name="star-o" size={20} /><Text style={{ fontSize: 15 }}> 1</Text>
                      </Pressable>

                    </View>
                    <View style={{ flex: 1 }} />
                  </View>
                </View>
              </View>
            )}


          <View style={{ width: '90%', alignSelf: 'center' }}>

            <FlatList
              data={commentsListData}
              renderItem={renderComments}
            />

          </View>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
          >
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              activeOpacity={1}
              onPress={closeModal}
            >
              <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                  Thank you for your Inquiries.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 20 }}>
                  We will get back to you as soon as possible.
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#007BFF', padding: 10, borderRadius: 5 }}
                  onPress={() => {
                    closeModal();
                    navigate('/ProfileFormTransaction');
                  }}
                >
                  <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Go to Transactions</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

     
        </View> */}

        </View>
      </ScrollView>
    </View>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  containerBox: {
    justifyContent: 'center',
    borderRadius: 5,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  category: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  specificationItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  category: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,

  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  columnContainer: {

    paddingHorizontal: 5
  },
  createButton: {
    backgroundColor: 'blue',
    color: 'white',
    padding: 10,
    borderRadius: 5,
  },


});
