import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Input, Icon, Stack, Pressable, Center, NativeBaseProvider, Button, Box, HStack, Image, VStack, Alert, IconButton, CloseIcon, Spinner, Heading, Collapse } from "native-base";
import { app, db, getFirestore, collection, addDoc, doc, setDoc, getAuth, auth } from './firebasecontrol'
import { signInWithEmailAndPassword } from 'firebase/auth';
import { MaterialIcons } from "@expo/vector-icons";



const LoginForm = () => {

  const [show, setShow] = React.useState(false);
  return <Stack space={4} w="100%" alignItems="center">

    <Input w={{
      base: "90%",
      md: "90%",
      sm: "90%",
    }} onSubmitEditing={handleSignIn} value={email} onChangeText={text => setEmail(text)} fontSize='16' InputLeftElement={<Icon as={<MaterialIcons name="person" />} size={5} ml="2" color="white" />} placeholder="Email" placeholderTextColor='white' color='white' />
    <Input w={{
      base: "90%",
      md: "90%",
      sm: "90%",
    }} value={password} onChangeText={text => setPassword(text)} fontSize='16' type={show ? "text" : "password"} InputRightElement={<Pressable onPress={() => setShow(!show)}>
      <Icon as={<MaterialIcons name={show ? "visibility" : "visibility-off"} />} size={5} mr="2" color="white" />
    </Pressable>} placeholder="Password" placeholderTextColor='white' color='white' />
    <HStack space={1} justifyContent="center">
      <Button _hover={{ bgColor: 'danger.900', }} _pressed={{ bgColor: 'danger.900', }} _focus={{ bgColor: 'danger.900', }} bgColor='danger.600' size="lg" borderWidth='1' borderColor='white' onPress={handleReset}>Reset Password</Button>
      <Button _hover={{ bgColor: '#537EFC', }} _pressed={{ bgColor: '#537EFC', }} _focus={{ bgColor: '#537EFC', }} bgColor='#7b9cff' size="lg" borderWidth='1' borderColor='white' w={{
        base: "50%",
        md: "50%",
        sm: "50%",
      }} onPress={handleSignIn}>Login</Button>

    </HStack>

  </Stack>;
};




export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = React.useState(false);
  const [errorShow, setErrorShow] = React.useState(false);
  const [errorTitle, setErrorTitle] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const logo = require('./assets/RMJ C-Hub 制御ハブ.png');

  const ErrorLoginShow = () => {
    return <Box w="100%" alignItems="center">
       
        <Collapse isOpen={errorShow}>
          <Alert maxW="400" status="error">
            <VStack space={1} flexShrink={1} w="100%">
              <HStack flexShrink={1} space={2} alignItems="center" justifyContent="space-between">
                <HStack flexShrink={1} space={2} alignItems="center">
                  <Alert.Icon />
                  <Text fontSize="md" fontWeight="medium" _dark={{
                  color: "coolGray.800"
                }}>
                    {errorTitle}
                  </Text>
                </HStack>
              </HStack>
              <Box pl="6" _dark={{
              _text: {
                color: "coolGray.600"
              }
            }}>
                {errorMessage}
              </Box>
            </VStack>
          </Alert>
        </Collapse>
 
      </Box>;
  
};

  const handleLogin = async () => {
    try {
      // Sign in with email and password
      await auth().signInWithEmailAndPassword(email, password);
      
      // // Navigate to another web page or screen
      navigation.navigate('./components/SuperAdmin');
    } catch (error) {
  
      console.log('Login failed', error);
      <ErrorLogin />
    }
  };
  
  const handleSignIn = () => {

    signInWithEmailAndPassword(auth, email, password)
    .then((re)=> {
      console.log(re);
    })
    .catch((error) =>{
      const errorCode = error.code;
      const errorMessage = error.message;
      setErrorShow(true);
      if (errorCode === 'auth/user-not-found') {
        console.log('Please use a valid email or check for misspellings.☹️');
        setErrorTitle('Email do not exist!');
        setErrorMessage('Please use a valid email or check for misspellings.☹️');
        <ErrorLoginShow/>
      } else if (errorCode === 'auth/wrong-password') {
        console.log('Password is incorrect, please try again. ☹️');
        setErrorTitle('Incorrect password');
        setErrorMessage('Password is incorrect, please try again. ☹️');
         <ErrorLoginShow/>
      } else if (errorCode === 'auth/missing-password') {
        console.log('Please enter a password. ☹️');
        setErrorTitle('Password is empty!');
        setErrorMessage('Please enter a password. ☹️');
         <ErrorLoginShow/>
      } 
      else if (errorCode === 'auth/invalid-email') {
        console.log('Email is invalid. ☹️');
        setErrorTitle('Invalid email!');
        setErrorMessage('Please enter a valid email. ☹️');
         <ErrorLoginShow/>
      } 
      
    })
  };
   const handleEmailOnChangeText = (text) => {
    setEmail(text) 
    setErrorShow(false)
  };
  const handlePasswordOnChangeText = (text) => {
    setPassword(text) 
    setErrorShow(false)
  };
  const handleReset = () => {
    // Perform login logic here
  };
  return (
    <NativeBaseProvider>

      <Box bgColor='#7b9cff' w='100%' h='100%'>
        <Center flex={1}>

          <Center px="3"  >
        


            <Box w={[300, 400, 550]} h={[94, 125, 172]}>
              <Image source={{
                uri: logo
              }} resizeMode='stretch' alt="Real Motor Japan Control Hub" style={{ flex: 1, }} />
            </Box>
            {/* <LoginForm /> */}
            <Stack space={4} w="100%" alignItems="center">

    <Input w={{
      base: "90%",
      md: "90%",
      sm: "90%",
    }} value={email} onSubmitEditing={handleSignIn} onChangeText={handleEmailOnChangeText} fontSize='16' InputLeftElement={<Icon as={<MaterialIcons name="person" />} size={5} ml="2" color="white" />} placeholder="Email" placeholderTextColor='white' color='white' />
    <Input w={{
      base: "90%",
      md: "90%",
      sm: "90%",
    }} value={password} onSubmitEditing={handleSignIn} onChangeText={handlePasswordOnChangeText} fontSize='16' type={show ? "text" : "password"} InputRightElement={<Pressable onPress={() => setShow(!show)}>
      <Icon as={<MaterialIcons name={show ? "visibility" : "visibility-off"} />} size={5} mr="2" color="white" />
    </Pressable>} placeholder="Password" placeholderTextColor='white' color='white' />
    <HStack space={1} justifyContent="center">
      <Button _hover={{ bgColor: 'danger.900', }} _pressed={{ bgColor: 'danger.900', }} _focus={{ bgColor: 'danger.900', }} bgColor='danger.600' size="lg" borderWidth='1' borderColor='white' onPress={handleReset}>Reset Password</Button>
      <Button _hover={{ bgColor: '#537EFC', }} _pressed={{ bgColor: '#537EFC', }} _focus={{ bgColor: '#537EFC', }} bgColor='#7b9cff' size="lg" borderWidth='1' borderColor='white' w={{
        base: "50%",
        md: "50%",
        sm: "50%",
      }} onPress={handleSignIn}>Login</Button>

    </HStack>

  </Stack>

          </Center>  

          
        </Center>

        <ErrorLoginShow/>
      </Box>
    </NativeBaseProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});








// <Stack space={4} w="100%" alignItems="center">

// <Input w={{
//   base: "90%",
//   md: "90%",
//   sm: "90%",
// }}  fontSize='16' InputLeftElement={<Icon as={<MaterialIcons name="person" />} size={5} ml="2" color="white" />} placeholder="Email" placeholderTextColor='white' color='white' />
// <Input w={{
//   base: "90%",
//   md: "90%",
//   sm: "90%",
// }}  fontSize='16' type={show ? "text" : "password"} InputRightElement={<Pressable onPress={() => setShow(!show)}>
//   <Icon as={<MaterialIcons name={show ? "visibility" : "visibility-off"} />} size={5} mr="2" color="white" />
// </Pressable>} placeholder="Password" placeholderTextColor='white' color='white' />
// <HStack space={1} justifyContent="center">
//   <Button _hover={{ bgColor: 'danger.900', }} _pressed={{ bgColor: 'danger.900', }} _focus={{ bgColor: 'danger.900', }} bgColor='danger.600' size="lg" borderWidth='1' borderColor='white' >Reset Password</Button>
//   <Button _hover={{ bgColor: '#537EFC', }} _pressed={{ bgColor: '#537EFC', }} _focus={{ bgColor: '#537EFC', }} bgColor='#7b9cff' size="lg" borderWidth='1' borderColor='white' w={{
//     base: "50%",
//     md: "50%",
//     sm: "50%",
//   }} >Login</Button>

// </HStack>

// </Stack>