import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, ScrollView } from 'react-native';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, getAuth, sendEmailVerification } from 'firebase/auth';
import { AuthContext } from '../context/AuthProvider';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Popover, NativeBaseProvider, Button, Box, Input, Icon, extendTheme } from 'native-base';

const ForgotPassword = ({ navigation }) => {

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

    const textEmailRef = useRef('');
    const [error, setError] = useState('');

    const handleChangeEmail = (value) => {
        textEmailRef.current = value
    }

    const handleSubmit = async () => {
        const auth = getAuth();
        const email = textEmailRef.current;

        sendPasswordResetEmail(auth, email).then(() => {
            console.log('Email has been sent to', email);
        })
            .catch((error) => {
                console.log('Error', error)
            });

        navigation.navigate('Log In')
    }
    return (
        <NativeBaseProvider theme={customTheme}>
            <View style={{ paddingTop: 60, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{
                    width: screenWidth > 625 ? 625 : '100%',
                    backgroundColor: "#fff",
                    boxShadow:'0 2px 10px rgba(3, 3, 3, 0.2)',
                    padding: 20
                }}>
                <View style={{alignItems: 'center'}}>
                    <Text style={{ fontSize: 26, fontWeight: '700' }}>Forgot Password</Text>
                    <Text style={{ fontSize: 16, marginTop: 5,  }}>
                        Please provide the email address you used during registration, and we will send you instructions on how to reset your password.
                        {'\n'}
                        Be assured that for security reasons, we do not store your password, so it will never be sent via email.
                    </Text>
                    </View>
                    <View style={{alignItems:'flex-start',marginVertical: 5}}>
                    <Text style={{fontSize: 16, marginVertical: 5,fontWeight: '700'}}>Email</Text>
                    <Input
                        _hover={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', outlineColor: 'info.50' }}
                        _focus={{ outlineColor: 'info.50', borderColor: "info.50", bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                        _focusVisible={{ outlineColor: 'info.50', borderColor: 'info.50', bg: 'whiteText.100', _hover: { borderColor: 'info.50' } }}
                        placeholder="Email"
                        onChangeText={handleChangeEmail}
                        w={'100%'}
                        focusOutlineColor={'info.50'}
                        h={10}
                      
                    />
                    </View>
                    <TouchableOpacity onPress={handleSubmit} style={{backgroundColor:'#7b9cff', marginTop: 5,justifyContent: 'center', alignItems: 'center', height: 40, borderRadius: 5}}><Text style={{color: 'white'}}>Send</Text></TouchableOpacity>
                </View>
            </View>
        </NativeBaseProvider>
    )

}
export default ForgotPassword;