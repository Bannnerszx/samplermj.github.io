import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Linking, ScrollView, Animated, Modal, Pressable, TextInput, FlatList, Image, Button } from 'react-native';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { FontAwesome, FontAwesome5, Entypo, MaterialCommunityIcons, Ionicons, AntDesign, Fontisto } from 'react-native-vector-icons';
import { collection, doc, getDoc, setDoc, getFirestore, updateDoc, serverTimestamp, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db, addDoc, fetchSignInMethodsForEmail, app, firebaseConfig } from '../../Firebase/firebaseConfig';
import { AuthContext } from '../../context/AuthProvider';
import { useParams } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BrowserRouter, Route, useNavigate, Link, useHistory } from 'react-router-dom';
import car1 from '../../assets/car1.JPG';
import ProgressStepper from '../ProgressStepper';

const ChatD = () => {


    const flatListRef = useRef(null);
    const { userEmail } = useContext(AuthContext);
    const { chatId } = useParams(); // Use useParams to access the chatId from the route
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);

    // Replace 'firestore' with your Firestore instance
    const firestore = getFirestore(); // Make sure to import getFirestore from Firebase

    useEffect(() => {
        // Set up a real-time listener for messages in the specific chat conversation using chatId
        const unsubscribe = onSnapshot(
            collection(firestore, 'chats', chatId, 'messages'),
            {
                query: orderBy('Time', 'asc'), // Order messages by timestamp
            },
            (snapshot) => {
                const messages = [];
                snapshot.forEach((doc) => {
                    messages.push(doc.data());
                });
                setChatMessages(messages);
            }
        );

        return () => {
            // Unsubscribe from the real-time listener when the component unmounts
            unsubscribe();
        };
    }, [chatId]);

    const handleSend = async () => {

        try {
            // Create a new message document in the chat conversation
            const newMessageDoc = doc(collection(firestore, 'chats', chatId, 'messages'));
            const messageData = {
                sender: userEmail, // Sender's email
                text: message,
                timestamp: serverTimestamp(),
            };

            // Set the message data in the new message document
            await setDoc(newMessageDoc, messageData);
            setMessage('');
            // Clear the message input field
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <View >
            {chatMessages && (
                <View>

                    <FlatList
                        nestedScrollEnabled
                        data={chatMessages
                            .filter((item) => item.timestamp)
                            .sort((a, b) => a.timestamp - b.timestamp)}
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
                <TextInput
                    placeholder='Type your message...'
                    value={message}
                    onChangeText={(text) => setMessage(text)}
                    style={styles.input}
                    onSubmitEditing={() => handleSend()}
                />
                <TouchableOpacity onPress={() => handleSend()}>
                    <Text style={styles.sendButton}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>

    );
};



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
const ProfileFormInquiriesChat = () => {
    //from progress stepper
    const [currentStep, setCurrentStep] = useState({ value: 1 });
    const totalSteps = 8;
    
    const updateSteps = () => {
      setCurrentStep({ value: currentStep.value + 1 });
    };
     
    //from progress stepper


    const { chatId } = useParams();
    const [chatData, setChatData] = useState(null);
    const { userEmail, logout, profileDataAuth } = useContext(AuthContext);

    useEffect(() => {

        if (userEmail) { // Fetch chat data from Firestore based on the chatId
            const fetchChatData = async () => {
                const firestore = getFirestore();
                const chatRef = doc(firestore, 'chats', chatId);

                try {
                    const chatDoc = await getDoc(chatRef);
                    if (chatDoc.exists()) {
                        const chat = chatDoc.data();
                        console.log('Participants:', chat.participants);
                        console.log('User Email:', userEmail);

                        // Check if the user is a participant in this chat
                        if (chat.participants.includes(userEmail)) {
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
        };

    }, [chatId, userEmail, navigate]);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showProfileOptions, setShowProfileOptions] = useState(false);
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

    //get data from firebase
    const [profileData, setProfileData] = useState(null);

    const [editMode, setEditMode] = useState(false);
    const [newFirstName, setNewFirstName] = useState('');
    const newFirstNameRef = useRef('');
    const [newLastName, setNewLastName] = useState('');
    const [newCountry, setNewCountry] = useState('');
    const newLastNameRef = useRef('');

    //handle textInputs
    const handleChangeLastName = (value) => {
        newLastNameRef.current = value
    };
    const handleChangeFirstName = (value) => {
        newFirstNameRef.current = value
    };

    const navigate = useNavigate();
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
                    setNewFirstName(userData.textFirst);
                    setNewLastName(userData.textLast);
                    setNewCountry(userData.country);
                }
            } catch (error) {
                console.log('Profile fetch error:', error);
            }
        };

        getUserProfile();
    }, [userEmail]);

    const handleEdit = () => {
        setEditMode(true);
    };
    //handle textInputs
    //fetch data
    //BREAKPOINT
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
            setScreenHeight(window.height);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);

    //


    //fetch data
    const data = [
        1
    ];
    const renderTransactionDetails = ({ item }) => {
        return (
            <View style={{ position: 'sticky' }}>
                <View style={{ flex: 1, borderWidth: 1 }}>
                    <View style={{ flexDirection: screenWidth < 993 ? 'column' : 'row' }}>
                        <View style={{ flex: screenWidth < 993 ? null : 2, marginBottom: screenWidth < 993 ? 20 : 0 }}>
                            {/* First view content */}
                            <View style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8, padding: 5 }}>
                                <Image source={car1} style={{ width: '100%', height: 350, resizeMode: 'contain' }} />

                            </View>
                        </View>
                        <View style={{ flex: screenWidth < 993 ? null : 3, padding: 5 }}>
                            {/* Middle view content */}
                            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                                    {/* First child view content */}
                                    <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.id}</Text>
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
                                        <Text>DBA-C11 C11-408702</Text>
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
                            <TouchableOpacity onPress={updateSteps}>
                                <Text>Next Step</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>

            </View>


        )
    };


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

    //handle Updates
    const handleUpdate = async () => {
        try {
            const db = getFirestore();
            const userDocRef = doc(db, 'accounts', userEmail);
            await updateDoc(userDocRef, {
                textFirst: newFirstNameRef.current,
                textLast: newLastNameRef.current,
            });

            // Update the profileData state with the edited values
            setProfileData((prevData) => ({

                ...prevData,
                textFirst: newFirstNameRef.current,
                textLast: newLastNameRef.current,

            }));

            setEditMode(false);
        } catch (error) {
            console.log('Update error:', error);
        }
    };
    //handle Updates
    //get data

    //dropdown
    const [showDropdown, setShowDropdown] = useState(false);

    const handleDropdownToggle = () => {
        setShowDropdown(!showDropdown);
    };
    //dropdown ends here

    //render something here

    //render something here

    return (
        <View>
            {chatData && (
                <View style={{ flexDirection: 'row' }}>
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
                                                        justifyContent: 'center'// Adding some border radius for a rounded appearance
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
                                                        justifyContent: 'center'// Adding some border radius for a rounded appearance
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
                                                        justifyContent: 'center'// Adding some border radius for a rounded appearance
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
                                borderWidth: 1,
                                borderColor: '#ccc',
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
                                                // Adding some border radius for a rounded appearance
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
                                                // Adding some border radius for a rounded appearance
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

                    <ScrollView
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        ref={scrollViewRef}
                        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                        style={{ flexDirection: 'column', height: '100vh' }}>
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
                        {/* {showGoToTop && (
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    bottom: 60, // Adjust the position as needed
                                    right: '120%', // Adjust the position as needed
                                    backgroundColor: 'blue',
                                    borderRadius: 30,
                                    padding: 10,
                                    zIndex: 1,
                                }}
                                onPress={handleGoToTop}
                            >
                                <FontAwesome name="arrow-up" size={30} color="white" />
                            </TouchableOpacity>
                        )} */}
                        <View style={{ marginVertical: 10 }}>
                            <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} updateSteps={updateSteps} />
                        </View>
                        <FlatList
                            data={data}
                            renderItem={renderTransactionDetails}
                        />


                        <ChatD />

                    </ScrollView>

                </View>
            )}
        </View>
    )
}

export default ProfileFormInquiriesChat;

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
        backgroundColor: '#fff'
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        margin: 5,
        borderRadius: 5,
    },
    sendButton: {
        backgroundColor: 'blue',
        color: 'white',
        padding: 10,
        borderRadius: 5,
    },

});
