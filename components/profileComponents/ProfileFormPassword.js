import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Dimensions, ScrollView } from "react-native";
import React, { useEffect, useState, useRef, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome, FontAwesome5, MaterialCommunityIcons, Ionicons, AntDesign, Entypo } from 'react-native-vector-icons';
import Svg, { G, Path, SvgUri } from 'react-native-svg';
import { storage } from '../../Firebase/firebaseConfig';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { MaterialIcons, } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { collection, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { auth, db, addDoc, setDoc, fetchSignInMethodsForEmail, app, firebaseConfig } from '../../Firebase/firebaseConfig';
import { AuthContext } from '../../context/AuthProvider';
import { getAuth, updatePassword, reauthenticateWithCredential, signInWithEmailAndPassword, EmailAuthProvider, } from 'firebase/auth';
import { Popover, NativeBaseProvider, Button, Box, Input, Icon, extendTheme } from 'native-base';
import { BrowserRouter, Route, useNavigate, Link, useHistory } from 'react-router-dom';




const ProfileFormPassword = () => {
    const navigate = useNavigate();
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

    const Stack = createNativeStackNavigator();
    const { userEmail, logout } = useContext(AuthContext);
    //BREAKPOINT
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    //BREAKPOINT

    //dropdown
    const [showDropdown, setShowDropdown] = useState(false);

    const handleDropdownToggle = () => {
        setShowDropdown(!showDropdown);
    };
    //dropdown ends here
    //BREAKPOINT

    //handle password change
    const [profileData, setProfileData] = useState(null);
    const oldPasswordRef = useRef('');
    const [oldPasswordFer, setOldPassword] = useState('');
    const newPasswordRef = useRef('');
    const [newPassword, setNewPassword] = useState('');
    const confirmNewPasswordRef = useRef('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [error, setError] = useState(null);
    const handleOldPassword = (value) => {
        oldPasswordRef.current = value
    };
    const handleNewPassword = (value) => {
        newPasswordRef.current = value
    }
    const handleConfirmNewPassword = (value) => {
        confirmNewPasswordRef.current = value
    };

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
                    setOldPassword(userData.password);
                }
            } catch (error) {
                console.log('Profile fetch error:', error);
            }
        };

        getUserProfile();
    }, [userEmail]);

  
    const handleUpdate = async () => {
        console.log('Button Pressed');

        if (newPasswordRef.current !== confirmNewPasswordRef.current) {
            setError(true);
            return;
        }
        if (oldPasswordFer !== oldPasswordRef.current) {
            setError(true);
            return;
        }

        if (newPasswordRef.current === '' || confirmNewPasswordRef.current === '' || oldPasswordRef.current === '') {
            setError(true);
            return;
        }

        const newPassword = newPasswordRef.current;

        const auth = getAuth();
        const user = auth.currentUser;

        // Check if user has recently logged in
        const lastSignInTimeString = user.metadata.lastSignInTime;
        const lastSignInTime = new Date(lastSignInTimeString).getTime();
        const signInTimeThreshold = 60 * 60 *24 * 1000; // 24 hours in milliseconds
    
        if (!isNaN(lastSignInTime) && Date.now() - lastSignInTime < signInTimeThreshold) {
            // User has recently logged in, proceed to change password
            try {
                const db = getFirestore();
                const userDocRef = doc(db, 'accounts', userEmail);
                await updateDoc(userDocRef, {
                    password: newPasswordRef.current,
                });

                // Update the profileData state with the edited values
                setProfileData((prevData) => ({
                    ...prevData,
                    password: newPasswordRef.current,
                }));

                // Set password changed indicator
                setPasswordChanged(true);
            } catch (error) {
                console.log('Change password error:', error);
                setError(true);
            }
        } else {
            // User hasn't recently logged in, prompt for re-authentication
            try {
                const credential = EmailAuthProvider.credential(user.email, oldPasswordRef.current);
                await reauthenticateWithCredential(user, credential);
                // Re-authentication successful, proceed to change password

                try {
                    const db = getFirestore();
                    const userDocRef = doc(db, 'accounts', userEmail);
                    await updateDoc(userDocRef, {
                        password: newPasswordRef.current,
                    });

                    // Update the profileData state with the edited values
                    setProfileData((prevData) => ({
                        ...prevData,
                        password: newPasswordRef.current,
                    }));

                    // Set password changed indicator
                    setPasswordChanged(true);
                } catch (error) {
                    console.log('Change password error:', error);
                    setError(true);
                }
            } catch (error) {
              
                console.log('Re-authentication error:', error);
                setError(true);
               
            }
        }

        setError(false);
    };

    //handle password change ends here

    //get data from firebase

    const [editMode, setEditMode] = useState(false);


    //SET EDIT MODE TRUE
    const handleEdit = () => {
        setEditMode(true);
    };
    //SET EDIT MODE TRUE

    //handle Updates

    //handle Updates

    return (
        <NativeBaseProvider theme={customTheme}>
            <ScrollView style={styles.container} contentContainerStyle={{ justifyContent: 'center' }}>
                {profileData ?
                    (
                        <View style={{
                            backgroundColor: "white",
                            alignItems: "center",
                            width: screenWidth > 1280 ? 1188 : '100%',
                            margin: "auto",
                            borderRadius: 5,
                            paddingBottom: 20,
                            boxShadow: screenWidth < 992 ? '0 0px 0px rgba(0, 0, 0, 0)' : '0 2px 10px rgba(3, 3, 3, 0.2)',
                        }}>
                            <View style={{ flexDirection: screenWidth < 992 ? 'column' : 'row', padding: 20, width: '100%' }}>
                                {screenWidth < 992 ?
                                    (
                                        <View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                                <FontAwesome name="user-circle-o" size={40} />
                                                <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 'bold' }}>{profileData.textFirst}{'\n'}{profileData.textLast}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginVertical: 10 }}>
                                                <View style={{ width: '100%', borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10 }}>
                                                    <TouchableOpacity onPress={handleDropdownToggle}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Text>My Account</Text>
                                                            <AntDesign name="down" size={25} />
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            {showDropdown && (
                                                <View style={{ justifyContent: 'center', width: '100%', alignItems: 'center', }}>

                                                    <View style={{ width: '100%', borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10 }}>
                                                        <TouchableOpacity >
                                                            <Text>Transactions</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={{ width: '100%', borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10 }}>
                                                        <Text>Inquiries Chat</Text>
                                                    </View>
                                                    <View style={{ width: '100%', borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10 }}>
                                                        <TouchableOpacity onPress={() => navigate('/')} >
                                                            <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Go To Home</Text>
                                                        </TouchableOpacity>

                                                    </View>
                                                    <View style={{ width: '100%', borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10 }}>
                                                        <TouchableOpacity >
                                                            <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Upload Screen</Text>
                                                        </TouchableOpacity>

                                                    </View>
                                                    <View style={{ width: '100%', borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10 }}>
                                                        <Text>Delete Account</Text>
                                                    </View>
                                                </View>
                                            )}


                                        </View>
                                    )
                                    :
                                    (
                                        <View style={{ width: screenWidth > 1280 ? 217 : '18.3%', padding: 10, }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                                <FontAwesome name="user-circle-o" size={40} />
                                                <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 'bold' }}>{profileData.textFirst}{'\n'}{profileData.textLast}</Text>
                                            </View>

                                            <View style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                                    <MaterialCommunityIcons name="account" size={30} />
                                                    <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>My Account</Text>
                                                </View>
                                                <View style={{ marginLeft: 45 }}>
                                                    <TouchableOpacity onPress={() => navigate('/Profile')}>
                                                        <Text style={{ fontSize: 16 }}>Profile</Text>
                                                    </TouchableOpacity>
                                                    <Text style={{ fontSize: 16 }}>Password</Text>
                                                </View>
                                            </View>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'center', width: '100%' }}>
                                                <FontAwesome name="history" size={30} />
                                                <TouchableOpacity >
                                                    <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Transactions</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'center', width: '100%' }}>
                                                <Ionicons name="chatbubble-ellipses" size={30} />
                                                <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Inquiries Chat</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'center', width: '100%' }}>
                                                <TouchableOpacity onPress={() => navigate('/')}>
                                                    <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Go To Home</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'center', width: '100%' }}>
                                                <TouchableOpacity onPress={logout}><Text>LOGOUT</Text></TouchableOpacity>
                                            </View>
                                            <View style={{ width: '100%', borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10 }}>
                                                <TouchableOpacity >
                                                    <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Upload Screen</Text>
                                                </TouchableOpacity>

                                            </View>

                                            <View style={{ padding: 10, margin: 10, marginTop: 20, alignItems: 'center', width: '100%' }}>
                                                <Text style={{ color: 'red' }}>Delete Account</Text>
                                            </View>
                                        </View>
                                    )}


                                {/*LESS THAN 992*/}
                                {screenWidth < 992 ? (
                                    <View style={{ width: screenWidth > 1280 ? 971 : '100%' }}>
                                        <View style={{ alignSelf: 'center', width: screenWidth < 992 ? '100%' : '90%', marginTop: 10 }}>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Password</Text>
                                            <Text style={{ fontSize: 18, fontWeight: '400' }}>Manage your password.</Text>
                                        </View>

                                        <View style={{ alignSelf: 'center', width: screenWidth < 992 ? '100%' : '90%', marginVertical: 10 }}>
                                            <View style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', marginVertical: 10 }} />
                                        </View>


                                        {/*LESS THAN 992 SCREEN PERSONAL INFO EDIT*/}
                                        <View style={{ alignSelf: 'center', width: screenWidth < 992 ? '100%' : '90%', borderRadius: 10, borderColor: '#ccc', borderWidth: 1, marginBottom: 20, padding: 15 }}>
                                            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 5 }}>Change Password</Text>

                                            <View>
                                                {screenWidth < 482 ?
                                                    (
                                                        <>
                                                            {/*LESS THAN 482 SCREEN PERSONAL INFO EDIT*/}
                                                            <View style={{ flexDirection: 'column', marginBottom: 10 }}>
                                                                <Text style={{ color: '#aaa' }}>Old Password</Text>
                                                                <Input
                                                                    _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                                                    _focus={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                    _focusVisible={{ outlineColor: 'info.50', borderColor: 'info.50', bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                    placeholder="Old Password"
                                                                    onChangeText={handleOldPassword}
                                                                    w={'100%'}
                                                                    focusOutlineColor={'info.50'}
                                                                />
                                                            </View>
                                                            <View style={{ flexDirection: 'column', marginBottom: 10 }}>
                                                                <Text style={{ color: '#aaa' }}>New Password</Text>
                                                                <Input
                                                                    placeholder="New Password"
                                                                    _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                                                    _focus={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                    _focusVisible={{ outlineColor: 'info.50', borderColor: 'info.50', bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                    onChangeText={handleNewPassword}
                                                                    w={'100%'}
                                                                    focusOutlineColor={'info.50'}
                                                                />
                                                            </View>
                                                            <View style={{ flexDirection: 'column', marginBottom: 10 }}>
                                                                <Text style={{ color: '#aaa' }}>Confirm New Password</Text>
                                                                <Input
                                                                    placeholder='Confirm New Password'
                                                                    _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                                                    _focus={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                    _focusVisible={{ outlineColor: 'info.50', borderColor: 'info.50', bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                    onChangeText={handleConfirmNewPassword}
                                                                    w={'100%'}
                                                                    focusOutlineColor={'info.50'}
                                                                />
                                                            </View>

                                                            {/*LESS THAN 482 SCREEN PERSONAL INFO EDIT*/}
                                                        </>

                                                    )
                                                    :
                                                    (
                                                        <>
                                                            {/*GREATER THAN 482 SCREEN PERSONAL INFO EDIT*/}
                                                            <View style={{ flexDirection: 'column', marginBottom: 10 }}>
                                                                <View style={{ flex: 1 }}>
                                                                    <Text style={{ color: '#aaa' }}>Old Password</Text>
                                                                    <Input
                                                                        _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                                                        _focus={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                        _focusVisible={{ outlineColor: 'info.50', borderColor: 'info.50', bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                        onChangeText={handleOldPassword}
                                                                        w={'50%'}
                                                                        focusOutlineColor={'info.50'}
                                                                    />
                                                                </View>
                                                                <View style={{ flex: 1 }}>
                                                                    <Text style={{ color: '#aaa' }}>New Password</Text>
                                                                    <Input
                                                                        _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                                                        _focus={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                        _focusVisible={{ outlineColor: 'info.50', borderColor: 'info.50', bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                        onChangeText={handleNewPassword}
                                                                        w={'50%'}
                                                                        focusOutlineColor={'info.50'}
                                                                    />
                                                                </View>
                                                                <View style={{ flex: 1 }}>
                                                                    <Text style={{ color: '#aaa' }}>Confirm New Password</Text>
                                                                    <Input
                                                                        _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                                                        _focus={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                        _focusVisible={{ outlineColor: 'info.50', borderColor: 'info.50', bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                        onChangeText={handleConfirmNewPassword}
                                                                        w={'50%'}
                                                                        focusOutlineColor={'info.50'}
                                                                    />
                                                                </View>
                                                            </View>

                                                            {/*GREATER THAN 482 SCREEN PERSONAL INFO EDIT*/}
                                                        </>
                                                    )}
                                            </View>










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
                                                    ...(screenWidth >= 482 && { position: 'absolute', right: 0, top: '50%', marginTop: -14, marginHorizontal: 15 }),
                                                }}
                                            >
                                                <Text style={{ fontSize: 14, color: '#aaa', marginRight: 5 }}>Update</Text>
                                                <MaterialCommunityIcons name="draw" size={15} color="#aaa" />
                                            </TouchableOpacity>





                                        </View>
                                        {/*LESS THAN 992 SCREEN PERSONAL INFO EDIT*/}


                                    </View>

                                )

                                    :

                                    (


                                        <View style={{ width: screenWidth > 1280 ? 971 : '79.%' }}>
                                            <View style={{ alignSelf: 'center', width: screenWidth < 992 ? '100%' : '90%', marginTop: 10 }}>
                                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Password</Text>
                                                <Text style={{ fontSize: 18, fontWeight: '400' }}>Manage your password.</Text>
                                            </View>

                                            <View style={{ alignSelf: 'center', width: screenWidth < 992 ? '100%' : '90%', marginVertical: 10 }}>
                                                <View style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', marginVertical: 10 }} />
                                            </View>

                                            {/*GREATHER THAN 1280 PERSONAL INFO EDIT*/}
                                            <View style={{ alignSelf: 'center', width: screenWidth < 992 ? '100%' : '90%', borderRadius: 10, borderColor: '#ccc', borderWidth: 1, marginBottom: 20, padding: 15 }}>
                                                <View>
                                                    <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 5 }}>Change Password</Text>
                                                    <View style={{ flexDirection: 'column', marginBottom: 10 }}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ color: '#aaa', }}>Old Password</Text>
                                                            <Input
                                                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                                                _focus={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                _focusVisible={{ outlineColor: 'info.50', borderColor: 'info.50', bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                onChangeText={handleOldPassword}
                                                                style={{ backgroundColor: 'white', }}
                                                                w={'50%'}
                                                                focusOutlineColor={'info.50'}

                                                            />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ color: '#aaa' }}>New Password</Text>
                                                            <Input
                                                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                                                _focus={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                _focusVisible={{ outlineColor: 'info.50', borderColor: 'info.50', bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                label={'New Password'}
                                                                w={'50%'}
                                                                focusOutlineColor={'info.50'}
                                                                onChangeText={handleNewPassword}
                                                                style={{ backgroundColor: 'white' }}
                                                            />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ color: '#aaa' }}>Confirm New Password</Text>
                                                            <Input
                                                                _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                                                                _focus={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                _focusVisible={{ outlineColor: 'info.50', borderColor: 'info.50', bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                                                                label={'Confirm New Password'}
                                                                w={'50%'}
                                                                focusOutlineColor={'info.50'}
                                                                onChangeText={handleConfirmNewPassword}
                                                                style={{ backgroundColor: 'white' }}
                                                            />
                                                        </View>
                                                    </View>

                                                </View>





                                                <TouchableOpacity onPress={handleUpdate} style={{ position: 'absolute', right: 0, top: '50%', marginTop: -14, width: 74, height: 28, borderRadius: 69, borderColor: '#aaa', borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 15, flexDirection: 'row' }}>
                                                    <Text style={{ fontSize: 14, color: '#aaa', marginRight: 5 }}>Update</Text>
                                                    <MaterialCommunityIcons name="draw" size={15} color='#aaa' />
                                                </TouchableOpacity>





                                                {error && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                                        <MaterialIcons name="error" size={10} color="red" />
                                                        <Text style={{ marginLeft: 5, color: 'red', fontSize: 10 }}>Old Password type incorrectly!</Text>
                                                    </View>
                                                )}
                                                {passwordChanged ? (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'flex-start' }}>
                                                        <MaterialIcons name="check" size={10} color="green" />
                                                        <Text style={{ marginLeft: 5, color: 'green', fontSize: 10 }}>Password changed successfully!</Text>
                                                    </View>
                                                ) : null}
                                            </View>
                                            {/*GREATHER THAN 1280 PERSONAL INFO EDIT*/}


                                        </View>)}



                            </View>
                        </View>
                    )
                    :
                    (
                        <View style={{ justifyContent: 'center', flex: 1 }}>

                        </View>
                    )}
            </ScrollView>
        </NativeBaseProvider>

    )
}

export default ProfileFormPassword; const styles = StyleSheet.create({
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