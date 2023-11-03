import { StyleSheet, Text, View, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, ScrollView } from 'react-native';
import React, { useEffect, useState, useRef, useMemo, useReducer, useCallback, useContext } from 'react';
import { Ionicons, AntDesign } from 'react-native-vector-icons';

import Svg, { G, Path } from 'react-native-svg';
import { MaterialIcons } from "@expo/vector-icons";
import { Button, NativeBaseProvider, Alert, Input, Icon, Pressable, extendTheme, Spinner, PresenceTransition, Checkbox } from 'native-base';
import { NavigationContainer, useIsFocused,useNavigation  } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, getAuth, sendEmailVerification } from 'firebase/auth';
import { auth, db, addDoc, collection, doc, setDoc, getDoc, fetchSignInMethodsForEmail, projectExtensionAuth } from '../Firebase/firebaseConfig';
import { AuthContext } from '../context/AuthProvider';
import SplashScreen from './SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({

  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1
  },


})



//google svg
const GoogleIcon = () => {
  return (
    <View style={{ paddingHorizontal: 15 }}>
      <Svg width={30} height={30} viewBox="0 0 48 48">

        <Path
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          fill="#fbc02d"
        />
        <Path
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          fill="#e53935"
        />
        <Path
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          fill="#4caf50"
        />
        <Path
          d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
          fill="#1565c0"
        />

      </Svg>
    </View>
  );
};

//

const Stack = createNativeStackNavigator();


const LoginForm = () => {


  const [profileData, setProfileData] = useState(null);

  //save screen
  // useEffect(() => {
  //   // Save the screen name in AsyncStorage
  //   saveCurrentScreenName('Log In');
  // }, []);

  // const saveCurrentScreenName = async (screenName) => {
  //   try {
  //     await AsyncStorage.setItem('currentScreen', screenName);
  //   } catch (error) {
  //     console.log('Error saving screen name:', error);
  //   }
  // };
  //save screen
  //theme
  const customTheme = extendTheme({
    colors: {
      info: {
        50: '#7b9cff',
        100: '#6f8ce6',
        500: '#627dcc', // Primary shade of the color
        900: '#4a5e99',
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

    }
  })
  //theme ends here
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(textEmailRef.current);
  };

  const isValidPassword = (password) => {
    // Password validation logic
    return passwordRef.current.length >= 6; // Example: Password must be at least 6 characters long
  };
  const textEmailRef = useRef('');
  const passwordRef = useRef('');
  const handleChangePassword = (value) => {
    passwordRef.current = value;
  };
  const handleChangeEmail = (value) => {
    textEmailRef.current = value;
  };


  //handle Submit

  const {  isError, setIsError } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const textEmail = textEmailRef.current;
    const password = passwordRef.current;
    setTextEmailError(false);
    setPasswordError(false);
    setBlankEmailError(false);
    setBlankPasswordError(false);

    // Perform input validation
    if (password.trim() === '' || textEmail.trim() === '') {
      if (password.trim() === '') {
        setBlankPasswordError(true);
      }
      if (textEmail.trim() === '') {
        setBlankEmailError(true);
      }
      return;
    }

    if (!isValidEmail(textEmail)) {
      setTextEmailError(true);
      return;
    }

    if (!isValidPassword(password)) {
      setPasswordError(true);
      return;
    }
    setLoading(true);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, textEmail, password);
      const userCredentialAuth = await signInWithEmailAndPassword(projectExtensionAuth, textEmail, password); //auth from marcvan14@gmail.com
      //MAKE AN AUTH FROM SAMPLERMJ THIS IS A NOTE


      // Check if the user's email is verified
      // if (!userCredential.user.emailVerified) {

      //   console.log('Error: Email not verified. Please verify your email.');
      //   setLoading(false);
      //   setTextEmailError(true);
      //   return;
      // }
      if (!userCredentialAuth.user.emailVerified) {
        // If the email is not verified, show an error message or handle it accordingly
        console.log('Error: Email not verified. Please verify your email.');
        setLoading(false);
        setTextEmailError(true);
        return;
      }

      // User's email is verified, proceed with further actions (e.g., navigation, etc.)
      console.log('User logged in successfully.');
    } catch (error) {
      // Handle login errors if necessary
      console.log('Login error:', error);
      setIsError(true);
    }

    setLoading(false); // Set loading state back to false after the login process is complete
    console.log('Submit button pressed');
    
  };


  //handle Submit ends here


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



  const [showPass, setShowPass] = useState(false);
  const [textEmailError, setTextEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [blankEmailError, setBlankEmailError] = useState(false);
  const [blankPasswordError, setBlankPasswordError] = useState(false);
  return (
    <View style={styles.container}>

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
              {/*INSERT OBJECT HERE */}
              <View style={{ width: '100%', height: 500 }}>
                <Text>LOGO HERE</Text>
              </View>
            </View>
          </View>
          {/*
ABOVE IS THE LEFT SIDE CONTAINER FOR PC SCREEN
BELOW IS THE RIGHT SIDE CONTAINER WITH INPUT FOR PC SCREEN
*/}
          <View style={{ maxHeight: '100%', }}>
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
                {/*INSERT OBJECT HERE */}
                <View style={{ width: '100%', height: 500 }}>
                  <NativeBaseProvider theme={customTheme}>

                    <View style={{ width: '100%', marginLeft: 20, marginTop: 20 }}>
                      <Text style={{ marginLeft: 10, fontWeight: 'bold', fontSize: 24, textAlign: 'left' }}>Sign in to continue to</Text>
                      <Text style={{ marginLeft: 10, fontWeight: 'bold', fontSize: 24, textAlign: 'left', color: '#7b9cff' }}>Real Motor Japan</Text>
                      <Text style={{ marginLeft: 10, fontWeight: '400', fontSize: 16, textAlign: 'left', color: '#aaa' }}>Welcome Back!</Text>
                    </View>
                    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                      <Input
                        _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                        _focus={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                        _focusVisible={{ outlineColor: 'info.50', borderColor: 'info.50', bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                        InputLeftElement={<Icon as={<MaterialIcons name="person" />} ml={2} size={5} color="muted.400" />}
                        placeholder="Email"
                        // ref={textEmailRef}
                        onChangeText={handleChangeEmail}
                        style={{ height: 40, color: '#000' }}
                        w={'90%'}
                        _invalid={{ borderColor: 'red.500' }}
                        isInvalid={textEmailError || blankEmailError || isError}
                        focusOutlineColor={isError || textEmailError || blankEmailError ? 'red.500' : 'info.50'}
                      />
                      {blankEmailError && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                          <MaterialIcons name="error" size={10} color="red" />
                          <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Email cannot be blank!</Text>
                        </View>
                      )}

                      {textEmailError && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                          <MaterialIcons name="error" size={10} color="red" />
                          <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Account does not exist/Email not verified.</Text>
                        </View>
                      )}
                      {isError && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                          <MaterialIcons name="error" size={10} color="red" />
                          <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Account does not exist.</Text>
                        </View>
                      )}


                    </View>
                    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                      <Input
                        _hover={{ borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                        _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                        _focusVisible={{ outlineColor: "info.50", borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                        InputRightElement={<Pressable onPress={() => setShowPass(!showPass)}>
                          <Icon as={<MaterialIcons name={showPass ? "visibility" : "visibility-off"} />} size={5} mr="2" color="muted.400" />
                        </Pressable>}
                        placeholder="Password"

                        onChangeText={handleChangePassword}
                        style={{ height: 40, color: '#000', borderColor: '#7b9cff' }}
                        w={'90%'}
                        type={showPass ? "text" : "password"}
                        _invalid={{ borderColor: 'red.500' }}
                        isInvalid={passwordError || blankPasswordError || isError}
                        focusOutlineColor={isError || passwordError || blankPasswordError ? 'red.500' : 'info.50'}
                      />
                      {passwordError && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                          <MaterialIcons name="error" size={10} color="red" />
                          <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Invalid password/Email!</Text>
                        </View>
                      )}
                      {blankPasswordError && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                          <MaterialIcons name="error" size={10} color="red" />
                          <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Password cannot be blank!</Text>
                        </View>
                      )}
                      {isError && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                          <MaterialIcons name="error" size={10} color="red" />
                          <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Invalid password.</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ width: '90%', alignItems: 'flex-end', justifyContent: 'flex-end', marginTop: 5 }}>
                        <TouchableOpacity>
                          <Text style={{ justifyContent: 'flex-end', color: '#7b9cff' }}>Forgot Password?</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ width: '90%', justifyContent: 'flex-start', marginTop: 10 }}>
                        <Checkbox _checked={{ bg: 'info.50', borderColor: 'info.50', _hover: { bg: 'info.100', borderColor: 'info.100' } }} _hover={{ bg: 'white', borderColor: 'info.100' }} style={{ alignItems: 'center' }}  ><Text style={{ fontSize: 14 }}>Remember Me</Text></Checkbox>
                      </View>
                    </View>
                    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                      <Button w={'90%'} onPress={handleSubmit} _pressed={{ bg: "info.100" }} bg="info.50" _hover={{ bg: "info.100" }}>Sign Up</Button>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#aaa', width: '30%' }} />
                      <Text style={{ paddingHorizontal: 10, color: '#aaa' }}>or</Text>
                      <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#aaa', width: '30%' }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                      <AntDesign name="facebook-square" size={30} color={'#4267B2'} />
                      <GoogleIcon />
                      <AntDesign name="twitter" size={30} color={'#1DA1F2'} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                      <Text>Don't have an account yet?</Text>
                      <TouchableOpacity style={{ cursor: 'pointer' }} onPress={() => navigate('/SignUp')} >
                        <Text style={{ color: '#7b9cff' }}> Sign Up</Text>
                      </TouchableOpacity>
                    </View>


                  </NativeBaseProvider>
                </View>
              </View>
            </View>
          </View>
        </View>
      ) :

        //MOBILE VIEW HERE
        (<View style={{ maxHeight: '100%' }}>
          <View style={{ width: 'auto', maxHeight: '100%', height: 100 }}>
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
              {/*INSERT OBJECT HERE */}
              <View style={{ width: '100%', height: 500 }}>
                <Text>LOGO HERE</Text>
              </View>
            </View>
          </View>
          {/*
ABOVE IS THE UPPER SIDE CONTAINER FOR PHONE SCREEN
BELOW IS THE LOWER SIDE CONTAINER WITH INPUT FOR PHONE SCREEN
*/}
          <View style={{ maxHeight: '100%', }}>
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
                {/*INSERT OBJECT HERE */}
                <View style={{ width: '100%', height: 500 }}>
                  <NativeBaseProvider theme={customTheme}>

                    <View style={{ width: '100%', marginLeft: 20, marginTop: 20 }}>
                      <Text style={{ marginLeft: 10, fontWeight: 'bold', fontSize: 24, textAlign: 'left' }}>Sign in to continue to</Text>
                      <Text style={{ marginLeft: 10, fontWeight: 'bold', fontSize: 24, textAlign: 'left', color: '#7b9cff' }}>Real Motor Japan</Text>
                      <Text style={{ marginLeft: 10, fontWeight: '400', fontSize: 16, textAlign: 'left', color: '#aaa' }}>Welcome Back!</Text>
                    </View>
                    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                      <Input
                        _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                        _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                        InputLeftElement={<Icon as={<MaterialIcons name="person" />} ml={2} size={5} color="muted.400" />}
                        placeholder="Email"
                        onChangeText={handleChangeEmail}

                        style={{ height: 40, color: '#000' }}
                        w={'90%'}
                        _invalid={{ borderColor: 'red.500' }}
                        isInvalid={textEmailError || blankEmailError}
                        focusOutlineColor={textEmailError || blankEmailError ? 'red.500' : 'info.50'}
                      />
                      {blankEmailError && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                          <MaterialIcons name="error" size={10} color="red" />
                          <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Email cannot be blank!</Text>
                        </View>
                      )}

                      {textEmailError && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                          <MaterialIcons name="error" size={10} color="red" />
                          <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Account does not exist.</Text>
                        </View>
                      )}

                    </View>
                    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                      <Input
                        _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                        _focus={{ borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}

                        placeholder="Password"

                        onChangeText={handleChangePassword}
                        style={{ height: 40, color: '#000' }}
                        w={'90%'}
                        type={showPass ? "text" : "password"}
                        InputRightElement={<Pressable onPress={() => setShowPass(!showPass)}>
                          <Icon as={<MaterialIcons name={showPass ? "visibility" : "visibility-off"} />} size={5} mr="2" color="muted.400" />
                        </Pressable>}
                        _invalid={{ borderColor: 'red.500' }}
                        isInvalid={passwordError || blankPasswordError}
                        focusOutlineColor={passwordError || blankPasswordError ? 'red.500' : 'info.50'}

                      />
                      {passwordError && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                          <MaterialIcons name="error" size={10} color="red" />
                          <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Invalid password!</Text>
                        </View>
                      )}
                      {blankPasswordError && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                          <MaterialIcons name="error" size={10} color="red" />
                          <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Password cannot be blank!</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ width: '90%', alignItems: 'flex-end', justifyContent: 'flex-end', marginTop: 5 }}>
                        <Text style={{ justifyContent: 'flex-end', color: '#7b9cff' }}>Forgot Password?</Text>
                      </View>
                      <View style={{ width: '90%', justifyContent: 'flex-start', marginTop: 10 }}>
                        <Checkbox _checked={{ bg: 'info.50', borderColor: 'info.50', _hover: { bg: 'info.100', borderColor: 'info.100' } }} _hover={{ bg: 'white', borderColor: 'info.100' }} style={{ alignItems: 'center' }}  ><Text style={{ fontSize: 14 }}>Remember Me</Text></Checkbox>
                      </View>
                    </View>
                    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                      <Button onPress={handleSubmit} w={'90%'} bg="info.50" _hover={{ bg: "info.100" }} _pressed={{ bg: "info.100" }}>SIGN IN</Button>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#aaa', width: '30%' }} />
                      <Text style={{ paddingHorizontal: 10, color: '#aaa' }}>or</Text>
                      <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#aaa', width: '30%' }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                      <AntDesign name="facebook-square" size={30} color={'#4267B2'} />
                      <GoogleIcon />
                      <AntDesign name="twitter" size={30} color={'#1DA1F2'} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                      <Text>Don't have an account yet?</Text>
                      <TouchableOpacity style={{ cursor: 'pointer' }} onPress={() => navigate('/SignUp')} >
                        <Text style={{ color: '#7b9cff' }}> Sign Up</Text>
                      </TouchableOpacity>
                    </View>


                  </NativeBaseProvider>
                </View>
              </View>
            </View>
          </View>
        </View>




        )}




    </View>


  )
};

export default LoginForm;


{/* <View style={containerLogInStyles}>
<View style={{width: '125%'  , backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems:'center', elevation: 3,
shadowColor: '#000',
shadowOffset: {
width: 0,
height: 2,
},
shadowOpacity: 0.4,
shadowRadius: 4,
borderRadius: 5}}>

  <View style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
    <EmailAnimation />
    <PasswordAnimation />
  </View>
  <View style={{width: '90%', marginTop: 5, justifyContent: 'flex-end', alignItems: 'flex-end'}}>
    <Text>Forgot Password?</Text>
  </View>
  <View style={{width: '90%', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
        <View style={{width: '100%', flexDirection: 'row', alignItems: 'center',   marginTop: 20,}}>
            <Checkbox 
            status={checked ? 'checked' : 'unchecked'}
            onPress={handleCheckboxToggle}
            />
            <Text>Remember Me</Text>
        </View>
    </View>
    <View style={{ marginTop: 10, width: '100%', alignItems: 'center', justifyContent: 'center'}}>
      <button className="login">SIGN IN</button>
    </View>
    <View style={{width:'100%' , flexDirection: 'row', justifyContent: 'center',alignItems: 'center', marginTop: 10}}>
          <View style={{borderBottomWidth: 1.5, borderBottomColor: '#aaa', width:'30%'}} />
          <Text style={{paddingHorizontal: 10, color: '#aaa'}}>or</Text>
          <View style={{borderBottomWidth: 1.5, borderBottomColor: '#aaa', width:'30%'}} />
    </View>
    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, width: '100%'}}>
      <AntDesign  name="facebook-square" size={30} color={'#4267B2'}/>
      <GoogleIcon />
      <AntDesign name="twitter" size={30} color={'#1DA1F2'}/>
    </View>
    <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 50, marginBottom: 20}}>
      <Text>Don't have an account yet?</Text>
      <Text style={{color: '#7b9cff'}}> Sign Up</Text>
    </View> 
    
    </View>
  </View> */}