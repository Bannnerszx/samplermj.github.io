import { StyleSheet, Text, View, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, FlatList, Image, ScrollView, Pressable, Linking, Modal } from 'react-native';
import React, { useEffect, useState, useRef, useMemo, useContext, useCallback, useLayoutEffect } from 'react';
import { Ionicons, AntDesign, FontAwesome, Foundation } from 'react-native-vector-icons';
import WebView from 'react-native-webview';
// import Svg, { Path } from 'react-native-svg';
// import { MaterialIcons } from '@expo/vector-icons';
// import { Button, NativeBaseProvider, Alert, Input, Icon, extendTheme, Spinner, PresenceTransition, Checkbox, Box } from 'native-base';
// import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, getAuth, sendEmailVerification } from 'firebase/auth';
import { auth, db, addDoc, collection, doc, setDoc, getDocs, fetchSignInMethodsForEmail, query, projectExtensionFirestore, storage, projectExtensionStorage } from '../../Firebase/firebaseConfig';
import { FlatGrid } from 'react-native-super-grid';
import Carousel from 'react-native-reanimated-carousel';
import { interpolate, useSharedValue, useAnimatedStyle } from "react-native-reanimated";
// import car1 from '../../assets/car1.JPG';
// import { useRoute } from '@react-navigation/native';
import { getStorage, ref, listAll, getDownloadURL, } from 'firebase/storage';
import { getDoc, onSnapshot, where, orderBy, limit, } from 'firebase/firestore';
import qs from 'qs'
import { AuthContext, AuthProvider } from '../../context/AuthProvider';
import { BrowserRouter, Route, useNavigate, Link, useHistory, useParams, useSearchParams, useLocation } from 'react-router-dom';
import logo1 from '../../assets/RMJ Cover Photo for Facebook.jpg';
import logo4 from '../../assets/RMJ logo for flag transparent.png';
import logo2 from '../../assets/RMZ Logo.png';
import logo3 from '../../assets/Thank Followers (Facebook Cover) (facebook cover photo).png';
import { Button } from 'native-base';

const StickyHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const searchQueryWorldRef = useRef('');
  const handleChangeQuery = (value) => {
    searchQueryWorldRef.current = value;
  }


  const handleSearch = () => {
    if (searchQueryWorldRef.current.trim() !== '') {
      // Navigate to SearchCar.js with the searchQuery as a route parameter
      navigate(`/SearchCar/${searchQueryWorldRef.current}`);
    }
  };
  const [scrollY] = useState(new Animated.Value(0));
  //BREAKPOINT


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
        boxShadow: '0 2px 10px rgba(3, 3, 3, 0.3)',
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
          <Image source={{ uri: logo4 }} style={{ flex: 1, resizeMode: 'contain', aspectRatio: 1 }} />
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
            defaultValue={searchQueryWorldRef.current}
            onChangeText={handleChangeQuery}
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

const SpecificSearches = () => {
  const navigate = useNavigate();
  const { makesAuth, setMakesData, setModelData, modelAuth, setMinYearData, setMaxYearData, } = useContext(AuthContext);
  //get all make
  const [carMakes, setCarMakes] = useState('');
  const [carModel, setCarModel] = useState('')
  const handleSelectMake = (option) => {
    setMakesData(option);
    setCarMakes(option);
    setShowMake(false);
    // Update the URL
  };
  const handlePress = () => {
    navigate(`/SearchCar/all?make=$&model=&bodyType=&minYear=&maxYear=&minPrice=&maxPrice=`);
  };
  const renderMake = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleSelectMake(item)}>
        <Text>{item}</Text>
      </TouchableOpacity>
    )
  }
  //get all make

  //get all model
  const handleSelectModel = (option) => {
    setCarModel(option);
    setShowModel(false);
    setModelData(option);
  }

  const renderModel = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleSelectModel(item)}>
        <Text>{item}</Text>
      </TouchableOpacity>
    )
  }
  //get all model

  //Show Make
  const [showMake, setShowMake] = useState(false);
  const toggleShowMake = () => {
    setShowMake(prevState => !prevState);
    setShowModel(false);
    setShowMinYear(false);
    setShowMaxYear(false);
  };
  //Show Mkae

  //Show Model
  const [showModel, setShowModel] = useState(false);
  const toggleShowModel = () => {
    setShowModel(prevState => !prevState);
    setShowMake(false);
    setShowMinYear(false);
    setShowMaxYear(false);
  }
  //Show Model

  //show Min Max Date
  const [selectMinYear, setSelectMinYear] = useState('');
  const [selectMaxYear, setSelectMaxYear] = useState('');
  const minYear = 1970;
  const maxYear = 2024;
  const viewRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (viewRef.current && !viewRef.current.contains(event.target)) {
        setShowMake(false);
        setShowModel(false);
        setShowMinYear(false);
        setShowMaxYear(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSelectMinYear = (selectedYear) => {
    setMinYearData(selectedYear);
    setSelectMinYear(selectedYear);
    setShowMinYear(false);
  }
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 9; // 3x3 grid
  const renderArrow = (direction) => {
    const isLeft = direction === 'left';
    const disabled = isLeft ? currentPage === 0 : currentPage === Math.ceil(reversedYears.length / pageSize) - 1;

    return (
      <Pressable
        onPress={() => {
          setCurrentPage(prevPage => isLeft ? prevPage - 1 : prevPage + 1);
        }}
        disabled={disabled}
        style={({ pressed, hovered }) => [
          {
            opacity: pressed ? 0.5 : 1,
            borderColor: hovered ? '#b0c4ff' : null,
            margin: 5
          }
        ]}
      >
        {isLeft ? <AntDesign name="left" size={20} /> : <AntDesign name="right" size={20} />}

      </Pressable>
    );
  }

  const reversedYears = Array.from({ length: maxYear - minYear + 1 }, (_, index) => (minYear + index).toString());// Example data

  const paginatedData = Array.from({ length: Math.ceil(reversedYears.length / pageSize) }, (_, i) =>
    reversedYears.slice(i * pageSize, (i + 1) * pageSize)
  );
  const renderMinItem = ({ item }) => {
    return (
      <Pressable
        style={({ pressed, hovered }) => [
          {

            alignItems: 'center',
            padding: 5,
            opacity: pressed ? 0.5 : 1,
            backgroundColor: hovered ? '#b0c4ff' : null
          }
        ]}
        onPress={() => handleSelectMinYear(item)}
      >
        <View style={{
          flexDirection: 'column',
          marginTop: 5,
          paddingVertical: 10,
          paddingHorizontal: 10,
          margin: 5,

          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text>{item}</Text>
        </View>
      </Pressable>
    )

  }

  const [showMinYear, setShowMinYear] = useState(false);
  const toggleShowMinYear = () => {
    setShowMinYear(prevState => !prevState);
    setShowModel(false);
    setShowMake(false);
    setShowMaxYear(false);
  };

  useEffect(() => {
    setMakesData('');
    setModelData('');
    setMinYearData('');
    setMaxYearData('');
  }, [])

  const handleSelectMaxYear = (selectedYear) => {
    setMaxYearData(selectedYear);
    setSelectMaxYear(selectedYear);
    setShowMaxYear(false);
  }
  const [showMaxYear, setShowMaxYear] = useState(false);
  const toggleShowMaxYear = () => {
    setShowMaxYear(prevState => !prevState);
    setShowModel(false);
    setShowMake(false);
    setShowMinYear(false);
  }
  const [currentPageMax, setCurrentPageMax] = useState(0);
  const renderArrowMax = (direction) => {
    const isLeft = direction === 'left';
    const disabled = isLeft ? currentPage === 0 : currentPage === Math.ceil(years.length / pageSize) - 1;

    return (
      <Pressable
        onPress={() => {
          setCurrentPageMax(prevPage => isLeft ? prevPage - 1 : prevPage + 1);
        }}
        disabled={disabled}
        style={({ pressed, hovered }) => [
          {
            opacity: pressed ? 0.5 : 1,
            borderColor: hovered ? '#b0c4ff' : null,
            margin: 5
          }
        ]}
      >
        {isLeft ? <AntDesign name="left" size={20} /> : <AntDesign name="right" size={20} />}

      </Pressable>
    );
  }

  const years = [...Array(maxYear - minYear + 1).keys()].map(i => (maxYear - i).toString()); // Example data

  const paginatedDataMax = Array.from({ length: Math.ceil(years.length / pageSize) }, (_, i) =>
    years.slice(i * pageSize, (i + 1) * pageSize)
  );
  const renderMaxItem = ({ item }) => {
    return (
      <Pressable
        style={({ pressed, hovered }) => [
          {

            alignItems: 'center',
            padding: 5,
            opacity: pressed ? 0.5 : 1,
            backgroundColor: hovered ? '#b0c4ff' : null
          }
        ]}
        onPress={() => handleSelectMaxYear(item)}
      >
        <View style={{
          flexDirection: 'column',
          marginTop: 5,
          paddingVertical: 10,
          paddingHorizontal: 10,
          margin: 5,

          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text>{item}</Text>
        </View>
      </Pressable>
    )

  }
  //show Min Max Date
  return (
    <View style={{ borderWidth: 1, padding: 10 }}>
      <View style={{ justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row' }}>

          <View style={{ flex: 1, margin: 5, borderWidth: 1, padding: 10 }}>
            <TouchableOpacity style={{ alignItems: 'center' }} onPress={toggleShowMake}>
              <Text>{carMakes !== '' ? carMakes : 'Make'}</Text>
            </TouchableOpacity>

            {showMake && (
              <View
                ref={viewRef}
                style={{
                  marginTop: 5,
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  elevation: 5,
                  width: '100%',
                  height: 200,
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: '#ccc',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
                }}
              >
                <ScrollView>
                  <FlatList
                    data={makesAuth}
                    keyExtractor={(item) => item}
                    renderItem={renderMake}
                  />
                </ScrollView>
              </View>
            )}
          </View>

          <View style={{ flex: 1, margin: 5, borderWidth: 1, padding: 10 }}>
            <TouchableOpacity style={{ alignItems: 'center' }} onPress={toggleShowModel}>
              <Text>{carModel !== '' ? carModel : 'Model'}</Text>
            </TouchableOpacity>

            {showModel && (
              <View
                ref={viewRef}
                style={{
                  marginTop: 5,
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  elevation: 5,
                  width: '100%',
                  height: 200,
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: '#ccc',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'

                }}>
                <ScrollView>
                  <FlatList
                    data={modelAuth}
                    keyExtractor={(item) => item}
                    renderItem={renderModel}
                  />
                </ScrollView>
              </View>
            )}
          </View>

          <View style={{ flex: 1, margin: 5, borderWidth: 1, padding: 10 }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={toggleShowMinYear}>
                  <Text>{!selectMinYear ? 'Min Year' : selectMinYear}</Text>
                </TouchableOpacity>
                {showMinYear && (
                  <View
                    ref={viewRef}
                    style={{
                      position: 'absolute',
                      marginTop: 5,
                      top: 27,
                      left: -11,
                      zIndex: 10,
                      elevation: 5,
                      height: 250,
                      width: 240,
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: '#ccc',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      justifyContent: 'center',
                      borderRadius: 5
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                      <View style={{ marginRight: 10 }}>{renderArrow('left')}</View>
                      <View style={{ marginLeft: 10 }}>{renderArrow('right')}</View>
                    </View>
                    <View style={{ borderBottomWidth: 2, marginVertical: 10, borderBottomColor: '#ccc' }} />
                    <ScrollView
                      horizontal
                      contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-evenly' }}
                    >
                      <FlatList
                        data={paginatedData[currentPage]}
                        renderItem={renderMinItem}
                        keyExtractor={(item) => item}
                        numColumns={3}
                        style={{ flexGrow: 0 }}
                      />
                    </ScrollView>
                  </View>

                )}
              </View>
              <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={toggleShowMaxYear}>
                  <Text>{!selectMaxYear ? 'Max Year' : selectMaxYear}</Text>
                </TouchableOpacity>
                {showMaxYear && (
                  <View
                    ref={viewRef}
                    style={{
                      position: 'absolute',
                      marginTop: 5,
                      top: 27,
                      right: -11,
                      zIndex: 10,
                      elevation: 5,
                      height: 250,
                      width: 240,
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: '#ccc',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      justifyContent: 'center',
                      borderRadius: 5
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                      <View style={{ marginRight: 10 }}>{renderArrowMax('left')}</View>
                      <View style={{ marginLeft: 10 }}>{renderArrowMax('right')}</View>
                    </View>
                    <View style={{ borderBottomWidth: 2, marginVertical: 10, borderBottomColor: '#ccc' }} />
                    <ScrollView
                      horizontal
                      contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-evenly' }}
                    >
                      <FlatList
                        data={paginatedDataMax[currentPageMax]}
                        renderItem={renderMaxItem}
                        keyExtractor={(item) => item}
                        numColumns={3}
                        style={{ flexGrow: 0 }}
                      />
                    </ScrollView>
                  </View>

                )}
              </View>
            </View>
          </View>
          <View>
            <TouchableOpacity style={{
              backgroundColor: 'blue',
              padding: 10,
              borderRadius: 5,
            }} onPress={handlePress}>
              <Text style={{
                color: 'white',
                fontSize: 20,
              }}>Press Me</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>

  )
}



const ThreeContainers = () => {
  console.log('RE RENDERING A LOT')
  const { logout, profileDataAuth } = useContext(AuthContext);


  const { userEmail, setProducts, name } = useContext(AuthContext);

  const renderItem = ({ item }) => <Card name={item.name} code={item.code} image={item.image} />;
  //COOL ANIMATIONS DOES NOT WORK
  const Card = ({ name, code, image }) => {
    return (
      <View style={{ backgroundColor: code, height: 350, justifyContent: 'center', alignItems: 'center' }}>
        <Image source={image} style={styles.image} />
        <Text >{name}</Text>
        <Text >{code}</Text>
      </View>
    );
  };
  //LMAO

  const renderItemScroll = ({ item }) => {
    return (
      <View style={{ width: 150, height: 150, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20 }}>
        <Image source={{ uri: item }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
      </View>
    );
  };

  //does not work version 2
  //<=1280 <1024 <769 < 577

  //carousels
  const refCard = useRef(null);

  //HERE IS THE IMAGEURLS

  const [carData, setCarData] = useState([]);
  const [logosUrls, setlogosUrls] = useState([]);

  useEffect(() => {
    fetchVehicleData();
    fetchLogosUrls();

  }, []);

  const fetchLogosUrls = async () => {
    try {
      const storageRef = ref(storage, 'logos'); // Specify the "logos" folder in storage
      const storageListResult = await listAll(storageRef);
      const urls = await Promise.all(
        storageListResult.items.map(async (itemRef) => {
          const downloadURL = await getDownloadURL(itemRef);
          return downloadURL;
        })
      );
      setlogosUrls(urls);
    } catch (error) {
      console.log('Error fetching image URLs:', error);
    }
  };


  const fetchVehicleData = async () => {
    try {
      const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');
      const querySnapshot = await getDocs(vehicleCollectionRef);

      const dataArray = [];
      querySnapshot.forEach((doc) => {
        dataArray.push({ id: doc.id, ...doc.data() });
      });
      setCarData(dataArray);
      // Now you have all documents within 'VehicleProducts' as an array

      // Filter the cars based on 'Reserve' status and carId
      // const filteredCars = dataArray.filter(car => {
      //   return car.Reserve === 'false' && car.carId === carId;
      // });

      // setFilteredCars(filteredCars);
    } catch (error) {
      console.log('Error fetching vehicle data:', error);
    }
  };

  const [carRefNumbers, setCarRefNumbers] = useState([]); // State to store referenceNumbers
  const [carIds, setCarIds] = useState([]);

  useEffect(() => {
    const fetchCarIds = async () => {
      const carIdsArray = [];

      try {
        const querySnapshot = await getDocs(collection(projectExtensionFirestore, 'VehicleProducts'));

        querySnapshot.forEach((doc) => {
          carIdsArray.push(doc.id);
        });

        setCarIds(carIdsArray); // Set the array of car IDs

      } catch (error) {
        console.error('Error fetching car IDs:', error);
      }
    };

    fetchCarIds();
  }, []);

  // GET THE REF NUMBER
  useEffect(() => {
    const fetchRefNumbers = async () => {
      try {
        const carRefNumbers = [];
        for (const carId of carIds) {
          const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);
          const vehicleDoc = await getDoc(vehicleDocRef);

          if (vehicleDoc.exists()) {
            const vehicleData = vehicleDoc.data();
            carRefNumbers.push(vehicleData.referenceNumber);
          }
        }
        // Update the state with the fetched reference numbers
        setCarRefNumbers(carRefNumbers);
      } catch (error) {
        console.error('Error fetching vehicle data: ', error);
      }
    };

    if (carIds.length > 0) {
      fetchRefNumbers();
    }
  }, [carIds]);




  //get images from ref number
  const folderIds = carIds;
  const [imageUrls, setImageUrls] = useState({});
  useEffect(() => {
    // Function to fetch the first image URL for a folder
    const fetchImageURL = async (folderId) => {
      const folderRef = ref(projectExtensionStorage, folderId);

      try {
        // List all items (images) in the folder
        const result = await listAll(folderRef);

        if (result.items.length > 0) {
          // Get the download URL for the first image in the folder
          const imageUrl = await getDownloadURL(result.items[0]);
          // Update the imageUrls state with the new URL
          setImageUrls((prevImageUrls) => ({
            ...prevImageUrls,
            [folderId]: imageUrl,
          }));
        } else {
          // If the folder is empty, you can add a placeholder URL or handle it as needed
        }
      } catch (error) {
        console.error('Error listing images for folder', folderId, ':', error);
      }
    };

    // Fetch image URLs for each folder
    folderIds.forEach((folderId) => {
      fetchImageURL(folderId);
    });
  }, [folderIds]);



  //send email
  const openModalRequest = () => {
    setModalVisible(!modalVisible);
  }
  const [modalVisible, setModalVisible] = useState(false);
  const handleSendEmail = async () => {
    try {
      await addDoc(collection(projectExtensionFirestore, "mail"), {
        from: userEmail,
        to: 'info@realmotor.jp',
        message: {
          subject: 'Request Car',
          html: 'Hello this was sent by new RMJ Website! マーク と カール',
        },
      });
      console.log("Email document successfully written!");
    } catch (error) {
      console.error("Error writing email document: ", error);
    }
  }
  //send email



  const [dataFiles, setDataFiles] = useState([
    { name: 'Logo 1', image: logo1 },
    { name: 'Logo 2', image: logo2 },
    { name: 'Logo 3', image: logo3 },
  ]);

  //fade in animations
  const animationStyle = React.useCallback((value) => {
    "worklet";

    const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
    const scale = interpolate(value, [-1, 0, 1], [1.25, 1, 0.25]);
    const opacity = interpolate(value, [-0.75, 0, 1], [0, 1, 0]);

    return {
      transform: [{ scale }],
      zIndex,
      opacity,
    };
  }, []);
  //fade out
  const [isAutoPlay, setIsAutoPlay] = React.useState(true);
  //carousels end here
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
  const handleNext = () => {
    refCard.current?.scrollTo({ count: +1, animated: true });
    setIsAutoPlay(!isAutoPlay)

  };

  const handlePrev = () => {
    refCard.current?.scrollTo({ count: -1, animated: true });
    setIsAutoPlay(!isAutoPlay)
  };
  const flatListRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const FilterRectangle = () => {
    const [isActive, setIsActive] = useState(false);

    // This useEffect hook adds the event listener to handle clicks outside the component
    useEffect(() => {
      const handleClickOutside = (event) => {
        // Check if the click occurred outside the component
        if (
          componentRef.current &&
          !componentRef.current.contains(event.target)
        ) {
          setIsActive(false);
        }
      };

      // Add the event listener when the component mounts
      document.addEventListener('click', handleClickOutside);

      // Remove the event listener when the component unmounts
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, []);

    // componentRef is used to reference the outer container for click detection
    const componentRef = useRef(null);

    return (
      <View style={{ flexDirection: 'row', width: '100%' }} >
        <View style={{ flex: 1, borderWidth: 1 }}>
          <TouchableOpacity onPress={() => setIsActive(!isActive)}>
            <Text>Make</Text>
          </TouchableOpacity>
          {isActive && (
            <View style={{
              backgroundColor: '#ccc',
              height: 100
            }}>

              <Text>ACTIVE HERE</Text>
            </View>
          )}
        </View>

      </View>
    );
  };

  const handleNextButtonPress = () => {
    const nextIndex = (currentIndex + 1) % logosUrls.length;

    flatListRef.current?.scrollToIndex({ index: nextIndex });
    setCurrentIndex(nextIndex);
  };

  const handlePrevButtonPress = () => {
    const prevIndex = (currentIndex - 1 + logosUrls.length) % logosUrls.length;

    flatListRef.current?.scrollToIndex({ index: prevIndex });
    setCurrentIndex(prevIndex);
  };
  const { width } = Dimensions.get('window');
  const numColumns = width >= 1024 ? 3 : 1;
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      marginHorizontal: 'auto',
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center'
    },

    containerBox: {

      alignItems: 'center',
      width: '100%',
      margin: 'auto',
      borderRadius: 5,
      justifyContent: 'center'

    },


    image: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 8,
    },
    code: {
      fontSize: 12,
      color: '#888',
    },

    scrollContainer: {
      paddingHorizontal: 10,
    },
    scrollbar: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      height: 8,
      width: '100%',
      backgroundColor: '#ccc',
      borderRadius: 4,
    },
    hoveredView: {

      boxShadow: '0 2px 10px rgba(3, 3, 3, 0.2)',
    },
  });
  const [isHovered, setIsHovered] = useState([]);
  const navigate = useNavigate();
  const handleCar = (carId) => {
    navigate(`/ProductScreen/${carId}`);
  };
  //SKELETON LOADING


  //SKELETON LOADING
  const [isLoading, setIsLoading] = useState(true);
  const [filteredCarData, setFilteredCarData] = useState([]);

  const dataBlank = [
    1, 2, 3, 4, 5
  ]
  const opacity = useRef(new Animated.Value(0.3));
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity.current, {
          toValue: 1,
          useNativeDriver: true,
          duration: 500
        }),
        Animated.timing(opacity.current, {
          toValue: 0.3,
          useNativeDriver: true,
          duration: 800
        })
      ])
    ).start();
  }, []);

  const renderBlankPapers = ({ item }) => {

    return (
      <View style={{ borderRadius: 10, boxShadow: '0 2px 10px rgba(2, 2, 2, 0.1)' }}>
        <View style={{ width: '100%', backgroundColor: 'white', overflow: 'hidden', aspectRatio: screenWidth > 729 ? 600 / 900 : 0.7 }}>
          <Animated.View style={{ opacity: opacity.current, resizeMode: 'cover', flex: 1, backgroundColor: '#eee' }} />
          <View style={{ padding: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', height: 50 }}>
              <View style={{ flex: 1, }}>
                <Animated.View
                  style={{ opacity: opacity.current, backgroundColor: '#eee', height: 20 }}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Animated.View
                style={{ opacity: opacity.current, backgroundColor: '#eee' }}
              />
            </View>
            <Animated.View style={{ opacity: opacity.current, height: 150, backgroundColor: '#eee', borderRadius: 15, marginTop: 10, }} />
          </View>
        </View>
      </View>
    )
  };
  //filtering and not showing the cars if they dont have images. USE THIS IN SEARCH CAR
  // useEffect(() => {
  //   const fetchData = () => {
  //     setTimeout(() => {
  //       const models = ['Vitz', 'Ractis', 'Sienta', 'Fit', 'Corolla Axio', 'Demio', 'Auris', 'C-Class', 'Vanguard', 'Mark X'];
  //       const uniqueCarData = {};

  //       carData.forEach(item => {
  //         // Convert both sides to lower case for case-insensitive comparison
  //         if (models.map(model => model.toLowerCase()).includes(item.model.toLowerCase()) && !uniqueCarData[item.model.toLowerCase()]) {
  //           uniqueCarData[item.model.toLowerCase()] = item;
  //         }
  //       });

  //       const updatedFilteredCarData = Object.values(uniqueCarData).filter(item => {
  //         return imageUrls.hasOwnProperty(item.id);
  //       });

  //       setFilteredCarData(updatedFilteredCarData);

  //       setTimeout(() => {
  //         setIsLoading(false); // Set loading to false after the 2-second delay
  //       }, 2000);

  //     }, 100);
  //   }

  //   fetchData();
  // }, [imageUrls]);
  const tabs = ['Popular', 'New Arrivals', 'Trucks', 'Vans'];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const models = ['TIGUAN', 'RACTIS', 'SIENTA', 'FIT', 'COROLLA AXIO', 'DEMIO', 'AURIS', 'C-CLASS', 'VANGUARD', 'MARK X'];
  const [vehicleData, setVehicleData] = useState([]);
  useEffect(() => {
    const fetchVehicleModels = async () => {
      try {
        const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');

        const uniqueModels = [...new Set(models.map(model => model.toUpperCase()))];

        const queries = uniqueModels.map(model => {
          return query(
            vehicleCollectionRef,
            where('model', '==', model),
            limit(1)
          );
        });

        const querySnapshots = await Promise.all(queries.map(q => getDocs(q)));

        const data = querySnapshots.flatMap(querySnapshot => {
          return querySnapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
          }));
        });

        setVehicleData(data);
      } catch (error) {
        console.log('Error fetching vehicle data:', error);
      }
    }

    fetchVehicleModels();
  }, []);



  const [truckData, setTruckData] = useState([]);
  useEffect(() => {
    const fetchVehicleModels = async () => {
      try {
        const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');

        // Create a query to filter documents by model
        const q = query(
          vehicleCollectionRef,
          where('bodyType', '==', 'TRUCK'),
          limit(10)
        );

        const querySnapshot = await getDocs(q);

        // querySnapshot.forEach((doc) => {
        //   console.log(doc.id, ' => ', doc.data());
        // });
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }));

        setTruckData(data);
      } catch (error) {
        console.log('Error fetching vehicle data:', error);
      }
    }

    fetchVehicleModels();
  }, []);

  useEffect(() => {
    const fetchData = () => {
      // Your code to fetch carData and imageUrls goes here

      let updatedFilteredCarData;

      if (activeTab === 'Popular') {
        updatedFilteredCarData = Object.values(vehicleData).filter(item => {
          return imageUrls.hasOwnProperty(item.id);
        });
      } else if (activeTab === 'New Arrivals') {
        // Filter for "New Arrivals" (last three days)
        // const today = new Date();
        // const threeDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3);

        // updatedFilteredCarData = carData.filter(item => {
        //   const dateString = item.dateAdded.split(' at ')[0]; // Extract date part
        //   const timeString = item.dateAdded.split(' at ')[1]; // Extract time part

        //   const [year, month, day] = dateString.split('/');
        //   const [hours, minutes, seconds] = timeString.split(':');

        //   const itemDate = new Date(year, month - 1, day, hours, minutes, seconds);

        //   return (itemDate >= threeDaysAgo && itemDate < today) && imageUrls.hasOwnProperty(item.id);
        // });

      } else if (activeTab === 'Trucks') {
        updatedFilteredCarData = truckData

      } else if (activeTab === 'Vans') {
        updatedFilteredCarData = carData.filter(item => {
          return item.bodyType.toLowerCase() === 'van' && imageUrls.hasOwnProperty(item.id);
        });
      }
      updatedFilteredCarData = updatedFilteredCarData.slice(0, 10);
      setFilteredCarData(updatedFilteredCarData);
      setTimeout(() => {
        setIsLoading(false); // Set loading to false after the 2-second delay
      }, 2000);
    };

    fetchData();
  }, [activeTab, imageUrls]);

  const renderIndividualImage = ({ item }) => {
    //HOVERED EFFECT
    const handlePress = () => {
      handleCar(item.id);
    };
    const imageUrl = imageUrls[item.id];
    return (
      <Pressable
        style={({ pressed, hovered }) => [
          {
            borderRadius: 10,
            opacity: pressed ? 0.5 : 1,
            boxShadow: hovered ? '0 2px 10px rgba(3, 3, 3, 0.3)' : '0 2px 10px rgba(2, 2, 2, 0.1)',
          },
        ]}
        onPress={handlePress}
      >
        <View style={[{ width: '100%', borderRadius: 5, overflow: 'hidden', zIndex: -2, aspectRatio: screenWidth > 729 ? 600 / 900 : 0.7 }]}>
          <Image
            source={{
              uri: imageUrl,
            }}
            style={{ resizeMode: 'cover', flex: 1 }}
          />
          <View style={{ padding: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', height: 50 }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontWeight: 'bold',
                  alignSelf: 'flex-start',
                  fontWeight: '600',
                  fontSize: 18,
                  marginRight: 5,
                  // Set the radius (blur effect)
                }} numberOfLines={2} ellipsizeMode="tail">
                  {item.data.carName}
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <FontAwesome name="star-o" size={20} />
                <FontAwesome name="star-o" size={20} />
                <FontAwesome name="star-o" size={20} />
                <FontAwesome name="star-o" size={20} />
                <FontAwesome name="star-o" size={20} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
              <Text style={{ alignSelf: 'flex-start', fontWeight: '500', fontSize: 16 }}>FOB:$ <Text style={{ color: 'green' }}>{item.data.price}</Text></Text>
              <Text style={{ alignSelf: 'flex-end' }}>{item.data.referenceNumber}</Text>
            </View>
            <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#aaa' }}>{item.data.location}</Text>
            <View style={{ height: 150, backgroundColor: '#e5e5e5', borderRadius: 15, marginTop: 10, boxShadow: '0 2px 10px rgba(3, 3, 3, 0.1)', justifyContent: 'space-between' }}>
              <Text style={{ padding: 10, textAlign: 'left', fontSize: 14, overflow: item.data.carDescription && item.data.carDescription.length > 80 ? 'hidden' : 'visible', textOverflow: 'ellipsis' }}>
                {item.data.carDescription}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="speedometer-outline" size={20} />
                  <Text> {item.data.mileage} km</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="calendar-outline" size={20} />
                  <Text>{item.data.regYear}/{item.data.regMonth}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };
  //HOVERED EFFECT ENDS HERE

  const [responsiveWidth, setResponsiveWidth] = useState(0);


  const { isDesktop, isPhablet, isTablet, isMobile } = useMemo(() => {
    let isMobile = false;
    let isTablet = false;
    let isPhablet = false;
    let isDesktop = false;

    if (screenWidth >= 1280) {
      isDesktop = true;

      setResponsiveWidth(356);

    } else if (screenWidth >= 1024) {
      isPhablet = true;

      setResponsiveWidth(356)

    } else if (screenWidth >= 768) {
      isTablet = true;
      setResponsiveWidth(450)

    } else if (screenWidth >= 577) {
      isMobile = true;

      setResponsiveWidth(452);

    } else {
      isMobile = true;

      setResponsiveWidth(352);

    }

    return { isDesktop, isPhablet, isTablet, isMobile };
  }, [screenWidth]);
  const fbRootRef = useRef();
  const location = useLocation();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v18.0';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    fbRootRef.current.appendChild(script);

    // Call FB.XFBML.parse() after the script loads
    script.onload = () => {
      if (window.FB) {
        window.FB.XFBML.parse();
      }
    };

    return () => {
      const fbRoot = fbRootRef.current;
      if (fbRoot && fbRoot.contains(script)) {
        fbRoot.removeChild(script);
      }
    };
  }, [location.pathname]);


  return (
    <View>
      <StickyHeader />
      <ScrollView
        style={{ flex: 1 }}

        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false } // Omit this line
        )}
        scrollEventThrottle={16}
      >
        <View style={[styles.container]}>
          <View style={[styles.containerBox, { width: screenWidth, flex: 1, }]}>
            <Carousel
              pagingEnabled={true}
              ref={refCard}
              loop
              width={screenWidth}
              height={screenWidth > 480 ? 800 : 600}
              autoPlay={isAutoPlay}
              data={dataFiles}
              scrollAnimationDuration={1000}

              renderItem={({ item }) => (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    padding: 5,
                  }}
                >
                  <Image
                    source={item.image}
                    style={{
                      width: '100%',
                      height: '110%',
                      resizeMode: 'cover',
                    }}
                  />
                </View>
              )}
              onIndexChanged={index => setActiveIndex(index)}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', width: screenWidth, height: screenWidth > 480 ? 400 : 600, alignItems: 'center', paddingHorizontal: 15, zIndex: 2 }}>
              <TouchableOpacity onPress={handlePrev}>
                <AntDesign name="leftcircleo" size={50} color="white" style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  elevation: 5,
                  borderRadius: 24
                }} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNext}>
                <AntDesign name="rightcircleo" size={50} color="white" style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  elevation: 5,
                  borderRadius: 24
                }} />
              </TouchableOpacity>

            </View>
            <View style={{ position: 'absolute', backgroundColor: 'transparent', width: '100%', height: '100%', zIndex: 1 }} />
          </View>
          <View style={{ padding: 10, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', width: screenWidth > 1280 ? 1188 : '100%', }}>
            <View style={[styles.containerBox, { padding: 10, flexBasis: `${100 / numColumns}%`, width: screenWidth > 1280 ? 328 : screenWidth }]}>
              <View style={{ width: responsiveWidth, padding: 5, height: 400, backgroundColor: '#f5f5f5', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigate('/Profile')}>
                  <Text>GO TO PROFILE</Text>
                </TouchableOpacity>
                <TouchableOpacity >
                  <Text>GO TO HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={logout}><Text>LOGOUT</Text></TouchableOpacity>

                <View style={{ borderWidth: 1, margin: 10, padding: 10 }}>
                  <TouchableOpacity style={{ alignItems: 'center' }} onPress={openModalRequest} >
                    <Text>Request Car</Text>
                  </TouchableOpacity>
                  <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={openModalRequest}
                  >
                    <TouchableWithoutFeedback onPress={openModalRequest} style={{ justifyContent: 'center', margin: 10 }}>
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, flex: 1, alignSelf: 'center' }}>
                          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Car Details</Text>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, width: '100%' }}>
                            <Text style={{ flex: 1, marginRight: 10, fontSize: 16, fontWeight: 'bold' }}>Country</Text>
                            <TextInput style={{ flex: 1, height: 40, borderWidth: 1, borderColor: '#ccc', paddingLeft: 10, fontSize: 16 }} placeholder='Country' />
                          </View>
                          <TouchableOpacity
                            style={{
                              backgroundColor: 'blue',
                              padding: 10,
                              borderRadius: 5,
                              alignItems: 'center',
                              marginTop: 10,
                              width: '100%',
                            }}
                            onPress={handleSendEmail}
                          >
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Send Request</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  </Modal>
                </View>


              </View>
            </View>
            <View style={[styles.containerBox, { padding: 10, flexBasis: `${100 / numColumns}%`, width: screenWidth > 1280 ? 356 : width }]}>
              <View style={{ borderColor: 'blue', width: screenWidth > 992 ? '100%' : width, alignItems: 'center' }}>
                <View style={{ width: responsiveWidth, height: 50, backgroundColor: 'black', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Foundation name="burst-new" size={40} color={'#fff'} />
                  <Text style={{ color: 'white' }}> New Stock</Text>
                </View>
                <Carousel
                  customAnimation={animationStyle}
                  loop
                  height={350}
                  width={responsiveWidth}
                  autoPlay={true}
                  data={filteredCarData}
                  scrollAnimationDuration={1000}
                  renderItem={({ item }) => (
                    <View style={{ backgroundColor: '#fafafa', justifyContent: 'center', flexDirection: 'column', overflow: 'hidden' }}>
                      {imageUrls[item.id] ? ( // Check if imageUrl is available for the referenceNumber
                        <Image source={{ uri: imageUrls[item.id] }} style={{ width: '100%', height: 250, resizeMode: 'cover' }} />
                      ) : (
                        null // You can add a placeholder component here
                      )}
                      <View style={{ flexDirection: 'column', marginLeft: 10, alignItems: 'center', padding: 10 }}>
                        <Text style={{ textAlign: 'center', fontSize: 22, fontWeight: 'bold', maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} numberOfLines={1}>
                          {item.carName}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 16, fontWeight: '400' }}>Vehicle Price: </Text>
                          <Text style={{ fontSize: 16, color: 'green' }}>${item.price}</Text>
                        </View>
                        <Text style={{ fontStyle: 'italic', color: '#aaa' }}>{item.location}</Text>
                      </View>
                    </View>
                  )}
                />
                <View style={{ position: 'absolute', backgroundColor: 'transparent', width: '100%', height: '100%', zIndex: 5 }} />
              </View>
            </View>
            <View style={[styles.containerBox, { padding: 10, flexBasis: `${100 / numColumns}%`, width: screenWidth > 1280 ? 356 : width, marginTop: 0 }]}>
              <div>
                <div ref={fbRootRef} id="fb-root"></div>
                <div
                  className="fb-page"
                  data-href="https://www.facebook.com/RealMotorJP"
                  data-show-posts="true"
                  data-show-featured="true"
                  data-width="350"
                  data-height="390"
                  data-small-header="false"
                  data-adapt-container-width="false"
                  data-hide-cover="false"
                  data-show-facepile="true"
                >
                  <blockquote cite="    " className="fb-xfbml-parse-ignore">
                    <a href="https://www.facebook.com/RealMotorJP">Real Motor Japan</a>
                  </blockquote>
                </div>
              </div>

            </View>
          </View>
          <View style={{ width: screenWidth > 1280 ? 1188 : screenWidth, padding: 10, zIndex: 100 }}>
            <SpecificSearches />
          </View>
          <View style={[styles.containerBox, { backgroundColor: 'transparent' }]}>
            <View style={{
              width: screenWidth > 1280 ? 1350 : screenWidth,
              padding: 10,
            }}>
              <FlatList
                data={[...logosUrls].reverse()}
                renderItem={renderItemScroll}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </View>

          {/* <View style={[styles.containerBox, { width: screenWidth > 1280 ? 1188 : screenWidth, borderWidth: 1 , zIndex: 5, }]}>
                <FilterRectangle />
        </View> */}
          {/* <View style={{ width: screenWidth > 1280 ? 1188 : screenWidth, }}> */}
          <View style={{ width: screenWidth > 1280 ? 1350 : screenWidth, padding: 10 }}>
            {/* <View style={{ flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#f5f5f5' }}>
              <Pressable
                style={({ pressed, hovered }) => [
                  {
                    padding: 5,
                    opacity: pressed ? 0.5 : 1,
                    borderBottomWidth: 2, borderBottomColor: hovered ? '#fff' : '#f1f1f1', flex: 1, alignItems: 'center', justifyContent: 'center'
                  }
                ]}
              >


                <Text style={{ fontWeight: '800', marginBottom: 5 }}>Popular</Text>

              </Pressable>
              <Pressable
                style={({ pressed, hovered }) => [
                  {
                    padding: 5,
                    opacity: pressed ? 0.5 : 1,
                    borderBottomWidth: 2, borderBottomColor: 'gray', flex: 1, alignItems: 'center', justifyContent: 'center'
                  }
                ]}
              >

                <Text style={{ fontWeight: '800', marginBottom: 5 }}>New Arrivals</Text>

              </Pressable>
              <Pressable
                style={({ pressed, hovered }) => [
                  {
                    padding: 5,
                    opacity: pressed ? 0.5 : 1,
                    borderBottomWidth: 2, borderBottomColor: 'gray', flex: 1, alignItems: 'center', justifyContent: 'center'
                  }
                ]}
              >
                <Text style={{ fontWeight: '800', marginBottom: 5 }}>Trucks</Text>
              </Pressable>
              <Pressable
                style={({ pressed, hovered }) => [
                  {
                    padding: 5,
                    opacity: pressed ? 0.5 : 1,
                    borderBottomWidth: 2, borderBottomColor: 'gray', flex: 1, alignItems: 'center', justifyContent: 'center'
                  }
                ]}
              >
                <Text style={{ fontWeight: '800', marginBottom: 5 }}>Vans</Text>
              </Pressable>
            </View> */}
            <View style={{
              flexDirection: 'row',

            }}>
              {tabs.map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={({ pressed, hovered }) => [
                    {
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 5,
                      marginHorizontal: 5,
                      borderBottomWidth: (activeTab === tab || hovered) ? 2 : null,
                    },
                    {
                      opacity: pressed ? 0.5 : 1,
                      borderBottomColor: (activeTab === tab || hovered) ? 'gray' : null,
                    },
                  ]}
                >
                  <Text style={{
                    fontWeight: '800',
                    marginBottom: 5,
                    textAlign: 'center'
                  }}>{tab}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ width: '100%', }}>
            <View style={{ justifyContent: 'center', zIndex: -1 }}>
              {isLoading ? (
                <FlatGrid
                  data={dataBlank}
                  itemDimension={350}
                  spacing={10}
                  renderItem={renderBlankPapers}
                />
              ) : (
                <FlatGrid
                  data={filteredCarData}
                  itemDimension={350}
                  spacing={10}
                  renderItem={renderIndividualImage}
                />
              )}



            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export default ThreeContainers;