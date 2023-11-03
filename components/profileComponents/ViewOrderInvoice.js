import orderInvoice from '../../assets/ORDER INVOICE PDF.png';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Linking, ScrollView, Animated, Modal, Pressable, TextInput, FlatList, Image, ActivityIndicator, Platform, Button } from 'react-native';
import React, { useEffect, useState, useRef, useContext } from 'react';
import jsPDF from 'jspdf';
import { AuthContext } from '../../context/AuthProvider';
import { useParams } from 'react-router-dom';
import { getStorage, listAll, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirestore, collection, where, query, onSnapshot, doc, getDoc, setDoc, serverTimestamp, orderBy, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db, addDoc, fetchSignInMethodsForEmail, app, firebaseConfig, projectExtensionFirestore, projectExtensionStorage, projectExtensionFirebase } from '../../Firebase/firebaseConfig';

const ViewOrderInvoice = () => {
    const { chatId } = useParams();
    const { userEmail } = useContext(AuthContext);

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
    const [carData, setCarData] = useState({});
    console.log('ALL CARDATA:', carData)
    useEffect(() => {
        const fetchCarData = async () => {
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);

            try {
                const vehicleDoc = await getDoc(vehicleDocRef);
                if (vehicleDoc.exists()) {
                    const vehicleData = vehicleDoc.data();
                    setCarData(vehicleData);
                } else {
                    // Vehicle data not found, set a specific message or data
                    navigate('/vehicle-not-found');// You can set a custom message or data here
                }
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
                // Handle the error, e.g., display an error message.
            }
        };

        if (carId) {
            fetchCarData();
        }
    }, [carId]);

    const [strings, setStrings] = useState([]);
    console.log('strings after setStrings:', carData.regYear);
    //fetching the user's information
    const carFeatures = {
        SafetySystemAnBrSy: carData.SafetySystemAnBrSy ? 'Anti-Lock Braking System (ABS)' : '',
        SafetySystemDrAi: carData.SafetySystemDrAi ? 'Driver Airbag' : '',
        SafetySystemPaAi: carData.SafetySystemPaAi ? 'Passenger Airbag' : '',
        SafetySystemSiAi: carData.SafetySystemSiAi ? 'Side Airbag' : '',
        ComfortAiCoFr: carData.ComfortAiCoFr ? 'Air Conditioning (Front)' : '',
        ComfortAiCoRe: carData.ComfortAiCoRe ? 'Air Conditioning (Rear)' : '',
        ComfortAMFMRa: carData.ComfortAMFMRa ? 'AM/FM Radio' : '',
        ComfortAMFMSt: carData.ComfortAMFMSt ? 'AM/FM Stereo' : '',
        ComfortCDPl: carData.ComfortCDPl ? 'CD Player' : '',
        ComfortCDCh: carData.ComfortCDCh ? 'CD Changer' : '',
        ComfortCrSpCo: carData.ComfortCrSpCo ? 'Cruise Speed Control' : '',
        ComfortDiSp: carData.ComfortDiSp ? 'Digital Speedometer' : '',
        ComfortDVDPl: carData.ComfortDVDPl ? 'DVD Player' : '',
        ComfortHDD: carData.ComfortHDD ? 'Hard Disk Drive' : '',
        ComfortNaSyGPS: carData.ComfortNaSyGPS ? 'Navigation System (GPS)' : '',
        ComfortPoSt: carData.ComfortPoSt ? 'Power Steering' : '',
        ComfortPrAuSy: carData.ComfortPrAuSy ? 'Premium Audio System' : '',
        ComfortReKeSy: carData.ComfortReKeSy ? 'Remote Keyless System' : '',
        ComfortTiStWh: carData.ComfortTiStWh ? 'Tilt Steering Wheel' : '',
        InteriorLeSe: carData.InteriorLeSe ? 'Leather Seats' : '',
        InteriorPoDoLo: carData.InteriorPoDoLo ? 'Power Door Locks' : '',
        InteriorPoMi: carData.InteriorPoMi ? 'Power Mirrors' : '',
        InteriorPoSe: carData.InteriorPoSe ? 'Power Seats' : '',
        InteriorPoWi: carData.InteriorPoWi ? 'Power Windows' : '',
        InteriorReWiDe: carData.InteriorReWiDe ? 'Rear Window Defroster' : '',
        InteriorReWiWi: carData.InteriorReWiWi ? 'Rear Window Wiper' : '',
        InteriorThRoSe: carData.InteriorThRoSe ? 'Third Row Seats' : '',
        InteriorTiGl: carData.InteriorTiGl ? 'Tinted Glasses' : '',
        ExteriorAlWh: carData.ExteriorAlWh ? 'Alloy Wheels' : '',
        ExteriorPoSlDo: carData.ExteriorPoSlDo ? 'Power Sliding Door' : '',
        ExteriorSuRo: carData.ExteriorSuRo ? 'Sunroof' : '',
        SellingPointsCuWh: carData.SellingPointsCuWh ? 'Customized Wheels' : '',
        SellingPointsFuLo: carData.SellingPointsFuLo ? 'Fully Loaded' : '',
        SellingPointsMaHiAv: carData.SellingPointsMaHiAv ? 'Maintenance History Available' : '',
        SellingPointsBrNeTi: carData.SellingPointsBrNeTi ? 'Brand New Tires' : '',
        SellingPointsNoAcHi: carData.SellingPointsNoAcHi ? 'No Accident History' : '',
        SellingPointsNoSmPrOw: carData.SellingPointsNoSmPrOw ? 'Non-Smoking Previous Owner' : '',
        SellingPointsOnOwHi: carData.SellingPointsOnOwHi ? 'One Owner History' : '',
        SellingPointsPeRaTi: carData.SellingPointsPeRaTi ? 'Performance-rated Tires' : '',
        SellingPointsReBo: carData.SellingPointsReBo ? 'Repainted Body' : '',
        SellingPointsTuEn: carData.SellingPointsTuEn ? "Turbo Engine" : '',
        SellingPointsUpAuSy: carData.SellingPointsUpAuSy ? "Upgraded Audio System" : ''
    };
    function displayFeature(feature) {
        return feature ? feature : null;
    }
    let layout = [
        displayFeature(carFeatures.SafetySystemAnBrSy),
        displayFeature(carFeatures.SafetySystemDrAi),
        displayFeature(carFeatures.SafetySystemPaAi),
        displayFeature(carFeatures.SafetySystemSiAi),
        displayFeature(carFeatures.ComfortAiCoFr),
        displayFeature(carFeatures.ComfortAiCoRe),
        displayFeature(carFeatures.ComfortAMFMRa),
        displayFeature(carFeatures.ComfortAMFMSt),
        displayFeature(carFeatures.ComfortCDPl),
        displayFeature(carFeatures.ComfortCDCh),
        displayFeature(carFeatures.ComfortCrSpCo),
        displayFeature(carFeatures.ComfortDiSp),
        displayFeature(carFeatures.ComfortDVDPl),
        displayFeature(carFeatures.ComfortHDD),
        displayFeature(carFeatures.ComfortNaSyGPS),
        displayFeature(carFeatures.ComfortPoSt),
        displayFeature(carFeatures.ComfortPrAuSy),
        displayFeature(carFeatures.ComfortReKeSy),
        displayFeature(carFeatures.ComfortTiStWh),
        displayFeature(carFeatures.InteriorLeSe),
        displayFeature(carFeatures.InteriorPoDoLo),
        displayFeature(carFeatures.InteriorPoMi),
        displayFeature(carFeatures.InteriorPoSe),
        displayFeature(carFeatures.InteriorPoWi),
        displayFeature(carFeatures.InteriorReWiDe),
        displayFeature(carFeatures.InteriorReWiWi),
        displayFeature(carFeatures.InteriorThRoSe),
        displayFeature(carFeatures.InteriorTiGl),
        displayFeature(carFeatures.ExteriorAlWh),
        displayFeature(carFeatures.ExteriorPoSlDo),
        displayFeature(carFeatures.ExteriorSuRo),
        displayFeature(carFeatures.SellingPointsCuWh),
        displayFeature(carFeatures.SellingPointsFuLo),
        displayFeature(carFeatures.SellingPointsMaHiAv),
        displayFeature(carFeatures.SellingPointsBrNeTi),
        displayFeature(carFeatures.SellingPointsNoAcHi),
        displayFeature(carFeatures.SellingPointsNoSmPrOw),
        displayFeature(carFeatures.SellingPointsOnOwHi),
        displayFeature(carFeatures.SellingPointsPeRaTi),
        displayFeature(carData.SellingPointsReBo),
        displayFeature(carData.SellingPointsTuEn),
        displayFeature(carData.SellingPointsUpAuSy)
    ].filter(Boolean).join('/');
    useEffect(() => {
        const fetchUserData = async () => {
            const userDocRef = doc(projectExtensionFirestore, 'chats', chatId);
            try {
                const docSnapshot = await getDoc(userDocRef);
                const orderInvoiceCustomerInfo = docSnapshot.data()?.orderInvoice;
                if (orderInvoiceCustomerInfo) {
                    setStrings([
                        orderInvoiceCustomerInfo.customerInfo.fullName,
                        orderInvoiceCustomerInfo.customerInfo.address + ' ' + orderInvoiceCustomerInfo.customerInfo.city + ' ' + orderInvoiceCustomerInfo.customerInfo.country,
                        orderInvoiceCustomerInfo.customerInfo.telNumber,
                        orderInvoiceCustomerInfo.notifyParty.fullName,
                        orderInvoiceCustomerInfo.notifyParty.address + ' ' + orderInvoiceCustomerInfo.notifyParty.city + ' ' + orderInvoiceCustomerInfo.notifyParty.country,
                        orderInvoiceCustomerInfo.notifyParty.telNumber,
                        carData.regYear + `/` + carData.regMonth, // Add conditional check for carData
                        carData?.mileage + ' km',
                        carData?.engineDisplacement + 'cc',
                        carData?.steering,
                        carData?.fuel,
                        carData?.transmission,
                        carData?.referenceNumber,
                        carData?.chassisNumber,
                        carData?.bodyType,
                        carData?.doors,
                        carData?.numberOfSeats,
                        carData?.exteriorColor,
                        carData?.driveType,
                        carData?.engineDisplacement + 'cc',
                        carData?.modelCode,
                        carData?.carName + ' ' + carData?.modelCode,
                        carData?.exteriorColor + ' ' + carData?.engineDisplacement + 'cc' + ' ' + carData?.transmission + ' ' + carData?.mileage + ' km' + ' ' + carData?.fuel,
                    ]);
                } else {
                    console.log('No proformaInvoice found');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (userEmail && chatId) {
            fetchUserData();
        }
    }, [userEmail, chatId, carData]);

    const [firstImageUrl, setFirstImageUrl] = useState(''); // Replace with the actual carId

    useEffect(() => {
        const carFolderRef = ref(projectExtensionStorage, carId);

        const fetchFirstImage = async () => {
            try {
                const items = await listAll(carFolderRef);

                if (items.items.length > 0) {
                    const imageUrl = await getDownloadURL(items.items[0]);
                    setFirstImageUrl(imageUrl);
                }
            } catch (error) {
                console.error('Error fetching first image:', error);
            }
        };

        fetchFirstImage();
    }, [carId]);
    const generatePDFs = () => {
        const doc = new jsPDF();

        doc.addImage(orderInvoice, 'JPEG', 0, 10, 210, 280, undefined, 'FAST');
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        doc.text(strings[0], 14.5, 80.9, 'left');
        let lineHeight = doc.internal.getLineHeight() / doc.internal.scaleFactor;
        let lines = doc.splitTextToSize(strings[1], 60).length;
        let blockHeight = lines * lineHeight;
        doc.text(strings[1], 14.5, 83.9, { maxWidth: 60, align: 'left' });
        doc.text('Tel Number: ' + strings[2], 14.5, 83.9 + blockHeight, 'left');

        //NOTIFY PARTY
        doc.text(strings[3], 14.5, 108.5, 'left');
        let lineHeightNotify = doc.internal.getLineHeight() / doc.internal.scaleFactor;
        let linesNotify = doc.splitTextToSize(strings[4], 60).length;
        let blockHeightNotify = linesNotify * lineHeightNotify;
        doc.text(strings[4], 14.5, 111.5, { maxWidth: 60, align: 'left' });
        doc.text('Tel Number: ' + strings[5], 14.5, 111.5 + blockHeightNotify, 'left');

        //ITEM DESCRIPTION
        doc.text(carData.referenceNumber, 61.5, 188.3, 'left');

        doc.setFont(undefined, 'bold');
        doc.setFontSize(7);
        const carName = carData.carName + ' ' + carData.modelCode;
        const carFeatures = carData.exteriorColor + ' ' + carData.engineDisplacement + 'cc' + ' ' + carData.transmission + ' ' + carData.mileage + 'km' + ' ' + carData.fuel;
        doc.text(carName, 16.9, 190.9, { maxWidth: 170, align: 'left' });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7);
        doc.text(carFeatures, 16.9, 194, { maxWidth: 170, align: 'left' });
        doc.text(carData.chassisNumber, 40.7, 197.8, { maxWidth: 170, align: 'left' });
        //ITEM DESCRIPTION

        // Convert the PDF to a data URI
        //doc.save('Proforma Invoice.pdf');
        const pdfDataUri = doc.output('datauristring');

        // Create a new window to display the PDF
        const newWindow = window.open();
        newWindow.document.write('<iframe width="100%" height="100%" src="' + pdfDataUri + '"></iframe>');
    };
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => generatePDFs()}>
                <Text style={{ color: 'red', textDecorationLine: 'underline' }}>Invoice.pdf</Text>
            </TouchableOpacity>
        </View>
    )
};

export default ViewOrderInvoice;