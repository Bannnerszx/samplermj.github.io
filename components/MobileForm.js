import React, { useEffect, useState } from 'react'
import { Box, NativeBaseProvider, Stack, Center, Input, Button, HStack, Icon, Pressable, VStack } from 'native-base';
import { StyleSheet, Text, View, Dimensions, useWindowDimensions, TextInput } from 'react-native';

const windowWidth = Dimensions.get('screen').width

const styles = StyleSheet.create({
    input: {
        height: 45,
        borderWidth: 1,
        borderColor: '#aaa',
        fontSize: 16,
       
        borderRadius: 5,
        
     },

})



const MobileForm = () => {
    const [inputWidth, setInputWidth] = useState(Dimensions.get('window').width);

  const handleScreenResize = () => {
    const { width } = Dimensions.get('window');
    setInputWidth(width);
  };

  useEffect(() => {
    Dimensions.addEventListener('change', handleScreenResize);
    return () => {
      Dimensions.removeEventListener('change', handleScreenResize);
    };
  }, []);
  const getTextInputWidth = (width) => {
    if (width >= 1280) {
      return 610;
    } else if (width >= 992) {
      return 456;
    } else if (width >= 768) {
      return 340;
    } else if (width >= 480) {
      return 210;
    } else {
      return 130;
    }
  };


    
  return (
    <NativeBaseProvider>

      <Box bgColor='#7b9cff' w='100%' h='100%'>
        <Center>
          
          <Stack w="100%" alignItems="center">
           
            <Box w={{base: 300,sm: 480,md: 768,lg: 992,xl: 1280,}} h={[ 200, 400, 600, 800 ]}>
             <Center>
             <HStack>
               <Box bgColor='#0a0078' w={{base: 150,sm: 240,md: 384,lg: 496,xl: 640,}} h={[ 200, 400, 600, 800 ]}>
                <Center>
                    <Text>Hello left</Text>
                </Center>
               </Box>
                
               <Box bgColor='#2255ab' w={{base: 150,sm: 240,md: 384,lg: 496,xl: 640,}} h={[ 200, 400, 600, 800 ]}>
               <Center>
                    <VStack>
                    <Text>Hello left</Text>
                    <TextInput style={[styles.input, {width: getTextInputWidth(inputWidth)}]} />
                    <TextInput style={[styles.input, {width: getTextInputWidth(inputWidth)}]} />
                    </VStack>
                </Center>
               </Box>
                </HStack>
             </Center>
            </Box>
            
            
            </Stack>
          
        </Center>
      </Box>
    </NativeBaseProvider>
  );
};

export default MobileForm;