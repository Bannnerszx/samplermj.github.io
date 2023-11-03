import React, { useState, useRef } from 'react';
import { Text, View, Button, Image, TextInput, StyleSheet, TouchableWithoutFeedback, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getStorage, ref, uploadBytes, getDownloadURL, } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { v4 as uuidv4 } from 'uuid';
import * as ImagePicker from 'expo-image-picker'
import { firebaseConfig, storage, addDoc, collection, db, doc, getDocs, setDoc, updateDoc } from '../../Firebase/firebaseConfig';
import ThreeContainers from './CarViewTable';
import { useNavigate } from 'react-router-dom';
// Initialize Firebase app



const UploadScreen = () => {
  const navigate = useNavigate();
  const [carName, setCarName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [mileage, setMileage] = useState('');
  const [year, setYear] = useState('');
  const [imgLink, setImgLink] = useState('');
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [location, setLocation] = useState('');

  const [uploadedImage, setUploadedImage] = useState(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const imageResult = await ImagePicker.launchImageLibraryAsync();
    if (!imageResult.canceled) {
      // The selected image is available in imageResult.uri
      // You can store it in state or use it directly for uploading
    }
  };


  const uploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      console.log('Permission denied');
      return;
    }

    const imagePickerResult = await ImagePicker.launchImageLibraryAsync();

    if (imagePickerResult.canceled) {
      console.log('Image picking cancelled');
      return;
    }

    const { uri, type } = imagePickerResult;

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExtension = type ? type.split('/')[1] : 'jpg';
      const filename = `image_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob, { contentType: type || 'image/jpeg' });
      const downloadURL = await getDownloadURL(storageRef);

      console.log('Image uploaded successfully');
      console.log('Download URL:', downloadURL);

      setUploadedImage(downloadURL);
      setImgLink(downloadURL);

      const carSpecsRef = collection(db, 'carSpecs');

      // Get all documents in 'carSpecs' collection and count the existing documents
      const querySnapshot = await getDocs(carSpecsRef);
      const carCounter = querySnapshot.size + 1;

      const carData = {
        id: carCounter,
        carName: carName,
        price: price,
        description: description,
        mileage: mileage,
        year: year,
        location: location,
        imageURL: downloadURL,
      };
      const docRef = await addDoc(collection(db, 'carSpecs'), carData);
      console.log('Car details added to Firestore with ID:', docRef.id);

      // Set the uploaded image URL
    } catch (error) {
      console.log('Image upload failed:', error);
    }
  };

  const uploadLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      console.log('Permission denied');
      return;
    }

    const imagePickerResult = await ImagePicker.launchImageLibraryAsync();

    if (imagePickerResult.canceled) {
      console.log('Image picking cancelled');
      return;
    }

    const { uri, type } = imagePickerResult;

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExtension = type ? type.split('/')[1] : 'jpg';
      const filename = `logos/logo_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, filename); // Specify the "logos" folder in storage

      await uploadBytes(storageRef, blob, { contentType: type || 'image/jpeg' });
      const downloadURL = await getDownloadURL(storageRef);

      console.log('Logo uploaded successfully');
      console.log('Download URL:', downloadURL);
      setUploadedLogo(downloadURL); // Set the uploaded logo URL
    } catch (error) {
      console.log('Logo upload failed:', error);
    }
  };

  //VIEW HOVERED
  const [isHovered, setIsHovered] = useState(false);

  const handleHoverIn = () => {
    setIsHovered(true);
  };

  const handleHoverOut = () => {
    setIsHovered(false);
  };

  const textStyles = [styles.text];
  if (isHovered) {
    textStyles.push(styles.hoveredText);
  }
  //VIEW HOVERED ENDS HERE


  return (
    <View >
      <Button title="Select Image" onPress={pickImage} />
      <TextInput
        placeholder="Car Name"
        value={carName}
        onChangeText={setCarName}
      />
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        placeholder="Mileage"
        value={mileage}
        onChangeText={setMileage}
      />
      <TextInput
        placeholder="Year"
        value={year}
        onChangeText={setYear}
      />
      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <Button title="Upload Image" onPress={uploadImage} />
      <Button title="Upload Logo" onPress={uploadLogo} />
      <Button
        title="Go To Page"
        onPress={() => navigate('/')}
      />
      {uploadedImage && <Image source={{ uri: uploadedImage }} style={{ width: 200, height: 200 }} />}




      <View>
        <Pressable
          onHoverIn={handleHoverIn}
          onHoverOut={handleHoverOut}
          style={({ hover }) => [
            styles.pressable,
            hover && styles.hoveredPressable,
          ]}
        >
          <Text style={textStyles}>BIG TEXT COMING THROUGH</Text>
        </Pressable>
      </View>


    </View>
  );
};


const styles = StyleSheet.create({
  pressable: {
    padding: 10,
  },
  hoveredPressable: {
    backgroundColor: 'red',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  hoveredText: {
    color: 'white',
  },
});

export default UploadScreen;