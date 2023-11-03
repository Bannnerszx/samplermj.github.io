import { StyleSheet, Text, View, TextInput, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, ScrollView, Image, FlatList } from 'react-native';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { FontAwesome, FontAwesome5, Entypo, MaterialCommunityIcons, Ionicons, AntDesign } from 'react-native-vector-icons';
import { AuthContext } from '../../context/AuthProvider';
import { BrowserRouter, Route, useNavigate, Link, useHistory, useParams } from 'react-router-dom';
import { firebaseConfig, storage, addDoc, collection, db, getDocs, query, where, getFirestore, doc, getDoc } from '../../Firebase/firebaseConfig';

const ProfileFormFavorite = () => {
  const { userEmail, logout, profileDataAuth } = useContext(AuthContext);
  const [userFavorites, setUserFavorites] = useState([]);
  useEffect(() => {
    // Check if userEmail is available before proceeding
    if (userEmail) {
      // Fetch user favorites only when userEmail is available
      const fetchUserFavorites = async () => {
        try {
          const favoritesSnapshot = await getDocs(collection(db, 'accounts', userEmail, 'favoriteLists'));
          const favoritesDataArray = favoritesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserFavorites(favoritesDataArray);
        } catch (error) {
          console.log('Error fetching user favorites:', error);
        }
      };
      // Call the fetchUserFavorites function to populate userFavorites
      fetchUserFavorites();
    }
  }, [userEmail]);

  //render the favorites
  const renderFavorites = ({ item }) => {

    return (
      <View style={{ flexDirection: 'row', padding: 5, backgroundColor: '#f5f5f5' , marginTop: 10}}>
        <View style={{ flex: 2, aspectRatio: screenWidth > 768 ? 466 / 300 : 600 / 400, padding: 10 }}>
          <Image source={{ uri: item.imageURL }} style={{ flex: 1, resizeMode: 'cover' }} />
        </View>
        <View style={{ flex: 3, marginLeft: 10 }}>
          <Text style={{ fontSize: 24, fontWeight: '600', color: '#ccc' }}>ID:{item.id}</Text>
          <Text style={{ fontSize: 22, fontWeight: '600' }}>{item.carName}</Text>
          <Text style={{ fontSize: 12 }}>{item.description}</Text>
          <Text style={{ color: '#aaa' }}><MaterialCommunityIcons name="steering" size={15} /> Right Handed</Text>
          <Text style={{ color: '#aaa' }}><MaterialCommunityIcons name="calendar-clock-outline" size={15} /> {item.year}</Text>
          <Text style={{ color: '#aaa' }}><Ionicons name="speedometer-outline" size={15} /> {item.mileage}</Text>
        </View>
        <View style={{ flex: 2 }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            elevation: 5,
            flex: 1,
            marginHorizontal: 10,

          }}>
            <View style={{ backgroundColor: '#7b9cff', padding: 10, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
              <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>About this car</Text>
            </View>
            <View style={{ marginLeft: 20, }}>
              <Text style={{ fontSize: 24, marginTop: 10 }}> {item.price}</Text>
              <Text style={{ color: '#aaa' }}><MaterialCommunityIcons name="calendar-clock-outline" size={20} /> DATE</Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>

          <TouchableOpacity style={{
            backgroundColor: '#FA4D4D', justifyContent: 'center', alignItems: 'center', height: 40,
            shadowColor: '#000', // Set the shadow color for iOS
            shadowOffset: { width: 0, height: 4 }, // Set the shadow offset (y = 4)
            shadowOpacity: 0.25, // Set the shadow opacity (25%)
            shadowRadius: 4,
            borderRadius: 5
          }}>
            <Text style={{ textAlign: 'center', color: 'white' }}>Message</Text>
          </TouchableOpacity>

        </View>
      </View>
    );
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
  const [showDropdown, setShowDropdown] = useState(false);


  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };


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
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ justifyContent: 'center' }}>
      {profileData ? (
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
                        <TouchableOpacity onPress={() => navigate('/ProfileFormTransaction')}>
                          <Text>Transactions</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ width: '100%', borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10 }}>
                        <Text>Inquiries Chat</Text>
                      </View>
                      <View style={{ width: '100%', borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10 }}>
                        <TouchableOpacity onPress={() => navigate('/ProfileFormFavorite')}>
                          <Text>Favorites</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ width: '100%', borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10 }}>
                        <TouchableOpacity onPress={() => navigate("/")}>
                          <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Go To Home</Text>
                        </TouchableOpacity>

                      </View>
                      <View style={{ width: '100%', borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10 }}>
                        <TouchableOpacity>
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
                      <Text style={{ fontSize: 16 }}>Profile</Text>
                      <TouchableOpacity onPress={() => navigate('/ProfilePassword')}>
                        <Text style={{ marginLeft: 10, fontSize: 16 }}>Password</Text>
                      </TouchableOpacity>

                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'center', width: '100%' }}>
                    <FontAwesome name="history" size={30} />
                    <TouchableOpacity onPress={() => navigate('/ProfileFormTransaction')}>
                      <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Transactions</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'center', width: '100%' }}>
                    <Ionicons name="chatbubble-ellipses" size={30} />
                    <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Inquiries Chat</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'center', width: '100%' }}>
                    <Ionicons name="chatbubble-ellipses" size={30} />
                    <TouchableOpacity onPress={() => navigate('/ProfileFormFavorite')}>
                      <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Favorites</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'center', width: '100%' }}>
                    <TouchableOpacity onPress={() => navigate("/")}>
                      <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Go To Home</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'center', width: '100%' }}>
                    <TouchableOpacity onPress={logout}><Text>LOGOUT</Text></TouchableOpacity>
                  </View>
                  <View style={{ width: '100%', borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10 }}>
                    <TouchableOpacity onPress={() => navigate('/UploadScreen')}>
                      <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Upload Screen</Text>
                    </TouchableOpacity>

                  </View>

                  <View style={{ padding: 10, margin: 10, marginTop: 20, alignItems: 'center', width: '100%' }}>
                    <Text style={{ color: 'red' }}>Delete Account</Text>
                  </View>
                </View>
              )}
            {screenWidth < 992 ? (
              <View style={{ width: screenWidth > 1280 ? 971 : '100%' }}>
                {/*TABLET FORM*/}
                {screenWidth > 742 && (
                  <View>
                    <View style={{ flexDirection: 'row', height: 40, alignItems: 'center' }}>
                      <View
                        style={{
                          backgroundColor: '#f5f5f5',
                          width: screenWidth > 1280 ? '95%' : '100%',
                          padding: 10,
                          marginBottom: 10,
                          shadowColor: '#000',
                          shadowOffset: {
                            width: 0,
                            height: 3,
                          },
                          shadowOpacity: 0.25,
                          shadowRadius: 2,
                        }}
                      >


                        <Text style={{ fontSize: 23, fontWeight: '700' }}>My Favorites</Text>
                      </View>

                    </View>
                    <View style={{ width: screenWidth > 1280 ? 971 : '100%', backgroundColor: '#f5f5f5', marginTop: 10 }}>
                     <FlatList
                      data={userFavorites}
                      renderItem={renderFavorites}
                     />
                    </View>

                  </View>
                )}
                {/*MOBILE FORM*/}
                {screenWidth < 742 && (
                  <View>
                    {userFavorites && (
                      <View style={{ backgroundColor: '#f5f5f5' }}>
                        {/* Title Cover */}
                        <View style={[styles.titleCover, { aspectRatio: 1.5 }]}>
                          <Image source={{ uri: userFavorites.imageURL }} style={styles.imageCard} />
                          <Text style={styles.imageName}>ID: N1023020696F-17</Text>
                        </View>

                        {/* Second Layer */}
                        <View style={styles.layerContainer}>
                          <Text style={styles.layerText}>{userFavorites.carName}</Text>
                        </View>

                        {/* Third Layer */}
                        <View style={styles.layerContainer}>
                          <Text style={styles.layerText}>{userFavorites.description}</Text>
                        </View>

                        {/* Fourth Layer */}
                        <View style={styles.layerContainer}>
                          <Text style={styles.layerText}>{userFavorites.location}</Text>
                        </View>

                        {/* Fifth Layer */}
                        <View style={styles.layerContainer}>
                          <Text style={styles.layerText}>{userFavorites.mileage}</Text>
                        </View>
                      </View>
                    )}


                  </View>
                )}


              </View>
            ) :
              (<View style={{ width: screenWidth > 1280 ? 971 : '79%' }}>
                <View style={{
                  backgroundColor: '#f5f5f5',
                  width: screenWidth > 1280 ? '95%' : '100%',
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
                  <View style={{ flexDirection: 'row', height: 40, alignItems: 'center' }}>

                    <Text style={{ fontSize: 23, fontWeight: '700' }}>My Favorites</Text>


                  </View>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: screenWidth > 1280 ? '95%' : '100%' }}>
                    <FlatList
                      data={userFavorites}
                      renderItem={renderFavorites}
                    />
                  </View>
                </View>



              </View>
              )}
          </View>
        </View>
      ) : (
        <View style={{ justifyContent: 'center', flex: 1 }}>

        </View>
      )}
    </ScrollView>
  );
};
export default ProfileFormFavorite;

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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  imageContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
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

  titleCover: {
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  imageCard: {
    flex: 1,
    resizeMode: 'cover',
  },
  imageName: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 5,
    borderRadius: 5,
  },
  layerContainer: {
    marginBottom: 10,
  },
  layerText: {
    fontSize: 14,
  },
});