import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Linking, ScrollView, Animated, Modal, Pressable, TextInput } from 'react-native';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { FontAwesome, FontAwesome5, Entypo, MaterialCommunityIcons, Ionicons, AntDesign, Fontisto } from 'react-native-vector-icons';
// import { List } from 'react-native-paper';
// import { Button, NativeBaseProvider, Alert, Input, Icon, Pressable, extendTheme, Spinner, PresenceTransition, Checkbox } from 'native-base';
// import PhoneInput from 'react-phone-input-2'
// import 'react-phone-input-2/lib/style.css'
import { collection, doc, getDoc, getFirestore, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db, addDoc, setDoc, fetchSignInMethodsForEmail, app, firebaseConfig, projectExtensionFirestore } from '../../Firebase/firebaseConfig';
// import { NavigationContainer, useIsFocused } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import ProfileFormAddress from './ProfileFormAddress';
// import { initializeApp, } from 'firebase/app';
import { AuthContext } from '../../context/AuthProvider';
// import SplashScreen from '../SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BrowserRouter, Route, useNavigate, Link, useHistory } from 'react-router-dom';


const ProfileForm = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const sidebarWidth = 250; // Adjust the sidebar width as needed
  const sidebarAnimation = useRef(new Animated.Value(0)).current;
  // Function to open the sidebar
  const openSidebar = () => {
    Animated.timing(sidebarAnimation, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnimation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start(() => setSidebarOpen(false));
  };

  //get data from firebase
  const [profileData, setProfileData] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const newFirstNameRef = useRef('');
  const [newLastName, setNewLastName] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const newLastNameRef = useRef('');
  const { userEmail, logout, profileDataAuth } = useContext(AuthContext);

  //handle textInputs
  const handleChangeLastName = (value) => {
    newLastNameRef.current = value
  };
  const handleChangeFirstName = (value) => {
    newFirstNameRef.current = value
  };

  const [chatIds, setChatIds] = useState([]);
  // Replace with actual user email

  useEffect(() => {
    const fetchChatIds = async () => {
      const db = getFirestore();
      const chatsRef = collection(projectExtensionFirestore, 'chats');
      const q = query(chatsRef, where('participants.customer', '==', userEmail));

      try {
        const querySnapshot = await getDocs(q);
        const chatIdsArray = querySnapshot.docs.map(doc => doc.id);
        const firstChatId = chatIdsArray[0]; // Accessing the first chat ID
        setChatIds([firstChatId]);

        console.log('CHAT ID NET: ', [firstChatId]) // Indexing from 0
      } catch (error) {
        console.error('Error fetching chat IDs:', error);
      }
    };

    fetchChatIds();
  }, [userEmail]);



  const navigate = useNavigate();
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        if (!userEmail) return; // Return early if userEmail is not available yet

        const db = getFirestore();
        const userDocRef = doc(db, 'accounts', userEmail);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setProfileData(userData);
          setNewFirstName(userData.textFirst);
          setNewLastName(userData.textLast);
          setNewCountry(userData.country);
        }
      } catch (error) {
        console.log('Profile fetch error:', error);
      }
    };

    getUserProfile();
  }, [userEmail]);

  const handleEdit = () => {
    setEditMode(true);
  };
  //handle textInputs
  //fetch data

  //fetch data
  //handle Updates
  const handleUpdate = async () => {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'accounts', userEmail);
      await updateDoc(userDocRef, {
        textFirst: newFirstNameRef.current,
        textLast: newLastNameRef.current,
      });

      // Update the profileData state with the edited values
      setProfileData((prevData) => ({

        ...prevData,
        textFirst: newFirstNameRef.current,
        textLast: newLastNameRef.current,

      }));

      setEditMode(false);
    } catch (error) {
      console.log('Update error:', error);
    }
  };
  //handle Updates
  //get data
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
  //dropdown
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };
  //dropdown ends here
  return (

    <View>

      {profileData && (
        <View style={{ flexDirection: 'row' }}>
          {screenWidth < 719 ? (
            sidebarOpen && (
              <Modal
                visible={sidebarOpen}
                transparent={true}
                animationType="slideRight"
                onRequestClose={closeSidebar}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    justifyContent: 'flex-end',
                  }}
                  activeOpacity={1}
                  onPress={closeSidebar}
                >
                  <Animated.View style={{
                    width: sidebarWidth,
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    backgroundColor: '#fff',
                    position: 'sticky',
                    top: 0,
                    height: '100%',
                    shadowColor: 'rgba(3, 3, 3, 0.1)',
                    shadowOffset: { width: 2, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 2,
                    elevation: 2,
                    transform: [
                      screenWidth > 719 ? null : {
                        translateX: sidebarAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-sidebarWidth, 0],
                        }),
                      },
                    ],

                    // Position the navigation bar at the top of the screen
                  }}>

                    {/*LET THIS BE THE LEFT NAV BAR*/}
                    <ScrollView style={{ flexDirection: 'column' }} contentContainerStyle={{ justifyContent: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                        <FontAwesome name="user-circle-o" size={40} />
                        <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 'bold' }}>{profileData.textFirst} {profileData.textLast}</Text>
                      </View>

                      <View style={{ alignSelf: 'center', width: '100%', marginBottom: 10 }}>
                        <View style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', marginVertical: 10 }} />
                      </View>

                      <View style={{ padding: 10, marginTop: -10 }}>
                        <Pressable
                          onPress={() => setShowProfileOptions(!showProfileOptions)}
                          style={({ pressed, hovered }) => ({
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                            backgroundColor: hovered ? '#aaa' : null,
                            width: '100%',
                            alignSelf: 'center', // Center the Pressable horizontally
                            borderRadius: 10,
                            height: 50,
                            padding: 5,
                            opacity: pressed ? 0.5 : 1,
                            // Adding some border radius for a rounded appearance
                          })}
                        >

                          <MaterialCommunityIcons name="account" size={30} />
                          <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>My Account</Text>

                        </Pressable>
                        {showProfileOptions && (
                          <View style={{ marginLeft: 40 }}>
                            <TouchableOpacity onPress={() => navigate('/Profile')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                              <Text style={{ marginLeft: 10, fontSize: 16 }}>Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigate('/ProfilePassword')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                              <Text style={{ marginLeft: 10, fontSize: 16 }}>Password</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      <View style={{ padding: 10, marginTop: -10 }}>
                        <Pressable
                          style={({ pressed, hovered }) => ({
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                            backgroundColor: hovered ? '#aaa' : null,
                            width: '100%',
                            alignSelf: 'center', // Center the Pressable horizontally
                            borderRadius: 10,
                            height: 50,
                            padding: 5,
                            opacity: pressed ? 0.5 : 1,
                            justifyConte: 'center'// Adding some border radius for a rounded appearance
                          })}
                        >
                          <FontAwesome name="history" size={30} />
                          <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Transactions</Text>
                        </Pressable>
                      </View>
                      <View style={{ padding: 10, marginTop: -10 }}>
                        <Pressable
                          onPress={() => navigate(`/ProfileFormChatGroup/${chatIds}`)}
                          style={({ pressed, hovered }) => ({
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                            backgroundColor: hovered ? '#aaa' : null,
                            width: '100%',
                            alignSelf: 'center', // Center the Pressable horizontally
                            borderRadius: 10,
                            height: 50,
                            padding: 5,
                            opacity: pressed ? 0.5 : 1,
                            justifyConte: 'center'// Adding some border radius for a rounded appearance
                          })}
                        >
                          <Ionicons name="chatbubble-ellipses" size={30} />
                          <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Inquiries Chat</Text>
                        </Pressable>
                      </View>
                      <View style={{ padding: 10, marginTop: -10 }}>
                        <Pressable
                          style={({ pressed, hovered }) => ({
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                            backgroundColor: hovered ? '#aaa' : null,
                            width: '100%',
                            alignSelf: 'center', // Center the Pressable horizontally
                            borderRadius: 10,
                            height: 50,
                            padding: 5,
                            opacity: pressed ? 0.5 : 1,
                            justifyConte: 'center'// Adding some border radius for a rounded appearance
                          })}
                        >
                          <Fontisto name="favorite" size={30} />
                          <Text style={{ marginLeft: 25, fontSize: 18, fontWeight: '500' }}>Favorites</Text>
                        </Pressable>
                      </View>
                      <View style={{ borderBottomWidth: 1, borderBottomColor: 'white', width: '100%', marginBottom: 10 }} />
                      <TouchableOpacity onPress={() => navigate('/')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                        <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Go To Home</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                        <Text>LOGOUT</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => navigate('/UploadScreen')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                        <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Upload Screen</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                        <Text style={{ color: 'red' }}>Delete Account</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </Animated.View>
                </TouchableOpacity>
              </Modal>
            )

          )
            : (
              <Animated.View style={{
                width: sidebarWidth,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                backgroundColor: '#fff',
                position: 'sticky',
                top: 0,
                height: '100vh',
                shadowColor: 'rgba(3, 3, 3, 0.1)',
                shadowOffset: { width: 2, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 2,
                elevation: 2,
                transform: [
                  screenWidth > 719 ? null : {
                    translateX: sidebarAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-sidebarWidth, 0],
                    }),
                  },
                ],

                // Position the navigation bar at the top of the screen
              }}>

                {/*LET THIS BE THE LEFT NAV BAR*/}
                <ScrollView style={{ flexDirection: 'column' }} contentContainerStyle={{ justifyContent: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0, padding: 10 }}>
                    <FontAwesome name="user-circle-o" size={40} />
                    <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 'bold' }}>{profileData.textFirst} {profileData.textLast}</Text>
                  </View>

                  <View style={{ alignSelf: 'center', width: '100%', marginBottom: 10 }}>
                    <View style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', marginVertical: 10 }} />
                  </View>

                  <View style={{ padding: 10 }}>
                    <Pressable
                      onPress={() => setShowProfileOptions(!showProfileOptions)}
                      style={({ pressed, hovered }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                        backgroundColor: hovered ? '#aaa' : null,
                        width: '100%',
                        alignSelf: 'center', // Center the Pressable horizontally
                        borderRadius: 10,
                        height: 50,
                        padding: 5,
                        opacity: pressed ? 0.5 : 1,
                        // Adding some border radius for a rounded appearance
                      })}
                    >

                      <MaterialCommunityIcons name="account" size={30} />
                      <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>My Account</Text>

                    </Pressable>
                    {showProfileOptions && (
                      <View style={{ marginLeft: 40 }}>
                        <TouchableOpacity onPress={() => navigate('/Profile')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                          <Text style={{ marginLeft: 10, fontSize: 16 }}>Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigate('/ProfilePassword')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                          <Text style={{ marginLeft: 10, fontSize: 16 }}>Password</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <View style={{ padding: 10, marginTop: -10 }}>
                    <Pressable
                      onPress={() => navigate('/ProfileFormTransaction')}
                      style={({ pressed, hovered }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                        backgroundColor: hovered ? '#aaa' : null,
                        width: '100%',
                        alignSelf: 'center', // Center the Pressable horizontally
                        borderRadius: 10,
                        height: 50,
                        padding: 5,
                        opacity: pressed ? 0.5 : 1,
                        justifyConte: 'center'// Adding some border radius for a rounded appearance
                      })}
                    >
                      <FontAwesome name="history" size={30} />
                      <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Transactions</Text>
                    </Pressable>
                  </View>
                  <View style={{ padding: 10, marginTop: -10 }}>
                    <Pressable
                      onPress={() => navigate(`/ProfileFormChatGroup/${chatIds}`)}
                      style={({ pressed, hovered }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                        backgroundColor: hovered ? '#aaa' : null,
                        width: '100%',
                        alignSelf: 'center', // Center the Pressable horizontally
                        borderRadius: 10,
                        height: 50,
                        padding: 5,
                        opacity: pressed ? 0.5 : 1,
                        justifyConte: 'center'// Adding some border radius for a rounded appearance
                      })}
                    >
                      <Ionicons name="chatbubble-ellipses" size={30} />
                      <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Inquiries Chat</Text>
                    </Pressable>
                  </View>
                  <View style={{ padding: 10, marginTop: -10 }}>
                    <Pressable
                      style={({ pressed, hovered }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                        backgroundColor: hovered ? '#aaa' : null,
                        width: '100%',
                        alignSelf: 'center', // Center the Pressable horizontally
                        borderRadius: 10,
                        height: 50,
                        padding: 5,
                        opacity: pressed ? 0.5 : 1,
                        justifyConte: 'center'// Adding some border radius for a rounded appearance
                      })}
                    >
                      <Fontisto name="favorite" size={30} />
                      <Text style={{ marginLeft: 25, fontSize: 18, fontWeight: '500' }}>Favorites</Text>
                    </Pressable>
                  </View>
                  <View style={{ borderBottomWidth: 1, borderBottomColor: 'white', width: '100%', marginBottom: 10 }} />
                  <TouchableOpacity onPress={() => navigate('/')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                    <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Go To Home</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                    <Text>LOGOUT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => navigate('/UploadScreen')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                    <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Upload Screen</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                    <Text style={{ color: 'red' }}>Delete Account</Text>
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>
            )}




          <ScrollView style={{ flex: 1, marginTop: 20 }}>
            <View style={{ flexDirection: 'row', width: '90%', alignSelf: 'center', alignItems: 'center' }}>
              {screenWidth <= 719 ? (
                <TouchableOpacity
                  style={{
                    marginRight: 10,
                  }}
                  onPress={openSidebar}
                >
                  <FontAwesome name={sidebarOpen ? 'close' : 'bars'} size={30} />
                </TouchableOpacity>
              ) : null}
              <View style={{ flex: 1 }}>
                <View style={{ width: '100%' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>My Profile</Text>
                  <Text style={{ fontSize: 18, fontWeight: '400' }}>Manage and protect your account.</Text>
                </View>
              </View>
            </View>

            <View style={{ alignSelf: 'center', width: '90%', marginBottom: 10 }}>
              <View style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', marginVertical: 10 }} />
            </View>
            {/*GREATHER THAN 1280 DISPLAY NAME*/}
            <View style={{ alignSelf: 'center', width: '90%', borderRadius: 10, borderColor: '#ccc', borderWidth: 1, marginBottom: 20, padding: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 5 }}>{profileData.textFirst} {profileData.textLast}</Text>
              <Text style={{ fontSize: 16, color: '#aaa', fontStyle: 'italic', textDecorationLine: 'underline', marginBottom: 10 }}>{userEmail}</Text>
              <Text style={{ fontSize: 14, color: '#aaa', marginBottom: 5 }}>{profileData.country}, {profileData.city}</Text>
              <TouchableOpacity
                style={{
                  marginTop: 15,
                  width: screenWidth < 482 ? '100%' : 74,
                  height: 28,
                  borderRadius: 69,
                  borderColor: '#aaa',
                  borderWidth: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  position: screenWidth < 482 ? 'static' : 'absolute',
                  right: screenWidth < 482 ? null : 0,
                  top: screenWidth < 482 ? null : '50%',
                  marginTop: screenWidth < 482 ? null : -14,
                  marginHorizontal: screenWidth < 482 ? null : 15,
                }}
              >
                <Text style={{ fontSize: 14, color: '#aaa', marginRight: 5 }}>Edit</Text>
                <MaterialCommunityIcons name="draw" size={15} color='#aaa' />
              </TouchableOpacity>
            </View>
            {/*GREATHER THAN 1280 DISPLAY NAME*/}

            {/*GREATHER THAN 1280 PERSONAL INFO EDIT*/}
            <View style={{ alignSelf: 'center', width: '90%', borderRadius: 10, borderColor: '#ccc', borderWidth: 1, marginBottom: 20, padding: 15 }}>

              <View>
                <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 5 }}>Personal Information</Text>
                <View style={{ flexDirection: screenWidth < 482 ? 'column' : 'row', marginBottom: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#aaa' }}>First Name</Text>
                    {editMode ? (
                      <View>
                        <TextInput
                          placeholder='First Name'
                          style={{ width: '50%' }}
                          defaultValue={newFirstNameRef.current}
                          onChangeText={handleChangeFirstName}
                        />
                      </View>
                    ) : (
                      <Text>{profileData.textFirst}</Text>
                    )}


                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#aaa' }}>Last Name</Text>

                    {editMode ? (
                      <View>
                        <TextInput
                          placeholder='Last Name'
                          defaultValue={newLastNameRef.current}
                          onChangeText={handleChangeLastName}
                          style={{ width: '50%' }}
                        />
                      </View>
                    ) : (
                      <Text>{profileData.textLast}</Text>
                    )}

                  </View>
                </View>
                <View style={{ flexDirection: screenWidth < 482 ? 'column' : 'row', marginBottom: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#aaa' }}>Email address</Text>
                    <Text>{userEmail}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#aaa' }}>Phone Number</Text>
                    <Text>+81 1111111111</Text>
                  </View>
                </View>
                <Text style={{ color: '#aaa' }}>Telephone Number</Text>
                <Text>+81 1111111111</Text>
              </View>


              {editMode ? (

                <TouchableOpacity
                  onPress={handleUpdate}
                  style={{
                    marginTop: 15,
                    width: screenWidth < 482 ? '100%' : 74,
                    height: 28,
                    borderRadius: 69,
                    borderColor: '#aaa',
                    borderWidth: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    position: screenWidth < 482 ? 'static' : 'absolute',
                    right: screenWidth < 482 ? null : 0,
                    top: screenWidth < 482 ? null : '50%',
                    marginTop: screenWidth < 482 ? null : -14,
                    marginHorizontal: screenWidth < 482 ? null : 15,
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#aaa', marginRight: 5 }}>Update</Text>
                  <MaterialCommunityIcons name="draw" size={15} color='#aaa' />
                </TouchableOpacity>

              )
                :
                (
                  <TouchableOpacity
                    onPress={handleEdit}
                    style={{
                      marginTop: 15,
                      width: screenWidth < 482 ? '100%' : 74,
                      height: 28,
                      borderRadius: 69,
                      borderColor: '#aaa',
                      borderWidth: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                      position: screenWidth < 482 ? 'static' : 'absolute',
                      right: screenWidth < 482 ? null : 0,
                      top: screenWidth < 482 ? null : '50%',
                      marginTop: screenWidth < 482 ? null : -14,
                      marginHorizontal: screenWidth < 482 ? null : 15,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: '#aaa', marginRight: 5 }}>Edit</Text>
                    <MaterialCommunityIcons name="draw" size={15} color='#aaa' />
                  </TouchableOpacity>
                )}





            </View>
            {/*GREATHER THAN 1280 PERSONAL INFO EDIT*/}

            {/*GREATHER THAN 1280 ADDRESS EDIT*/}
            <View style={{ alignSelf: 'center', width: '90%', borderRadius: 10, borderColor: '#ccc', borderWidth: 1, marginBottom: 20, padding: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 5 }}>Address</Text>
              <View style={{ flexDirection: screenWidth < 482 ? 'column' : 'row', marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#aaa' }}>Country</Text>
                  <Text>{profileData.country}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#aaa' }}>City</Text>
                  <Text>{profileData.city}</Text>
                </View>
              </View>
              <View style={{ flexDirection: screenWidth < 482 ? 'column' : 'row', marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#aaa' }}>Postal Code</Text>
                  <Text>8904</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#aaa' }}>Street</Text>
                  <Text>Salamankero</Text>
                </View>
              </View>
              <TouchableOpacity
                style={{
                  marginTop: 15,
                  width: screenWidth < 482 ? '100%' : 74,
                  height: 28,
                  borderRadius: 69,
                  borderColor: '#aaa',
                  borderWidth: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  position: screenWidth < 482 ? 'static' : 'absolute',
                  right: screenWidth < 482 ? null : 0,
                  top: screenWidth < 482 ? null : '50%',
                  marginTop: screenWidth < 482 ? null : -14,
                  marginHorizontal: screenWidth < 482 ? null : 15,
                }}
              >
                <Text style={{ fontSize: 14, color: '#aaa', marginRight: 5 }}>Edit</Text>
                <MaterialCommunityIcons name="draw" size={15} color='#aaa' />
              </TouchableOpacity>
            </View>
            {/*GREATHER THAN 1280 ADDRESS EDIT*/}
            {/*LMAO*/}

          </ScrollView>


        </View>



      )}

    </View>

  )
};

export default ProfileForm;

const styles = StyleSheet.create({
  container: {
    paddingTop: "60px",
  },
  containerBox: {
    alignItems: 'center',
    width: '100%',
    margin: 'auto',
    borderRadius: 5,
    justifyContent: 'center'

  },

});
