import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Linking, ScrollView, Animated, Modal, Pressable, TextInput, FlatList, Image, ActivityIndicator, Platform, Button } from 'react-native';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { FontAwesome, FontAwesome5, Entypo, MaterialCommunityIcons, Ionicons, AntDesign, Fontisto, MaterialIcons } from 'react-native-vector-icons';
import { getFirestore, collection, where, query, onSnapshot, doc, getDoc, setDoc, serverTimestamp, orderBy, getDocs, updateDoc, limit, startAfter } from 'firebase/firestore';
import { auth, db, addDoc, fetchSignInMethodsForEmail, app, firebaseConfig, projectExtensionFirestore, projectExtensionStorage } from '../../Firebase/firebaseConfig';
import { AuthContext } from '../../context/AuthProvider';
import { useParams } from 'react-router-dom';
import { getStorage, listAll, getDownloadURL, ref } from "firebase/storage";
import { BrowserRouter, Route, useNavigate, Link, useHistory } from 'react-router-dom';

import ProgressStepper from '../ProgressStepper';
import { Country, City } from 'country-state-city';
import { Calendar } from 'react-native-calendars';
import ViewInvoice from './ViewInvoice';

import ViewOrderInvoice from './ViewOrderInvoice';

const ChatD = ({ selectedChatId }) => {
    //BREAKPOINT
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove
    }, []);


    const { userEmail } = useContext(AuthContext);
    const { chatId } = useParams(); // Use useParams to access the chatId from the route
    const [messages, setMessages] = useState({});
    const currentChatId = chatId;
    const [chatMessages, setChatMessages] = useState([]);
    const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState(null);
    const loadLatestMessages = async () => {
        try {
            const querySnapshot = await getDocs(
                query(
                    collection(projectExtensionFirestore, 'chats', chatId, 'messages'),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                )
            );

            const newMessages = querySnapshot.docs.map(doc => doc.data()).reverse();

            if (newMessages.length > 0) {
                setOldestMessageTimestamp(newMessages[0].timestamp);
                setChatMessages(newMessages);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };
    useEffect(() => {
        const chatRef = collection(projectExtensionFirestore, 'chats', currentChatId, 'messages');

        const unsubscribe = onSnapshot(
            query(
                chatRef,
                orderBy('timestamp', 'desc'),
                limit(10)
            ),
            (snapshot) => {
                if (!snapshot.empty) {
                    const messages = snapshot.docs.map(doc => doc.data()).reverse();
                    if (messages.length > 0) {
                        setOldestMessageTimestamp(messages[0].timestamp);
                        setChatMessages(messages);
                    }
                }
            },
            (error) => {
                console.error('Error fetching messages:', error);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [currentChatId]);

    const loadMoreMessages = async () => {
        try {
            if (oldestMessageTimestamp) {
                const querySnapshot = await getDocs(
                    query(
                        collection(projectExtensionFirestore, 'chats', currentChatId, 'messages'),
                        orderBy('timestamp', 'desc'),
                        startAfter(oldestMessageTimestamp),
                        limit(10)
                    )
                );

                const newMessages = querySnapshot.docs.map(doc => doc.data()).reverse();

                if (newMessages.length > 0) {
                    setOldestMessageTimestamp(newMessages[0].timestamp);
                    setChatMessages(prevMessages => [...newMessages, ...prevMessages]);
                }
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };
    console.log(chatMessages)
    // Replace 'firestore' with your Firestore instance
    const firestore = getFirestore(); // Make sure to import getFirestore from Firebase

    // useEffect(() => {
    //     // Set up a real-time listener for messages in the specific chat conversation using chatId
    //     const unsubscribe = onSnapshot(
    //         collection(projectExtensionFirestore, 'chats', chatId, 'messages'),
    //         {
    //             query: orderBy('Time', 'asc'), // Order messages by timestamp
    //         },
    //         (snapshot) => {
    //             const messages = [];
    //             snapshot.forEach((doc) => {
    //                 messages.push(doc.data());
    //             });
    //             setChatMessages(messages);
    //         }
    //     );

    //     return () => {
    //         // Unsubscribe from the real-time listener when the component unmounts
    //         unsubscribe();
    //     };
    // }, [chatId]); //STILL USING OLD DATABASE

    //fetch the carId
    const [carId, setCarId] = useState('');
    const [proformaIssue, setProformaIssue] = useState(null);
    console.log('CAR ID FOR THIS SHITZZ: ', carId);


    useEffect(() => {
        // Define the reference to the chat document with the specific chatId
        const chatRef = doc(projectExtensionFirestore, 'chats', chatId);

        // Listen for real-time updates to the document
        const unsubscribe = onSnapshot(chatRef, (chatDocSnapshot) => {
            if (chatDocSnapshot.exists()) {
                // Extract the carId, carName, and carRefNumber from the document data
                const vehicleData = chatDocSnapshot.data()?.vehicle;
                if (vehicleData) {
                    setCarId(vehicleData.carId);
                }
                const proformaInvoice = chatDocSnapshot.data()?.proformaInvoice;
                if (proformaInvoice) {
                    setProformaIssue(proformaInvoice.proformaIssue);
                }
            }
        }, (error) => {
            console.error('Error listening to chat document:', error);
        });

        return () => {
            // Unsubscribe from the listener when the component unmounts
            unsubscribe();
        };
    }, [chatId]); //STILL USING OLD DATABASE

    //fetch the carId

    //fetch customer email
    //Reserved button
    const [reservationStatus, setReservationStatus] = useState(false);
    useEffect(() => {
        const fetchVehicleDoc = async () => {
            try {
                // Only fetch the vehicle document if carId is available
                if (carId) {
                    const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);
                    const docSnapshot = await getDoc(vehicleDocRef);

                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        const reserveValue = data.Reserve || false;
                        setReservationStatus(reserveValue);
                    }
                }
            } catch (error) {
                console.error('Error fetching vehicle document:', error);
            }
        };

        fetchVehicleDoc();
    }, [carId]); //USES NEW DATABASE BUT STILL NEED CHECKING

    const handleReserve = async () => {
        const carChatId = carId;
        try {
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carChatId);
            await updateDoc(vehicleDocRef, {
                Reserve: true // Send a boolean value
            });

            setReservationStatus(true);
        } catch (error) {
            console.error('Error reserving vehicle:', error);
        }
    };
    //Reserved button




    //fetch the cardata
    const [carData, setCarData] = useState('');
    useEffect(() => {
        if (carId) {
            // Create a reference to the document
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);

            // Listen for real-time updates to the document
            const unsubscribe = onSnapshot(vehicleDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const carDataFromFirestore = docSnapshot.data();
                    setCarData(carDataFromFirestore);
                } else {
                    console.log('Document does not exist.');
                }
            }, (error) => {
                console.error('Error listening to document:', error);
            });

            // Return a cleanup function to unsubscribe when the component unmounts
            return () => unsubscribe();
        }
        console.log(carData.carName)
    }, [carId]); //USES NEW DATABASE BUT STILL NEED CHECKING

    //fetch the carData

    const handleMessageChange = (text) => {
        setMessages(prevMessages => ({
            ...prevMessages,
            [currentChatId]: text
        }));
    };
    const handleSend = async () => {
        try {
            const timestamp = new Date(); // Get the current date and time

            const year = timestamp.getFullYear();
            const month = timestamp.toLocaleString('default', { month: 'short' }); // Get the month abbreviation (e.g., Oct)
            const day = timestamp.getDate().toString().padStart(2, '0');

            const hours = timestamp.getHours().toString().padStart(2, '0');
            const minutes = timestamp.getMinutes().toString().padStart(2, '0');
            const seconds = timestamp.getSeconds().toString().padStart(2, '0');

            const formattedTimestampString = `${month} ${day}, ${year} at ${hours}:${minutes}:${seconds}`;

            // Create a new message document in the chat conversation with the formatted timestamp as the document ID
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'), formattedTimestampString);
            const newMessageDoc = doc(collection(firestore, 'chats', chatId, 'messages'), formattedTimestampString);

            const messageData = {
                sender: userEmail, // Sender's email
                text: messageValue,
                timestamp: serverTimestamp(),
            };

            // Set the message data in the new message document
            await setDoc(newMessageDoc, messageData);
            await setDoc(newMessageDocExtension, messageData);
            setMessages('');
            // Clear the message input field
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };



    //USES NEW DATABASE BUT STILL NEED CHECKING
    const messageValue = messages[currentChatId] || '';
    const navigate = useNavigate();
    const handlePress = () => {
        if (proformaIssue) {
            const url = `/ProfileFormChatGroup/${chatId}/print`;
            window.open(url, '_blank');
        }
    };

    return (
        <View>

            {chatMessages && (
                <View>
                    <View style={{ position: 'sticky', padding: 10 }}>
                        <View style={{ flex: 1, borderWidth: 1 }}>
                            <View style={{ flexDirection: screenWidth < 993 ? 'column' : 'row' }}>
                                <View style={{ flex: screenWidth < 993 ? null : 2, marginBottom: screenWidth < 993 ? 20 : 0 }}>
                                    {/* First view content */}
                                    <View style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8, padding: 5 }}>
                                        {/* <Image source={car1} style={{ width: '100%', height: 350, resizeMode: 'contain' }} /> */}

                                    </View>
                                </View>
                                <View style={{ flex: screenWidth < 993 ? null : 3, padding: 5 }}>
                                    {/* Middle view content */}
                                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                        <View style={{ flex: 1, alignItems: 'flex-start' }}>
                                            {/* First child view content */}
                                            <Text style={{ fontSize: 18, fontWeight: '600' }}>{carData.carName}</Text>
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
                                            <Text style={{ fontSize: 18, fontWeight: '600', textDecorationLine: 'underline' }}>{carData.carName}</Text>
                                            <View style={{ alignSelf: screenWidth < 335 ? 'flex-start' : null }}>
                                                <Text style={{ color: '#aaa', fontSize: 12 }}>Mozambique, Dar Es Salaam</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: screenWidth < 335 ? null : 1, alignItems: screenWidth < 335 ? null : 'flex-end' }}>
                                            <View>
                                                <Text>DBA-C11 C11-408702</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                                                <MaterialCommunityIcons name="steering" size={20} />
                                                <Text>{carData.steering}</Text>
                                                <Text> {carData.mileage}</Text>
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

                            </View>

                        </View>

                    </View>
                    <TouchableOpacity onPress={loadMoreMessages} style={{ padding: 10, backgroundColor: 'lightgray', alignItems: 'center' }}>
                        <Text>Load More</Text>
                    </TouchableOpacity>
                    <FlatList
                        nestedScrollEnabled
                        data={chatMessages}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View>
                                <View
                                    style={[
                                        styles.chatContainer,
                                        {
                                            alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                            backgroundColor: item.sender === userEmail ? 'blue' : 'green',

                                        },
                                    ]}
                                >
                                    <Text style={{ color: 'white', }}>{item.text}</Text>

                                    {item.sender === `marc@realmotor.jp` && item.proformaIssue === true ? (
                                        <ViewInvoice />) : null}
                                    {item.sender === `marc@realmotor.jp` && item.receiverInfoIssue === true
                                        ? (
                                            <ReceiverInformation />) : null}
                                    {item.sender === `marc@realmotor.jp` && item.orderInvoiceIssue === true
                                        ? (
                                            <ViewOrderInvoice />) : null}
                                    {item.sender === `marc@realmotor.jp` && item.amendedInvoiceIssue === true
                                        ? (
                                            <ViewOrderInvoice />) : null}


                                </View>
                                <Text style={{
                                    color: 'black', fontStyle: 'italic', fontSize: 9, alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                    padding: 10,
                                    paddingTop: -5,
                                    borderRadius: 10,
                                    maxWidth: '80%',
                                }}>
                                    {item.timestamp && new Date(item.timestamp.toDate()).toLocaleTimeString()}
                                </Text>
                            </View>
                        )}
                    />

                </View>
            )}


            <View style={styles.inputContainer}>
                <InvoiceAmendment />
                <TextInput
                    placeholder={`Type your message`}
                    value={messageValue}
                    onChangeText={(text) => handleMessageChange(text)}
                    style={styles.input}
                    onSubmitEditing={() => handleSend()}
                />
                <TouchableOpacity onPress={() => handleSend()}>
                    <Text style={styles.sendButton}>Send</Text>
                </TouchableOpacity>
            </View>

            {!reservationStatus && (
                <TouchableOpacity onPress={handleReserve} disabled={reservationStatus}>
                    <Text>Reserve</Text>
                </TouchableOpacity>
            )}

        </View>

    );
};

const InvoiceAmendment = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const openModalRequest = () => {
        setModalVisible(!modalVisible);
    };
    const { userEmail } = useContext(AuthContext);
    const { chatId } = useParams();
    //COUNTRY AND CITY
    const [countries, setCountries] = useState([]);
    const [showCountries, setShowCountries] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCountryLabel, setSelectedCountryLabel] = useState('Country');
    const [filter, setFilter] = useState('');
    const toggleCountries = () => {
        setShowCountries(!showCountries);
        setFilter('');
        setFilteredCountries(countries);
        setShowCities(false);
    };
    const [showCountriesNotify, setShowCountriesNotify] = useState(false);
    const [selectedCountryNotify, setSelectedCountryNotify] = useState('');
    const [selectedCountryNotifyLabel, setSelectedCountryNotifyLabel] = useState('Country');
    const [filterNotify, setFilterNotify] = useState('');
    const [filteredCountriesNotify, setFilteredCountriesNotify] = useState(countries);
    const handleClearNotify = () => {
        setSelectedCountryNotifyLabel('Country');
        setSelectedCityNotify('City');
        setSelectedCountryNotify('');
    };
    const toggleCountriesNotify = () => {
        setShowCountriesNotify(!showCountriesNotify);
        setFilterNotify('');
        setFilteredCountriesNotify(countries);
        setShowCitiesNotify(false);
    }

    useEffect(() => {
        try {
            const countriesData = Country.getAllCountries().map((country) => ({
                value: country.isoCode,
                label: country.name
            }));
            setFilteredCountries(countriesData);
            setCountries(countriesData);
            setFilteredCountriesNotify(countriesData);
        } catch (error) {
            console.error('Error Fetching countries:', error)
        }
    }, []);
    const [filteredCountries, setFilteredCountries] = useState(countries);
    const handleFilterChange = (text) => {
        setFilter(text);
        setFilterCities(text);
        setFilterNotify(text);
        const filteredData = countries.filter(item =>
            item.label.toLowerCase().includes(text.toLowerCase()));
        const filteredDataCities = cities.filter(item => item.label.toLowerCase().includes(text.toLowerCase()));
        setFilteredCountries(filteredData);
        setFilteredCities(filteredDataCities);
        setFilteredCountriesNotify(filteredData);
        setFilteredCitiesNotify(filteredDataCities);
    };
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState(cities);
    const [showCities, setShowCities] = useState(false);
    const [selectedCity, setSelectedCity] = useState('City');
    const [filterCities, setFilterCities] = useState('');
    const toggleCities = () => {
        setShowCities(!showCities);
        setFilterCities('');
        setFilteredCities(cities);
        setShowCountries(false);
    };
    useEffect(() => {
        if (selectedCountry) {
            const countryCities = City.getCitiesOfCountry(selectedCountry);
            const citiesData = countryCities.map((city) => ({
                label: city.name
            }));
            console.log('All cities inside', citiesData);
            setCities(citiesData);

            if (citiesData.length <= 0) {
                setSelectedCity(selectedCountryLabel);
            }
        }
        if (selectedCountryNotify) {
            const countryCities = City.getCitiesOfCountry(selectedCountryNotify);
            const citiesData = countryCities.map((city) => ({
                label: city.name
            }));
            console.log('All cities inside', citiesData);
            setCities(citiesData);

            if (citiesData.length <= 0) {
                setSelectedCityNotify(selectedCountryNotifyLabel);
            }
        }
    }, [selectedCountry, selectedCountryNotify]);
    const [showCitiesNotify, setShowCitiesNotify] = useState(false);
    const [selectedCityNotify, setSelectedCityNotify] = useState('City');
    const [filterCitiesNotify, setFilterCitiesNotify] = useState('');
    const [filteredCitiesNotify, setFilteredCitiesNotify] = useState(cities);
    const toggleCitiesNotify = () => {
        setShowCitiesNotify(!showCitiesNotify)
        setFilterCitiesNotify('');
        setFilteredCitiesNotify(cities);
        setShowCountriesNotify(false);
    };
    const handleClear = () => {
        setSelectedCountryLabel('Country');
        setSelectedCountry('');
        setSelectedCity('');
    };
    //COUNTRY AND CITY

    //is CHECKEDNOTIFY
    const [isChecked, setChecked] = useState(false);
    const [isCheckedNotify, setCheckedNotify] = useState(false);

    //if false
    const [fullNameNotifyInput, setFullNameNotifyInput] = useState('');
    const [addressNotify, setAddressNotify] = useState('');
    const [telNumberNotify, setTelNumberNotify] = useState('');
    const [emailNotify, setEmailNotify] = useState('');

    //fetching data from STOCKID

    //if true
    const [fullNameDB, setFullNameDB] = useState('');
    const [countryDB, setCountryDB] = useState('Country');
    const [cityDB, setCityDB] = useState('City');
    const [telNumberDB, setTelNumberDB] = useState('');
    const [addressDB, setAddressDB] = useState('');
    //if false
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [telNumber, setTelNumber] = useState('');


    useEffect(() => {
        const fetchUserData = async () => {
            const userDocRef = doc(projectExtensionFirestore, 'accounts', userEmail);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFullNameDB(userData.textFirst + ' ' + userData.textLast);
                    setTelNumberDB('+' + userData.textPhoneNumber);
                    setAddressDB(userData.textZip + ' ' + userData.textStreet + ',' + ' ' + userData.city);
                    setCountryDB(userData.country);
                    setCityDB(userData.city);
                } else {
                    console.log('No user with that Email')
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        };
        if (userEmail) {
            fetchUserData();
        }
    }, [userEmail])
    //fetching the user's information

    //fetching data from STOCKID carId = STOCKID
    const [carId, setCarId] = useState(null);
    useEffect(() => {
        const fetchCarId = async () => {
            try {
                const vehicleIdDocRef = doc(projectExtensionFirestore, 'chats', chatId);
                const docSnapshot = await getDoc(vehicleIdDocRef);

                if (docSnapshot.exists()) {
                    const carIdValue = docSnapshot.data().vehicle.carId;
                    setCarId(carIdValue);
                } else {
                    console.log('Document does not exist');
                }
            } catch (error) {
                console.error('Error getting document:', error);
            }
        }

        fetchCarId(); // Don't forget to call the function!
    }, [projectExtensionFirestore, chatId]);
    //fetching data from STOCKID carId = STOCKID


    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        step: {
            height: 10,
            width: '30%',
            backgroundColor: '#ccc',
        },
        completed: {
            backgroundColor: 'green',
        },
        circle: {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: '#ff4d4d',
            justifyContent: 'center',
            alignItems: 'center',
        },
        innerCircle: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
        },
        innerCircleCompleted: {
            backgroundColor: 'green',
        },
        line: {
            height: 10,
            width: '30%',
            backgroundColor: '#ccc',
            flexShrink: 1,
        },
    });

    const [inputEmail, setInputEmail] = useState('');
    const [inputEmailNotify, setInputEmailNotify] = useState('');
    const setOrderInvoice = async () => {

        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')} at ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;

        const customerInfo = {
            fullName: isChecked ? fullNameDB : fullName,
            country: isChecked ? countryDB : selectedCountryLabel,
            city: isChecked ? cityDB : selectedCity,
            address: isChecked ? addressDB : address,
            telNumber: isChecked ? telNumberDB : telNumber,
            email: inputEmail,
        };

        const infoCustomerInput = {
            fullName: isCheckedNotify ? (isChecked ? fullNameDB : fullName) : fullNameNotifyInput,
            country: isCheckedNotify ? (isChecked ? countryDB : selectedCountryLabel) : selectedCountryNotifyLabel,
            city: isCheckedNotify ? (isChecked ? cityDB : selectedCity) : selectedCityNotify,
            address: isCheckedNotify ? (isChecked ? addressDB : address) : addressNotify,
            telNumber: isCheckedNotify ? (isChecked ? telNumberDB : telNumber) : telNumberNotify,
            email: inputEmailNotify,
        };

        try {
            const orderRef = doc(projectExtensionFirestore, 'chats', chatId);
            const timestamp = new Date(); // Get the current date and time

            const year = timestamp.getFullYear();
            const month = timestamp.toLocaleString('default', { month: 'short' }); // Get the month abbreviation (e.g., Oct)
            const day = timestamp.getDate().toString().padStart(2, '0');

            const hours = timestamp.getHours().toString().padStart(2, '0');
            const minutes = timestamp.getMinutes().toString().padStart(2, '0');
            const seconds = timestamp.getSeconds().toString().padStart(2, '0');

            const formattedTimestampString = `${month} ${day}, ${year} at ${hours}:${minutes}:${seconds}`;
            // Create a new message document in the chat conversation with the formatted timestamp as the document ID
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'), formattedTimestampString);
            const messageData = {
                sender: userEmail, // Sender's email
                text: `REQUEST AMENDMENT INFORMATION      

Customer Information
            Full Name: ${isChecked ? fullNameDB : fullName}
            Country: ${isChecked ? countryDB : selectedCountryLabel}
            City: ${isChecked ? cityDB : selectedCity}
            Address: ${isChecked ? addressDB : address}
            Tel. Number: ${isChecked ? telNumberDB : telNumber}
            Email: ${inputEmail}
            
Notify Party
            Full Name: ${isCheckedNotify ? (isChecked ? fullNameDB : fullName) : fullNameNotifyInput}
            Country: ${isCheckedNotify ? (isChecked ? countryDB : selectedCountryLabel) : selectedCountryNotifyLabel}
            City: ${isCheckedNotify ? (isChecked ? cityDB : selectedCity) : selectedCityNotify}
            Address: ${isCheckedNotify ? (isChecked ? addressDB : address) : addressNotify}
            Tel. Number: ${isCheckedNotify ? (isChecked ? telNumberDB : telNumber) : telNumberNotify}
            Email: ${inputEmailNotify}
            `,
                timestamp: serverTimestamp(),
                requestAmendInvoice: true,
                infoCustomerInput,
                customerInfo
            };
            await updateDoc(orderRef, {
                orderInvoice: {
                    orderInvoiceIssue: true,
                    customerInfo,
                    notifyParty: isCheckedNotify ? customerInfo : infoCustomerInput,
                    dateIssued: formattedDate, // Add formatted date
                },
            });
            await setDoc(newMessageDocExtension, messageData);
        } catch (error) {
            console.error('Error updating Proforma Invoice:', error);
        }
    };

    //STEP TRACKER
    const [currentStep, setCurrentStep] = useState(1);
    const addStep = () => {
        setCurrentStep(currentStep + 1);
    };
    return (
        <View>
            <TouchableOpacity onPress={() => openModalRequest()}>
                <MaterialCommunityIcons name={'file-document-edit'} size={25} style={{ margin: 5, color: '#7b9cff' }} />
            </TouchableOpacity>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={openModalRequest}
            >
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                    <View style={{ backgroundColor: 'white', width: 992, height: '90%', padding: 10, borderRadius: 10 }}>
                        <ScrollView>
                            <View style={{ marginTop: 5 }}>


                                <View>
                                    {currentStep === 1 && (

                                        <View style={{ flexDirection: 'column', zIndex: -2 }}>
                                            <View style={{}}>
                                                <Text style={{ fontWeight: '700', color: 'red' }}>*Make Necessary Changes</Text>
                                            </View>
                                            <View style={{ flex: 1, marginTop: 5 }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#4169E1' }}>
                                                        Customer Information
                                                    </Text>
                                                    <TouchableOpacity onPress={() => {
                                                        setChecked(prev => {
                                                            if (prev && isChecked) {
                                                                setFullNameDB(fullNameDB);
                                                                setCityDB(cityDB);
                                                                setCountryDB(countryDB);
                                                                setAddressDB(addressDB);
                                                                setTelNumberDB(telNumberDB);
                                                            } else {
                                                                setFullName(' ');
                                                                setSelectedCountryLabel('Country')
                                                                setSelectedCity('City')
                                                                setAddress(' ')
                                                                setTelNumber(' ')
                                                            }
                                                            return !prev;
                                                        });
                                                    }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                                        <MaterialIcons
                                                            name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                                                            size={20}
                                                            color="black"
                                                        />
                                                        <Text>Set as customer's information <Text style={{ color: 'red' }}>*</Text></Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Full Name</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                            {isChecked ? (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={fullNameDB}
                                                                    onChangeText={(text) => setFullNameDB(text)}
                                                                />
                                                            ) : (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={fullName}
                                                                    onChangeText={(text) => setFullName(text)}
                                                                />
                                                            )}

                                                        </View>
                                                    </View>

                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                                        <View style={{ flex: 1, zIndex: 2 }}>
                                                            <TouchableOpacity onPress={toggleCountries} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                                    <View style={{ alignSelf: 'center' }}>
                                                                        {isChecked ? (
                                                                            <Text style={{ textAlignVertical: 'center' }}>{countryDB}</Text>
                                                                        ) : (
                                                                            <Text style={{ textAlignVertical: 'center' }}>{selectedCountry ? selectedCountryLabel : 'Country'}</Text>
                                                                        )}
                                                                    </View>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <TouchableOpacity onPress={handleClear} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                            <AntDesign name="close" size={15} />
                                                                        </TouchableOpacity>
                                                                        <AntDesign
                                                                            name="down"
                                                                            size={15}
                                                                            style={[
                                                                                { transitionDuration: '0.3s' },
                                                                                showCountries && {
                                                                                    transform: [{ rotate: '180deg' }],
                                                                                },
                                                                            ]}
                                                                        />
                                                                    </View>
                                                                </View>
                                                            </TouchableOpacity>
                                                            {showCountries && (
                                                                <View style={{
                                                                    marginTop: 5,
                                                                    position: 'absolute',
                                                                    top: '100%',
                                                                    left: 0,
                                                                    elevation: 5,
                                                                    width: '100%',
                                                                    maxHeight: 200,
                                                                    backgroundColor: "white",
                                                                    borderWidth: 1,
                                                                    borderColor: '#ccc',
                                                                    shadowColor: '#000',
                                                                    shadowOffset: { width: 0, height: 4 },
                                                                    shadowOpacity: 0.25,
                                                                    shadowRadius: 4,
                                                                    zIndex: 3
                                                                }}>
                                                                    <View style={{
                                                                        flexDirection: 'row',
                                                                        alignItems: 'center',
                                                                        backgroundColor: '#fff',
                                                                        borderWidth: 0.5,
                                                                        borderColor: '#000',
                                                                        height: 40,
                                                                        borderRadius: 5,
                                                                        margin: 10,
                                                                        zIndex: 3
                                                                    }}>
                                                                        <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                                        <TextInput
                                                                            placeholder='Search Country'
                                                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                            textAlignVertical='center'
                                                                            placeholderTextColor={'gray'}
                                                                            value={filter}
                                                                            onChangeText={handleFilterChange}
                                                                        />
                                                                    </View>
                                                                    <ScrollView>
                                                                        <FlatList
                                                                            data={filteredCountries}
                                                                            keyExtractor={(item) => item.value} // Use item.label as the key
                                                                            renderItem={({ item }) => (
                                                                                <TouchableOpacity onPress={() => {
                                                                                    setSelectedCountryLabel(item.label);
                                                                                    setSelectedCountry(item.value);
                                                                                    setShowCountries(false);
                                                                                    setFilteredCountries(countries);
                                                                                    setSelectedCity('City')
                                                                                }}>
                                                                                    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                                        <Text>{item.label}</Text>
                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                            )}
                                                                        />

                                                                    </ScrollView>
                                                                </View>
                                                            )}

                                                        </View>
                                                    </View>
                                                    <View style={{ flex: 1, marginLeft: 5 }}>
                                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                                        <View style={{ flex: 1, zIndex: 2, }}>
                                                            <TouchableOpacity onPress={selectedCountry ? toggleCities : null} disabled={!selectedCountry || selectedCountryLabel === 'Country'} style={{ borderWidth: 1, borderRadius: 5 }}>

                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                                    {isChecked ? (
                                                                        <Text style={{ textAlignVertical: 'center' }}>{cityDB}</Text>
                                                                    ) : (
                                                                        <Text style={{ textAlignVertical: 'center' }}>{selectedCity ? selectedCity : 'City'}</Text>
                                                                    )}
                                                                    <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                                        <AntDesign
                                                                            name="down"
                                                                            size={15}
                                                                            style={[
                                                                                { transitionDuration: '0.3s' },
                                                                                showCities && {
                                                                                    transform: [{ rotate: '180deg' }],
                                                                                },
                                                                            ]}
                                                                        />
                                                                    </View>
                                                                </View>

                                                            </TouchableOpacity>
                                                            {showCities && (
                                                                <View
                                                                    style={{
                                                                        marginTop: 5,
                                                                        position: 'absolute',
                                                                        top: '100%',
                                                                        left: 0,
                                                                        elevation: 5,
                                                                        width: '100%',
                                                                        maxHeight: 200,
                                                                        backgroundColor: 'white',
                                                                        borderWidth: 1,
                                                                        borderColor: '#ccc',
                                                                        elevation: 5,
                                                                        zIndex: 2
                                                                    }}>
                                                                    <View style={{
                                                                        flexDirection: 'row',
                                                                        alignItems: 'center',
                                                                        backgroundColor: '#fff',
                                                                        borderWidth: 0.5,
                                                                        borderColor: '#000',
                                                                        height: 40,
                                                                        borderRadius: 5,
                                                                        margin: 10,
                                                                        zIndex: 3
                                                                    }}>
                                                                        <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                                        <TextInput
                                                                            placeholder='Search Cities'
                                                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                            textAlignVertical='center'
                                                                            placeholderTextColor={'gray'}
                                                                            value={filterCities}
                                                                            onChangeText={handleFilterChange}
                                                                        />
                                                                    </View>
                                                                    <ScrollView>
                                                                        <FlatList
                                                                            data={filteredCities}
                                                                            keyExtractor={(item, index) => index.toString()}
                                                                            renderItem={({ item }) => (
                                                                                <TouchableOpacity onPress={() => {
                                                                                    setSelectedCity(item.label)
                                                                                    setShowCities(false);
                                                                                    setFilteredCities(cities);
                                                                                }}>
                                                                                    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                                        <Text>{item.label}</Text>
                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                            )}
                                                                        />
                                                                    </ScrollView>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Address</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                            {isChecked ? (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={addressDB}
                                                                    onChangeText={(text) => setAddressDB(text)}
                                                                />
                                                            ) : (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={address}
                                                                    onChangeText={(text) => setAddress(text)}
                                                                />
                                                            )}

                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Tel. Number</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                            {isChecked ? (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={telNumberDB}
                                                                    onChangeText={(telNumberDB) => setTelNumberDB(telNumberDB)}
                                                                />
                                                            ) : (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={telNumber}
                                                                    onChangeText={(text) => setTelNumber(text)}
                                                                />
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Email</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                            <TextInput
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                value={inputEmail}
                                                                onChangeText={(text) => setInputEmail(text)}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>

                                            </View>

                                            <View style={{ flex: 1, marginLeft: 5, marginTop: 5, zIndex: -2 }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#4169E1' }}>
                                                        Notify Party
                                                    </Text>
                                                    <TouchableOpacity onPress={() => {
                                                        setCheckedNotify(prev => {
                                                            if (prev && isCheckedNotify) {
                                                                setFullNameDB(fullNameDB);
                                                                setFullName(fullName);
                                                                setCityDB(cityDB);
                                                                setCountryDB(countryDB);
                                                                setAddressDB(addressDB);
                                                                setTelNumberDB(telNumberDB);
                                                                setSelectedCountryLabel(selectedCountryLabel)
                                                                setSelectedCity(selectedCity)
                                                                setAddress(address)
                                                                setTelNumber(telNumber)
                                                            } else {
                                                                setFullNameNotifyInput(' ');
                                                                setSelectedCountryNotifyLabel('Country');
                                                                setSelectedCountryNotify('');
                                                                setSelectedCityNotify('City');
                                                                setAddressNotify('');
                                                                setTelNumberNotify('');
                                                            }
                                                            return !prev;
                                                        });
                                                    }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                                        <MaterialIcons
                                                            name={isCheckedNotify ? 'check-box' : 'check-box-outline-blank'}
                                                            size={20}
                                                            color="black"
                                                        />
                                                        <Text>Same as customer <Text style={{ color: 'red' }}>*</Text></Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Full Name</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                            {isCheckedNotify ? (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={isChecked ? fullNameDB : fullName}
                                                                    onChangeText={(text) => {
                                                                        setFullNameDB(text);
                                                                        setFullName(text);
                                                                    }}
                                                                />
                                                            ) : (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={fullNameNotifyInput}
                                                                    onChangeText={(text) => setFullNameNotifyInput(text)}
                                                                />
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                                        <View style={{ flex: 1, zIndex: 2 }}>
                                                            <TouchableOpacity onPress={toggleCountriesNotify} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                                    <View style={{ alignSelf: 'center' }}>
                                                                        {isCheckedNotify ? (
                                                                            <Text style={{ textAlignVertical: 'center' }}>
                                                                                {isChecked ? countryDB : selectedCountryLabel}
                                                                            </Text>
                                                                        ) : (
                                                                            <Text style={{ textAlignVertical: 'center' }}>
                                                                                {selectedCountryNotifyLabel}
                                                                            </Text>
                                                                        )}
                                                                    </View>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <TouchableOpacity onPress={handleClearNotify} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                            <AntDesign name="close" size={15} />
                                                                        </TouchableOpacity>
                                                                        <AntDesign
                                                                            name="down"
                                                                            size={15}
                                                                            style={[
                                                                                { transitionDuration: '0.3s' },
                                                                                showCountriesNotify && {
                                                                                    transform: [{ rotate: '180deg' }],
                                                                                },
                                                                            ]}
                                                                        />
                                                                    </View>
                                                                </View>
                                                            </TouchableOpacity>
                                                            {showCountriesNotify && (
                                                                <View style={{
                                                                    marginTop: 5,
                                                                    position: 'absolute',
                                                                    top: '100%',
                                                                    left: 0,
                                                                    elevation: 5,
                                                                    width: '100%',
                                                                    maxHeight: 200,
                                                                    backgroundColor: "white",
                                                                    borderWidth: 1,
                                                                    borderColor: '#ccc',
                                                                    shadowColor: '#000',
                                                                    shadowOffset: { width: 0, height: 4 },
                                                                    shadowOpacity: 0.25,
                                                                    shadowRadius: 4,
                                                                    elevation: 5,
                                                                    zIndex: 3
                                                                }}>
                                                                    <View style={{
                                                                        flexDirection: 'row',
                                                                        alignItems: 'center',
                                                                        backgroundColor: '#fff',
                                                                        borderWidth: 0.5,
                                                                        borderColor: '#000',
                                                                        height: 40,
                                                                        borderRadius: 5,
                                                                        margin: 10,
                                                                        zIndex: 3
                                                                    }}>
                                                                        <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                                        <TextInput
                                                                            placeholder='Search Country'
                                                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                            textAlignVertical='center'
                                                                            placeholderTextColor={'gray'}
                                                                            value={filterNotify}
                                                                            onChangeText={handleFilterChange}
                                                                        />
                                                                    </View>
                                                                    <ScrollView>

                                                                        <FlatList
                                                                            data={filteredCountriesNotify}
                                                                            keyExtractor={(item) => item.label} // Use item.label as the key
                                                                            renderItem={({ item }) => (
                                                                                <TouchableOpacity onPress={() => {
                                                                                    setSelectedCountryNotifyLabel(item.label)
                                                                                    setSelectedCountryNotify(item.value)
                                                                                    setShowCountriesNotify(false);
                                                                                    setFilteredCountriesNotify(countries);
                                                                                    setSelectedCityNotify('City')
                                                                                }}>
                                                                                    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                                        <Text>{item.label}</Text>
                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                            )}
                                                                        />
                                                                    </ScrollView>
                                                                </View>
                                                            )}

                                                        </View>
                                                    </View>
                                                    <View style={{ flex: 1, marginLeft: 5 }}>
                                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                                        <View style={{ flex: 1, zIndex: 2, }}>
                                                            <TouchableOpacity onPress={selectedCountryNotify ? toggleCitiesNotify : null} disabled={!selectedCountryNotify || selectedCountryNotifyLabel === 'Country'} style={{ borderWidth: 1, borderRadius: 5 }}>

                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>

                                                                    {isCheckedNotify ? (
                                                                        <Text style={{ textAlignVertical: 'center' }}>{
                                                                            isChecked ? cityDB : selectedCity
                                                                        }</Text>
                                                                    ) : (
                                                                        <Text style={{ textAlignVertical: 'center' }}> {selectedCityNotify}</Text>
                                                                    )}
                                                                    <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                                        <AntDesign
                                                                            name="down"
                                                                            size={15}
                                                                            style={[
                                                                                { transitionDuration: '0.3s' },
                                                                                showCitiesNotify && {
                                                                                    transform: [{ rotate: '180deg' }],
                                                                                },
                                                                            ]}
                                                                        />
                                                                    </View>
                                                                </View>

                                                            </TouchableOpacity>
                                                            {showCitiesNotify && (
                                                                <View
                                                                    style={{
                                                                        marginTop: 5,
                                                                        position: 'absolute',
                                                                        top: '100%',
                                                                        left: 0,
                                                                        elevation: 5,
                                                                        width: '100%',
                                                                        maxHeight: 150,
                                                                        backgroundColor: 'white',
                                                                        borderWidth: 1,
                                                                        borderColor: '#ccc',
                                                                        elevation: 5,
                                                                        zIndex: 2
                                                                    }}>
                                                                    <View style={{
                                                                        flexDirection: 'row',
                                                                        alignItems: 'center',
                                                                        backgroundColor: '#fff',
                                                                        borderWidth: 0.5,
                                                                        borderColor: '#000',
                                                                        height: 40,
                                                                        borderRadius: 5,
                                                                        margin: 10,
                                                                        zIndex: 3
                                                                    }}>
                                                                        <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                                        <TextInput
                                                                            placeholder='Search Cities'
                                                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                            textAlignVertical='center'
                                                                            placeholderTextColor={'gray'}
                                                                            value={filterCitiesNotify}
                                                                            onChangeText={handleFilterChange}
                                                                        />
                                                                    </View>
                                                                    <ScrollView>
                                                                        <FlatList
                                                                            data={filteredCitiesNotify}
                                                                            keyExtractor={(item, index) => index.toString()}
                                                                            renderItem={({ item }) => (
                                                                                <TouchableOpacity onPress={() => {

                                                                                    setSelectedCityNotify(item.label);
                                                                                    setShowCitiesNotify(false);
                                                                                    setFilteredCitiesNotify(cities);
                                                                                }}>
                                                                                    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                                        <Text>{item.label}</Text>
                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                            )}
                                                                        />
                                                                    </ScrollView>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Address</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                            {isCheckedNotify ? (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={isChecked ? addressDB : address}
                                                                    onChangeText={(text) => { setAddress(text); setAddressDB(text); }}
                                                                />
                                                            ) : (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={addressNotify}
                                                                    onChangeText={(text) => setAddressNotify(text)}
                                                                />
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Tel. Number</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>

                                                            {isCheckedNotify ? (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={isChecked ? telNumberDB : telNumber}
                                                                    onChangeText={(text) => { setTelNumber(text); setTelNumberDB(text); }}
                                                                />
                                                            ) : (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={telNumberNotify}
                                                                    onChangeText={(text) => setTelNumberNotify(text)}
                                                                />
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>


                                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Email</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                            <TextInput
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                value={inputEmailNotify}
                                                                onChangeText={(text) => setInputEmailNotify(text)}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>

                                            </View>
                                        </View>

                                    )}

                                    {currentStep === 2 && (
                                        <View style={{ zIndex: -2 }}>
                                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                                                <View style={{
                                                    borderRadius: 90, marginTop: -20
                                                }}>
                                                    <Entypo name="check" size={100} color={'#fff'} style={{ position: 'absolute', top: 20, left: 25, zIndex: 2 }} />
                                                    <View style={{ width: 150, height: 150, borderRadius: 150, backgroundColor: '#00cc00' }} />
                                                </View>
                                                <View style={{ marginTop: 5 }}>
                                                    <Text style={{ fontSize: 18, fontWeight: '800' }}>Edit Confirmed</Text>
                                                </View>
                                                <View style={{ marginTop: 5 }}>
                                                    <Text style={{ fontSize: 16 }}>Please wait for the sales person to issue another Invoice.</Text>
                                                </View>
                                                <View style={{ marginTop: 5 }}>
                                                    <Text style={{ fontSize: 16 }}>Thank you for your patience</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                    <TouchableOpacity style={{ backgroundColor: '#7b9cff', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5, height: 35 }} onPress={() => {
                                        if (currentStep === 2) {
                                            openModalRequest();
                                            setOrderInvoice();
                                            setCurrentStep(1);
                                        } else {
                                            addStep();
                                        }
                                    }}>
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>{currentStep === 2 ? 'Close' : 'Confirm Changes'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const ReceiverInformation = () => {
    //THIS COMPONENT IS THE DETAILS FOR THE DHL DELIVERY

    const [modalVisible, setModalVisible] = useState(false);
    const openModalRequest = () => {
        setModalVisible(!modalVisible);
    };
    const { userEmail } = useContext(AuthContext);
    const { chatId } = useParams();
    //COUNTRY AND CITY
    const [countries, setCountries] = useState([]);
    const [showCountries, setShowCountries] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCountryLabel, setSelectedCountryLabel] = useState('Country');
    const [filter, setFilter] = useState('');
    const toggleCountries = () => {
        setShowCountries(!showCountries);
        setFilter('');
        setFilteredCountries(countries);
        setShowCities(false);
    };
    const [showCountriesNotify, setShowCountriesNotify] = useState(false);
    const [selectedCountryNotify, setSelectedCountryNotify] = useState('');
    const [selectedCountryNotifyLabel, setSelectedCountryNotifyLabel] = useState('Country');
    const [filterNotify, setFilterNotify] = useState('');
    const [filteredCountriesNotify, setFilteredCountriesNotify] = useState(countries);
    const handleClearNotify = () => {
        setSelectedCountryNotifyLabel('Country');
        setSelectedCityNotify('City');
        setSelectedCountryNotify('');
    };
    const toggleCountriesNotify = () => {
        setShowCountriesNotify(!showCountriesNotify);
        setFilterNotify('');
        setFilteredCountriesNotify(countries);
        setShowCitiesNotify(false);
    }

    useEffect(() => {
        try {
            const countriesData = Country.getAllCountries().map((country) => ({
                value: country.isoCode,
                label: country.name
            }));
            setFilteredCountries(countriesData);
            setCountries(countriesData);
            setFilteredCountriesNotify(countriesData);
        } catch (error) {
            console.error('Error Fetching countries:', error)
        }
    }, []);
    const [filteredCountries, setFilteredCountries] = useState(countries);
    const handleFilterChange = (text) => {
        setFilter(text);
        setFilterCities(text);
        setFilterNotify(text);
        const filteredData = countries.filter(item =>
            item.label.toLowerCase().includes(text.toLowerCase()));
        const filteredDataCities = cities.filter(item => item.label.toLowerCase().includes(text.toLowerCase()));
        setFilteredCountries(filteredData);
        setFilteredCities(filteredDataCities);
        setFilteredCountriesNotify(filteredData);
        setFilteredCitiesNotify(filteredDataCities);
    };
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState(cities);
    const [showCities, setShowCities] = useState(false);
    const [selectedCity, setSelectedCity] = useState('City');
    const [filterCities, setFilterCities] = useState('');
    const toggleCities = () => {
        setShowCities(!showCities);
        setFilterCities('');
        setFilteredCities(cities);
        setShowCountries(false);
    };
    useEffect(() => {
        if (selectedCountry) {
            const countryCities = City.getCitiesOfCountry(selectedCountry);
            const citiesData = countryCities.map((city) => ({
                label: city.name
            }));
            console.log('All cities inside', citiesData);
            setCities(citiesData);

            if (citiesData.length <= 0) {
                setSelectedCity(selectedCountryLabel);
            }
        }
        if (selectedCountryNotify) {
            const countryCities = City.getCitiesOfCountry(selectedCountryNotify);
            const citiesData = countryCities.map((city) => ({
                label: city.name
            }));
            console.log('All cities inside', citiesData);
            setCities(citiesData);

            if (citiesData.length <= 0) {
                setSelectedCityNotify(selectedCountryNotifyLabel);
            }
        }
    }, [selectedCountry, selectedCountryNotify]);
    const [showCitiesNotify, setShowCitiesNotify] = useState(false);
    const [selectedCityNotify, setSelectedCityNotify] = useState('City');
    const [filterCitiesNotify, setFilterCitiesNotify] = useState('');
    const [filteredCitiesNotify, setFilteredCitiesNotify] = useState(cities);
    const toggleCitiesNotify = () => {
        setShowCitiesNotify(!showCitiesNotify)
        setFilterCitiesNotify('');
        setFilteredCitiesNotify(cities);
        setShowCountriesNotify(false);
    };
    const handleClear = () => {
        setSelectedCountryLabel('Country');
        setSelectedCountry('');
        setSelectedCity('');
    };
    //COUNTRY AND CITY

    //is CHECKEDNOTIFY
    const [isChecked, setChecked] = useState(false);
    const [isCheckedNotify, setCheckedNotify] = useState(false);

    //if false
    const [fullNameNotifyInput, setFullNameNotifyInput] = useState('');
    const [addressNotify, setAddressNotify] = useState('');
    const [telNumberNotify, setTelNumberNotify] = useState('');
    const [emailNotify, setEmailNotify] = useState('');

    //fetching data from STOCKID

    //if true
    const [fullNameDB, setFullNameDB] = useState('');
    const [countryDB, setCountryDB] = useState('Country');
    const [cityDB, setCityDB] = useState('City');
    const [telNumberDB, setTelNumberDB] = useState('');
    const [addressDB, setAddressDB] = useState('');
    //if false
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [telNumber, setTelNumber] = useState('');


    useEffect(() => {
        const fetchUserData = async () => {
            const userDocRef = doc(projectExtensionFirestore, 'accounts', userEmail);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFullNameDB(userData.textFirst + ' ' + userData.textLast);
                    setTelNumberDB('+' + userData.textPhoneNumber);
                    setAddressDB(userData.textZip + ' ' + userData.textStreet + ',' + ' ' + userData.city);
                    setCountryDB(userData.country);
                    setCityDB(userData.city);
                } else {
                    console.log('No user with that Email')
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        };
        if (userEmail) {
            fetchUserData();
        }
    }, [userEmail])
    //fetching the user's information

    //fetching data from STOCKID carId = STOCKID
    const [carId, setCarId] = useState(null);
    useEffect(() => {
        const fetchCarId = async () => {
            try {
                const vehicleIdDocRef = doc(projectExtensionFirestore, 'chats', chatId);
                const docSnapshot = await getDoc(vehicleIdDocRef);

                if (docSnapshot.exists()) {
                    const carIdValue = docSnapshot.data().vehicle.carId;
                    setCarId(carIdValue);
                } else {
                    console.log('Document does not exist');
                }
            } catch (error) {
                console.error('Error getting document:', error);
            }
        }

        fetchCarId(); // Don't forget to call the function!
    }, [projectExtensionFirestore, chatId]);
    //fetching data from STOCKID carId = STOCKID
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        step: {
            height: 10,
            width: '30%',
            backgroundColor: '#ccc',
        },
        completed: {
            backgroundColor: 'green',
        },
        circle: {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: '#ff4d4d',
            justifyContent: 'center',
            alignItems: 'center',
        },
        innerCircle: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
        },
        innerCircleCompleted: {
            backgroundColor: 'green',
        },
        line: {
            height: 10,
            width: '30%',
            backgroundColor: '#ccc',
            flexShrink: 1,
        },
    });

    const [inputEmail, setInputEmail] = useState('');
    const [inputEmailNotify, setInputEmailNotify] = useState('');

    const setDeliveryInfo = async () => {

        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')} at ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;

        const customerInfo = {
            fullName: isChecked ? fullNameDB : fullName,
            country: isChecked ? countryDB : selectedCountryLabel,
            city: isChecked ? cityDB : selectedCity,
            address: isChecked ? addressDB : address,
            telNumber: isChecked ? telNumberDB : telNumber,
            email: inputEmail,
        };

        try {
            const orderRef = doc(projectExtensionFirestore, 'chats', chatId);
            const timestamp = new Date(); // Get the current date and time

            const year = timestamp.getFullYear();
            const month = timestamp.toLocaleString('default', { month: 'short' }); // Get the month abbreviation (e.g., Oct)
            const day = timestamp.getDate().toString().padStart(2, '0');

            const hours = timestamp.getHours().toString().padStart(2, '0');
            const minutes = timestamp.getMinutes().toString().padStart(2, '0');
            const seconds = timestamp.getSeconds().toString().padStart(2, '0');

            const formattedTimestampString = `${month} ${day}, ${year} at ${hours}:${minutes}:${seconds}`;
            // Create a new message document in the chat conversation with the formatted timestamp as the document ID
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'), formattedTimestampString);
            const messageData = {
                sender: userEmail, // Sender's email
                text: `DELIVERY ADDRESS INFORMATION
Customer Information
            Full Name: ${isChecked ? fullNameDB : fullName}
            Country: ${isChecked ? countryDB : selectedCountryLabel}
            City: ${isChecked ? cityDB : selectedCity}
            Address: ${isChecked ? addressDB : address}
            Tel. Number: ${isChecked ? telNumberDB : telNumber}
            Email: ${inputEmail}
                `,
                timestamp: serverTimestamp(),
                customerInfo,
            };
            await updateDoc(orderRef, {
                deliveryAddressInformation: {
                    customerInfo,
                    dateIssued: formattedDate, // Add formatted date
                },
            });
            await setDoc(newMessageDocExtension, messageData);
        } catch (error) {
            console.error('Error updating Proforma Invoice:', error);
        }
    };


    return (
        <View>
            <TouchableOpacity onPress={() => openModalRequest()}>
                <Text>ENTER INFORMATION</Text>
            </TouchableOpacity>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={openModalRequest}
            >
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                    <View style={{ backgroundColor: 'white', width: 400, height: 450, padding: 10, borderRadius: 10 }}>
                        <ScrollView>
                            <View style={{ flex: 1, marginTop: 5 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#4169E1' }}>
                                        Delivery Address & Customer Information
                                    </Text>
                                    <TouchableOpacity onPress={() => {
                                        setChecked(prev => {
                                            if (prev && isChecked) {
                                                setFullNameDB(fullNameDB);
                                                setCityDB(cityDB);
                                                setCountryDB(countryDB);
                                                setAddressDB(addressDB);
                                                setTelNumberDB(telNumberDB);
                                            } else {
                                                setFullName(' ');
                                                setSelectedCountryLabel('Country')
                                                setSelectedCity('City')
                                                setAddress(' ')
                                                setTelNumber(' ')
                                            }
                                            return !prev;
                                        });
                                    }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                        <MaterialIcons
                                            name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                                            size={20}
                                            color="black"
                                        />
                                        <Text>Set as customer's information <Text style={{ color: 'red' }}>*</Text></Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text>Full Name</Text>
                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                            {isChecked ? (
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={fullNameDB}
                                                    onChangeText={(text) => setFullNameDB(text)}
                                                />
                                            ) : (
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={fullName}
                                                    onChangeText={(text) => setFullName(text)}
                                                />
                                            )}

                                        </View>
                                    </View>

                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                        <View style={{ flex: 1, zIndex: 2 }}>
                                            <TouchableOpacity onPress={toggleCountries} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                    <View style={{ alignSelf: 'center' }}>
                                                        {isChecked ? (
                                                            <Text style={{ textAlignVertical: 'center' }}>{countryDB}</Text>
                                                        ) : (
                                                            <Text style={{ textAlignVertical: 'center' }}>{selectedCountry ? selectedCountryLabel : 'Country'}</Text>
                                                        )}
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                        <TouchableOpacity onPress={handleClear} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                            <AntDesign name="close" size={15} />
                                                        </TouchableOpacity>
                                                        <AntDesign
                                                            name="down"
                                                            size={15}
                                                            style={[
                                                                { transitionDuration: '0.3s' },
                                                                showCountries && {
                                                                    transform: [{ rotate: '180deg' }],
                                                                },
                                                            ]}
                                                        />
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                            {showCountries && (
                                                <View style={{
                                                    marginTop: 5,
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    elevation: 5,
                                                    width: '100%',
                                                    maxHeight: 200,
                                                    backgroundColor: "white",
                                                    borderWidth: 1,
                                                    borderColor: '#ccc',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: 0.25,
                                                    shadowRadius: 4,
                                                    zIndex: 3
                                                }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        backgroundColor: '#fff',
                                                        borderWidth: 0.5,
                                                        borderColor: '#000',
                                                        height: 40,
                                                        borderRadius: 5,
                                                        margin: 10,
                                                        zIndex: 3
                                                    }}>
                                                        <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                        <TextInput
                                                            placeholder='Search Country'
                                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                            textAlignVertical='center'
                                                            placeholderTextColor={'gray'}
                                                            value={filter}
                                                            onChangeText={handleFilterChange}
                                                        />
                                                    </View>
                                                    <ScrollView>
                                                        <FlatList
                                                            data={filteredCountries}
                                                            keyExtractor={(item) => item.value} // Use item.label as the key
                                                            renderItem={({ item }) => (
                                                                <TouchableOpacity onPress={() => {
                                                                    setSelectedCountryLabel(item.label);
                                                                    setSelectedCountry(item.value);
                                                                    setShowCountries(false);
                                                                    setFilteredCountries(countries);
                                                                    setSelectedCity('City')
                                                                }}>
                                                                    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                        <Text>{item.label}</Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            )}
                                                        />

                                                    </ScrollView>
                                                </View>
                                            )}

                                        </View>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 5 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                        <View style={{ flex: 1, zIndex: 2, }}>
                                            <TouchableOpacity onPress={selectedCountry ? toggleCities : null} disabled={!selectedCountry || selectedCountryLabel === 'Country'} style={{ borderWidth: 1, borderRadius: 5 }}>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                    {isChecked ? (
                                                        <Text style={{ textAlignVertical: 'center' }}>{cityDB}</Text>
                                                    ) : (
                                                        <Text style={{ textAlignVertical: 'center' }}>{selectedCity ? selectedCity : 'City'}</Text>
                                                    )}
                                                    <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                        <AntDesign
                                                            name="down"
                                                            size={15}
                                                            style={[
                                                                { transitionDuration: '0.3s' },
                                                                showCities && {
                                                                    transform: [{ rotate: '180deg' }],
                                                                },
                                                            ]}
                                                        />
                                                    </View>
                                                </View>

                                            </TouchableOpacity>
                                            {showCities && (
                                                <View
                                                    style={{
                                                        marginTop: 5,
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        elevation: 5,
                                                        width: '100%',
                                                        maxHeight: 200,
                                                        backgroundColor: 'white',
                                                        borderWidth: 1,
                                                        borderColor: '#ccc',
                                                        elevation: 5,
                                                        zIndex: 2
                                                    }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        backgroundColor: '#fff',
                                                        borderWidth: 0.5,
                                                        borderColor: '#000',
                                                        height: 40,
                                                        borderRadius: 5,
                                                        margin: 10,
                                                        zIndex: 3
                                                    }}>
                                                        <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                        <TextInput
                                                            placeholder='Search Cities'
                                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                            textAlignVertical='center'
                                                            placeholderTextColor={'gray'}
                                                            value={filterCities}
                                                            onChangeText={handleFilterChange}
                                                        />
                                                    </View>
                                                    <ScrollView>
                                                        <FlatList
                                                            data={filteredCities}
                                                            keyExtractor={(item, index) => index.toString()}
                                                            renderItem={({ item }) => (
                                                                <TouchableOpacity onPress={() => {
                                                                    setSelectedCity(item.label)
                                                                    setShowCities(false);
                                                                    setFilteredCities(cities);
                                                                }}>
                                                                    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                        <Text>{item.label}</Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            )}
                                                        />
                                                    </ScrollView>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text>Address</Text>
                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                            {isChecked ? (
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={addressDB}
                                                    onChangeText={(text) => setAddressDB(text)}
                                                />
                                            ) : (
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={address}
                                                    onChangeText={(text) => setAddress(text)}
                                                />
                                            )}

                                        </View>
                                    </View>
                                </View>
                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text>Tel. Number</Text>
                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                            {isChecked ? (
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={telNumberDB}
                                                    onChangeText={(telNumberDB) => setTelNumberDB(telNumberDB)}
                                                />
                                            ) : (
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={telNumber}
                                                    onChangeText={(text) => setTelNumber(text)}
                                                />
                                            )}
                                        </View>
                                    </View>
                                </View>

                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text>Email</Text>
                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                            <TextInput
                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                value={inputEmail}
                                                onChangeText={(text) => setInputEmail(text)}
                                            />
                                        </View>
                                    </View>
                                </View>

                            </View>

                            <TouchableOpacity style={{ backgroundColor: '#7b9cff', borderRadius: 5, marginTop: 20 }} onPress={() => { openModalRequest(); setDeliveryInfo(); }}>
                                <View style={{ padding: 10, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontWeight: '600' }}>Submit Details</Text>
                                </View>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

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
                    alignSelf: 'center',
                    borderRadius: 10,
                    height: 50,
                    padding: 5,
                    opacity: pressed ? 0.5 : 1,
                    justifyContent: 'center'
                })}
            >
                <MaterialCommunityIcons name="account" size={30} />

            </Pressable>
            {showProfileOptions && (
                <View style={{ justifyContent: 'center', width: '100%', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigate('/Profile')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Ionicons name="person-outline" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigate('/ProfilePassword')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <MaterialCommunityIcons name="onepassword" size={20} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};
const OrderItem = ({ toggleModal }) => {
    const { userEmail } = useContext(AuthContext);
    const { chatId } = useParams();

    //update steps but (ONLY ORDER ITEM)
    const [currentStepDB, setCurrentStepDB] = useState({ value: 2 });
    const statusToValue = {
        'Negotiation': 1,
        'Issue Proforma Invoice': 2,
        'Order Item': 3,
        'Payment Confirmation': 4,
        'Shipping Schedule': 5,
        'Copy of B/L': 6,
        'Documentation': 7,
        'Item Received': 8,
        'Completed': 9
    };
    const valueToStatus = {
        1: 'Negotiation',
        2: 'Issue Proforma Invoice',
        3: 'Order Item',
        4: 'Payment Confirmation',
        5: 'Shipping Schedule',
        6: 'Copy of B/L',
        7: 'Documentation',
        8: 'Item Received',
        9: 'Completed'
    };
    const getNextStatus = (currentStatus) => {
        const statusValues = Object.keys(statusToValue).map(key => statusToValue[key]);
        const currentIndex = statusValues.indexOf(statusToValue[currentStatus]);

        if (currentIndex !== -1 && currentIndex < statusValues.length - 1) {
            const nextValue = statusValues[currentIndex + 1];
            return valueToStatus[nextValue];
        }

        return null; // No next status found
    };
    const updateSteps = async () => {
        try {
            const chatDocRefExtension = doc(projectExtensionFirestore, 'chats', chatId);

            // Get the current status string
            const currentStatus = valueToStatus[currentStepDB.value];

            // Get the next status string
            const nextStatus = getNextStatus(currentStatus);

            if (nextStatus) {
                // Update the document with the next status
                await updateDoc(chatDocRefExtension, {
                    stepIndicator: {
                        value: statusToValue[nextStatus],
                        status: nextStatus
                    }
                });
                setCurrentStepDB({ value: statusToValue[nextStatus] });
                console.log('Steps updated successfully!');
            } else {
                console.log('No next status found.');
            }
        } catch (error) {
            console.error('Error updating steps:', error);
        }
    };
    //update steps but (ONLY ORDER ITEM)


    //COUNTRY AND CITY
    const [countries, setCountries] = useState([]);
    const [showCountries, setShowCountries] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCountryLabel, setSelectedCountryLabel] = useState('');
    const [filter, setFilter] = useState('');
    const toggleCountries = () => {
        setShowCountries(!showCountries);
        setFilter('');
        setFilteredCountries(countries);
        setShowCities(false);
    };
    const [showCountriesNotify, setShowCountriesNotify] = useState(false);
    const [selectedCountryNotify, setSelectedCountryNotify] = useState('');
    const [selectedCountryNotifyLabel, setSelectedCountryNotifyLabel] = useState('');
    const [filterNotify, setFilterNotify] = useState('');
    const [filteredCountriesNotify, setFilteredCountriesNotify] = useState(countries);
    const handleClearNotify = () => {
        setSelectedCountryNotifyLabel('Country');
        setSelectedCityNotify('City');
        setSelectedCountryNotify('');
    };
    const toggleCountriesNotify = () => {
        setShowCountriesNotify(!showCountriesNotify);
        setFilterNotify('');
        setFilteredCountriesNotify(countries);
        setShowCitiesNotify(false);
    }

    useEffect(() => {
        try {
            const countriesData = Country.getAllCountries().map((country) => ({
                value: country.isoCode,
                label: country.name
            }));
            setFilteredCountries(countriesData);
            setCountries(countriesData);
            setFilteredCountriesNotify(countriesData);
        } catch (error) {
            console.error('Error Fetching countries:', error)
        }
    }, []);
    const [filteredCountries, setFilteredCountries] = useState(countries);
    const handleFilterChange = (text) => {
        setFilter(text);
        setFilterCities(text);
        setFilterNotify(text);
        const filteredData = countries.filter(item =>
            item.label.toLowerCase().includes(text.toLowerCase()));
        const filteredDataCities = cities.filter(item => item.label.toLowerCase().includes(text.toLowerCase()));
        setFilteredCountries(filteredData);
        setFilteredCities(filteredDataCities);
        setFilteredCountriesNotify(filteredData);
        setFilteredCitiesNotify(filteredDataCities);
    };
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState(cities);
    const [showCities, setShowCities] = useState(false);
    const [selectedCity, setSelectedCity] = useState('');
    const [filterCities, setFilterCities] = useState('');
    const toggleCities = () => {
        setShowCities(!showCities);
        setFilterCities('');
        setFilteredCities(cities);
        setShowCountries(false);
    };
    useEffect(() => {
        if (selectedCountry) {
            const countryCities = City.getCitiesOfCountry(selectedCountry);
            const citiesData = countryCities.map((city) => ({
                label: city.name
            }));
            console.log('All cities inside', citiesData);
            setCities(citiesData);

            if (citiesData.length <= 0) {
                setSelectedCity(selectedCountryLabel);
            }
        }
        if (selectedCountryNotify) {
            const countryCities = City.getCitiesOfCountry(selectedCountryNotify);
            const citiesData = countryCities.map((city) => ({
                label: city.name
            }));
            console.log('All cities inside', citiesData);
            setCities(citiesData);

            if (citiesData.length <= 0) {
                setSelectedCityNotify(selectedCountryNotifyLabel);
            }
        }
    }, [selectedCountry, selectedCountryNotify]);
    const [showCitiesNotify, setShowCitiesNotify] = useState(false);
    const [selectedCityNotify, setSelectedCityNotify] = useState('');
    const [filterCitiesNotify, setFilterCitiesNotify] = useState('');
    const [filteredCitiesNotify, setFilteredCitiesNotify] = useState(cities);
    const toggleCitiesNotify = () => {
        setShowCitiesNotify(!showCitiesNotify)
        setFilterCitiesNotify('');
        setFilteredCitiesNotify(cities);
        setShowCountriesNotify(false);
    };
    const handleClear = () => {
        setSelectedCountryLabel('Country');
        setSelectedCountry('');
        setSelectedCity('');
    };
    //COUNTRY AND CITY

    //is CHECKEDNOTIFY
    const [isChecked, setChecked] = useState(true);
    const [isCheckedNotify, setCheckedNotify] = useState(true);

    //if false
    const [fullNameNotifyInput, setFullNameNotifyInput] = useState('');
    const [addressNotify, setAddressNotify] = useState('');
    const [telNumberNotify, setTelNumberNotify] = useState('');
    const [emailNotify, setEmailNotify] = useState('');

    //fetching data from STOCKID

    //if true
    const [fullNameDB, setFullNameDB] = useState('');
    const [countryDB, setCountryDB] = useState('');
    const [cityDB, setCityDB] = useState('');
    const [telNumberDB, setTelNumberDB] = useState('');
    const [addressDB, setAddressDB] = useState('');
    //if false
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [telNumber, setTelNumber] = useState('');


    useEffect(() => {
        const fetchUserData = async () => {
            const userDocRef = doc(projectExtensionFirestore, 'accounts', userEmail);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFullNameDB(userData.textFirst + ' ' + userData.textLast);
                    setTelNumberDB('+' + userData.textPhoneNumber);
                    setAddressDB(userData.textZip + ' ' + userData.textStreet + ',' + ' ' + userData.city);
                    setCountryDB(userData.country);
                    setCityDB(userData.city);
                } else {
                    console.log('No user with that Email')
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        };
        if (userEmail) {
            fetchUserData();
        }
    }, [userEmail])
    //fetching the user's information

    //fetching data from STOCKID carId = STOCKID
    const [carId, setCarId] = useState(null);
    useEffect(() => {
        const fetchCarId = async () => {
            try {
                const vehicleIdDocRef = doc(projectExtensionFirestore, 'chats', chatId);
                const docSnapshot = await getDoc(vehicleIdDocRef);

                if (docSnapshot.exists()) {
                    const carIdValue = docSnapshot.data().vehicle.carId;
                    setCarId(carIdValue);
                } else {
                    console.log('Document does not exist');
                }
            } catch (error) {
                console.error('Error getting document:', error);
            }
        }

        fetchCarId(); // Don't forget to call the function!
    }, [projectExtensionFirestore, chatId]);
    //fetching data from STOCKID carId = STOCKID


    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        step: {
            height: 10,
            width: '30%',
            backgroundColor: '#ccc',
        },
        completed: {
            backgroundColor: 'green',
        },
        circle: {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: '#ff4d4d',
            justifyContent: 'center',
            alignItems: 'center',
        },
        innerCircle: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
        },
        innerCircleCompleted: {
            backgroundColor: 'green',
        },
        line: {
            height: 10,
            width: '30%',
            backgroundColor: '#ccc',
            flexShrink: 1,
        },
    });
    //STEP TRACKER
    const [currentStep, setCurrentStep] = useState(1);
    const addStep = () => {
        setCurrentStep(currentStep + 1);
    };
    const setOrderInvoice = async () => {

        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')} at ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;

        const customerInfo = {
            fullName: fullName || fullNameDB,
            country: selectedCountryLabel || countryDB,
            city: selectedCity || cityDB,
            address: address || addressDB,
            telNumber: telNumber || telNumberDB,
            email: userEmail,
        };

        const infoCustomerInput = {
            fullName: fullNameNotifyInput,
            country: selectedCountryNotifyLabel,
            city: selectedCityNotify,
            address: addressNotify,
            telNumber: telNumberNotify,
            email: emailNotify,
        };

        try {
            const orderRef = doc(projectExtensionFirestore, 'chats', chatId);
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
            const messageData = {
                sender: 'marc@realmotor.jp', // Sender's email
                text: "Order Invoice",
                timestamp: serverTimestamp(),
                orderInvoiceIssue: true
            };
            await updateDoc(orderRef, {
                orderInvoice: {
                    proformaIssue: true,
                    customerInfo,
                    notifyParty: isCheckedNotify ? customerInfo : infoCustomerInput,
                    dateIssued: formattedDate, // Add formatted date
                },
            });
            await setDoc(newMessageDocExtension, messageData);
        } catch (error) {
            console.error('Error updating Proforma Invoice:', error);
        }
    };
    //STEP TRACKER


    //CALENDAR
    const [selectedDate, setSelectedDate] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef();
    const handleDateSelect = (date) => {
        setSelectedDate(date.dateString);
    };
    const toggleCalendar = () => {
        setShowCalendar(!showCalendar)
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [])
    //CALENDAR

    return (
        <View>
            <View style={{ justifyContent: 'center' }}>
                <View style={{ backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', padding: 10, borderRadius: 5 }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Order Form</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text>If you agree all condition, please enter the necessary information to place your order. *Bank Information will be shown to Invoice after you complete the order.</Text>
                </View>
                {/* <View style={{ marginTop: 5, width: '90%', alignSelf: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ justifyContent: `flex-start`, alignItems: 'center', zIndex: 3 }}>
                            <TouchableOpacity style={[styles.circle]} disabled={currentStep < 1}> <View style={{ position: 'absolute', top: 30, alignSelf: 'center', width: 150, left: -50 }}><Text>Fill in your information</Text></View></TouchableOpacity>

                        </View>
                        <View style={{ marginTop: -2, width: '100%', height: 7, backgroundColor: '#ccc', position: 'absolute', top: '50%' }} />
                        <View style={{
                            zIndex: 2,
                            marginTop: -2, height: 7, backgroundColor:
                                currentStep === 1 ? '#ccc' : currentStep === 2 ? '#ff4d4d' : '#ff4d4d',
                            position: 'absolute', top: '50%',
                            width: currentStep === 1 ? 0 : currentStep === 2 ? '50%' : '100%'
                        }} />
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity style={[styles.circle, { backgroundColor: currentStep < 2 ? '#ccc' : '#ff4d4d' }]} disabled={currentStep < 2}> <View style={{ position: 'absolute', top: 30, alignSelf: 'center', width: 50 }}><Text>Confirm</Text></View></TouchableOpacity>

                        </View>
                        <View style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                            <TouchableOpacity style={[styles.circle, { backgroundColor: currentStep < 3 ? '#ccc' : '#ff4d4d' }]} disabled={currentStep < 3}> <View style={{ position: 'absolute', top: 30, alignSelf: 'center', width: 60 }}><Text>Complete</Text></View></TouchableOpacity>

                        </View>
                    </View>

                </View> */}
                {currentStep === 1 && (
                    <View style={{ marginTop: 20 }}>
                        <View style={{}}>
                            <Text style={{ fontWeight: '700', color: 'red' }}>*Require Fields</Text>
                        </View>
                        <View>

                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>Wire Transfer Amount</Text>
                                <View style={{ flex: 1, zIndex: 2 }}>
                                    <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                        <TextInput
                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>Payment Due Date</Text>
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        height: 'auto',
                                        fontSize: 22,
                                        borderRadius: 7,
                                        borderWidth: 1,
                                        width: 250,
                                        padding: 10,
                                    }}
                                    onPress={toggleCalendar}
                                >
                                    <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                                        <Text
                                            style={{
                                                fontSize: 16,
                                            }}
                                        >
                                            {selectedDate || 'yyyy-mm-dd'}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <AntDesign
                                            name="down"
                                            size={15}
                                            style={[
                                                { transitionDuration: '0.3s' },
                                                showCalendar && {
                                                    transform: [{ rotate: '180deg' }],
                                                },
                                            ]}

                                        />
                                    </View>
                                </TouchableOpacity>
                                {showCalendar &&
                                    <View
                                        ref={calendarRef}
                                        style={{
                                            position: 'absolute',
                                            top: '101%',
                                            elevation: 5,
                                            backgroundColor: "white",
                                            borderWidth: 1,
                                            borderColor: '#ccc',
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.25,
                                            shadowRadius: 4,
                                            elevation: 5,
                                            zIndex: 5,
                                            width: 250,
                                            marginTop: 5
                                        }}
                                    >
                                        <Calendar
                                            onDayPress={handleDateSelect}
                                            markedDates={{
                                                [selectedDate]: { selected: true, marked: true, selectedColor: '#7b9cff' }
                                            }}
                                            renderArrow={(direction) => (
                                                <Text>{direction === 'left' ? <AntDesign name="left" size={11} style={{
                                                    color: '#7b9cff',
                                                    fontWeight: '700',
                                                }} /> : <AntDesign name="right" size={11} style={{
                                                    color: '#7b9cff',
                                                    fontWeight: '700',
                                                }} />}</Text>
                                            )}
                                            minDate={new Date().toISOString().split('T')[0]}
                                            theme={{
                                                'stylesheet.calendar.header': {
                                                    monthText: {
                                                        color: '#7b9cff',
                                                        fontWeight: '700',
                                                    },
                                                    yearText: {
                                                        color: '#7b9cff',
                                                        fontWeight: '700',
                                                    },
                                                },
                                            }}
                                        />
                                    </View>
                                }
                            </View>

                            <View style={{ flex: 1, marginTop: 5, zIndex: -1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>Port of Discharge</Text>
                                <View style={{ flex: 1, zIndex: 2 }}>
                                    <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35, justifyContent: 'center' }}>
                                        <Text>Yokohama / Japan</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ flex: 1, zIndex: -1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>Remitter's Name</Text>
                                <View style={{ borderWidth: 0.5, backgroundColor: '#f5f7f9', borderRadius: 5, padding: 5, height: 35, justifyContent: 'center' }}>
                                    <TextInput
                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                    />
                                </View>
                            </View>

                            <View style={{ backgroundColor: 'red', justifyContent: 'flex-start', alignItems: 'flex-start', padding: 10, borderRadius: 5, marginTop: 5, zIndex: -1 }}>
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Please Fill in you Details</Text>
                            </View>

                            <View style={{ flexDirection: 'row', zIndex: -2 }}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>
                                            Customer Information
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            setChecked(!isChecked); setAddress(''); setFullName(''); setSelectedCountry(''); setSelectedCountryLabel('Country')
                                            setSelectedCity('City');
                                        }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                            <MaterialIcons
                                                name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                                                size={20}
                                                color="black"
                                            />
                                            <Text>Set as customer's information <Text style={{ color: 'red' }}>*</Text></Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Full Name</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                {isChecked ? (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={fullNameDB}
                                                        onChangeText={(text) => setFullNameDB(text)}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={fullName}
                                                        onChangeText={(text) => setFullName(text)}
                                                    />
                                                )}

                                            </View>
                                        </View>

                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                            <View style={{ flex: 1, zIndex: 2 }}>
                                                <TouchableOpacity onPress={toggleCountries} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                        <View style={{ alignSelf: 'center' }}>
                                                            {isChecked ? (
                                                                <Text style={{ textAlignVertical: 'center' }}>{countryDB}</Text>
                                                            ) : (
                                                                <Text style={{ textAlignVertical: 'center' }}>{selectedCountry ? selectedCountryLabel : 'Country'}</Text>
                                                            )}
                                                        </View>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                            <TouchableOpacity onPress={handleClear} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                <AntDesign name="close" size={15} />
                                                            </TouchableOpacity>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCountries && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                {showCountries && (
                                                    <View style={{
                                                        marginTop: 5,
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        elevation: 5,
                                                        width: '100%',
                                                        maxHeight: 200,
                                                        backgroundColor: "white",
                                                        borderWidth: 1,
                                                        borderColor: '#ccc',
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.25,
                                                        shadowRadius: 4,
                                                        zIndex: 3
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Country'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filter}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>
                                                            <FlatList
                                                                data={filteredCountries}
                                                                keyExtractor={(item) => item.value} // Use item.label as the key
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {
                                                                        setSelectedCountryLabel(item.label);
                                                                        setSelectedCountry(item.value);
                                                                        setShowCountries(false);
                                                                        setFilteredCountries(countries);
                                                                        setSelectedCity('City')
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />

                                                        </ScrollView>
                                                    </View>
                                                )}

                                            </View>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 5 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                            <View style={{ flex: 1, zIndex: 2, }}>
                                                <TouchableOpacity onPress={selectedCountry ? toggleCities : null} disabled={!selectedCountry || selectedCountryLabel === 'Country'} style={{ borderWidth: 1, borderRadius: 5 }}>

                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                        {isChecked ? (
                                                            <Text style={{ textAlignVertical: 'center' }}>{cityDB}</Text>
                                                        ) : (
                                                            <Text style={{ textAlignVertical: 'center' }}>{selectedCity ? selectedCity : 'City'}</Text>
                                                        )}
                                                        <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCities && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>

                                                </TouchableOpacity>
                                                {showCities && (
                                                    <View
                                                        style={{
                                                            marginTop: 5,
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            elevation: 5,
                                                            width: '100%',
                                                            maxHeight: 200,
                                                            backgroundColor: 'white',
                                                            borderWidth: 1,
                                                            borderColor: '#ccc',
                                                            elevation: 5,
                                                            zIndex: 2
                                                        }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Cities'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filterCities}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>
                                                            <FlatList
                                                                data={filteredCities}
                                                                keyExtractor={(item, index) => index.toString()}
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {
                                                                        setSelectedCity(item.label)
                                                                        setShowCities(false);
                                                                        setFilteredCities(cities);
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />
                                                        </ScrollView>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Address</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                {isChecked ? (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={addressDB}
                                                        onChangeText={(text) => setAddressDB(text)}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={address}
                                                        onChangeText={(text) => setAddress(text)}
                                                    />
                                                )}

                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Tel. Number</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                {isChecked ? (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={telNumberDB}
                                                        onChangeText={(telNumberDB) => setTelNumberDB(telNumberDB)}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={telNumber}
                                                        onChangeText={(text) => setTelNumber(text)}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>E-mail</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={userEmail}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ flex: 1, marginLeft: 5 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>
                                            Notify Party
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            setCheckedNotify(!isCheckedNotify);
                                            setSelectedCountryNotifyLabel('');
                                            setSelectedCityNotify('');
                                            setFullNameNotifyInput('');
                                            setAddressNotify('');
                                            setTelNumberNotify('');
                                            setEmailNotify('');
                                        }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                            <MaterialIcons
                                                name={isCheckedNotify ? 'check-box' : 'check-box-outline-blank'}
                                                size={20}
                                                color="black"
                                            />
                                            <Text>Same as customer <Text style={{ color: 'red' }}>*</Text></Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Full Name</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                {isCheckedNotify ? (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={!isChecked ? fullName : fullNameDB}
                                                        onChangeText={(text) => {
                                                            setFullNameDB(text);
                                                            setFullName(text);
                                                        }}

                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={fullNameNotifyInput}
                                                        onChangeText={(text) => setFullNameNotifyInput(text)}

                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                            <View style={{ flex: 1, zIndex: 2 }}>
                                                <TouchableOpacity onPress={toggleCountriesNotify} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                        <View style={{ alignSelf: 'center' }}>
                                                            {isCheckedNotify ? (
                                                                <Text style={{ textAlignVertical: 'center' }}>
                                                                    {!isChecked ? selectedCountryLabel : countryDB || selectedCountryLabel}
                                                                </Text>
                                                            ) : (
                                                                <Text style={{ textAlignVertical: 'center' }}>
                                                                    {!isCheckedNotify ? !selectedCountryNotifyLabel ? 'Country' : selectedCountryNotifyLabel : selectedCountryNotifyLabel}
                                                                </Text>
                                                            )}
                                                        </View>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                            <TouchableOpacity onPress={handleClearNotify} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                <AntDesign name="close" size={15} />
                                                            </TouchableOpacity>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCountriesNotify && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                {showCountriesNotify && (
                                                    <View style={{
                                                        marginTop: 5,
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        elevation: 5,
                                                        width: '100%',
                                                        maxHeight: 200,
                                                        backgroundColor: "white",
                                                        borderWidth: 1,
                                                        borderColor: '#ccc',
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.25,
                                                        shadowRadius: 4,
                                                        elevation: 5,
                                                        zIndex: 3
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Country'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filterNotify}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>

                                                            <FlatList
                                                                data={filteredCountriesNotify}
                                                                keyExtractor={(item) => item.label} // Use item.label as the key
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {
                                                                        setSelectedCountryNotifyLabel(item.label)
                                                                        setSelectedCountryNotify(item.value)
                                                                        setShowCountriesNotify(false);
                                                                        setFilteredCountriesNotify(countries);
                                                                        setSelectedCityNotify('City')
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />
                                                        </ScrollView>
                                                    </View>
                                                )}

                                            </View>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 5 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                            <View style={{ flex: 1, zIndex: 2, }}>
                                                <TouchableOpacity onPress={selectedCountryNotify ? toggleCitiesNotify : null} disabled={!selectedCountryNotify || selectedCountryNotifyLabel === 'Country'} style={{ borderWidth: 1, borderRadius: 5 }}>

                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>

                                                        {isCheckedNotify ? (
                                                            <Text style={{ textAlignVertical: 'center' }}>{
                                                                !isChecked ? selectedCity : cityDB
                                                            }</Text>
                                                        ) : (
                                                            <Text style={{ textAlignVertical: 'center' }}>{!isCheckedNotify ? !selectedCityNotify ? 'City' : selectedCityNotify : selectedCityNotify}</Text>
                                                        )}
                                                        <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCitiesNotify && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>

                                                </TouchableOpacity>
                                                {showCitiesNotify && (
                                                    <View
                                                        style={{
                                                            marginTop: 5,
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            elevation: 5,
                                                            width: '100%',
                                                            maxHeight: 150,
                                                            backgroundColor: 'white',
                                                            borderWidth: 1,
                                                            borderColor: '#ccc',
                                                            elevation: 5,
                                                            zIndex: 2
                                                        }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Cities'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filterCitiesNotify}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>
                                                            <FlatList
                                                                data={filteredCitiesNotify}
                                                                keyExtractor={(item, index) => index.toString()}
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {

                                                                        setSelectedCityNotify(item.label);
                                                                        setShowCitiesNotify(false);
                                                                        setFilteredCitiesNotify(cities);
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />
                                                        </ScrollView>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Address</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                {isCheckedNotify ? (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={!isChecked ? address : addressDB}
                                                        onChangeText={(text) => { setAddress(text); setAddressDB(text); }}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={addressNotify}
                                                        onChangeText={(text) => setAddressNotify(text)}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Tel. Number</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>

                                                {isCheckedNotify ? (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={!isChecked ? telNumber : telNumberDB}
                                                        onChangeText={(text) => { setTelNumber(text); setTelNumberDB(text); }}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={telNumberNotify}
                                                        onChangeText={(text) => setTelNumberNotify(text)}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>E-mail</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                {isCheckedNotify ? (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={userEmail}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={emailNotify}
                                                        onChangeText={(text) => setEmailNotify(text)}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

                        </View>
                        <View style={{ marginTop: 5 }}>
                            <TouchableOpacity style={{ backgroundColor: '#7b9cff', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5 }} onPress={() => addStep()}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {currentStep === 2 && (
                    <View style={{ marginTop: 20 }}>
                        <View style={{}}>
                            <Text style={{ fontWeight: '700', color: 'red' }}>*Require Fields</Text>
                        </View>
                        <View>

                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>Wire Transfer Amount</Text>
                                <View style={{ flex: 1, zIndex: 2 }}>
                                    <View style={{ borderRadius: 5, padding: 5, height: 35 }}>
                                        <Text style={{ color: '#00ff11', fontWeight: '700' }}>AMOUNT</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>Payment Due Date</Text>
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        height: 'auto',
                                        width: 250,
                                        padding: 10,
                                    }}

                                >
                                    <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                color: '#00ff11', fontWeight: '700'
                                            }}
                                        >
                                            yyyy-mm-dd
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                            </View>

                            <View style={{ flex: 1, marginTop: 5, zIndex: -1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>Port of Discharge</Text>
                                <View style={{ flex: 1, zIndex: 2 }}>
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            height: 'auto',
                                            width: 250,
                                            padding: 10,
                                        }}

                                    >
                                        <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    color: '#00ff11', fontWeight: '700'
                                                }}
                                            >
                                                Yokohama / Japan
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{ flex: 1, zIndex: -1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>Remitter's Name</Text>
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        height: 'auto',
                                        width: 250,
                                        padding: 10,
                                    }}

                                >
                                    <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                color: '#00ff11', fontWeight: '700'
                                            }}
                                        >
                                            MARC VAN CABAGUING
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={{ backgroundColor: 'red', justifyContent: 'flex-start', alignItems: 'flex-start', padding: 10, borderRadius: 5, marginTop: 5, zIndex: -1 }}>
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Please Fill in you Details</Text>
                            </View>

                            <View style={{ flexDirection: 'row', zIndex: -2 }}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>
                                            Customer Information
                                        </Text>
                                        <TouchableOpacity disabled onPress={() => {
                                            setChecked(!isChecked); setAddress(''); setFullName(''); setSelectedCountry(''); setSelectedCountryLabel('Country')
                                            setSelectedCity('City');
                                        }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                            <MaterialIcons
                                                name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                                                size={20}
                                                color="black"
                                            />
                                            <Text>Set as customer's information <Text style={{ color: 'red' }}>*</Text></Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Full Name</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                {isChecked ? (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={fullNameDB}
                                                        onChangeText={(text) => setFullNameDB(text)}
                                                        disabled
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={fullName}
                                                        onChangeText={(text) => setFullName(text)}
                                                        disabled
                                                    />
                                                )}

                                            </View>
                                        </View>

                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                            <View style={{ flex: 1, zIndex: 2 }}>
                                                <TouchableOpacity disabled={true} onPress={toggleCountries} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                        <View style={{ alignSelf: 'center' }}>
                                                            {isChecked ? (
                                                                <Text style={{ textAlignVertical: 'center' }}>{countryDB}</Text>
                                                            ) : (
                                                                <Text style={{ textAlignVertical: 'center' }}>{selectedCountry ? selectedCountryLabel : 'Country'}</Text>
                                                            )}
                                                        </View>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                            <TouchableOpacity disabled onPress={handleClear} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                <AntDesign name="close" size={15} />
                                                            </TouchableOpacity>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCountries && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                {showCountries && (
                                                    <View style={{
                                                        marginTop: 5,
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        elevation: 5,
                                                        width: '100%',
                                                        maxHeight: 200,
                                                        backgroundColor: "white",
                                                        borderWidth: 1,
                                                        borderColor: '#ccc',
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.25,
                                                        shadowRadius: 4,
                                                        zIndex: 3
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Country'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filter}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>
                                                            <FlatList
                                                                data={filteredCountries}
                                                                keyExtractor={(item) => item.value} // Use item.label as the key
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {
                                                                        setSelectedCountryLabel(item.label);
                                                                        setSelectedCountry(item.value);
                                                                        setShowCountries(false);
                                                                        setFilteredCountries(countries);
                                                                        setSelectedCity('City')
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />

                                                        </ScrollView>
                                                    </View>
                                                )}

                                            </View>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 5 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                            <View style={{ flex: 1, zIndex: 2, }}>
                                                <TouchableOpacity onPress={selectedCountry ? toggleCities : null} disabled style={{ borderWidth: 1, borderRadius: 5 }}>

                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                        {isChecked ? (
                                                            <Text style={{ textAlignVertical: 'center' }}>{cityDB}</Text>
                                                        ) : (
                                                            <Text style={{ textAlignVertical: 'center' }}>{selectedCity ? selectedCity : 'City'}</Text>
                                                        )}
                                                        <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCities && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>

                                                </TouchableOpacity>
                                                {showCities && (
                                                    <View
                                                        style={{
                                                            marginTop: 5,
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            elevation: 5,
                                                            width: '100%',
                                                            maxHeight: 200,
                                                            backgroundColor: 'white',
                                                            borderWidth: 1,
                                                            borderColor: '#ccc',
                                                            elevation: 5,
                                                            zIndex: 2
                                                        }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Cities'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filterCities}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>
                                                            <FlatList
                                                                data={filteredCities}
                                                                keyExtractor={(item, index) => index.toString()}
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {
                                                                        setSelectedCity(item.label)
                                                                        setShowCities(false);
                                                                        setFilteredCities(cities);
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />
                                                        </ScrollView>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>


                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Address</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                {isChecked ? (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={addressDB}
                                                        onChangeText={(text) => setAddressDB(text)}
                                                        disabled
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={address}
                                                        onChangeText={(text) => setAddress(text)}
                                                        disabled
                                                    />
                                                )}

                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Tel. Number</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                {isChecked ? (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={telNumberDB}
                                                        onChangeText={(telNumberDB) => setTelNumberDB(telNumberDB)}
                                                        disabled
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={telNumber}
                                                        onChangeText={(text) => setTelNumber(text)}
                                                        disabled
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>E-mail</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={userEmail}
                                                    disabled
                                                />
                                            </View>
                                        </View>
                                    </View>

                                </View>


                                <View style={{ flex: 1, marginLeft: 5 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>
                                            Notify Party
                                        </Text>
                                        <TouchableOpacity disabled onPress={() => {
                                            setCheckedNotify(!isCheckedNotify);
                                            setSelectedCountryNotifyLabel('');
                                            setSelectedCityNotify('');
                                            setFullNameNotifyInput('');
                                            setAddressNotify('');
                                            setTelNumberNotify('');
                                            setEmailNotify('');
                                        }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                            <MaterialIcons
                                                name={isCheckedNotify ? 'check-box' : 'check-box-outline-blank'}
                                                size={20}
                                                color="black"
                                            />
                                            <Text>Same as customer <Text style={{ color: 'red' }}>*</Text></Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Full Name</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                {isCheckedNotify ? (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={!isChecked ? fullName : fullNameDB}
                                                        onChangeText={(text) => {
                                                            setFullNameDB(text);
                                                            setFullName(text);
                                                        }}
                                                        disabled
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={fullNameNotifyInput}
                                                        onChangeText={(text) => setFullNameNotifyInput(text)}
                                                        disabled
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                            <View style={{ flex: 1, zIndex: 2 }}>
                                                <TouchableOpacity disabled onPress={toggleCountriesNotify} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                        <View style={{ alignSelf: 'center' }}>
                                                            {isCheckedNotify ? (
                                                                <Text style={{ textAlignVertical: 'center' }}>
                                                                    {!isChecked ? selectedCountryLabel : countryDB || selectedCountryLabel}
                                                                </Text>
                                                            ) : (
                                                                <Text style={{ textAlignVertical: 'center' }}>
                                                                    {!isCheckedNotify ? !selectedCountryNotifyLabel ? 'Country' : selectedCountryNotifyLabel : selectedCountryNotifyLabel}
                                                                </Text>
                                                            )}
                                                        </View>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                            <TouchableOpacity onPress={handleClearNotify} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                <AntDesign name="close" size={15} />
                                                            </TouchableOpacity>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCountriesNotify && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                {showCountriesNotify && (
                                                    <View style={{
                                                        marginTop: 5,
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        elevation: 5,
                                                        width: '100%',
                                                        maxHeight: 200,
                                                        backgroundColor: "white",
                                                        borderWidth: 1,
                                                        borderColor: '#ccc',
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.25,
                                                        shadowRadius: 4,
                                                        elevation: 5,
                                                        zIndex: 3
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Country'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filterNotify}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>

                                                            <FlatList
                                                                data={filteredCountriesNotify}
                                                                keyExtractor={(item) => item.label} // Use item.label as the key
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {
                                                                        setSelectedCountryNotifyLabel(item.label)
                                                                        setSelectedCountryNotify(item.value)
                                                                        setShowCountriesNotify(false);
                                                                        setFilteredCountriesNotify(countries);
                                                                        setSelectedCityNotify('City')
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />
                                                        </ScrollView>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 5 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                            <View style={{ flex: 1, zIndex: 2, }}>
                                                <TouchableOpacity onPress={selectedCountryNotify ? toggleCitiesNotify : null} disabled style={{ borderWidth: 1, borderRadius: 5 }}>

                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>

                                                        {isCheckedNotify ? (
                                                            <Text style={{ textAlignVertical: 'center' }}>{
                                                                !isChecked ? selectedCity : cityDB
                                                            }</Text>
                                                        ) : (
                                                            <Text style={{ textAlignVertical: 'center' }}>{!isCheckedNotify ? !selectedCityNotify ? 'City' : selectedCityNotify : selectedCityNotify}</Text>
                                                        )}
                                                        <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCitiesNotify && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>

                                                </TouchableOpacity>
                                                {showCitiesNotify && (
                                                    <View
                                                        style={{
                                                            marginTop: 5,
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            elevation: 5,
                                                            width: '100%',
                                                            maxHeight: 150,
                                                            backgroundColor: 'white',
                                                            borderWidth: 1,
                                                            borderColor: '#ccc',
                                                            elevation: 5,
                                                            zIndex: 2
                                                        }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Cities'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filterCitiesNotify}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>
                                                            <FlatList
                                                                data={filteredCitiesNotify}
                                                                keyExtractor={(item, index) => index.toString()}
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {

                                                                        setSelectedCityNotify(item.label);
                                                                        setShowCitiesNotify(false);
                                                                        setFilteredCitiesNotify(cities);
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />
                                                        </ScrollView>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Address</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                {isCheckedNotify ? (
                                                    <TextInput
                                                        disabled
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={!isChecked ? address : addressDB}
                                                        onChangeText={(text) => { setAddress(text); setAddressDB(text); }}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        disabled
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={addressNotify}
                                                        onChangeText={(text) => setAddressNotify(text)}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Tel. Number</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>

                                                {isCheckedNotify ? (
                                                    <TextInput
                                                        disabled
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={!isChecked ? telNumber : telNumberDB}
                                                        onChangeText={(text) => { setTelNumber(text); setTelNumberDB(text); }}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        disabled
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={telNumberNotify}
                                                        onChangeText={(text) => setTelNumberNotify(text)}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>E-mail</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                {isCheckedNotify ? (
                                                    <TextInput
                                                        disabled
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={userEmail}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        disabled
                                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                        value={emailNotify}
                                                        onChangeText={(text) => setEmailNotify(text)}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

                        </View>
                        <View style={{ marginTop: 5 }}>
                            <TouchableOpacity style={{ backgroundColor: '#7b9cff', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5 }}
                                onPress={async () => {
                                    await setOrderInvoice();
                                    addStep();
                                }}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {currentStep === 3 && (
                    <View>
                        <View style={{ marginTop: 20 }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: '#00ff99', fontWeight: '700', fontSize: 25 }}>Thank you for your order!</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>Wire Transfer Amount</Text>
                                <View style={{ flex: 1, zIndex: 2 }}>
                                    <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                        <TextInput
                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>Payment Due Date</Text>
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        height: 'auto',
                                        width: 250,
                                        padding: 10,
                                    }}

                                >
                                    <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                color: '#00ff11', fontWeight: '700'
                                            }}
                                        >
                                            yyyy-mm-dd
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                            </View>

                        </View>
                        <View style={{ marginTop: 5 }}>
                            <TouchableOpacity style={{ backgroundColor: '#7b9cff', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5 }}
                                onPress={async () => {
                                    await updateSteps();
                                    toggleModal();
                                    addStep();
                                }}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}


            </View>

        </View>
    )

}

const ProfileFormChatGroup = () => {
    const hideThis = false
    //status checker

    const firestore = getFirestore();
    const [getStep, setGetStep] = useState(0);
    const [currentStep, setCurrentStep] = useState({ value: 1 });
    const [selectedChatId, setSelectedChatId] = useState(null);
    console.log('PROFILEFORMCHATGROUP', selectedChatId)
    const statusToValue = {
        'Negotiation': 1,
        'Issue Proforma Invoice': 2,
        'Order Item': 3,
        'Payment Confirmation': 4,
        'Shipping Schedule': 5,
        'Copy of B/L': 6,
        'Documentation': 7,
        'Item Received': 8,
        'Completed': 9
    };
    const valueToStatus = {
        1: 'Negotiation',
        2: 'Issue Proforma Invoice',
        3: 'Order Item',
        4: 'Payment Confirmation',
        5: 'Shipping Schedule',
        6: 'Copy of B/L',
        7: 'Documentation',
        8: 'Item Received',
        9: 'Completed'
    };
    const getNextStatus = (currentStatus) => {
        const statusValues = Object.keys(statusToValue).map(key => statusToValue[key]);
        const currentIndex = statusValues.indexOf(statusToValue[currentStatus]);

        if (currentIndex !== -1 && currentIndex < statusValues.length - 1) {
            const nextValue = statusValues[currentIndex + 1];
            return valueToStatus[nextValue];
        }

        return null; // No next status found
    };
    // const updateSteps = async () => {
    //     try {
    //         const chatDocRef = doc(firestore, 'chats', chatId);

    //         // Get the current status string
    //         const currentStatus = valueToStatus[currentStep.value];

    //         // Get the next status string
    //         const nextStatus = getNextStatus(currentStatus);

    //         if (nextStatus) {
    //             // Update the document with the next status
    //             await updateDoc(chatDocRef, {
    //                 stepIndicator: {
    //                     value: statusToValue[nextStatus],
    //                     status: nextStatus
    //                 }
    //             });

    //             setCurrentStep({ value: statusToValue[nextStatus] });
    //             console.log('Steps updated successfully!');
    //         } else {
    //             console.log('No next status found.');
    //         }
    //     } catch (error) {
    //         console.error('Error updating steps:', error);
    //     }
    // };

    const totalSteps = 8;

    useEffect(() => {
        setCurrentStep({ value: getStep });
        console.log('value per ChatID: ', getStep);
    }, [getStep]);

    useEffect(() => {
        const targetChatId = selectedChatId || chatId; // Use selectedChatId if available, otherwise use chatId

        if (targetChatId) {
            const chatDocRef = doc(projectExtensionFirestore, 'chats', targetChatId);
            const unsubscribe = onSnapshot(chatDocRef, (docSnapshot) => {
                try {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        if (data.stepIndicator) {
                            const value = data.stepIndicator.value;
                            const parsedValue = parseInt(value, 10);

                            if (!isNaN(parsedValue)) {
                                setGetStep(parsedValue);
                                setCurrentStep({ value: parsedValue });
                            } else {
                                console.error('Value is not a valid number:', value);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            });

            // Clean up the listener when the component unmounts
            return () => unsubscribe();
        }
    }, [selectedChatId, chatId]);
    //status checker

    //chatid getter

    //chatid getter

    //fetch customer email
    //fetch customer email
    const [customerEmail, setCustomerEmail] = useState('');

    // Fetch the customer email
    useEffect(() => {
        const fetchCustomerEmail = async () => {
            try {
                const db = getFirestore();
                const chatsRef = collection(projectExtensionFirestore, 'chats');
                const q = query(
                    chatsRef,
                    where('participants.salesRep', '==', 'marc@realmotor.jp')
                );

                // Listener to get the first chat where the salesRep is 'marc@realmotor.jp'
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    snapshot.forEach((doc) => {
                        const chat = doc.data();
                        setCustomerEmail(chat.participants.customer);
                        // Only get the first chat and set the customer email, then unsubscribe
                        return;
                    });
                });
                return unsubscribe;
            } catch (error) {
                console.error('Error fetching customer email: ', error);
            }
        };
        fetchCustomerEmail();
    }, []);
    //fetch customer email

    //from progress stepper
    const navigate = useNavigate();
    const [chatData, setChatData] = useState(null);
    const { chatId } = useParams();
    const { userEmail, logout, profileDataAuth } = useContext(AuthContext);
    useEffect(() => {
        if (userEmail) {
            const fetchChatData = async () => {
                const firestore = getFirestore();
                const chatRef = doc(projectExtensionFirestore, 'chats', chatId);

                try {
                    const chatDoc = await getDoc(chatRef);
                    if (chatDoc.exists()) {
                        const chat = chatDoc.data();
                        console.log('Participants:', chat.participants);
                        console.log('User Email:', userEmail);

                        // Check if the user is a participant in this chat
                        if (
                            chat.participants.salesRep === 'marc@realmotor.jp' ||
                            chat.participants.customer === userEmail
                        ) {
                            setChatData(chat);
                        } else {
                            // User doesn't have permission to access this chat
                            navigate('/access-denied'); // Redirect to an access denied page
                        }
                    } else {
                        // Chat doesn't exist
                        navigate('/chat-not-found'); // Redirect to a chat not found page
                    }
                } catch (error) {
                    console.error('Error fetching chat data:', error);
                    navigate('/error'); // Redirect to an error page
                }
            };
            fetchChatData();
        }
    }, [chatId, customerEmail, navigate]);

    const [chatsCustomer, setChatsCustomer] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // For the customer
    useEffect(() => {
        const fetchCustomerChats = async () => {
            try {
                const db = getFirestore();
                const chatsRef = collection(projectExtensionFirestore, 'chats');
                const q = query(
                    chatsRef,
                    where('participants.customer', '==', userEmail),
                );

                // Fetch data once using getDocs
                const querySnapshot = await getDocs(q);
                const chatData = querySnapshot.docs.map((doc) => {
                    const chat = doc.data();
                    // Access carId from the nested structure
                    const carId = chat?.vehicle?.carId || '';
                    return { ...chat, carId }; // Include carId in the chat data
                });

                // Simulate a loading time of 1.5 seconds
                setTimeout(() => {
                    setChatsCustomer(chatData);
                    setIsLoading(false);
                }, 1500);
            } catch (error) {
                console.error('Error fetching customer chats: ', error);
            }
        };

        fetchCustomerChats();
    }, [userEmail]);







    // For the sales representative




    const navigateChat = () => {

    }
    const scrollViewRef = useRef(null);
    const [showGoToTop, setShowGoToTop] = useState(false);

    // Function to scroll to the top when the "Go to Top" button is pressed
    const handleGoToTop = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
    };

    // Function to handle the ScrollView's scroll event
    const handleScroll = (event) => {
        // Calculate whether the user has scrolled to the bottom
        const isAtBottom = event.nativeEvent.contentOffset.y + event.nativeEvent.layoutMeasurement.height >= event.nativeEvent.contentSize.height;

        // Show/hide the "Go to Top" button based on scroll position
        setShowGoToTop(isAtBottom);
    };

    useEffect(() => {
        // Add a scroll event listener to the ScrollView
        if (scrollViewRef.current) {
            scrollViewRef.current.addEventListener('onScroll', handleScroll);
        }

        // Clean up the event listener when the component unmounts
        return () => {
            if (scrollViewRef.current) {
                scrollViewRef.current.removeEventListener('onScroll', handleScroll);
            }
        };
    }, []);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showProfileOptions, setShowProfileOptions] = useState(false);
    const sidebarWidth = 70;
    const sidebarAnimation = useRef(new Animated.Value(0)).current;
    //Function to open the sidebar
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

    //BREAKPOINT
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove
    }, []);

    const data = [
        1
    ];
    //  const renderTransactionDetails = ({ item }) => {
    //     return (



    //     )
    // };
    const [modalVisible, setModalVisible] = useState(false);
    const openModalRequest = () => {
        setModalVisible(!modalVisible);
    }

    return (
        <View>

            <View style={{ flexDirection: 'row' }}>
                {screenWidth < 993 ? (
                    sidebarOpen && (
                        <Modal
                            visible={sidebarOpen}
                            transparent={true}
                            animationType='slideRight'
                            onRequestClose={closeSidebar}
                        >
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    justifyContent: 'flex-end'
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
                                                    alignSelf: 'center',
                                                    borderRadius: 10,
                                                    height: 50,
                                                    padding: 5,
                                                    opacity: pressed ? 0.5 : 1,
                                                    justifyContent: 'center'
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
                                                    alignSelf: 'center',
                                                    borderRadius: 10,
                                                    height: 50,
                                                    padding: 5,
                                                    opacity: pressed ? 0.5 : 1,
                                                    justifyContent: 'center'
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
                                                    alignSelf: 'center',
                                                    borderRadius: 10,
                                                    height: 50,
                                                    padding: 5,
                                                    opacity: pressed ? 0.5 : 1,
                                                    justifyContent: 'center'
                                                })}
                                            >
                                                <Fontisto name="favorite" size={30} />

                                            </Pressable>
                                        </View>
                                        <View style={{ borderBottomWidth: 1, borderBottomColor: '#fff', width: '100%', marginBottom: 10 }} />
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
                    :
                    (
                        <Animated.View
                            style={{
                                width: sidebarWidth,
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                backgroundColor: '#fff',
                                position: 'sticky',
                                top: 0,
                                height: '100vh',
                                borderRightWidth: 1,
                                borderRightColor: '#ccc',
                                transform: [
                                    screenWidth > 719 ? null : {
                                        translateX: sidebarAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-sidebarWidth, 0],
                                        }),
                                    },
                                ],
                            }}
                        >
                            {/*LET THIS BE THE LEFT NAV BAR*/}
                            <ScrollView style={{ flexDirection: 'column', width: sidebarWidth }} contentContainerStyle={{ justifyContent: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0, padding: 10, justifyContent: 'center' }}>
                                    <FontAwesome name="user-circle-o" size={40} />

                                </View>

                                <View style={{ alignSelf: 'center', width: '80%', marginBottom: 10 }}>
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
                                            alignSelf: 'center',
                                            borderRadius: 10,
                                            height: 50,
                                            padding: 5,
                                            opacity: pressed ? 0.5 : 1,
                                            justifyContent: 'center'
                                        })}
                                    >
                                        <FontAwesome name="history" size={30} />

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
                                            alignSelf: 'center',
                                            borderRadius: 10,
                                            height: 50,
                                            padding: 5,
                                            opacity: pressed ? 0.5 : 1,
                                            justifyContent: 'center'
                                        })}
                                    >
                                        <Ionicons name="chatbubble-ellipses" size={30} />

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
                                            alignSelf: 'center',
                                            borderRadius: 10,
                                            height: 50,
                                            padding: 5,
                                            opacity: pressed ? 0.5 : 1,
                                            justifyContent: 'center'
                                        })}
                                    >
                                        <Fontisto name="favorite" size={30} />
                                    </Pressable>
                                </View>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: '#fff', width: '100%', marginBottom: 10 }} />
                                <TouchableOpacity onPress={() => navigate('/')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10, justifyContent: 'center' }}>
                                    <FontAwesome name="home" size={30} />
                                </TouchableOpacity>

                                <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                                    <Entypo name="log-out" size={30} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigate('/UploadScreen')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10, justifyContent: 'center' }}>
                                    <FontAwesome name="upload" size={30} />
                                </TouchableOpacity>

                                <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                                    <AntDesign name="delete" size={30} />
                                </TouchableOpacity>


                            </ScrollView>

                        </Animated.View>
                    )}
                <View style={{ borderRightWidth: 1, borderRightColor: '#ccc', height: '100vh', flex: 1, position: 'sticky', top: 0, padding: 5 }}>
                    <View style={{ margin: 10 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>CHATS</Text>
                    </View>
                    <View>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            borderWidth: 0.5,
                            borderColor: '#000',
                            height: 40,
                            borderRadius: 5,
                            margin: 10,
                        }}>
                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                            <TextInput
                                placeholder='Search Car'
                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                textAlignVertical='center'
                                placeholderTextColor={'gray'}
                            />
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <ScrollView style={{ flex: 1 }}>
                            {isLoading && (
                                <ActivityIndicator size="large" color="#0000ff" />
                            )}
                            {!isLoading && chatsCustomer && (
                                <FlatList
                                    data={chatsCustomer}
                                    keyExtractor={(item, index) => `${item.carId}_${index}`}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedChatId(`chat_${item.carId}_${userEmail}`);
                                                const route = `/ProfileFormChatGroup/chat_${item.carId}_${userEmail}`;
                                                navigate(route);
                                            }}
                                            style={{ flex: 1, backgroundColor: '#ccc', padding: 10, marginVertical: 4, borderRadius: 5 }}
                                        >
                                            <Text>Car ID: {item.carId}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            )}

                        </ScrollView>
                    </View>
                </View>

                <ScrollView
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                    style={{ flexDirection: 'column', height: '100vh', flex: 4 }}>

                    <View>
                        <View style={{ marginVertical: 10 }}>
                            <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} />
                            {currentStep.value === 1 && (
                                <View style={{ borderWidth: 1, margin: 10 }}>
                                    <View style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                                            NEGOTIATE WITH THE BUYER BY EXCHANGING MESSAGES
                                        </Text>
                                        <Text style={{ marginBottom: 8 }}>
                                            The following things should be discussed:
                                        </Text>
                                        <Text style={{ marginBottom: 8 }}>
                                            - Total Price: FOB Price (not including freight cost) or C&F Price (Cost & Freight), insurance cost, inspection fee etc.
                                        </Text>
                                        <Text style={{ marginBottom: 8 }}>
                                            - Payment Terms & Payment Date
                                        </Text>
                                        <Text style={{ marginBottom: 8 }}>
                                            - Condition of the item: If you have unsure points about the deal, please make sure before you confirm the order.
                                        </Text>
                                        <Text style={{ marginBottom: 8 }}>
                                            NEXT ACTION:
                                        </Text>
                                        <Text style={{ marginBottom: 16 }}>
                                            After above points and other conditions are agreed, please send Proforma Invoice by clicking on
                                            <Text style={{ fontWeight: 'bold' }}> [Issue Proforma Invoice]</Text> and submit the form.
                                        </Text>
                                        <TouchableOpacity
                                            style={{
                                                height: 50,
                                                backgroundColor: '#FAA000',
                                                borderRadius: 10,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>
                                                ISSUE PROFORMA INVOICE
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            )}
                            {currentStep.value === 2 && (
                                <View style={{ borderWidth: 1, margin: 10 }}>
                                    <View style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                                            You have received Proforma Invoice. Please check the details (Total Price, Payment due date etc). If you agree all condition, please click on "Order Item" and place your order. Bank Information will be shown after you complete the order.
                                        </Text>
                                        <Text>Transaction Information:</Text>
                                        <Text style={{ marginBottom: 8 }}>C&F Dar es Salaam</Text>
                                        <Text style={{ marginBottom: 8 }}>US$14,000</Text>
                                        <Text style={{ marginBottom: 8 }}>PDF HERE</Text>
                                        <Text style={{ marginBottom: 8 }}>Edit the Proforma Invoice here</Text>
                                        <Text>Payment Due Date:</Text>
                                        <TouchableOpacity
                                            style={{
                                                height: 50,
                                                backgroundColor: '#FAA000',
                                                borderRadius: 10,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginTop: 16,
                                            }}
                                            onPress={() => openModalRequest()}
                                        >
                                            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>
                                                ORDER ITEM BUTTON HERE
                                            </Text>
                                        </TouchableOpacity>
                                        <Modal
                                            animationType="fade"
                                            transparent={true}
                                            visible={modalVisible}
                                            onRequestClose={openModalRequest}
                                        >
                                            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                                                <View style={{ backgroundColor: 'white', width: '90%', height: '90%', padding: 10 }}>
                                                    <ScrollView>
                                                        <OrderItem toggleModal={openModalRequest} />
                                                    </ScrollView>
                                                </View>
                                            </View>
                                        </Modal>
                                    </View>
                                </View>


                            )}
                            {currentStep.value === 3 && (
                                <View style={{ borderWidth: 1, margin: 10 }}>
                                    <View style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                                        <View >
                                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                                                Before Clicking the Confirm Payment:
                                            </Text>
                                            <Text style={{ marginBottom: 8 }}>
                                                - Ensure Proof of Payment is received by the payment due date.
                                            </Text>
                                            <Text style={{ marginBottom: 8 }}>
                                                - If unable to pay by due date, send a warning one day prior to inform the seller for possible extension of due date.
                                            </Text>
                                            <Text style={{ marginBottom: 8 }}>
                                                - Extension requests must be approved by the seller; payment due date is determined by the seller, not the user.
                                            </Text>
                                        </View>
                                        <View >
                                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                                                After User Sends Proof of Payment (PoP):
                                            </Text>
                                            <Text style={{ marginBottom: 8 }}>
                                                - Send a confirmation message after the user sends the PoP.
                                            </Text>
                                            <Text style={{ marginBottom: 8 }}>
                                                - If no funds are reflected in the bank after 2 weeks, notify the user one day prior that no funds have been received, otherwise, the transaction will be cancelled.
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={{
                                                marginTop: 16,
                                                height: 50,
                                                backgroundColor: '#FAA000',
                                                borderRadius: 10,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                                                Proceed to Payment Confirmation
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>


                            )}
                            {currentStep.value === 4 && (
                                <View style={{ borderWidth: 1, margin: 10 }}>
                                    <View style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                                        <Text style={{ marginBottom: 8 }}>
                                            - Arrange the item's shipment.
                                        </Text>
                                        <Text style={{ marginBottom: 8 }}>
                                            - Once the shipping date is confirmed, use the [Shipping Schedule] button to notify the Buyer of the Estimated Time of Departure (ETD).
                                        </Text>
                                        <TouchableOpacity
                                            style={{
                                                marginTop: 16,
                                                height: 50,
                                                backgroundColor: '#FAA000',
                                                borderRadius: 10,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                                                Proceed to Shipping Schedule
                                            </Text>
                                        </TouchableOpacity>
                                        <View style={{ borderTopWidth: 1, padding: 10, marginTop: 16 }}>
                                            <Text
                                                style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Transaction Details</Text>
                                        </View>
                                    </View>
                                </View>

                            )}
                            {currentStep.value === 5 && (
                                <View style={{ borderWidth: 1, margin: 10 }}>
                                    <View style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                                        <TouchableOpacity
                                            style={{
                                                marginTop: 16,
                                                height: 50,
                                                backgroundColor: '#FAA000',
                                                borderRadius: 10,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                                                Proceed to Copy of B/L
                                            </Text>
                                        </TouchableOpacity>
                                        <View style={{ borderTopWidth: 1, padding: 10, marginTop: 16 }}>
                                            <Text
                                                style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Transaction Details</Text>
                                        </View>
                                    </View>
                                </View>

                            )}
                            {currentStep.value === 6 && (
                                <View style={{ borderWidth: 1, margin: 10 }}>
                                    <View style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                                        <TouchableOpacity
                                            style={{
                                                marginTop: 16,
                                                height: 50,
                                                backgroundColor: '#FAA000',
                                                borderRadius: 10,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                                                Proceed to Documentation
                                            </Text>
                                        </TouchableOpacity>
                                        <View style={{ borderTopWidth: 1, padding: 10, marginTop: 16 }}>
                                            <Text
                                                style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Transaction Details</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                            {currentStep.value === 7 && (
                                <View style={{ borderWidth: 1, margin: 10 }}>
                                    <View style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                                        <TouchableOpacity
                                            style={{
                                                marginTop: 16,
                                                height: 50,
                                                backgroundColor: '#FAA000',
                                                borderRadius: 10,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                                                Proceed to Item Received
                                            </Text>
                                        </TouchableOpacity>
                                        <View style={{ borderTopWidth: 1, padding: 10, marginTop: 16 }}>
                                            <Text
                                                style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Transaction Details</Text>
                                        </View>
                                    </View>
                                </View>

                            )}
                            {currentStep.value === 8 && (
                                <View style={{ borderWidth: 1, margin: 10 }}>
                                    <View style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                                        <TouchableOpacity
                                            style={{
                                                marginTop: 16,
                                                height: 50,
                                                backgroundColor: '#FAA000',
                                                borderRadius: 10,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                                                Complete Transaction
                                            </Text>
                                        </TouchableOpacity>
                                        <View style={{ borderTopWidth: 1, padding: 10, marginTop: 16 }}>
                                            <Text
                                                style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Transaction Details</Text>
                                        </View>
                                    </View>
                                </View>

                            )}
                            {currentStep.value === 9 && (
                                <View style={{ borderWidth: 1, margin: 10 }}>
                                    <View style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                                        <View
                                            style={{
                                                marginTop: 16,
                                                height: 50,
                                                backgroundColor: '#FAA000',
                                                borderRadius: 10,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: 'white' }}>
                                                Completed Transaction
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>

                        <ChatD selectedChatId={selectedChatId} />
                    </View>


                </ScrollView>

            </View>
            <View style={{ position: 'absolute', top: 1, left: -100, zIndex: -999, backgroundColor: 'transparent' }}>
            </View>
        </View>

    )

}

export default ProfileFormChatGroup;

const styles = StyleSheet.create({
    container: {
        paddingTop: "60px",
    },


    chatContainer: {
        margin: 5,
        padding: 10,
        borderRadius: 10,
        maxWidth: '70%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'gray',
        padding: 5,
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        margin: 5,
        borderRadius: 5,
        height: 40
    },
    sendButton: {
        backgroundColor: 'blue',
        color: 'white',
        padding: 10,
        borderRadius: 5,
    },

});
