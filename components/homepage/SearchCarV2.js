import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { StyleSheet, Text, View, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, FlatList, Image, ScrollView, Pressable, Linking, Modal, Button } from 'react-native';
import logo4 from '../../assets/RMJ logo for flag transparent.png';
import { Ionicons, AntDesign, FontAwesome, Foundation } from 'react-native-vector-icons';
import { FlatGrid } from "react-native-super-grid";
import { auth, db, addDoc, collection, doc, setDoc, getDocs, fetchSignInMethodsForEmail, query, orderBy, projectExtensionFirestore, storage, projectExtensionStorage } from '../../Firebase/firebaseConfig';
import { getStorage, ref, listAll, getDownloadURL, } from 'firebase/storage';
import { getDoc, onSnapshot } from 'firebase/firestore';
import { BrowserRouter, Route, useNavigate, Link, useHistory, useParams, useSearchParams } from 'react-router-dom';
import { NativeBaseProvider, PresenceTransition } from "native-base";
import { AuthContext } from "../../context/AuthProvider";




const StickyHeader = ({ setSearchQuery, textMakeRef }) => {
    const { user, logout } = useContext(AuthContext);
    const textInputRef = useRef(null);
    const navigate = useNavigate();

    const clearSearch = () => {
        setSearchQuery('');
        textInputRef.current.clear();
        textMakeRef.current.value = 'Make'
    };

    const [textHere, setTextHere] = useState('');
    const handleSearchEnter = () => {
        if (textHere.trim() !== '') {
            navigate(`/SearchCar/${textHere}`);
        }
    };
    const handleSearch = (text) => {
        setSearchQuery(text);
        setTextHere(text);

    }
    const [scrollY] = useState(new Animated.Value(0));
    //BREAKPOINT
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);

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
                    flex: 3
                }}>
                    <AntDesign name="search1" size={30} style={{ margin: 5, color: 'gray' }} />
                    <TextInput
                        placeholder='Search by make, model, or keyword'
                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, flex: 3, fontSize: 20 }}
                        textAlignVertical='center'
                        placeholderTextColor={'gray'}
                        onChangeText={handleSearch}
                        onSubmitEditing={handleSearchEnter}
                        ref={textInputRef}
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
    );
};
const FilteredPeopleList = ({ people }) => {
    const [filteredPeople, setFilteredPeople] = useState(people);
    const [searchParams, setSearchParams] = useSearchParams();

    let [age, setAge] = useState(searchParams.get('age') || '');
    let [weight, setWeight] = useState(searchParams.get('weight') || '');
    let [height, setHeight] = useState(searchParams.get('height') || '');
    let [isActive, setIsActive] = useState(
        searchParams.get('isActive') === '' || null
    );

    const handleSearchEnter = () => {
        let filteredList = people;
        if (age) {
            filteredList = filteredList.filter(person => person.age === parseInt(age));
        }
        if (weight) {
            filteredList = filteredList.filter(
                person => person.weight === parseInt(weight)
            );
        }

        if (height) {
            filteredList = filteredList.filter(
                person => person.height === parseInt(height)
            );
        }

        if (isActive !== null) {
            filteredList = filteredList.filter(person => person.active === isActive);
        }

        // Update the state with the filtered list
        setFilteredPeople(filteredList);

        // Update the search params
        const queryParams = new URLSearchParams(searchParams);
        queryParams.set('age', age);
        queryParams.set('weight', weight);
        queryParams.set('height', height);
        queryParams.set('isActive', isActive);

        // Set the new search params
        setSearchParams(queryParams.toString());
    };

    useEffect(() => {
        handleSearchEnter();
    }, [age, weight, height, isActive]);

    return (
        <View>
            <TextInput
                placeholder="Age"
                keyboardType="numeric"
                value={age}
                onChangeText={text => setAge(text)}
            />
            <TextInput
                placeholder="Weight"
                keyboardType="numeric"
                value={weight}
                onChangeText={text => setWeight(text)}
            />
            <TextInput
                placeholder="Height"
                keyboardType="numeric"
                value={height}
                onChangeText={text => setHeight(text)}
            />
            <TouchableOpacity
                onPress={() => setIsActive(!isActive)}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 10,
                }}
            >
                <AntDesign
                    name={isActive ? 'checkcircle' : 'checkcircleo'}
                    size={24}
                    color={isActive ? 'green' : 'grey'}
                />
                <Text style={{ marginLeft: 10 }}>
                    Active ({isActive ? 'true' : 'false'})
                </Text>
            </TouchableOpacity>

            <Button title="Search" onPress={handleSearchEnter} />

            <FlatList
                data={filteredPeople}
                keyExtractor={person => person.name}
                renderItem={({ item }) => (
                    <View>
                        <Text>{item.name}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const FilteredCarList = () => {

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
    console.log('DOLLAR RATE: ', getConversion);
    useEffect(() => {
        const currencyDocRef = doc(projectExtensionFirestore, 'currency', 'currency');

        const unsubscribe = onSnapshot(currencyDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const jpyToUsd = docSnapshot.data().jpyToUsd;
                console.log('JPY to USD:', jpyToUsd);
                setGetConversion(jpyToUsd);
            } else {
                console.log('No such document!');
            }
        }, (error) => {
            console.error('Error getting document:', error);
        });

        return () => unsubscribe();
    }, []);

    //FETCH THE CURRENCY




    //fetch car ids
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
    //fetch car ids

    //get the ref number
    const [carRefNumbers, setCarRefNumbers] = useState([]);
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
                setCarRefNumbers(carRefNumbers);
            } catch (error) {
                console.log('Error fetching vehicle data: ', error)
            }
        };
        if (carIds.length > 0) {
            fetchRefNumbers();
        }
    }, [carIds]);
    //get the ref number

    //get images from ref number
    const folderIds = carRefNumbers;
    const [imageUrls, setImageUrls] = useState({});
    useEffect(() => {
        const fetchImageURL = async (folderId) => {
            const folderRef = ref(projectExtensionStorage, folderId);
            try {
                const result = await listAll(folderRef);
                if (result.items.length > 0) {
                    const imageUrl = await getDownloadURL(result.items[0]);
                    setImageUrls((prevImageUrls) => ({
                        ...prevImageUrls,
                        [folderId]: imageUrl
                    }));
                } else {

                }
            } catch (error) {
                console.error('Error listing images for folder', folderId, ':', error);

            }
        };
        folderIds.forEach((folderId) => {
            fetchImageURL(folderId);
        });
    }, [folderIds]);
    //get images from ref number

    //fetch vehicle data fetching the cars
    const [carData, setCarData] = useState([]);
    const fetchVehicleData = async () => {
        try {
            const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');
            const querySnapshot = await getDocs(vehicleCollectionRef);

            const dataArray = [];
            querySnapshot.forEach((doc) => {
                dataArray.push({ id: doc.id, ...doc.data() });

            });
            console.log('dataArray:', dataArray);


            setCarData(dataArray);


        } catch (error) {
            console.log('Error fetching vehicle data:', error)
        }
    };
    useEffect(() => {
        fetchVehicleData();
    }, [])
    const {makesFromOutside} = useContext(AuthContext);
    console.log('makes from carview table: ', makesFromOutside);
    //filtered data
    const [filteredCar, setFilteredCar] = useState([]);
    console.log('CAR DATA FILTERED: ', filteredCar);
    const [searchParams, setSearchParams] = useSearchParams();
    let [filterCarMake, setFilterCarmake] = useState(searchParams.get('make') || '');
    let [filterCarModel, setFilterCarModel] = useState(searchParams.get('model') || '');
    let [filterBodyType, setFilterBodyType] = useState(searchParams.get('bodyType') || '');
    let [filterMinFob, setFilterMinFob] = useState(searchParams.get('minPrice') || '');
    let [filterMaxFob, setFilterMaxFob] = useState(searchParams.get('maxPrice') || '');
    let [filterMinMileage, setFilterMinMileage] = useState(searchParams.get('minMileage') || '');
    let [filterMaxMileage, setFilterMaxMileage] = useState(searchParams.get('maxMileage') || '');
    let [filterMinDisplacement, setFilterMinDisplacement] = useState(searchParams.get('minDisplacement') || '');
    let [filterMaxDisplacement, setFilterMaxDisplacement] = useState(searchParams.get('maxDisplacement') || '');
    // const filterCarData = () => {
    //     let filteredData = carData;
    //     if (filterCarMake) {
    //         filteredData = filteredData.filter((car) => car.make === filterCarMake);
    //     }
    //     if (filterCarModel) {
    //         filteredData = filteredData.filter((car) => car.model === filterCarModel);
    //     }
    //     if(filterBodyType) {
    //         filteredData = filteredData.filter((car) => car.bodyType === filterBodyType);
    //     }
    //     setFilteredCar(filteredData);
    // };

    const handleSearchEnter = () => {
        // Call the filterCarData function to get the filtered data
        let filteredData = carData;

        if (filterCarMake) {
            const makeLower = filterCarMake.toLowerCase();
            filteredData = filteredData.filter(car => car.make.toLowerCase() === makeLower);
        }

        if (filterCarModel) {
            const modelLower = filterCarModel.toLowerCase();
            filteredData = filteredData.filter(car => car.model.toLowerCase() === modelLower);
        }

        if (filterBodyType) {
            const makeLower = filterBodyType.toLowerCase();
            filteredData = filteredData.filter(car => car.bodyType.toLowerCase() === makeLower);
        }
        if (selectedMinYear && selectedMaxYear) {
            filteredData = filteredData.filter(car =>
                car.regYear >= parseInt(selectedMinYear) && car.regYear <= parseInt(selectedMaxYear)
            );
        }
        if (filterMinFob && filterMaxFob) {
            filteredData = filteredData.filter(car =>
                Math.floor(parseInt(car.fobPrice) * getConversion) >= parseInt(filterMinFob) && Math.floor(parseInt(car.fobPrice) * getConversion) <= parseInt(filterMaxFob)
            )
        }
        if (filterMinMileage) {
            filteredData = filteredData.filter(car =>
                parseInt(car.mileage) >= parseInt(filterMinMileage) && parseInt(car.mileage) <= parseInt(filterMaxMileage)
            )
        }
        if (filterMinDisplacement && filterMaxDisplacement) {
            filteredData = filteredData.filter(car =>
                parseInt(car.engineDisplacement) >= parseInt(filterMinDisplacement) && parseInt(car.engineDisplacement) <= parseInt(filterMaxDisplacement)
            )
        }
        if (filterMaxMileage) {
            filteredData = filteredData.filter(car =>
                parseInt(car.mileage) <= parseInt(filterMaxMileage)
            );
        }

        setFilteredCar(filteredData);

        const queryParams = new URLSearchParams(searchParams);
        queryParams.set('make', filterCarMake);
        queryParams.set('model', filterCarModel);
        queryParams.set('bodyType', filterBodyType);
        queryParams.set('minYear', selectedMinYear);
        queryParams.set('maxYear', selectedMaxYear);
        queryParams.set('minPrice', filterMinFob);
        queryParams.set('maxPrice', filterMaxFob);
        queryParams.set('minMileage', filterMinMileage);
        queryParams.set('maxMileage', filterMaxMileage);
        queryParams.set('minDisplacement', filterMinDisplacement);
        queryParams.set('maxDisplacement', filterMaxDisplacement);

        setSearchParams({
            make: filterCarMake,
            model: filterCarModel,
            bodyType: filterBodyType,
            minYear: selectedMinYear,
            maxYear: selectedMaxYear,
            minPrice: filterMinFob,
            maxPrice: filterMaxFob,
            minMileage: filterMinMileage,
            maxMileage: filterMaxMileage,
            minDisplacement: filterMinDisplacement,
            maxDisplacement: filterMaxDisplacement
        });
        setFilterCarModel('');
        setFilterCarmake('');
        setFilterMinMileage('');
        setFilterMaxMileage('');
        setFilterMinFob('');
        setFilterMaxFob('');
        setFilterBodyType('');
        setSelectedMinYear('');
        setSelectedMaxYear('');
        setFilterMinDisplacement('');
        setFilterMaxDisplacement('');
    };



    //YEARS FILTERING
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
                    width: '100%',


                }}>
                    <Text>{item}</Text>

                </View>
            </Pressable>
        );
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
                    width: '100%',


                }}>
                    <Text>{item}</Text>

                </View>
            </Pressable>
        );
    };
    let [selectedMinYear, setSelectedMinYear] = useState(searchParams.get('minYear') || '');
    let [selectedMaxYear, setSelectedMaxYear] = useState(searchParams.get('maxYear') || '');

    const handleMinYearSelection = (selectedYear) => {
        setSelectedMinYear(selectedYear);
        setIsActive(false);
    };
    const handleMaxYearSelection = (selectedYear) => {
        setSelectedMaxYear(selectedYear);
        setIsActiveMax(false);
    };
    //YEARS FILTERING

    // useEffect(() => {
    //      filterCarData();
    //     handleSearchEnter();  USE THIS IF YOU WANT FAST SEARCH ELSE USE THE OTHER USEEFFECT
    // }, [filterCarMake, filterCarModel, filterBodyType]);

    useEffect(() => {
        handleSearchEnter();
    }, []);



    //filtered data



    //USE IF NEED TO FIND THE LENGTH
    useEffect(() => {
        console.log('ILAN SILA: ');
    }, []);

    const handleCar = (carId) => {
        navigate(`/ProductScreen/${carId}`);
    };

    //render the cards in the flatgrid
    const renderIndividualImage = ({ item }) => {
        const conversion = parseFloat(getConversion);
        const fobPrice = parseFloat(item.fobPrice);
        const dollarRate = Math.floor(fobPrice * conversion).toLocaleString();

        const handlePress = () => {
            handleCar(item.id);
        };
        const imageUrl = imageUrls[item.referenceNumber];
        return (
            <Pressable
                style={({ pressed, hovered }) => [
                    {
                        opacity: pressed ? 0.5 : 1,
                        boxShadow: hovered ? '0 2px 10px rgba(3, 3, 3, 0.3)' : '0 2px 10px rgba(2, 2, 2, 0.1)'
                    }
                ]}
                onPress={handlePress}
            >
                <View style={[{ width: '100%', borderRadius: 5, overflow: 'hidden', zIndex: -2, aspectRatio: screenWidth > 729 ? 600 / 900 : 0.7 }]}>
                    {imageUrl ? (
                        <Image
                            source={{
                                uri: imageUrl
                            }}
                            style={{ resizeMode: 'cover', flex: 1 }}
                        />
                    ) : (
                        null
                    )}
                    <View style={{ padding: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', height: 50 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ alignSelf: 'flex-start', fontWeight: '600', fontSize: 18, marginRight: 5 }} numberOfLines={2} ellipsizeMode="tail">
                                    {item.carName}
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
                            <Text style={{ alignSelf: 'flex-start', fontWeight: '500', fontSize: 16 }}>FOB: $ <Text style={{ color: 'green' }}>{dollarRate}</Text></Text>
                            <Text style={{ alignSelf: 'flex-end' }}>{item.referenceNumber}</Text>
                        </View>
                        <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#aaa' }}>{item.location}</Text>
                        <View style={{ height: 150, backgroundColor: '#e6e6e6', borderRadius: 15, marginTop: 10, boxShadow: '0 2px 10px rgba(3,3,3,0.1)', justifyContent: 'space-between' }}>
                            <Text style={{ padding: 10, textAlign: 'left', fontSize: 14, overflow: item.carDescription.length > 80 ? 'hidden' : 'visible', textOverflow: 'ellipsis' }}>
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
        <View style={{ marginTop: 20 }}>
            <TextInput
                placeholder="Enter Make"
                value={filterCarMake}
                onChangeText={(text) => setFilterCarmake(text)}
            />
            <TextInput
                placeholder="Enter Model"
                value={filterCarModel}
                onChangeText={(text) => setFilterCarModel(text)}
            />
            <TextInput
                placeholder="Enter Body Type"
                value={filterBodyType}
                onChangeText={(text) => setFilterBodyType(text)}
            />
            <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                <TextInput
                    placeholder="Min Price"
                    value={filterMinFob}
                    onChangeText={(text) => setFilterMinFob(text)}
                />
                <TextInput
                    placeholder="Max Price"
                    value={filterMaxFob}
                    onChangeText={(text) => setFilterMaxFob(text)}
                />
            </View>
            <View style={{ flexDirection: 'row', marginHorizontal: 10 }}>
                {/*MIN DATE PICKER*/}
                <View style={{ paddingRight: 5, marginTop: 5, justifyContent: 'center', alignSelf: 'center', }}>
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
                                    <Text>{!selectedMinYear ? 'Select Min Year' : selectedMinYear}</Text>
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
                            <View>
                                <View style={{ height: 200, zIndex: 10, elevation: 5, justifyContent: 'center' }}>
                                    <FlatList
                                        data={reversedYears}
                                        renderItem={renderMinItem}
                                        keyExtractor={(item) => item}
                                        showsVerticalScrollIndicator={false}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </View>
                {/*MAXIMUM DATE PICKER*/}
                <View style={{ paddingRight: 5, marginTop: 5, justifyContent: 'center', alignSelf: 'center', }}>
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
                                    <Text>{!selectedMaxYear ? 'Select Max Year' : selectedMaxYear}</Text>
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
                            <View>
                                <View style={{ height: 200, zIndex: 10, elevation: 5, justifyContent: 'center' }}>
                                <FlatList
                                        data={years}
                                        renderItem={renderMaxItem}
                                        keyExtractor={(item) => item}
                                        showsVerticalScrollIndicator={false}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: 'row', marginHorizontal: 10 }}>
                <TextInput
                    placeholder="Min Mileage"
                    value={filterMinMileage}
                    onChangeText={(text) => setFilterMinMileage(text)}
                />
                <TextInput
                    placeholder="Max Mileage"
                    value={filterMaxMileage}
                    onChangeText={(text) => setFilterMaxMileage(text)}
                />
            </View>
            <View style={{flexDirection: 'row'}}>
                <TextInput
                    placeholder="Min Engine Capacity"
                    value={filterMinDisplacement}
                    onChangeText={(text)=> setFilterMinDisplacement(text)}
                />
                <TextInput
                placeholder="Max Engine Capacity"
                value={filterMaxDisplacement}
                onChangeText={(text) => setFilterMaxDisplacement(text)}
                />
            </View>
            <Button title="Filter" onPress={handleSearchEnter} />




            <FlatGrid
                data={filteredCar}
                itemDimension={350}
                spacing={10}
                renderItem={renderIndividualImage}
            />
        </View>
    )


}

const SearchCarV2 = () => {
    const { searchQueryWorld } = useParams();
    const [searchQuery, setSearchQuery] = useState(searchQueryWorld || '');

    
    const people = [
        { name: 'John Doe', age: 30, weight: 70, height: 180, active: true },
        { name: 'Jane Doe', age: 21, weight: 70, height: 180, active: true },
        { name: 'Mark Big', age: 22, weight: 62, height: 165, active: false },
        { name: 'James Small', age: 26, weight: 69, height: 175, active: false },
        { name: 'Jenard Crub', age: 21, weight: 78, height: 175, active: false },
        { name: 'Brix Crub', age: 29, weight: 65, height: 175, active: false },
        { name: 'Donovel Serval', age: 29, weight: 71, height: 175, active: true },
        { name: 'No weight Guy', age: 29, height: 175, active: true },
        { name: 'Also No weight guy', age: 29, height: 175, active: true },
        { name: 'This also has no weight', age: 29, height: 175, active: true },
        // ...more people
    ];


    return (
        <View>
            <StickyHeader searchQuery={setSearchQuery} />
            {/* <FilteredPeopleList people={people} /> */}
            <FilteredCarList />
        </View>
    );
};

export default SearchCarV2;