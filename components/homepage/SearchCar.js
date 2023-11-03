import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { StyleSheet, Text, View, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, FlatList, ScrollView, Pressable, Linking, KeyboardAvoidingView, Modal, TextArea, Platform, Image } from 'react-native';
import logo4 from '../../assets/RMJ logo for flag transparent.png';
import { Ionicons, AntDesign, FontAwesome, Foundation } from 'react-native-vector-icons';
import { FlatGrid } from "react-native-super-grid";
import { auth, db, addDoc, collection, doc, setDoc, getDocs, fetchSignInMethodsForEmail, query, orderBy, projectExtensionFirestore, storage, projectExtensionStorage } from '../../Firebase/firebaseConfig';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import { getDoc, onSnapshot, where, limit } from 'firebase/firestore';
import { BrowserRouter, Route, useNavigate, Link, useHistory, useParams, useSearchParams } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { Calendar } from "react-native-calendars";


const StickyHeader = () => {
    const { user, logout, makesFromOutside, setMakesData, modelFromOutside, setModelData, setMinYearData, setMaxYearData } = useContext(AuthContext);
    const textInputRef = useRef(null);
    const navigate = useNavigate();
    const clearSearch = () => {
        textInputRef.current.clear();
        navigate(`/SearchCar/all`);
        // Reset the search query to 'all'
        handleSearchByKeyword('all'); // Perform a new search with 'all'
    };
    const textHereRef = useRef('');
    const handleSearchEnter = async () => {
        setMakesData('');
        setModelData('');
        setMinYearData('');
        setMaxYearData('');
        navigate(`/SearchCar/${textHereRef.current || 'all'}`);
        handleSearchByKeyword(textHereRef.current);
    };
    const { searchQueryWorld } = useParams();
    const [searchResults, setSearchResults] = useState([]);
    const handleSearchByKeyword = async () => {
        try {
            const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');

            if (searchQueryWorld === 'all') {
                const querySnapshot = await getDocs(query(vehicleCollectionRef, limit(5)));
                const results = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data()
                }));
                setSearchResults(results);
            } else {
                const q = query(
                    vehicleCollectionRef,
                    where('keywords', 'array-contains', textHereRef.current.toUpperCase()),
                    limit(5)
                );
                const querySnapshot = await getDocs(q);

                const results = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data()
                }));

                setSearchResults(results);
            }
        } catch (error) {
            console.error('Error searching for products:', error);
        }
    };

    useEffect(() => {
        const handleSearchByKeyword = async () => {
            try {
                const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');

                if (searchQueryWorld === 'all') {
                    const querySnapshot = await getDocs(query(vehicleCollectionRef, limit(5)));
                    const results = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        data: doc.data()
                    }));
                    setSearchResults(results);
                } else {
                    const q = query(
                        vehicleCollectionRef,
                        where('keywords', 'array-contains', searchQueryWorld.toUpperCase()),
                        limit(5),
                    );
                    const querySnapshot = await getDocs(q);

                    const results = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        data: doc.data()
                    }));

                    setSearchResults(results);
                }
            } catch (error) {
                console.error('Error searching for products:', error);
            }
        };

        if (searchQueryWorld) {
            handleSearchByKeyword();
        }

    }, [searchQueryWorld]);



    const handleInputChange = (text) => {
        textHereRef.current = text;// Reset submittedSearch when input changes
    };


    const [scrollY] = useState(new Animated.Value(0));
    //calendar functions
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const handleCalendarToggle = () => {
        setShowCalendar(!showCalendar);
    };

    const handleDatePress = (date) => {
        setSelectedDate(date.dateString);
        setShowCalendar(false); // Close the calendar after a date is selected
    };
    //calendar functions

    //fetch makes below
    const [makes, setMakes] = useState([]);
    const [model, setModel] = useState([]);
    const [carMakes, setCarMakes] = useState('');
    const [carModel, setCarModel] = useState('');

    const handleSelectMake = (option) => {

        setModalVisible(false);
        setCarMakes(option);
        document.body.style.overflow = 'auto';
    };
    const handleSelectModel = (option) => {
        setCarModel(option);
        setModalVisibleModel(false);
        document.body.style.overflow = 'auto';
    }
    //fetch model below
    useEffect(() => {
        let unsubscribe;

        const fetchData = async () => {
            if (!carMakes) {
                return;
            }

            try {
                const docRef = doc(collection(projectExtensionFirestore, 'Model'), carMakes);
                unsubscribe = onSnapshot(docRef, (snapshot) => {
                    const modelData = snapshot.data()?.model || [];
                    setModel(modelData);
                });
            } catch (error) {
                console.error('Error fetching data from Firebase: ', error);
            }
        };
        fetchData();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [carMakes]);

    useEffect(() => {

        try {
            const docRef = doc(collection(projectExtensionFirestore, 'Make'), 'Make');
            const unsubscribe = onSnapshot(docRef, (snapshot) => {
                const makeData = snapshot.data()?.make || [];
                setMakes(makeData);
            });
            return unsubscribe;
        } catch (error) {
            console.error('Error fetching data from Firebase: ', error);
        }
    }, []);




    //fetch bodyType
    const [bodyType, setBodyType] = useState([]);
    const [carBodyType, setCarBodyType] = useState('');
    const handleSelectBodyType = (option) => {
        setCarBodyType(option);
        setModalVisibleBodyType(false);
        setMakesData('');
        setModelData('');
        setMinYearData('');
        setMaxYearData('');
        document.body.style.overflow = 'auto';
    }
    useEffect(() => {
        try {
            const docRef = doc(collection(projectExtensionFirestore, 'BodyType'), 'BodyType');
            const unsubscribe = onSnapshot(docRef, (snapshot) => {
                const bodyTypeData = snapshot.data()?.bodyType || [];

                setBodyType(bodyTypeData);
            });
            return unsubscribe;
        } catch (error) {
            console.error('Error fetching data from Firebase: ', error);
        }
    }, []);
    //fetch bodyType

    //years filtering
    const [isActive, setIsActive] = useState(false);
    const [isActiveMax, setIsActiveMax] = useState(false);
    const minYear = 1970;
    const maxYear = 2024;
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, index) => maxYear - index);
    const reversedYears = years.slice().reverse();
    const renderMinItem = ({ item }) => {
        return (
            <Pressable
                style={({ pressed, hovered }) => [
                    {
                        opacity: pressed ? 0.5 : 1,
                        backgroundColor: hovered ? '#b0c4ff' : null
                    },
                ]}
                onPress={() => handleMinYearSelection(item)}
            >
                <View style={{
                    flexDirection: 'column',
                    marginTop: 5,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    width: '100%'
                }}>
                    <Text>{item}</Text>
                </View>
            </Pressable>
        )
    };
    const renderMaxItem = ({ item }) => {
        return (
            <Pressable
                style={({ pressed, hovered }) => [
                    {
                        opacity: pressed ? 0.5 : 1,
                        backgroundColor: hovered ? '#b0c4ff' : null
                    },
                ]}
                onPress={() => handleMaxYearSelection(item)}
            >
                <View style={{
                    flexDirection: 'column',
                    marginTop: 5,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    width: '100%'
                }}>
                    <Text>{item}</Text>
                </View>

            </Pressable>
        )

    };

    const [selectMinYear, setSelectMinYear] = useState('');
    const [selectMaxYear, setSelectMaxYear] = useState('');
    const [selectOutsideMinYear, setSelectOutsideMinYear] = useState('');
    const [selectOutsideMaxYear, setSelectOutsideMaxYear] = useState('');
    const [modalVisibleYear, setModalVisibleYear] = useState(false);
    const showModalYear = () => {
        setModalVisibleYear(true);
        document.body.style.overflow = 'hidden';
    };
    const hideModalYear = () => {
        setModalVisibleYear(false);
        setIsActive(false);
        setIsActiveMax(false);
        document.body.style.overflow = 'auto';
    };

    const applyFilter = () => {
        setSelectOutsideMinYear(selectMinYear);
        setSelectOutsideMaxYear(selectMaxYear);
        setModalVisibleYear(false);
        document.body.style.overflow = 'auto';
    }
    const handleMinYearSelection = (selectedYear) => {
        setSelectMinYear(selectedYear);
        setIsActive(false);
    };
    const handleMaxYearSelection = (selectedYear) => {
        setSelectMaxYear(selectedYear);
        setIsActiveMax(false);
    }
    const MinDatePicker = () => {
        return (
            <View style={{ paddingRight: 5, marginTop: 5, justifyContent: 'center', flex: 1 }}>
                <View style={{ backgroundColor: 'white', borderWidth: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', height: 'auto' }}>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                height: 'auto',
                                fontSize: 22,
                                borderRadius: 7,
                                width: '100%',
                                padding: 10,
                                zIndex: isActive ? 20 : 1,
                            }}
                            onPress={() => { setIsActive(!isActive) }}
                        >
                            <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                                <Text>{!selectMinYear ? 'Select Min Year' : selectMinYear}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                                <AntDesign
                                    name="down"
                                    size={15}
                                    style={[
                                        {
                                            transitionDuration: '0.3s'
                                        },
                                        isActive && {
                                            transform: [{ rotate: '180deg' }],
                                        },
                                    ]}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                    {isActive && (
                        <View
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                zIndex: 10,
                                elevation: 5,
                                width: '100%',
                                height: 200,
                                backgroundColor: 'white',
                                borderWidth: 1,
                                borderColor: '#ccc',
                                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                            }}
                        >
                            <FlatList
                                data={reversedYears}
                                renderItem={renderMinItem}
                                keyExtractor={(item) => item}
                                showsVerticalScrollIndicator={false}
                            />

                        </View>
                    )}
                </View>
            </View>
        )
    };

    const MaxDatePicker = () => {
        return (
            <View style={{ paddingRight: 5, marginTop: 5, justifyContent: 'center', flex: 1, }}>
                <View style={{ backgroundColor: 'white', borderWidth: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', height: 'auto' }}>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                height: 'auto',
                                fontSize: 22,
                                borderRadius: 7,
                                width: '100%',
                                padding: 10,
                                zIndex: isActiveMax ? 20 : 1,
                            }}
                            onPress={() => { setIsActiveMax(!isActiveMax) }}
                        >
                            <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                                <Text>{!selectMaxYear ? 'Select Max Year' : selectMaxYear}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                                <AntDesign
                                    name="down"
                                    size={15}
                                    style={[
                                        {
                                            transitionDuration: '0.3s'
                                        },
                                        isActiveMax && {
                                            transform: [{ rotate: '180deg' }],
                                        },
                                    ]}
                                />
                            </View>
                        </TouchableOpacity>

                    </View>
                    {isActiveMax && (
                        <View
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                zIndex: 10,
                                elevation: 5,
                                width: '100%',
                                height: 200,
                                backgroundColor: 'white',
                                borderWidth: 1,
                                borderColor: '#ccc',
                                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                            }}
                        >
                            <FlatList
                                data={years}
                                renderItem={renderMaxItem}
                                keyExtractor={(item) => item}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    )}
                </View>
            </View>
        )
    };

    const clearYear = () => {
        setSelectOutsideMaxYear('');
        setSelectOutsideMinYear('');
        setSelectMinYear('');
        setSelectMaxYear('');
        navigate('/SearchCar/all');
    }
    //years filtering

    //add pricing
    const [fobMin, setFobMin] = useState('');
    const [fobMax, setFobMax] = useState('');
    const [inputFobMinOut, setInputFobMinOut] = useState('');
    const [inputFobMaxOut, setInputFobMaxOut] = useState('');
    const [modalVisibleFob, setModalVisibleFob] = useState(false);

    const applyFilterFob = () => {
        setInputFobMinOut(fobMin);
        setInputFobMaxOut(fobMax);
        setModalVisibleFob(false)
    }

    const showModalFob = () => {
        setModalVisibleFob(true);

    }
    const hideModalFob = () => {
        setModalVisibleFob(false);
    }
    const clearFob = () => {
        setFobMin('');
        setFobMax('');
        setInputFobMinOut('');
        setInputFobMaxOut('');
        navigate('/SearchCar/all');
    }
    //add pricing




    const [modalVisibleBodyType, setModalVisibleBodyType] = useState(false);
    const showModalBodyType = () => {
        setModalVisibleBodyType(true);
        document.body.style.overflow = 'hidden';
    };
    const hideModalBodyType = () => {
        setModalVisibleBodyType(false);
        document.body.style.overflow = 'auto';
    };
    const clearBodyType = () => {
        setCarBodyType('');
        navigate('/SearchCar/all');
        document.body.style.overflow = 'auto';
    }
    //fetch bodytype



    const [modalVisible, setModalVisible] = useState(false); //make this false after

    const showModal = () => {
        setModalVisible(true);
        document.body.style.overflow = 'hidden';
    };

    const hideModal = () => {
        setModalVisible(false);
        document.body.style.overflow = 'auto';
    };
    const [modalVisibleModel, setModalVisibleModel] = useState(false); //make this false after

    const showModalModel = () => {
        setModalVisibleModel(true);
        document.body.style.overflow = 'hidden';
    };

    const hideModalModel = () => {
        setModalVisibleModel(false);
        document.body.style.overflow = 'auto';
    };

    const clearMake = () => {
        setMakesData('');
        setCarMakes('');
        setCarModel('');
        navigate('/SearchCar/all');
        document.body.style.overflow = 'auto';
    };

    const clearModel = () => {
        setModelData('');
        setMinYearData('');
        setMaxYearData('');
        setCarModel('');
        navigate('/SearchCar/all');
        document.body.style.overflow = 'auto';
    }

    const thisRef = useRef(null);
    const textInputRefMin = useRef(null);
    const textInputRefMax = useRef(null);
    return (
        <View>
            <Animated.View
                style={{
                    position: 'sticky',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 100,
                    backgroundColor: 'lightblue',
                    justifyContent: 'center',
                    backgroundColor: '#fff', // Background color // Gradient effect (won't work in React Native) // CSS gradient
                    zIndex: 1000,
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
                        <TouchableOpacity onPress={() => navigate('/')} style={{ flex: 1, justifyContent: 'center', }}>
                            <Image source={{ uri: logo4 }} style={{ flex: 1, resizeMode: 'contain', aspectRatio: 0.5 }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#f4f4f4',
                        borderWidth: 0.5,
                        padding: 5,
                        borderRadius: 5,
                        margin: 20,
                        flex: 3,
                    }}>
                        <AntDesign name="search1" size={30} style={{ margin: 5, color: 'gray' }} />
                        <TextInput
                            placeholder='Search by make, model, or keyword'
                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, flex: 3, fontSize: 20 }}
                            textAlignVertical='center'
                            placeholderTextColor={'gray'}
                            onChangeText={handleInputChange}
                            onSubmitEditing={(text) => handleSearchEnter(text)}
                            ref={textInputRef}
                            defaultValuevalue={textHereRef.current}
                        />
                        <TouchableOpacity onPress={clearSearch}>
                            <AntDesign name="closecircle" size={24} color="gray" />
                        </TouchableOpacity>
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
            <Animated.View
                style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#aaa',
                    position: 'sticky',
                    top: 100,
                    left: 0,
                    right: 0,
                    backgroundColor: 'lightblue',
                    justifyContent: 'center',
                    backgroundColor: '#fff', // Background color // Gradient effect (won't work in React Native) // CSS gradient
                    zIndex: 1000,
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
                <View style={{ borderTopWidth: 1, flex: 1, borderTopColor: '#aaa', }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 10 }}>
                        <View style={{ flex: 1, borderWidth: 1, margin: 10, padding: 10 }}>
                            <TouchableOpacity style={{ alignItems: 'center' }} onPress={showModal}>
                                <Text>{carMakes !== '' ? carMakes : 'Make'}</Text>
                            </TouchableOpacity>
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={modalVisible}
                                onRequestClose={hideModal}
                            >
                                <TouchableWithoutFeedback onPress={hideModal} style={{ justifyContent: 'center', margin: 10 }}>
                                    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'row', }}>
                                        <View style={{ width: 400, height: 600, margin: 10, padding: 10, backgroundColor: 'white', borderRadius: 0, marginTop: '8.6%', marginLeft: 20, zIndex: 5 }}>
                                            <ScrollView>
                                                <FlatList
                                                    data={makes}
                                                    keyExtractor={(item) => item}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity onPress={() => handleSelectMake(item)}>
                                                            <Text>{item}</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                />
                                            </ScrollView>
                                            {/* <TouchableOpacity onPress={hideModal}>
                                        <Text>Close</Text>
                                    </TouchableOpacity> */}
                                        </View>
                                        <View style={{ flex: 1 }} />
                                        <View style={{ flex: 1 }} />
                                        <View style={{ flex: 1 }} />
                                        <View style={{ flex: 1 }} />
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        </View>
                        <View style={{ flex: 1, borderWidth: 1, margin: 10, padding: 10 }}>
                            <TouchableOpacity style={{ alignItems: 'center' }} onPress={showModalModel} disabled={!carMakes}>
                                <Text>{carModel !== '' ? carModel : 'Model'}</Text>
                            </TouchableOpacity>
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={modalVisibleModel}
                                onRequestClose={hideModalModel}
                            >
                                <TouchableWithoutFeedback onPress={hideModalModel} style={{ justifyContent: 'center', margin: 10 }}>
                                    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'row', }}>
                                        <View style={{ flex: 1 }} />
                                        <View style={{ width: 400, height: 600, margin: 10, padding: 10, backgroundColor: 'white', borderRadius: 0, marginTop: '8.6%', marginLeft: 20, zIndex: 5 }}>
                                            <ScrollView>
                                                <FlatList
                                                    data={model}
                                                    keyExtractor={(item) => item}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity onPress={() => handleSelectModel(item)}>
                                                            <Text>{item}</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                />
                                            </ScrollView>
                                            {/* <TouchableOpacity onPress={hideModal}>
                                        <Text>Close</Text>
                                    </TouchableOpacity> */}
                                        </View>
                                        <View style={{ flex: 1 }} />
                                        <View style={{ flex: 1 }} />
                                        <View style={{ flex: 1 }} />
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        </View>
                        <View style={{ flex: 1, borderWidth: 1, margin: 10, padding: 10 }}>
                            <TouchableOpacity style={{ alignItems: 'center' }} onPress={showModalBodyType} disabled={!bodyType}>
                                <Text>{carBodyType !== '' ? carBodyType : 'Body Style'}</Text>
                            </TouchableOpacity>
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={modalVisibleBodyType}
                                onRequestClose={hideModalBodyType}
                            >
                                <TouchableWithoutFeedback onPress={hideModalBodyType} style={{ justifyContent: 'center', margin: 10 }}>
                                    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'row', }}>
                                        <View style={{ flex: 1 }} />
                                        <View style={{ flex: 1 }} />
                                        <View style={{ width: 400, height: 600, margin: 10, padding: 10, backgroundColor: 'white', borderRadius: 0, marginTop: '8.6%', marginLeft: 20, zIndex: 5 }}>
                                            <ScrollView>
                                                <FlatList
                                                    data={bodyType}
                                                    keyExtractor={(item) => item}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity onPress={() => handleSelectBodyType(item)} >
                                                            <Text>{item}</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                />
                                            </ScrollView>
                                            {/* <TouchableOpacity onPress={hideModal}>
                                            <Text>Close</Text>
                                        </TouchableOpacity> */}
                                        </View>
                                        <View style={{ flex: 1 }} />
                                        <View style={{ flex: 1 }} />
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        </View>
                        <View style={{ flex: 1, borderWidth: 1, margin: 10, padding: 10 }}>
                            <TouchableOpacity style={{ alignItems: 'center' }} onPress={showModalFob}>
                                <Text>{fobMin && fobMax !== 0 ? (`${fobMin} - ${fobMax}`) : ('Price')}</Text>
                            </TouchableOpacity>
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={modalVisibleFob}
                                onRequestClose={hideModalFob}
                            >
                                <TouchableWithoutFeedback onPress={(e) => {
                                    if (e.target !== thisRef.current) {
                                        if (e.target !== textInputRefMax.current) {
                                            if (e.target !== textInputRefMin.current) {
                                                hideModalFob();
                                            }

                                        }
                                    }
                                }}>
                                    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0, 0, 0, 0.5)', }}>
                                        <View style={{ flex: 1 }} />
                                        <View style={{ flex: 1 }} />
                                        <View style={{ flex: 1 }} />
                                        <View
                                            ref={textInputRefMin}
                                            style={{
                                                width: 400,
                                                height: 600,
                                                margin: 10,
                                                padding: 10,
                                                backgroundColor: 'white',
                                                borderRadius: 0,
                                                marginTop: '8.6%',
                                                marginLeft: 20,
                                                zIndex: 5,
                                                justifyContent: 'space-between',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row' }}>
                                                <TextInput
                                                    ref={thisRef}
                                                    placeholder="Min Price"
                                                    value={fobMin}
                                                    onChangeText={(text) => {
                                                        const parsedValue = parseInt(text.replace(/\D/g, ''), 10);
                                                        if (text === '' || !isNaN(parsedValue)) {
                                                            setFobMin(text === '' ? '' : parsedValue);
                                                        }
                                                    }}
                                                />
                                                <TextInput
                                                    ref={textInputRefMax}
                                                    placeholder="Max Price"
                                                    value={fobMax}
                                                    onChangeText={(text) => {
                                                        const parsedValue = parseInt(text.replace(/\D/g, ''), 10);
                                                        if (text === '' || !isNaN(parsedValue)) {
                                                            setFobMax(text === '' ? '' : parsedValue);
                                                        }
                                                    }}
                                                />
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                                <TouchableOpacity style={{ borderWidth: 1, padding: 10, paddingHorizontal: 100 }} onPress={applyFilterFob}>
                                                    <Text>Apply Filter</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <View style={{ flex: 1 }} />
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        </View>
                        <View style={{ flex: 1, borderWidth: 1, margin: 10, padding: 10 }}>
                            <TouchableOpacity style={{ alignItems: 'center' }} onPress={showModalYear}>
                                <Text>{selectMinYear && selectMaxYear !== '' ? (`Year: ${selectMinYear} - ${selectMaxYear}`) : ('Year')}</Text>
                            </TouchableOpacity>
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={modalVisibleYear}
                                onRequestClose={hideModalYear}
                            >
                                <TouchableWithoutFeedback onPress={hideModalYear} style={{ justifyContent: 'center', margin: 10 }}>
                                    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'row', }}>
                                        <View style={{ flex: 1 }} />
                                        <View style={{ flex: 1 }} />
                                        <View style={{ flex: 1 }} />
                                        <View
                                            style={{
                                                width: 400,
                                                height: 600,
                                                margin: 10,
                                                padding: 10,
                                                backgroundColor: 'white',
                                                borderRadius: 0,
                                                marginTop: '8.6%',
                                                marginLeft: 20,
                                                zIndex: 5,
                                                justifyContent: 'space-between', // Align items at the top and bottom
                                                flexDirection: 'column', // Arrange items in a column
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row' }}>
                                                <MinDatePicker />
                                                <MaxDatePicker />
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                                <TouchableOpacity style={{ borderWidth: 1, padding: 10, paddingHorizontal: 100 }} onPress={applyFilter}>
                                                    <Text>Apply Filter</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <View style={{ flex: 1 }} />
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        </View>
                    </View>
                </View>
            </Animated.View>
            <AllData searchResults={searchResults} carMakeValue={carMakes} carModelValue={carModel} carBodyTypeValue={carBodyType} minYearValue={minYear} maxYearValue={maxYear} fobMinValue={fobMin} fobMaxValue={fobMax} />

        </View>
    );
};

const AllData = ({ carMakeValue, carModelValue, carBodyTypeValue, maxYearValue, minYearValue, fobMinValue, fobMaxValue, makesOutsideValue, searchResults }) => {
    const { modelFromOutside, minYearFromOutside, maxYearFromOutside, makesFromOutside } = useContext(AuthContext)
    const [carData, setCarData] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchParamsUseEffect, setSearchParamsUseEffect] = useSearchParams();
    const [filterOutside, setFilteredOutside] = useState([]);

    // const filterData = (data) => {
    //     let filteredData = data;
    //     if (makesFromOutside) {
    //         const makeLower = makesFromOutside.toLowerCase();
    //         filteredData = filteredData.filter(car => car.make.toLowerCase() === makeLower)
    //     }
    //     if (modelFromOutside) {
    //         const makeLower = modelFromOutside.toString().toLowerCase();
    //         filteredData = filteredData.filter(car => car.model.toLowerCase() === makeLower);
    //     }
    //     if (minYearFromOutside) {
    //         filteredData = filteredData.filter(car =>
    //             car.regYear >= parseInt(minYearFromOutside)
    //         );
    //     }
    //     if (maxYearFromOutside) {
    //         filteredData = filteredData.filter(car =>
    //             car.regYear <= parseInt(maxYearFromOutside)
    //         );
    //     }
    //     return filteredData;
    // };

    // useEffect(() => {
    //     const filteredData = filterData(carData);
    //     setFilteredOutside(filteredData.slice(0, 25)); // Load first 25 items

    //     // Set query params
    //     const queryParams = new URLSearchParams(searchParamsUseEffect);
    //     queryParams.set('make', makesFromOutside);
    //     queryParams.set('model', modelFromOutside);
    //     queryParams.set('minYear', minYearFromOutside);
    //     queryParams.set('maxYear', maxYearFromOutside);
    //     setSearchParamsUseEffect(queryParams);

    //     // Simulated loading delay
    //     setTimeout(() => {
    //         setIsLoading(false); // End loading
    //     }, 1500);
    // }, [carData, makesFromOutside, modelFromOutside, minYearFromOutside, maxYearFromOutside]);

    const [imageUrls, setImageUrls] = useState({});
    console.log('IMAGE',imageUrls)
    const handleChoose = async () => {
        try {
            const vehicleCollectionRef = query(collection(projectExtensionFirestore, 'VehicleProducts'), limit(10));
            let filteredData = [];
            let q = query(vehicleCollectionRef);

            if (carMakeValue) {
                q = query(q, where('make', '==', carMakeValue.toUpperCase()), limit(10));
            }

            if (carModelValue) {
                q = query(q, where('model', '==', carModelValue.toUpperCase()), limit(10));
            }

            if (carBodyTypeValue) {
                q = query(q, where('bodyType', '==', carBodyTypeValue.toUpperCase()), limit(10));
            }

            const querySnapshot = await getDocs(q);

            const carIdsWithImages = [];

            await Promise.all(querySnapshot.docs.map(async (doc) => {
                const carId = doc.id;
                const folderRef = ref(projectExtensionStorage, carId);
                try {
                    const result = await listAll(folderRef);
                    if (result.items.length > 0) {
                        const imageUrl = await getDownloadURL(result.items[0]);
                        setImageUrls((prevImageUrls) => ({
                            ...prevImageUrls,
                            [carId]: imageUrl,
                        }));
                        carIdsWithImages.push(carId);
                        filteredData.push({
                            id: carId,
                            data: doc.data(),
                            imageUrl: imageUrl, // Added imageUrl to filteredData
                        });
                
                    }
                } catch (error) {
                    console.error('Error listing images for car', carId, ':', error);
                }
            }));

            setFilteredCars(filteredData);
            const queryParams = new URLSearchParams(searchParams);
            queryParams.set('make', carMakeValue);
            queryParams.set('model', carModelValue);
            queryParams.set('bodyType', carBodyTypeValue);

            setSearchParams({
                make: carMakeValue,
                model: carModelValue,
                bodyType: carBodyTypeValue,
            });
       
        } catch (error) {
            console.error('Error filtering cars:', error);
        }
    }
    useEffect(() => {
        if (carMakeValue || carModelValue || carBodyTypeValue) {
            handleChoose();
        } else {
            setFilteredCars(searchResults);
        }
    }, [carMakeValue, carModelValue, searchResults, carBodyTypeValue]);

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

    //FETCH THE CURRENCY
    const [getConversion, setGetConversion] = useState('');
    useEffect(() => {
        const currencyDocRef = doc(projectExtensionFirestore, 'currency', 'currency');
        const unsubscribe = onSnapshot(currencyDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const jpyToUsd = docSnapshot.data().jpyToUsd;
                setGetConversion(jpyToUsd);
            } else {
                console.log('No such document');
            }
        }, (error) => {
            console.error('Error getting document: ', error);
        });
        return () => unsubscribe();
    }, []);
    //FETCH THE CURRENCY







    // // GET THE REF NUMBER
    // useEffect(() => {
    //     const fetchCarIds = async () => {
    //         try {
    //             const querySnapshot = await getDocs(collection(projectExtensionFirestore, 'VehicleProducts'));
    //             const carIdsArray = querySnapshot.docs.map(doc => doc.id);
    //             setCarRefNumbers(carIdsArray);
    //         } catch (error) {
    //             console.error('Error fetching car IDs:', error);
    //         }
    //     };
    //     fetchCarIds();
    // }, []);

    //filtering and not showing the cars if they dont have images. USE THIS IN SEARCH CAR



    //get images from ref number

    // console.log('ALL IMAGE LINK', imageUrls);
    // useEffect(() => {
    //     // Function to fetch the first image URL for a folder
    //     const fetchImageURL = async (folderId) => {
    //         const folderRef = ref(projectExtensionStorage, folderId);
    //         try {
    //             // List all items (images) in the folder
    //             const result = await listAll(folderRef);

    //             if (result.items.length > 0) {
    //                 // Get the download URL for the first image in the folder
    //                 const imageUrl = await getDownloadURL(result.items[0]);
    //                 // Update the imageUrls state with the new URL
    //                 setImageUrls((prevImageUrls) => ({
    //                     ...prevImageUrls,
    //                     [folderId]: imageUrl,
    //                 }));
    //             } else {
    //                 // If the folder is empty, you can add a placeholder URL or handle it as needed
    //             }
    //         } catch (error) {
    //             console.error('Error listing images for folder', folderId, ':', error);
    //         }
    //     };

    //     // Fetch image URLs for each folder
    //     carIds.forEach((folderId) => {
    //         fetchImageURL(folderId);
    //     });
    // }, [carIds]);

    // fetchVehicleData FETCHING THE CARS
    const fetchVehicleData = async () => {
        try {
            const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');
            const querySnapshot = await getDocs(vehicleCollectionRef);

            const dataArray = [];
            querySnapshot.forEach((doc) => {
                dataArray.push({ id: doc.id, ...doc.data() });
            });

            return dataArray;
        } catch (error) {
            console.log('Error fetching vehicle data:', error);
            return [];
        }
    };



    // useEffect(() => {
    //     const fetchData = async () => {
    //         const dataArray = await fetchVehicleData();

    //         if (typeof searchQuery === 'string') {
    //             const updatedFilteredCarData = dataArray.filter(item => {
    //                 return imageUrls.hasOwnProperty(item.id);
    //             });

    //             setCarData(updatedFilteredCarData);

    //             if (searchQuery.toLowerCase() === 'all') {
    //                 setFilteredCars(updatedFilteredCarData); // Display all cars
    //             } else {
    //                 const filteredData = updatedFilteredCarData.filter(item => item.carName.toLowerCase().includes(searchQuery.toLowerCase()));
    //                 setFilteredCars(filteredData);
    //             }
    //         }
    //     };

    //     fetchData();
    // }, [searchQuery, imageUrls]);




    const handleCar = (carId) => {
        navigate(`/ProductScreen/${carId}`);

    };

    //SKELETON LOADING
    const [isLoading, setIsLoading] = useState(true);
    const dataBlank = [
        1, 2, 3, 4, 5
    ];


    const renderBlankPapers = ({ item }) => {
        return (
            <View style={{ borderRadius: 10, boxShadow: '0 2px 10px rgba(2, 2, 2, 0.1)' }}>
                <View style={{ width: '100%', backgroundColor: 'white', overflow: 'hidden', aspectRatio: screenWidth > 729 ? 600 / 900 : 0.7 }}>
                    <Animated.View style={{ opacity: opacity.current, resizeMode: 'cover', flex: 1, backgroundColor: '#eee' }} />
                    <View style={{ padding: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', height: 50 }}>
                            <View style={{ flex: 1 }}>
                                <Animated.View style={{ opacity: opacity.current, backgroundColor: '#eee', height: 20 }} />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Animated.View style={{ opacity: opacity.current, backgroundColor: '#eee' }} />
                        </View>
                        <Animated.View style={{ opacity: opacity.current, height: 150, height: 150, backgroundColor: '#eee', borderRadius: 15, marginTop: 10 }} />
                    </View>
                </View>
            </View>
        )
    }
    //SKELETON LOADING
    const renderIndividualImage = ({ item }) => {
        //HOVERED EFFECT
        const conversion = parseFloat(getConversion);
        const fobPrice = parseFloat(item.fobPrice);
        const dollarRate = Math.floor(fobPrice * conversion).toLocaleString();

        const handlePress = () => {
            handleCar(item.id);
        };
        const imageUrl = imageUrls[item.id];
        return (
            <Pressable
                style={({ pressed, hovered }) => [
                    {
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
                                <Text style={{ alignSelf: 'flex-start', fontWeight: '600', fontSize: 18, marginRight: 5 }} numberOfLines={2} ellipsizeMode="tail">
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
                            <Text style={{ alignSelf: 'flex-start', fontWeight: '500', fontSize: 16 }}>FOB:$ <Text style={{ color: 'green' }}>{dollarRate}</Text></Text>
                            <Text style={{ alignSelf: 'flex-end' }}>{item.referenceNumber}</Text>
                        </View>
                        <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#aaa' }}>{item.location}</Text>
                        <View style={{ height: 150, backgroundColor: '#e6e6e6', borderRadius: 15, marginTop: 10, boxShadow: '0 2px 10px rgba(3, 3, 3, 0.1)', justifyContent: 'space-between' }}>
                            <Text style={{ padding: 10, textAlign: 'left', fontSize: 14, overflow: item.carDescription && item.carDescription.length > 80 ? 'hidden' : 'visible', textOverflow: 'ellipsis' }}>
                                {item.carDescription}
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="speedometer-outline" size={20} />
                                    <Text> {item.mileage}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="calendar-outline" size={20} />
                                    <Text>{item.regYear}/{item.regMonth}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <ScrollView showsVerticalScrollIndicator={true}>
            <FlatGrid
                data={filteredCars}
                renderItem={renderIndividualImage}
                itemDimension={350}
                spacing={10}
            />
        </ScrollView>
    )
};


const SearchCar = () => {
    const { searchQueryWorld } = useParams();
    const [searchQuery, setSearchQuery] = useState('');


    return (
        <View>
            <StickyHeader searchQueryWorld={searchQueryWorld} searchQuery={searchQuery} />
            {/* <DropDownKeyword setSearchQuery={setSearchQuery} textMakeRef={textMakeRef} /> */}
            {/* <AllData searchQuery={searchQuery} /> */}

        </View>
    )
}

export default SearchCar;