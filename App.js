import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useMemo, useContext, StrictMode } from 'react'
import { AppState, StyleSheet, Text, View, Dimensions, useWindowDimensions } from 'react-native';
import { FontAwesome, Entypo, MaterialIcons, Ionicons, Fontisto } from 'react-native-vector-icons';
import { Box, NativeBaseProvider } from 'native-base';
import LoginForm from './components/LogInForm';
import SignUpForm from './components/SignUpForm';
import ProfileForm from './components/profileComponents/ProfileForm';
// import ProfileFormAddress from './components/profileComponents/ProfileFormAddress';
// import MobileForm from './components/MobileForm';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileFormPassword from './components/profileComponents/ProfileFormPassword';
import ProfileFormTransaction from './components/profileComponents/ProfileFormTransaction';
import ProfileFormFavorite from './components/profileComponents/ProfileFormFavorite';
import ThreeContainers from './components/homepage/CarViewTable';
import UploadScreen from './components/homepage/UploadScreen';
import { AuthProvider } from './context/AuthProvider';
import ForgotPassword from './components/ForgotPassword';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, getAuth, sendEmailVerification, reload } from 'firebase/auth';
import { auth, db, addDoc, collection, doc, setDoc, getDoc, fetchSignInMethodsForEmail, projectExtensionAuth } from './Firebase/firebaseConfig';
import SplashScreen from './components/SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductDetailScreen from './components/homepage/ProductScreen';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import EmailVerificationHandler from './components/EmailVerificationHandler';
import ProfileFormInquiriesChat from './components/profileComponents/ProfileFormInquiriesChat';
import ProfileFormChatGroup from './components/profileComponents/ProfileFormChatGroup';
import SearchCar from './components/homepage/SearchCar';
import SearchCarV2 from './components/homepage/SearchCarV2';
import UploadCsv from './components/homepage/UploadCsv';
import ViewInvoice from './components/profileComponents/ViewInvoice';

const widthSize = Dimensions.get('window').width
const HEADER_HEIGHT = 160;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    // top: '-12%'
    borderWidth: 1,
  },
  header: {
    position: 'fixed',
    flexDirection: 'row',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#7b9cff',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    height: HEADER_HEIGHT,
    zIndex: 1,
    width: 'auto'

  },
  footer: {

    backgroundColor: '#dfe1e8',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 2,
    // shadowColor: '#000000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
    height: 'auto',
    width: widthSize,
    marginTop: '100vh'
  },
  headerText: {
    fontSize: '90%',
    color: 'white',
    fontFamily: 'Chivo-Light',

  },
  box: {
    width: 'auto',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  }
});

const Header = () => {
  return (

    <View style={styles.header}>
      <View style={{ width: 100, height: 20, }}> </View>
      <View style={styles.box}> <Text style={styles.headerText}> Real Motor Japan | Japanese pre-owned vehicles for sale</Text> </View>
      <View style={{ width: 20, height: 20 }}> </View>
      <View style={styles.box}> <Text style={styles.headerText}> Follow us on:  <a style={{ textDecoration: 'none' }} href='https://www.facebook.com/RealMotorJP' target="_blank"><FontAwesome name="facebook-square" size={15} color="white" /> </a> <a style={{ textDecoration: 'none' }} href='https://www.instagram.com/realmotorjp/' target='_blank'><FontAwesome name="instagram" size={15} color="white" /> </a> <FontAwesome name="twitter" size={15} color="white" /></Text> </View>
      <View style={{ width: 20, height: 20 }}> </View>
      <View style={styles.box}> <Text style={styles.headerText}> <Entypo name="help-with-circle" size={15} color="white" /> Help</Text> </View>
      <View style={styles.box}> <Text style={styles.headerText}> <Ionicons name="notifications" size={15} color="white" /> Notifications</Text> </View>
      <View style={{ width: 20, height: 20 }}> </View>
      <View style={styles.box}> <Text style={styles.headerText}> <Entypo name="language" size={15} color="white" /> </Text> </View>
      <View style={{ width: 20, height: 20 }}> </View>
      <View style={styles.box}> <Text style={styles.headerText}> <Entypo name="login" size={15} color="white" /> Login |</Text> </View>
      <View style={styles.box}> <Text style={styles.headerText}> <Entypo name="new-message" size={15} color="white" /> Signup </Text> </View>
      {/* <Flag code="US" size={16} /> */}

    </View>
  );
};

//END LINE

const Footer = () => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

  useEffect(() => {
    const handleScreenResize = () => {
      setScreenWidth(Dimensions.get('window').width);
      setScreenHeight(Dimensions.get('window').height);
    };

    Dimensions.addEventListener('change', handleScreenResize);

    return () => {
      Dimensions.remove('change', handleScreenResize);
    };
  }, []);


  return (
    <View style={[styles.footer, { width: screenWidth }]}>
    </View>
  );
};
//END LINE
const Stack = createNativeStackNavigator();
const App = () => {
  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'white'
    },
  };
  //save screen
  // useEffect(() => {
  //   // Retrieve the saved screen name from AsyncStorage
  //   getCurrentScreenName();
  // }, []);

  // const getCurrentScreenName = async () => {
  //   try {
  //     const screenName = await AsyncStorage.getItem('currentScreen');
  //     setInitialRoute(screenName || 'Three Containers'); // If screenName is null (first-time app use), set to 'Log In'
  //   } catch (error) {
  //     console.log('Error retrieving screen name:', error);
  //   }
  // };
  // const [initialRoute, setInitialRoute] = useState('Log In');
  //save screen

  //SCREEN SIGN UP ENDS HERE
  const [userEmail, setUserEmail] = useState(null);
  const auth = getAuth();

  useEffect(() => {


    // Subscribe to Firebase Auth state changes to handle login persistence
    const unsubscribe = onAuthStateChanged(projectExtensionAuth, async (loggedInUser) => {
      if (loggedInUser) {
        // If the user is logged in and their email is verified, set the userEmail state
        if (loggedInUser.emailVerified) {
          try {
            await reload(loggedInUser);
            setUserEmail(loggedInUser.email);
          } catch (error) {
            console.error('Error reloading user:', error);
          }

        } else {
          // If email is not verified, reset the userEmail state
          setUserEmail(null);

        }
      } else {
        // If the user is logged out, reset the userEmail state
        setUserEmail(null);
      }
    });

    // Clean up the subscription when the component is unmounted
    return () => unsubscribe();
  }, []);
  //private route

  //private route ends here


  const [isLoading, setIsLoading] = useState(true);

  // Simulate app initialization
  setTimeout(() => {
    setIsLoading(false);
  }, 1500); // Adjust the time as needed for your app's actual initialization

  if (isLoading) {
    return <SplashScreen />;
  }



  return (

    <AuthProvider>
      <NativeBaseProvider>
        <Router>
          {/* Your Navigation */}
          <Routes>
            {/* Authenticated Routes */}
        
            <Route exact path="/" element={<ThreeContainers />} />
            <Route exact path="/ProfileFormFavorite
            " element={userEmail ? <ProfileFormFavorite /> :  <Navigate to="/LoginForm" /> } />
            <Route exact path="/Profile" element={userEmail ? <ProfileForm /> :  <Navigate to="/LoginForm" /> }  />
            <Route exact path="/ProfileFormChatGroup/:chatId" element={userEmail ? <ProfileFormChatGroup /> :  <Navigate to="/LoginForm" /> }  />
            <Route exact path="/ProfileFormChatGroup/:chatId/print" element={userEmail ? <ViewInvoice /> :  <Navigate to="/LoginForm" /> }  />
            <Route exact path="/ProfilePassword" element={userEmail ? <ProfileFormPassword /> :  <Navigate to="/LoginForm" /> } />
            <Route exact path="/VerifyEmail" element={<EmailVerificationHandler />} />
            <Route exact path="/SignUp" element={<SignUpForm />} />
            {/* 
            
           
            <Route exact path="/ProfilePassword" element={ProfileFormPassword} />
            <Route exact path="/ForgotPassword" element={ForgotPassword} />
            {/*  */}
            <Route exact path="/UploadScreen" element={<UploadScreen />} />
            <Route exact path="/ProfileFormTransaction"  element={userEmail ? <ProfileFormTransaction /> :  <Navigate to="/LoginForm" /> }  />
            <Route path="/ProductScreen/:carId" element={ <ProductDetailScreen />}/>
            <Route
              exact
              path="/LoginForm"
              element={userEmail ? <Navigate to="/" /> : <LoginForm />}
            />
            <Route
            exact
            path='/SearchCar/:searchQueryWorld'
            element={<SearchCar />}
            />
            <Route
              exact
              path='/SearchCarV2'
              element={<SearchCarV2 />}
            />
             <Route
              exact
              path='/UploadCsv'
              element={<UploadCsv />}
            />

            
            {/* <Route exact path="/ForgotPassword" element={ForgotPassword} />
            <Route exact path="/ProductScreen/:id" element={ProductDetailScreen} /> */}


            {/* Additional Routes */}
            {/* Uncomment and add your additional routes here if needed */}
            {/* <Route exact path="/ProfileFormFavorite" component={ProfileFormFavorite} />
        <Route exact path="/ProfileFormAddress" component={ProfileFormAddress} /> */}

            {/* Default Route */}

          </Routes>
        </Router>
      </NativeBaseProvider>
    </AuthProvider>


  )
};

export default App;