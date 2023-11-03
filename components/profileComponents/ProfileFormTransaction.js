import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Linking, ScrollView, Animated, Modal, Pressable, FlatList, Image } from 'react-native';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons, Ionicons, AntDesign, Fontisto } from 'react-native-vector-icons';
import { Popover, NativeBaseProvider, Button, Box, Input, Icon } from 'native-base';
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { useNavigate } from 'react-router-dom';
import { firebaseConfig, storage, addDoc, collection, db, getDocs, query, where, getFirestore, doc, getDoc, projectExtensionStorage, listAll, } from '../../Firebase/firebaseConfig';
import { ref, getDownloadURL} from 'firebase/storage';
import { AuthContext } from '../../context/AuthProvider';
import ProgressStepper from '../ProgressStepper';


const ProfileOptions = () => {

  const navigate = useNavigate();
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  return (
    <View>
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
  )
}

const ProfileFormTransaction = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userEmail, logout, profileDataAuth } = useContext(AuthContext);
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

  const navigate = useNavigate();
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


  //FETCH THE TRANSACTION DETAILS
  const [userTransactions, setUserTransactions] = useState({});

  useEffect(() => {
    // Check if userEmail is available before proceeding
    if (userEmail) {
      // Fetch user transactions only when userEmail is available
      const fetchUserTransactions = async () => {
        try {
          const transactionsSnapshot = await getDocs(collection(db, 'accounts', userEmail, 'transactions'));
          const transactionsDataArray = transactionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserTransactions(transactionsDataArray);
        } catch (error) {
          console.log('Error fetching user transactions:', error);
        }
      };
      // Call the fetchUserTransactions function to populate userTransactions
      fetchUserTransactions();
    }
  }, [userEmail]);

  //PROFILEDATA
  const [profileData, setProfileData] = useState(null);
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
        }
      } catch (error) {
        console.log('Profile fetch error:', error);
      }
    };

    getUserProfile();
  }, [userEmail]);
  //PROFILE DATA ENDS HERE
  //FETCH THE TRANSACTIO DETAILS ENDS HERE

  //fetch the ids inside transactions

  const [refNumber, setRefNumber] = useState([]);

  const fetchTransactionIds = async (userEmail) => {
    try {
      const transactionSnapshot = await getDocs(collection(db, 'accounts', userEmail, 'transactions'));
  
      const transactionData = transactionSnapshot.docs.map(doc => {
        const id = doc.id;
        const data = doc.data();
        const referenceNumber = data.referenceNumber;
  
        return {
          id, // Include the id directly
          data: { ...data, referenceNumber }
        };
      });
  
      const transactionIds = transactionData.map(item => item.id); 
      console.log("IDS", transactionIds)// Extract the id values
  
      setRefNumber(transactionIds);
  
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchTransactionIds(userEmail);
    }
  }, [userEmail]);

  const folderIds = refNumber;
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
  //fetch ids from transactions




  const renderTransactionDetails = ({ item }) => {
    const imageUrl = imageUrls[item.id];
    return (
      <View>
        {profileData && (
          <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ flexDirection: screenWidth < 993 ? 'column' : 'row' }}>
              <View style={{ flex: screenWidth < 993 ? null : 2, marginBottom: screenWidth < 993 ? 20 : 0 }}>
                {/* First view content */}
                <View style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8, aspectRatio: 1.3, padding: 5 }}>
                { imageUrl && (<Image source={{uri: imageUrl}} style={{ flex: 1, resizeMode: 'cover' }} />)}
                </View>
              </View>
              <View style={{ flex: screenWidth < 993 ? null : 3, padding: 5 }}>
                {/* Middle view content */}
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    {/* First child view content */}
                    <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.referenceNumber}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialCommunityIcons name="calendar-clock-outline" size={20} />
                      <Text style={{ color: '#aaa', fontSize: 12 }}> 4 Aug 2023 - 12:04pm</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    {/* Third child view content */}
                    <Entypo name="chat" size={40} />
                  </View>
                </View>
                <View style={{ flexDirection: screenWidth < 335 ? 'column' : 'row', marginBottom: 10 }}>
                  <View style={{ flex: 1, alignItems: screenWidth < 335 ? 'center' : 'flex-start' }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', textDecorationLine: 'underline' }}>{item.carName}</Text>
                    <View style={{ alignSelf: screenWidth < 335 ? 'flex-start' : null }}>
                      <Text style={{ color: '#aaa', fontSize: 12 }}>Mozambique, Dar Es Salaam</Text>
                    </View>
                  </View>
                  <View style={{ flex: screenWidth < 335 ? null : 1, alignItems: screenWidth < 335 ? null : 'flex-end' }}>
                    <View>
                      <Text>{item.modelCode} {item.chassisNumber}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                      <MaterialCommunityIcons name="steering" size={20} />
                      <Text>Right</Text>
                      <Text> {item.mileage}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ height: 1, backgroundColor: 'gray', marginBottom: 20 }} />
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFD700' }}>C&F INSPECTION INSURANCE</Text>
                  <Text>
                    Invoice No: <AntDesign name="pdffile1" size={20} style={{ color: 'red' }} />
                    <Text style={{ color: 'blue' }}>74227</Text>
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                  <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 16, marginVertical: 5 }}>Total Price</Text>
                    <Text style={{ fontSize: 16 }}>FOB</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 16, marginVertical: 5 }}>
                      $
                      <Text style={{ color: '#85BB65' }}>999,999</Text>
                    </Text>
                    <Text style={{ fontSize: 16 }}>
                      $
                      <Text style={{ color: '#85BB65' }}>999,999</Text>
                    </Text>
                  </View>
                </View>
                <View style={{ height: 1, backgroundColor: 'gray', marginBottom: 20 }} />
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 16 }}>Payment</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 16, marginVertical: 5 }}>
                      $
                      <Text style={{ color: '#85BB65' }}>999,999</Text>
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ flex: 1, alignItems: screenWidth < 993 ? null : 'center', justifyContent: 'center' }}>
                <TouchableOpacity style={{ backgroundColor: '#007BFF', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 20, justifyContent: 'center' }} onPress={() => navigate(`/ProfileFormChatGroup/chat_${item.id}_${userEmail}`)}>
                  <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>Message button</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ height: 1.9, backgroundColor: 'gray', marginVertical: 20 }} />
          </View>
        )}
      </View>


    )
  };

  //dropdown



  //dropdown ends here
  //scrollable
  const [isScrolling, setIsScrolling] = useState(false);
  const flatListRef = useRef(null);

  const menuItems = [
    'All',
    'Negotiation',
    'Received Invoice',
    'Ordered Items',
    'Payment',
    'To Ship',
    'Finished Documents',
    'Completed',
    'Cancelled',
  ];

  const handleScroll = () => {
    setIsScrolling(!isScrolling);
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={{
          fontSize: 16,
          marginHorizontal: 10,
          flex: 1
        }}>{item}</Text>
      </View>

    );
  };

  //scrollable
  return (
    <NativeBaseProvider>
      <View >
        <View style={{
          flexDirection: 'row'
        }}>

          {screenWidth < 993 ? (
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
                    <ScrollView style={{ flexDirection: 'column' }} contentContainerStyle={{ justifyContent: 'center' }} >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                        <FontAwesome name="user-circle-o" size={40} />
                        <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 'bold' }}>Marc Van Cabaguing</Text>
                      </View>

                      <View style={{ alignSelf: 'center', width: '100%', marginBottom: 10 }}>
                        <View style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', marginVertical: 10 }} />
                      </View>

                      <View style={{ padding: 10 }}>
                        <ProfileOptions />
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
                            // Adding some border radius for a rounded appearance
                          })}
                        >
                          <FontAwesome name="history" size={30} />
                          <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Transactions</Text>
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
                    <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 'bold' }}>Marc Van Cabaguing</Text>
                  </View>

                  <View style={{ alignSelf: 'center', width: '100%', marginBottom: 10 }}>
                    <View style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', marginVertical: 10 }} />
                  </View>

                  <View style={{ padding: 10 }}>
                    <ProfileOptions />
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

          <ScrollView style={{ flex: 1, padding: 10 }}  >
            <View style={{ flexDirection: 'row', width: '90%', padding: 10 }}>
              {screenWidth <= 992 ? (
                <TouchableOpacity
                  style={{
                    marginRight: 10,
                  }}
                  onPress={openSidebar}
                >
                  <FontAwesome name={sidebarOpen ? 'bars' : 'bars'} size={30} />
                </TouchableOpacity>
              ) : null}
              <View style={{ flex: 1 }}>
                <View style={{ width: '100%' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Transactions</Text>
                  <Text style={{ fontSize: 18, fontWeight: '400' }}>Trace your transactions.</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', width: '100%', paddingVertical: 20, paddingHorizontal: 10, marginTop: 10, shadowColor: 'rgba(3, 3, 3, 0.3)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 5, elevation: 2, justifyContent: 'space-evenly' }}>
              {screenWidth > 1193 ? (
                <>
                  {menuItems.map((item, index) => (
                    <View key={index} style={{ marginRight: 10, flexDirection: 'row' }}>
                      <Text style={{
                        fontSize: 16,
                        marginHorizontal: 5,
                      }}>{item}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <>
                  <FlatList
                    data={menuItems}
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    renderItem={renderItem}
                  />
                </>
              )}

            </View>
            <View style={{ marginVertical: 9 }}>

              <Input placeholder='Search for Chassis, Make, Model, Year' h={9} w={'100%'} variant="filled" InputLeftElement={<Icon as={<Entypo name="magnifying-glass" />} size={5} ml="3" color="muted.400" />} />

            </View>
            <View style={{
              backgroundColor: '#f5f5f5',
              width: '100%',
              padding: 10,
              marginBottom: 10,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.25,
              shadowRadius: 2,
            }}>
              {screenWidth >= 992 && (
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ flex: 5, fontWeight: 'bold', paddingVertical: 5, paddingHorizontal: 10, textAlign: 'center' }}>Item</Text>
                  <Text style={{ flex: 1, fontWeight: 'bold', paddingVertical: 5, paddingHorizontal: 10, textAlign: 'center' }}>Status</Text>
                </View>
              )}
            </View>
            <FlatList
              data={userTransactions}
              renderItem={renderTransactionDetails}
            />
          </ScrollView>





        </View>

      </View>
    </NativeBaseProvider>

  );
};

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
  menuContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 10,
    boxShadow: '0 2px 5px rgba(3, 3, 3, 0.3)',

  },
  cardContainer: {
    backgroundColor: '#f5f5f5',

    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  imageContainer: {
    marginBottom: 10,

  },
  image: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  imageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  idText: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  dateText: {
    fontStyle: 'italic',
  },
  imageName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  layerContainer: {
    marginBottom: 10,
    padding: 10
  },
  layerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButton: {
    backgroundColor: '#7b9cff',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },


});
export default ProfileFormTransaction;