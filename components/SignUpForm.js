import { StyleSheet, Text, View, TextInput, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, FlatList, Platform, Dimensions, Image } from 'react-native';
import React from 'react';
import { useEffect, useState, useRef, useCallback, useMemo, useReducer, useContext } from 'react';
// import Svg, { Path } from 'react-native-svg';
import { Octicons, Ionicons, AntDesign, Feather, Entypo, FontAwesome, FontAwesome5 } from 'react-native-vector-icons';
// import { Checkbox } from 'react-native-paper';
import { Country, State, City } from 'country-state-city';
import Select from 'react-select';
import '../assets/style.css';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
// import { setStatusBarTranslucent } from 'expo-status-bar';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, getAuth, sendEmailVerification } from 'firebase/auth';
import { auth, db, addDoc, collection, doc, setDoc, getDoc, fetchSignInMethodsForEmail, projectExtensionAuth, projectExtensionFirestore } from '../Firebase/firebaseConfig';
import { Button, NativeBaseProvider, Alert, Input, Icon, Pressable, extendTheme, Spinner, PresenceTransition } from 'native-base';
// import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { Navigate, useNavigate } from 'react-router-dom';
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext, AuthProvider } from '../context/AuthProvider';
import logo4 from '../assets/RMJ logo for flag transparent.png';


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    marginTop: 100
  },

  inputSan: {
    width: '90%',
    height: 40,
    borderWidth: 1,
    borderColor: '#aaa',
    fontSize: 16,
    padding: 10,
    borderRadius: 5,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#7AC142',
    opacity: 0.8,
  },
  checkmark: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    opacity: 0,
  },
  checkmarkLine: {
    position: 'absolute',
    backgroundColor: '#7AC142',
    width: 15,
    height: 3,
  },
  checkmarkTop: {
    transform: [{ rotate: '-45deg' }],
    top: 17,
    left: 12,
  },
  checkmarkBottom: {
    transform: [{ rotate: '45deg' }],
    top: 21,
    left: 12,
  },

});
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

  //
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
        <View style={{ flex: 1, justifyContent: 'center', }}>
          <TouchableOpacity onPress={() => navigate('/')} style={{flex: 1, justifyContent: 'center', }}>
            <Image source={{ uri: logo4 }} style={{ flex: 1, resizeMode: 'contain', aspectRatio: 0.5 }} />
          </TouchableOpacity>
        </View>
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
          // Call handleSearch with the entered text
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

const hashPassword = (password) => {
  // Simple hash function using string manipulation
  let hashedPassword = '';
  for (let i = 0; i < password.length; i++) {
    hashedPassword += String.fromCharCode(password.charCodeAt(i) + 1);
  }
  return hashedPassword;
};

const SignUpForm = () => {
  //AUTH CONTEXT
  const navigate = useNavigate();

  const initialState = 'Initial Last Name';

  function reducer(state, action) {
    switch (action.type) {
      case 'SET_LAST_NAME':
        return action.payload;
      default:
        return state;
    }
  }


  const { userEmail, logout, profileDataAuth } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [textFirst, setTextFirst] = useState('');
  const textFirstRef = useRef('');
  const [textLast, setTextLast] = useState('');
  const textLastRef = useRef('');
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const passwordRef = useRef('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const passwordConfirmRef = useRef('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordConfirmError, setPasswordConfirmError] = useState(false);
  // const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState(null);
  const [textEmail, setTextEmail] = useState('');
  const textEmailRef = useRef('');
  const [textEmailError, setTextEmailError] = useState(false);
  const [isEmailInUse, setIsEmailInUse] = useState(false);
  const [countries, setCountries] = useState([]);
  const [showPass, setShowPass] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [countryError, setCountryError] = useState(false);
  const [cityError, setCityError] = useState(false)
  // const [textStreet, setTextStreet] = useState('');
  const textStreetRef = useRef('');
  // const [textZip, setTextZip] = useState('');
  const [textStreetError, setTextStreetError] = useState(false)
  const [textZipError, setTextZipError] = useState(false);
  const textZipRef = useRef('');
  const [textPhoneNumber, setTextPhoneNumber] = useState('');
  const [textPhoneNumberError, setTextPhoneNumberError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  // const passwordConfirmClear = useRef('');



  //country and cities
  useEffect(() => {
    // Fetch the list of countries
    const countriesData = Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
    }));
    setCountries(countriesData);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      // Fetch the list of cities for the selected country
      const countryCities = City.getCitiesOfCountry(selectedCountry.value);
      const citiesData = countryCities.map((city) => ({
        value: city.name,
        label: city.name,
      }));
      setCities(citiesData);

      // Set the selected city to the first city in the options
      if (citiesData.length > 0) {
        setSelectedCity(citiesData[0]);
      } else {
        setSelectedCity({ value: 'None', label: 'None' });
      }
    }
  }, [selectedCountry]);

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    setCountryError(false);

  };

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
    setCityError(false);
  };



  const theme = extendTheme({
    colors: {
      info: {
        50: '#7b9cff',
        100: '#6f8ce6'
      },
      whiteText: {
        100: '#ffffff'
      },
      blackText: {
        100: '#000000'
      },
      primary: {
        50: '#000000'
      }

    },
    config: {
      // Changing initialColorMode to 'dark'
      initialColorMode: 'dark'
    }
  })

  //country and cities end here
  //handle live email change
  const handleChangeEmail = (value) => {
    setIsEmailInUse(false)
    textEmailRef.current = value
    const emailIsEmpty = value.trim().length === 0;

    let isEmailError = false;
    if (!emailIsEmpty) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmailValid = emailRegex.test(value);
      isEmailError = !isEmailValid;
    }
    setTextEmailError(isEmailError);

    if (emailIsEmpty) {
      setTextEmailError(isEmailError);
    }

  };
  const handleChangeFirstName = (value) => {
    textFirstRef.current = value
    const firstNameIsEmpty = value.trim().length === 0;
    setFirstNameError(firstNameIsEmpty);
    // const firstNameIsEmpty = value.trim().length === 0;
    // setTextFirst(value)
    // setFirstNameError(firstNameIsEmpty)
  };

  const handleChangeLastName = (value) => {
    textLastRef.current = value

    const lastNameIsEmpty = value.trim().length === 0;
    setLastNameError(lastNameIsEmpty);
  };

  const handleChangeZip = (value) => {
    textZipRef.current = value
    // const textZipIsEmpty = value.trim().length === 0;
    // setTextZip(value);
    // setTextZipError(textZipIsEmpty);
  };
  const handleChangeStreet = (value) => {
    textStreetRef.current = value
    // const textStreetIsEmpty = value.trim().length === 0;
    // setTextStreet(value);
    // setTextStreetError(textStreetIsEmpty);
  };
  const handlePhoneNumberChange = number => {
    setTextPhoneNumber(number)

  }

  const handlePasswordChange = (text) => {

    passwordRef.current = text;
    if (text.length < 8) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }

  };
  const handlePasswordConfirmChange = (text) => {
    passwordConfirmRef.current = text;

    if (text !== passwordRef.current) {
      setPasswordConfirmError(true);
    } else {
      setPasswordConfirmError(false);
    }
  };

  const handleFocus = () => {
    setPasswordError(false);
    setPasswordConfirmError(false);
  };

  const handleBlur = () => {
    if (password.length < 8) {
      setPasswordError(true);
    }
    if (passwordConfirm !== password) {
      setPasswordConfirmError(true);
    }
  };
  //handle phone Number

  //handle phone number

  //handle live email change ends here


  const handleNext = async () => {

    if (step === 1) {

      const email = textEmailRef.current;
      setTextEmail(email);
      const firstName = textFirstRef.current;
      setTextFirst(firstName);
      const lastName = textLastRef.current;
      setTextLast(lastName);
      const firstNameIsEmpty = textFirstRef.current.trim().length === 0;
      const lastNameIsEmpty = textLastRef.current.trim().length === 0;
      const emailIsEmpty = textEmailRef.current.trim().length === 0;

      setFirstNameError(firstNameIsEmpty);
      setLastNameError(lastNameIsEmpty);

      let isEmailError = false;

      if (emailIsEmpty) {
        isEmailError = true;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = emailRegex.test(email);
        isEmailError = !isEmailValid;

        if (!isEmailError) {
          try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            setIsEmailInUse(methods.length > 0);
            isEmailError = methods.length > 0;
            if (isEmailError) {
              setTextEmailError(false); // Reset the textEmailError if email is already in use
            }
          } catch (error) {
            console.log('Error checking email:', error);
          }
          setIsEmailInUse(true);
        }
      }

      setTextEmailError(isEmailError);

      if (firstNameIsEmpty || lastNameIsEmpty || isEmailError) {
        return;
      }
    }

    if (step === 2) {
      const password = passwordRef.current;
      setPassword(password);
      const passwordConfirm = passwordConfirmRef.current;
      setPasswordConfirm(passwordConfirm);
      const passwordIsEmpty = passwordRef.current.trim().length === 0;
      const confirmPasswordIsEmpty = passwordConfirmRef.current.trim().length === 0;
      const isPasswordMatch = passwordRef.current === passwordConfirm;
      const isPasswordValid = passwordRef.current.trim().length >= 8;


      // if(!passwordIsEmpty){
      //   return;
      // }

      if (passwordIsEmpty && !isPasswordValid && confirmPasswordIsEmpty) {
        setPasswordError(passwordIsEmpty || (!passwordIsEmpty && !isPasswordMatch) || (!passwordIsEmpty && !isPasswordValid));
        return;
      }
      // Set password error
      setPasswordConfirmError(confirmPasswordIsEmpty || (!confirmPasswordIsEmpty && !isPasswordMatch));
      if (passwordIsEmpty || confirmPasswordIsEmpty || !isPasswordMatch || !isPasswordValid) {
        passwordConfirmRef.current = '';
        return;

      }


    }

    setStep(step + 1);
    setIsOpen(!isOpen);
  };

  //hanldePrevious
  const handlePrevious = () => {
    // if (step === 2){
    //   setTextFirst(textFirstRef.current);
    //   setTextLast(textLastRef.current);
    //   setTextEmail(textEmailRef.current);
    //   setIsEmailInUse(false);
    // }
    setStep(step - 1);
    setIsOpen(!isOpen);
  };


  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  //CREATE AN ACCOUNT
  // const createAccount = async () => {

  //   try {
  //     if (password === passwordConfirm) {
  //       await createUserWithEmailAndPassword(auth, textEmail, password);

  //     setTextEmail(''); // Clear the email input
  //     setPassword(''); // Clear the password input
  //     setError(null); // Clear the error state
  //     setPasswordConfirm('');
  //     setShowSuccessAlert(true);


  //     } else {
  //       setError("Passwords don't match");
  //     }
  //   } catch (e) {
  //     setError('There was a problem creating your account');
  //   }

  // };
  //CREATE AN ACCOUNT ends here



  //fetch data
  const FetchData = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          // Fetch the user document from the "users" collection
          const userDocRef = doc(db, 'accounts', 'asd1233@gmail.com'); // Replace 'userDocumentId' with the actual ID of the user document
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            setUserData(userData);
          } else {
            console.log('User document does not exist.');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
    }, []);

    return (
      <View>
        {userData && (
          <View>
            <Text>User profile:</Text>
            <Text>Email: {userData.textEmail}</Text>
            <Text>Password: {userData.password}</Text>
            <Text>First Name: {userData.textFirst}</Text>
            <Text>Last Name: {userData.textLast}</Text>
            <Text>Country: {userData.country}</Text>
          </View>
        )}
      </View>
    );
  };
  //fetch data ends here

  //Create an account start
  const handleSubmit = async () => {
    setIsLoading(true);
    const countryLabel = selectedCountry ? selectedCountry.label : '';
    const cityLabel = selectedCity ? selectedCity.label : '';
    const street = textStreetRef.current;
    const zip = textZipRef.current;
    try {
      const email = textEmail;
      const firstName = textFirst;
      const lastName = textLast;
      const passwordText = password;
      // const passwordRef = password.current;
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userCredentialAuth = await createUserWithEmailAndPassword(projectExtensionAuth, email, password);

      // User successfully created, now set the success alert
      setShowSuccessAlert(true);

      // Get the user object from the userCredential
      const user = userCredential.user;
      const userAuth = userCredentialAuth.user;


      // Send email verification
      await sendEmailVerification(user);
      await auth.signOut(user);

      await sendEmailVerification(userAuth);
      await auth.signOut(userAuth);

      // Get the authentication token


      // Create a new document in the "accounts" collection
      const userDocRef = doc(db, 'accounts', textEmail);
      const userDocRefAuth = doc(projectExtensionFirestore, 'accounts', textEmail)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // const hashedPassword = hashPassword(password);

      // Create a new document or overwrite existing document with the same email
      await setDoc(userDocRef, {
        textEmail: email,
        textFirst: firstName,
        textLast: lastName,
        password: passwordText,
        country: countryLabel,
        city: cityLabel,
        textPhoneNumber,
        textStreet: street,
        textZip: zip
      });
      await setDoc(userDocRefAuth, {
        textEmail: email,
        textFirst: firstName,
        textLast: lastName,
        password: passwordText,
        country: countryLabel,
        city: cityLabel,
        textPhoneNumber,
        textStreet: street,
        textZip: zip
      });
      console.log('User profile created with ID:', textEmail);
      setTextEmail(email); // Set userEmail state after email verification is sent
      // Reset form fields
      setPassword('');
      setTextFirst('');
      setTextLast('');
      setCountries('');
      setStep(step + 1);
    } catch (error) {
      console.error('Error creating user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };



  //NEW BREAKPOINT
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  useEffect(() => {
    const handleDimensionsChange = ({ window }) => {
      setScreenWidth(window.width);
    };

    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

    return () => subscription.remove();
  }, []);

  let formWidth;
  if (screenWidth >= 1280) {
    formWidth = 625;
  } else if (screenWidth >= 992) {
    formWidth = 485;
  } else if (screenWidth >= 768) {
    formWidth = 380;
  } else if (screenWidth >= 480) {
    formWidth = 400;
  } else {

    formWidth = 320;
  }
  //NEW BREAKPOINT ENDS HERE


  //phone style

  //phone style ends here


  return (
    <View>
      <StickyHeader />
      <View style={styles.container}>

        {/*PC FORM*/}
        {screenWidth >= 768 ? (
          <View style={{ flexDirection: 'row', maxHeight: '100%' }}>
            <View style={{ width: 'auto', maxHeight: '100%', height: 'auto' }}>
              <View style={{
                width: '100%', elevation: 3,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.4,
                shadowRadius: 4,
                borderRadius: 1,
                backgroundColor: '#95b0ff'
              }}>

                {step === 1 && (

                  <View style={{ height: 550, maxHeight: '100%' }}>
                    <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                      <Text style={{ color: '#FFDE7B', fontSize: 32, fontWeight: '900' }}>O</Text>
                      <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>  Real Motor Japan</Text>
                    </View>
                    <View style={{ marginTop: 25, padding: 16, marginLeft: 10, }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Feather name="check-circle" size={14} color={"#FFDE7B"} />
                        <Text style={{ fontSize: 16, color: '#fff', marginLeft: 5, fontWeight: 'bold' }}>Details</Text>
                      </View>
                      <View style={{ marginTop: 5 }} />
                      <Text style={{ fontSize: 14, color: '#fff', marginLeft: 10, }}>Kindly provide your name and email.</Text>
                    </View>
                    <View style={{ marginTop: -10, padding: 16, marginLeft: 10, }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Feather name="check-circle" size={14} color={"#D7E1FF"} />
                        <Text style={{ fontSize: 16, color: '#D7E1FF', marginLeft: 5, fontWeight: 'bold' }}>Password</Text>
                      </View>
                      <View style={{ marginTop: 5 }} />
                      <Text style={{ fontSize: 14, color: '#D7E1FF', marginLeft: 10, }}>Must be at least 8 characters long.</Text>
                    </View>
                    <View style={{ marginTop: -10, padding: 16, marginLeft: 10, }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Feather name="check-circle" size={14} color={"#D7E1FF"} />
                        <Text style={{ fontSize: 16, color: '#D7E1FF', marginLeft: 5, fontWeight: 'bold' }}>Basic Information</Text>
                      </View>
                      <View style={{ marginTop: 5 }} />
                      <Text style={{ fontSize: 14, color: '#D7E1FF', marginLeft: 10, }}>It simplifies negotiations and makes the final price clear.</Text>
                    </View>


                  </View>
                )}
                {step === 2 && (
                  <View style={{ height: 550, maxHeight: '100%' }}>
                    <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                      <Text style={{ color: '#FFDE7B', fontSize: 32, fontWeight: '900' }}>O</Text>
                      <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>  Real Motor Japan</Text>
                    </View>
                    <View style={{ marginTop: 25, padding: 16, marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Feather name="check-circle" size={14} color={"#D7E1FF"} />
                        <Text style={{ fontSize: 16, color: '#D7E1FF', marginLeft: 5, fontWeight: 'bold' }}>Details</Text>
                      </View>
                      <View style={{ marginTop: 5 }} />
                      <Text style={{ fontSize: 14, color: '#D7E1FF', marginLeft: 10 }}>Kindly provide your name and email.</Text>
                    </View>
                    <View style={{ marginTop: -10, padding: 16, marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Feather name="check-circle" size={14} color={"#FFDE7B"} />
                        <Text style={{ fontSize: 16, color: '#fff', marginLeft: 5, fontWeight: 'bold' }}>Password</Text>
                      </View>
                      <View style={{ marginTop: 5 }} />
                      <Text style={{ fontSize: 14, color: '#fff', marginLeft: 10, }}>Must be at least 8 characters long.</Text>
                    </View>
                    <View style={{ marginTop: -10, padding: 16, marginLeft: 10, }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Feather name="check-circle" size={14} color={"#D7E1FF"} />
                        <Text style={{ fontSize: 16, color: '#D7E1FF', marginLeft: 5, fontWeight: 'bold' }}>Basic Information</Text>
                      </View>
                      <View style={{ marginTop: 5 }} />
                      <Text style={{ fontSize: 14, color: '#D7E1FF', marginLeft: 10, }}>It simplifies negotiations and makes the final price clear.</Text>
                    </View>

                  </View>
                )}
                {step === 3 && (
                  <View style={{ height: 550, maxHeight: '100%' }}>
                    <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                      <Text style={{ color: '#FFDE7B', fontSize: 32, fontWeight: '900' }}>O</Text>
                      <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>  Real Motor Japan</Text>
                    </View>
                    <View style={{ marginTop: 25, padding: 16, marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Feather name="check-circle" size={14} color={"#D7E1FF"} />
                        <Text style={{ fontSize: 16, color: '#D7E1FF', marginLeft: 5, fontWeight: 'bold' }}>Details</Text>
                      </View>
                      <View style={{ marginTop: 5 }} />
                      <Text style={{ fontSize: 14, color: '#D7E1FF', marginLeft: 10, }}>Kindly provide your name and email.</Text>
                    </View>
                    <View style={{ marginTop: -10, padding: 16, marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Feather name="check-circle" size={14} color={"#D7E1FF"} />
                        <Text style={{ fontSize: 16, color: '#D7E1FF', marginLeft: 5, fontWeight: 'bold' }}>Password</Text>
                      </View>
                      <View style={{ marginTop: 5 }} />
                      <Text style={{ fontSize: 14, color: '#D7E1FF', marginLeft: 10, }}>Must be at least 8 characters long.</Text>
                    </View>
                    <View style={{ marginTop: -10, padding: 16, marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Feather name="check-circle" size={14} color={"#FFDE7B"} />
                        <Text style={{ fontSize: 16, color: '#fff', marginLeft: 5, fontWeight: 'bold' }}>Basic Information</Text>
                      </View>
                      <View style={{ marginTop: 5 }} />
                      <Text style={{ fontSize: 14, color: '#fff', marginLeft: 10 }}>It simplifies negotiations and makes the final price clear.</Text>
                    </View>

                  </View>
                )}



              </View>

            </View>
            {/*
   ABOVE IS THE LEFT SIDE CONTAINER FOR PC SCREEN
   BELOW IS THE RIGHT SIDE CONTAINER WITH INPUT FOR PC SCREEN
   */}
            <View style={{ maxHeight: '100%', }} >
              <View style={{ width: formWidth, maxHeight: '100%', height: 'auto' }}>

                <View style={{
                  width: '100%', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  borderRadius: 5
                }}>

                  <View style={{ marginTop: 50 }} />

                  <View style={{ width: '100%', }}>
                    <NativeBaseProvider theme={theme}>


                      {step === 1 && (
                        <PresenceTransition visible={!isOpen} initial={{
                          opacity: 0
                        }} animate={{
                          opacity: 1,
                          transition: {
                            duration: 250
                          }
                        }}>
                          <View style={{ height: 500 }}>
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <View
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 5,
                                  backgroundColor: '#fff',

                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderWidth: 1,
                                  borderColor: '#aaa'
                                }}
                              >
                                <AntDesign name="adduser" size={30} color="#000" />
                              </View>
                            </View>
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ fontWeight: 'bold', fontSize: 24, textAlign: 'center' }}>Create an account</Text>
                              <Text style={{ fontWeight: '300', fontSize: 12, color: '#aaa' }}>Enter your Name and Email.</Text>
                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                _invalid={{ borderColor: 'red.500' }}
                                placeholder="First Name (名前)"
                                defaultValue={textFirstRef.current}
                                onChangeText={handleChangeFirstName}
                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                isInvalid={firstNameError}
                                focusOutlineColor={firstNameError ? 'red.500' : 'info.50'}
                              />
                              {firstNameError && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                  <MaterialIcons name="error" size={10} color="red" />
                                  <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Enter First Name</Text>
                                </View>
                              )}
                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                _invalid={{ borderColor: 'red.500' }}
                                placeholder="Last Name (姓)"

                                defaultValue={textLastRef.current}
                                onChangeText={handleChangeLastName}
                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                isInvalid={lastNameError}
                                focusOutlineColor={lastNameError ? 'red.500' : 'info.50'}
                              />
                              {lastNameError && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                  <MaterialIcons name="error" size={10} color="red" />
                                  <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Enter Last Name</Text>
                                </View>
                              )}
                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: 'info.50', bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                InputLeftElement={<Icon as={<MaterialIcons name="person" />} ml={2} size={5} color="muted.400" />}
                                placeholder="Email (メール)"
                                defaultValue={textEmailRef.current}
                                onChangeText={handleChangeEmail}
                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                _invalid={{ borderColor: 'red.500' }}
                                isInvalid={!!textEmailError}
                                focusOutlineColor={textEmailError ? 'red.500' : 'info.50'}
                              />
                              {textEmailError && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                  <MaterialIcons name="error" size={10} color="red" />
                                  {isEmailInUse ? (
                                    <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Email already in use</Text>
                                  ) : (
                                    <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Please enter a valid email</Text>
                                  )}
                                </View>

                              )}
                            </View>

                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Button w={'90%'} onPress={handleNext} bg="info.50" _hover={{ bg: "info.100" }} _pressed={{ bg: "info.100" }}>Next</Button>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#aaa', width: '30%' }} />
                              <Text style={{ paddingHorizontal: 10, color: '#aaa' }}>or</Text>
                              <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#aaa', width: '30%' }} />
                            </View>
                            <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Text>Create account using Google</Text>
                            </View>

                            <View style={{ position: 'absolute', top: 480, left: '50%', transform: 'translateX(-50%)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                              <View style={{ width: 19, height: 7, borderRadius: 10, backgroundColor: '#aaa' }} />
                              <View style={{ width: 7, height: 7, borderRadius: 10, backgroundColor: '#000', marginHorizontal: 5 }} />
                              <View style={{ width: 7, height: 7, borderRadius: 10, backgroundColor: '#000' }} />
                            </View>
                          </View>
                        </PresenceTransition>
                      )}


                      {step === 2 && (
                        <PresenceTransition visible={isOpen} initial={{
                          opacity: 0
                        }} animate={{
                          opacity: 1,
                          transition: {
                            duration: 250
                          }
                        }}>
                          <View style={{ height: 500 }}>
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <View
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 5,
                                  backgroundColor: '#fff',

                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderWidth: 1,
                                  borderColor: '#aaa'
                                }}
                              >
                                <AntDesign name="lock" size={30} color="#000" />
                              </View>
                            </View>
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ fontWeight: 'bold', fontSize: 24, textAlign: 'center' }}>Password</Text>
                              <Text style={{ fontWeight: '300', fontSize: 12, color: '#aaa' }}>Must be at least 8 characters.</Text>
                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                placeholder="Password"
                                defaultValue={passwordRef.current}
                                onChangeText={handlePasswordChange}
                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                type={showPass ? "text" : "password"}
                                InputRightElement={<Pressable onPress={() => setShowPass(!showPass)}>
                                  <Icon as={<MaterialIcons name={showPass ? "visibility" : "visibility-off"} />} size={5} mr="2" color="muted.400" />
                                </Pressable>}
                                _invalid={{ borderColor: 'red.500' }}
                                isInvalid={passwordError}
                                focusOutlineColor={passwordError ? 'red.500' : 'info.50'}
                              //     onFocus={handleFocus}
                              // onBlur={handleBlur}
                              />
                              {passwordError && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                  <MaterialIcons name="error" size={10} color="red" />
                                  <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Password must be 8 characters long</Text>
                                </View>
                              )}
                              {/* {passwordError && (
  <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
    <MaterialIcons name="error" size={12} color="red" />
  </View>
)} */}
                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                placeholder="Confirm Password"
                                defaultValue={passwordConfirmRef.current}
                                onChangeText={handlePasswordConfirmChange}
                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                type={showPass ? "text" : "password"}
                                InputRightElement={<Pressable onPress={() => setShowPass(!showPass)}>
                                  <Icon as={<MaterialIcons name={showPass ? "visibility" : "visibility-off"} />} size={5} mr="2" color="muted.400" />
                                </Pressable>}
                                _invalid={{ borderColor: 'red.500' }}
                                isInvalid={passwordConfirmError}
                                focusOutlineColor={passwordConfirmError ? 'red.500' : 'info.50'}
                              />
                              {passwordConfirmError && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                  <MaterialIcons name="error" size={10} color="red" />
                                  <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Password does not match!</Text>
                                </View>
                              )}
                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>

                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                              <Button w={'40%'} onPress={handlePrevious} _pressed={{ bg: "info.100" }} bg="info.50" _hover={{ bg: "info.100" }}>Prev</Button>
                              <View style={{ marginHorizontal: '5%' }} />
                              <Button w={'40%'} onPress={handleNext} _pressed={{ bg: "info.100" }} bg="info.50" _hover={{ bg: "info.100" }}>Next</Button>
                            </View>
                            <View style={{ position: 'absolute', top: 480, left: '50%', transform: 'translateX(-50%)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                              <View style={{ width: 7, height: 7, borderRadius: 10, backgroundColor: '#000' }} />
                              <View style={{ width: 19, height: 7, borderRadius: 10, backgroundColor: '#aaa', marginHorizontal: 5 }} />
                              <View style={{ width: 7, height: 7, borderRadius: 10, backgroundColor: '#000' }} />
                            </View>
                          </View>
                        </PresenceTransition>
                      )}

                      {step === 3 && (
                        <PresenceTransition visible={!isOpen} initial={{
                          opacity: 0
                        }} animate={{
                          opacity: 1,
                          transition: {
                            duration: 250
                          }
                        }}>
                          <View style={{ height: 500 }}>
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <View
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 5,
                                  backgroundColor: '#fff',

                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderWidth: 1,
                                  borderColor: '#aaa'
                                }}
                              >
                                <AntDesign name="info" size={30} color="#000" />
                              </View>
                            </View>
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ fontWeight: 'bold', fontSize: 24, textAlign: 'center' }}>Basic Information</Text>
                              <Text style={{ fontWeight: '300', fontSize: 12, color: '#aaa' }}>Know your customer.</Text>
                            </View>
                            <View style={{ width: '100%', zIndex: 2, marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <View style={{ width: '90%', zIndex: 5 }}>
                                <Select
                                  styles={{
                                    control: (provided) => ({
                                      ...provided,
                                      borderColor: countryError ? 'red' : provided.borderColor,
                                      fontSize: 13,
                                    }),
                                  }}
                                  options={countries}
                                  value={selectedCountry}
                                  onChange={handleCountryChange}
                                  placeholder="Select a country (国を選択)"
                                />
                              </View>
                              <View style={{ marginVertical: 10 }} />
                              <View style={{ width: '90%' }}>
                                <Select
                                  styles={{
                                    control: (provided) => ({
                                      ...provided,
                                      borderColor: cityError ? 'red' : provided.borderColor,
                                      fontSize: 13,
                                    }),
                                  }}
                                  options={cities}
                                  value={selectedCity}
                                  onChange={handleCityChange}
                                  placeholder="Select a city (都市を選択)"
                                />
                              </View>
                            </View>
                            <View style={{ marginVertical: 10, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                placeholder="Street (通り)"

                                onChangeText={handleChangeStreet}
                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                _invalid={{ borderColor: 'red.500' }}
                                isInvalid={textStreetError}
                                focusOutlineColor={textStreetError ? 'red.500' : 'info.50'}
                              />
                            </View>
                            <View style={{ marginVertical: 10, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                placeholder="ZIP Code (郵便番号)"

                                onChangeText={handleChangeZip}
                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                _invalid={{ borderColor: 'red.500' }}
                                isInvalid={textZipError}
                                focusOutlineColor={textZipError ? 'red.500' : 'info.50'}
                              />
                            </View>
                            <View style={{ zIndex: 1, width: '100%', marginVertical: 10, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                              <PhoneInput
                                value={textPhoneNumber}
                                onChange={handlePhoneNumberChange}
                                specialLabel={''}
                                country={'jp'}

                              />
                              {textPhoneNumberError && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                  <MaterialIcons name="error" size={12} color="red" />
                                  <Text style={{ marginLeft: 5, color: 'red' }}>Please input valid phone number.</Text>
                                </View>
                              )}
                            </View>
                            {/* <Button title="Console log this shizz" onPress={handleConsoleLog}  /> */}
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                              <Button w={'40%'} disabled={isLoading} onPress={handlePrevious} _pressed={{ bg: "info.100" }} bg="info.50" _hover={{ bg: "info.100" }}>Prev</Button>
                              <View style={{ marginHorizontal: '5%' }} />

                              <Button disabled={isLoading} w={'40%'} onPress={handleSubmit} _pressed={{ bg: "info.100" }} bg="info.50" _hover={{ bg: "info.100" }}>{isLoading ? <Spinner color="white" /> : 'Sign Up'}</Button>

                            </View>
                            <View style={{ position: 'absolute', top: 480, left: '50%', transform: 'translateX(-50%)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

                              <View style={{ width: 7, height: 7, borderRadius: 10, backgroundColor: '#000' }} />
                              <View style={{ width: 7, height: 7, borderRadius: 10, backgroundColor: '#000', marginHorizontal: 5 }} />
                              <View style={{ width: 19, height: 7, borderRadius: 10, backgroundColor: '#aaa' }} />
                            </View>
                          </View>
                        </PresenceTransition>
                      )}


                      {step === 4 && (
                        <View style={{ height: 500, alignItems: 'center', maxHeight: '100%' }}>
                          <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{
                              borderRadius: 150, marginTop: -40
                            }}>
                              <Entypo name="check" size={100} color={'#fff'} style={{ position: 'absolute', top: 20, left: 25, zIndex: 2 }} />
                              <View style={{ width: 150, height: 150, borderRadius: 150, backgroundColor: '#00cc00' }} />
                            </View>
                            <Text style={{ fontWeight: 'bold', fontSize: 24 }}>
                              Email Verification Sent
                            </Text>
                            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                              <Text>A verification email has been sent to</Text>
                              <Text style={{ fontStyle: "italic", textDecorationLine: 'underline' }}>{textEmail}</Text>
                            </View>
                            <View style={{ justifyContent: 'center', alignItems: 'center', width: 300, marginTop: 10 }}>
                              <Text style={{ textAlign: 'center' }}>Please click on the verification link in your email to continue your registration.</Text>
                            </View>
                            <View style={{ justifyContent: 'center', alignItems: 'center', width: 300, marginVertical: 10 }}>
                              <FontAwesome5 name="envelope-open-text" size={60} />
                            </View>
                            <View style={{ justifyContent: 'center', alignItems: 'center', width: 350, marginTop: 10 }}>
                              <Text style={{ textAlign: 'center' }}>If you haven't received the confirmation email, please ensure to check your spam folder or verify that the email address you provided is accurate.</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigate('/')} style={{
                              borderWidth: 1, borderColor: '#7b9cff', justifyContent: 'center', alignItems: 'center', height: 40,
                              shadowColor: '#000', // Set the shadow color for iOS
                              shadowOffset: { width: 0, height: 4 }, // Set the shadow offset (y = 4)
                              shadowOpacity: 0.25, // Set the shadow opacity (25%)
                              shadowRadius: 4,
                              marginBottom: 5,
                              maxWidth: '100%',
                              margin: 5,
                              padding: 2,
                            }}>
                              <Text adjustsFontSizeToFit numberOfLines={2} style={{ textAlign: 'center', color: 'black', fontSize: 12 }}>Go back to Home</Text>
                            </TouchableOpacity>

                          </View>
                        </View>)}



                    </NativeBaseProvider>
                  </View>

                </View>

              </View>

            </View>

          </View>
        ) : (
          //MOBILE VIEW HERE
          //*
          //*
          //*
          //*
          //*
          //*
          <View style={{ maxHeight: '100%' }}>
            <View style={{ width: formWidth, maxHeight: '100%', height: 'auto' }}>

              <View style={{ flexDirection: 'row', }}>
                {step === 1 && (
                  <View style={{
                    backgroundColor: '#95b0ff',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.4,
                    shadowRadius: 4,
                    borderRadius: 1,
                    width: formWidth, padding: 16, maxHeight: '100%', height: 'auto', zIndex: 1, bottom: -5, borderRadius: 5
                  }}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                      <Text style={{ color: '#FFDE7B', fontSize: 32, fontWeight: '900' }}>O</Text>
                      <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>  Real Motor Japan</Text>
                    </View>
                    <View style={{ padding: 16, marginLeft: 10, }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Feather name="check-circle" size={14} color={"#FFDE7B"} />
                        <Text style={{ fontSize: 16, color: '#fff', marginLeft: 5, fontWeight: 'bold' }}>Details</Text>
                      </View>
                      <View style={{ marginTop: 5 }} />
                      <Text style={{ fontSize: 14, color: '#fff', marginLeft: 10, }}>Kindly provide your name and email.</Text>
                    </View>
                  </View>
                )}

                {step === 2 && (
                  <View style={{
                    backgroundColor: '#95b0ff',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.4,
                    shadowRadius: 4,
                    borderRadius: 1,
                    width: formWidth, padding: 16, maxHeight: '100%', height: 'auto', zIndex: 1, bottom: -5, borderRadius: 5
                  }}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                      <Text style={{ color: '#FFDE7B', fontSize: 32, fontWeight: '900' }}>O</Text>
                      <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>  Real Motor Japan</Text>
                    </View>
                    <View style={{ padding: 16, marginLeft: 10, }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Feather name="check-circle" size={14} color={"#FFDE7B"} />
                        <Text style={{ fontSize: 16, color: '#fff', marginLeft: 5, fontWeight: 'bold' }}>Password</Text>
                      </View>
                      <View style={{ marginTop: 5 }} />
                      <Text style={{ fontSize: 14, color: '#fff', marginLeft: 10, }}>Must be at least 8 characters long.</Text>
                    </View>
                  </View>
                )}

                {step === 3 && (
                  <View style={{
                    backgroundColor: '#95b0ff',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.4,
                    shadowRadius: 4,
                    borderRadius: 1,
                    width: formWidth, padding: 16, maxHeight: '100%', height: 'auto', zIndex: 1, bottom: -5, borderRadius: 5
                  }}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginTop: 10 }}>
                      <Text style={{ color: '#FFDE7B', fontSize: 32, fontWeight: '900' }}>O</Text>
                      <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>  Real Motor Japan</Text>
                    </View>
                    <View style={{ padding: 16, marginLeft: 10, }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Feather name="check-circle" size={14} color={"#FFDE7B"} />
                        <Text style={{ fontSize: 16, color: '#fff', marginLeft: 5, fontWeight: 'bold' }}>Basic Information</Text>
                      </View>
                      <View style={{ marginTop: 5 }} />
                      <View style={{ width: 200, marginLeft: 10 }}>
                        <Text style={{ fontSize: 14, color: '#fff' }}>It simplifies negotiations and makes the final price clear.</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

            </View>
            {/*
              ABOVE IS THE TOP CONTAINER MOBILE VIEW
              *
              *
              *
              *
              BELOW IS THE BOTTOM CONTAINER INPUT TEXT MOBILE VIEW
              */}
            <View style={{ zIndex: 2, alignItems: 'center' }}>
              <View style={{ width: formWidth, maxHeight: '100%', height: 'auto', alignItems: 'center' }}>
                <View style={{
                  width: '100%', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  borderRadius: 5
                }}>


                  {error && <Text style={{ color: 'red' }}>{error}</Text>}
                  <View style={{ width: '100%', }}>
                    <NativeBaseProvider theme={theme}>

                      <View style={{ marginTop: 30 }} />
                      {step === 1 && (
                        <PresenceTransition visible={!isOpen} initial={{
                          opacity: 0
                        }} animate={{
                          opacity: 1,
                          transition: {
                            duration: 250
                          }
                        }}>
                          <View style={{ height: 500 }}>
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <View
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 5,
                                  backgroundColor: '#fff',

                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderWidth: 1,
                                  borderColor: '#aaa'
                                }}
                              >
                                <AntDesign name="adduser" size={30} color="#000" />
                              </View>
                            </View>
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ fontWeight: 'bold', fontSize: 24, textAlign: 'center' }}>Create an account</Text>
                              <Text style={{ fontWeight: '300', fontSize: 12, color: '#aaa' }}>Enter your Name and Email.</Text>
                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                placeholder="First Name (名前)"
                                defaultValue={textFirstRef.current}
                                onChangeText={handleChangeFirstName}
                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                isInvalid={firstNameError}
                                focusOutlineColor={firstNameError ? 'red.500' : 'info.50'}
                              />
                              {firstNameError && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                  <MaterialIcons name="error" size={10} color="red" />
                                  <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Enter First Name</Text>
                                </View>
                              )}
                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                placeholder="Last Name (姓)"
                                defaultValue={textLastRef.current}
                                onChangeText={handleChangeLastName}
                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                isInvalid={lastNameError}
                                focusOutlineColor={lastNameError ? 'red.500' : 'info.50'}
                              />
                              {lastNameError && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                  <MaterialIcons name="error" size={10} color="red" />
                                  <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Enter Last Name</Text>
                                </View>
                              )}
                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                InputLeftElement={<Icon as={<MaterialIcons name="person" />} ml={2} size={5} color="muted.400" />}
                                placeholder="Email (メール)"
                                defaultValue={textEmailRef.current}
                                onChangeText={handleChangeEmail}
                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                _invalid={{ borderColor: 'red.500' }}
                                isInvalid={!!textEmailError}
                                focusOutlineColor={textEmailError ? 'red.500' : 'info.50'}
                              />
                              {textEmailError && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                  <MaterialIcons name="error" size={10} color="red" />
                                  {isEmailInUse ? (
                                    <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Email already in use</Text>


                                  ) : (
                                    <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Please enter a valid email</Text>
                                  )}
                                </View>
                              )}
                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Button w={'90%'} _pressed={{ bg: "info.100" }} onPress={handleNext} bg={"info.50"} _hover={{ bg: "info.100" }}>Next</Button>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#aaa', width: '30%' }} />
                              <Text style={{ paddingHorizontal: 10, color: '#aaa' }}>or</Text>
                              <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#aaa', width: '30%' }} />
                            </View>
                            <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Text>Create account using Google</Text>
                            </View>

                            <View style={{ position: 'absolute', top: 480, left: '50%', transform: 'translateX(-50%)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                              <View style={{ width: 19, height: 7, borderRadius: 10, backgroundColor: '#aaa' }} />
                              <View style={{ width: 7, height: 7, borderRadius: 10, backgroundColor: '#000', marginHorizontal: 5 }} />
                              <View style={{ width: 7, height: 7, borderRadius: 10, backgroundColor: '#000' }} />
                            </View>
                          </View>
                        </PresenceTransition>
                      )}


                      {step === 2 && (
                        <PresenceTransition visible={isOpen} initial={{
                          opacity: 0
                        }} animate={{
                          opacity: 1,
                          transition: {
                            duration: 250
                          }
                        }}>
                          <View style={{ height: 500 }}>
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <View
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 5,
                                  backgroundColor: '#fff',

                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderWidth: 1,
                                  borderColor: '#aaa'
                                }}
                              >
                                <AntDesign name="lock" size={30} color="#000" />
                              </View>
                            </View>
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ fontWeight: 'bold', fontSize: 24, textAlign: 'center' }}>Password</Text>
                              <Text style={{ fontWeight: '300', fontSize: 12, color: '#aaa' }}>Must be at least 8 characters.</Text>
                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                placeholder="Password (パスワード)"
                                defaultValue={passwordRef.current}
                                onChangeText={handlePasswordChange}

                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                type={showPass ? "text" : "password"}
                                InputRightElement={<Pressable onPress={() => setShowPass(!showPass)}>
                                  <Icon as={<MaterialIcons name={showPass ? "visibility" : "visibility-off"} />} size={5} mr="2" color="muted.400" />
                                </Pressable>}
                                _invalid={{ borderColor: 'red.500' }}
                                isInvalid={passwordError}
                                focusOutlineColor={passwordError ? 'red.500' : 'info.50'}
                              // onFocus={handleFocus}
                              // onBlur={handleBlur}
                              />
                              {passwordError && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                  <MaterialIcons name="error" size={10} color="red" />
                                  <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Password must be 8 characters long</Text>
                                </View>
                              )}
                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                placeholder="Confirm Password (パスワードの確認)"
                                defaultValue={passwordConfirmRef.current}
                                onChangeText={handlePasswordConfirmChange}

                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                type={showPass ? "text" : "password"}
                                InputRightElement={<Pressable onPress={() => setShowPass(!showPass)}>
                                  <Icon as={<MaterialIcons name={showPass ? "visibility" : "visibility-off"} />} size={5} mr="2" color="muted.400" />
                                </Pressable>}
                                _invalid={{ borderColor: 'red.500' }}
                                isInvalid={passwordConfirmError}
                                focusOutlineColor={passwordConfirmError ? 'red.500' : 'info.50'}
                              />
                              {passwordConfirmError && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                  <MaterialIcons name="error" size={10} color="red" />
                                  <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Password does not match!</Text>
                                </View>
                              )}
                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>

                            </View>
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                              <Button w={'40%'} onPress={handlePrevious} _pressed={{ bg: "info.100" }} bg={"info.50"} _hover={{ bg: "info.100" }}>Prev</Button>
                              <View style={{ marginHorizontal: '5%' }} />
                              <Button w={'40%'} onPress={handleNext} _pressed={{ bg: "info.100" }} bg={"info.50"} _hover={{ bg: "info.100" }}>Next</Button>
                            </View>
                            <View style={{ position: 'absolute', top: 480, left: '50%', transform: 'translateX(-50%)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                              <View style={{ width: 7, height: 7, borderRadius: 10, backgroundColor: '#000' }} />
                              <View style={{ width: 19, height: 7, borderRadius: 10, backgroundColor: '#aaa', marginHorizontal: 5 }} />
                              <View style={{ width: 7, height: 7, borderRadius: 10, backgroundColor: '#000' }} />
                            </View>
                          </View>
                        </PresenceTransition>
                      )}

                      {step === 3 && (
                        <PresenceTransition visible={!isOpen} initial={{
                          opacity: 0
                        }} animate={{
                          opacity: 1,
                          transition: {
                            duration: 250
                          }
                        }}>
                          <View style={{ height: 500 }}>
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <View
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 5,
                                  backgroundColor: '#fff',

                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderWidth: 1,
                                  borderColor: '#aaa'
                                }}
                              >
                                <AntDesign name="info" size={30} color="#000" />
                              </View>
                            </View>
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ fontWeight: 'bold', fontSize: 24, textAlign: 'center' }}>Basic Information</Text>
                              <Text style={{ fontWeight: '300', fontSize: 12, color: '#aaa' }}>Know your customer.</Text>
                            </View>
                            <View style={{ width: '100%', zIndex: 2, marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                              <View style={{ width: '90%', zIndex: 5 }}>
                                <Select
                                  styles={{
                                    control: (provided) => ({
                                      ...provided,
                                      borderColor: countryError ? 'red' : provided.borderColor,
                                      fontSize: 13,
                                    }),
                                  }}
                                  options={countries}
                                  value={selectedCountry}
                                  onChange={handleCountryChange}
                                  placeholder="Select a country (国を選択)"
                                />
                              </View>
                              <View style={{ marginVertical: 10 }} />
                              <View style={{ width: '90%' }}>
                                <Select
                                  styles={{
                                    control: (provided) => ({
                                      ...provided,
                                      borderColor: cityError ? 'red' : provided.borderColor,
                                      fontSize: 13,
                                    }),
                                  }}
                                  options={cities}
                                  value={selectedCity}
                                  onChange={handleCityChange}
                                  placeholder="Select a city (都市を選択)"
                                />
                              </View>
                            </View>
                            <View style={{ marginVertical: 10, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                placeholder="Street (通り)"
                                defaultValue={textStreetRef.current}
                                onChangeText={handleChangeStreet}
                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                _invalid={{ borderColor: 'red.500' }}
                                isInvalid={textStreetError}
                                focusOutlineColor={textStreetError ? 'red.500' : 'info.50'}
                              />
                            </View>
                            <View style={{ marginVertical: 10, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                              <Input
                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                placeholder="ZIP Code (郵便番号)"
                                defaultValue={textZipRef.current}
                                onChangeText={handleChangeZip}
                                style={{ height: 40, color: '#000' }}
                                w={'90%'}
                                _invalid={{ borderColor: 'red.500' }}
                                isInvalid={textZipError}
                                focusOutlineColor={textZipError ? 'red.500' : 'info.50'}
                              />

                            </View>
                            <View style={{ zIndex: 1, width: '100%', marginVertical: 10, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                              <PhoneInput
                                value={textPhoneNumber}
                                onChange={handlePhoneNumberChange}
                                specialLabel={''}
                                country={'jp'}

                              />
                              {textPhoneNumberError && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                  <MaterialIcons name="error" size={12} color="red" />
                                  <Text style={{ marginLeft: 5, color: 'red' }}>Please input valid phone number.</Text>
                                </View>
                              )}
                            </View>


                            {/* <Button title="Console log this shizz" onPress={handleConsoleLog}  /> */}
                            <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                              <Button w={'40%'} disabled={isLoading} onPress={handlePrevious} _pressed={{ bg: "info.100" }} bg="info.50" _hover={{ bg: "info.100" }}>Prev</Button>
                              <View style={{ marginHorizontal: '5%' }} />

                              <Button disabled={isLoading} w={'40%'} onPress={handleSubmit} _pressed={{ bg: "info.100" }} bg="info.50" _hover={{ bg: "info.100" }}>{isLoading ? <Spinner color="white" /> : 'Sign Up'}</Button>

                            </View>
                            <View style={{ position: 'absolute', top: 480, left: '50%', transform: 'translateX(-50%)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

                              <View style={{ width: 7, height: 7, borderRadius: 10, backgroundColor: '#000' }} />
                              <View style={{ width: 7, height: 7, borderRadius: 10, backgroundColor: '#000', marginHorizontal: 5 }} />
                              <View style={{ width: 19, height: 7, borderRadius: 10, backgroundColor: '#aaa' }} />
                            </View>
                          </View>
                        </PresenceTransition>
                      )}



                    </NativeBaseProvider>
                  </View>
                  {step === 4 && (
                    <View style={{ height: 500, alignItems: 'center', maxHeight: '100%' }}>
                      <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{
                          borderRadius: 150, marginTop: -20
                        }}>
                          <Entypo name="check" size={100} color={'#fff'} style={{ position: 'absolute', top: 20, left: 25, zIndex: 2 }} />
                          <View style={{ width: 150, height: 150, borderRadius: 150, backgroundColor: '#00cc00' }} />
                        </View>
                        <Text style={{ fontWeight: 'bold', fontSize: 24 }}>
                          Email Verification Sent
                        </Text>
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                          <Text>A verification email has been sent to</Text>
                          <Text style={{ fontStyle: "italic", textDecorationLine: 'underline' }}>{textEmail}</Text>
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center', width: 280, marginTop: 10 }}>
                          <Text style={{ textAlign: 'center' }}>Please click on the verification link in your email to continue your registration.</Text>
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center', width: 280, marginVertical: 10 }}>
                          <FontAwesome5 name="envelope-open-text" size={60} />
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center', width: 280, marginTop: 10 }}>
                          <Text style={{ textAlign: 'center' }}>If you haven't received the confirmation email, please ensure to check your spam folder or verify that the email address you provided is accurate.</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigate('/')} style={{
                          borderWidth: 1, borderColor: '#7b9cff', justifyContent: 'center', alignItems: 'center', height: 40,
                          shadowColor: '#000', // Set the shadow color for iOS
                          shadowOffset: { width: 0, height: 4 }, // Set the shadow offset (y = 4)
                          shadowOpacity: 0.25, // Set the shadow opacity (25%)
                          shadowRadius: 4,
                          marginBottom: 5,
                          maxWidth: '100%',
                          margin: 5,
                          padding: 2,
                        }}>
                          <Text adjustsFontSizeToFit numberOfLines={2} style={{ textAlign: 'center', color: 'black', fontSize: 12 }}>Go back to Home</Text>
                        </TouchableOpacity>
                      </View>

                    </View>)}

                </View>

              </View>

            </View>
          </View>
        )

        }
      </View>
    </View>

  )
};
export default SignUpForm;














{/* <View style={styles.adSign}>
<View style={{alignSelf: 'flex-start', padding: 30}}>
<Text style={{fontSize: 30, fontWeight: 500}}>REAL MOTOR JAPAN</Text>
    <View style={{marginTop: 10}}>
<Text style={{fontSize: 20, fontWeight: 450}}>Create a free account to get a reply from <br/>the seller.</Text>
    <View style={{width: 325, justifyContent: 'center', alignItems: 'center', alignContent: 'center', alignSelf: 'center', marginTop: 15}}>
    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
    <Octicons name="dot-fill" size={20} style={{fontSize: 15, paddingRight:5}} /><Text >Take part in the negotiation process, ensuring a fair and satisfactory outcome.</Text>
    </View>
    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 5}}>
    <Octicons name="dot-fill" size={20} style={{fontSize: 15,paddingRight:5 }}/><Text>100% free, no credit card required. No hidden fees</Text>
    </View>
    </View>
 </View>
</View>
<View style={{marginTop: -50, padding: 30, marginLeft: -40}}>
    <Text style={{fontSize: 20, fontWeight: 450}}>Convenient Service when you are a member!</Text>
</View>
<View style={{width: 390, height: 200 , backgroundColor: 'black'}}>
        
        <Text style={{color: 'white'}}>LOGO HERE</Text>
         <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <View style={{width: 195 }}>
            <Text style={{color: 'white'}}>Negotiate with sales representative</Text>
            <Text style={{color: 'white'}}>Your own personal Profile</Text>
            <Text style={{color: 'white'}}>Gain access to comprehensive and detailed tracking information about your car.</Text>
            </View>
            <View style={{width: 195, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{color: 'white'}}>Stay informed with the most up-to-date stock list, ensuring you have access to the latest information.</Text>
            <Text style={{color: 'white'}}>You can specify your "Final country" and "Nearest Port", you will be able to know the "Total Price" !</Text>
            <Text style={{color: 'white'}}>White</Text>
            </View>
        </View> 
</View>

   

</View> */}