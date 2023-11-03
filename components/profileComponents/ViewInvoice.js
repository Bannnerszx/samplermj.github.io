import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Linking, ScrollView, Animated, Modal, Pressable, TextInput, FlatList, Image, ActivityIndicator, Platform, Button } from 'react-native';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { FontAwesome, FontAwesome5, Entypo, MaterialCommunityIcons, Ionicons, AntDesign, Fontisto } from 'react-native-vector-icons';
import { getFirestore, collection, where, query, onSnapshot, doc, getDoc, setDoc, serverTimestamp, orderBy, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db, addDoc, fetchSignInMethodsForEmail, app, firebaseConfig, projectExtensionFirestore, projectExtensionStorage, projectExtensionFirebase } from '../../Firebase/firebaseConfig';
import { AuthContext } from '../../context/AuthProvider';
import { useParams } from 'react-router-dom';
import { getStorage, listAll, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { BrowserRouter, Route, useNavigate, Link, useHistory } from 'react-router-dom';
import car1 from '../../assets/car1.JPG';
import ProgressStepper from '../ProgressStepper';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import ViewShot from 'react-native-view-shot';

import { PDFViewer, ReactPDF, PDFDownloadLink } from "@react-pdf/renderer";
import { usePDF, Margin, Options, Resolution } from 'react-to-pdf';
import * as DocumentPicker from 'expo-document-picker';
import blankPDF from '../../assets/BLANK PDF.png'

const ViewInvoice = () => {
    const { chatId } = useParams();
    const { userEmail } = useContext(AuthContext);
    console.log('chatId', chatId)
    //database fetching
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

    //fetching the logo
    const [logoURL, setLogoURL] = useState('');

    useEffect(() => {
        const carFolderRef = ref(projectExtensionStorage, 'Logo');

        const fetchFirstImage = async () => {
            try {
                const items = await listAll(carFolderRef);

                if (items.items.length > 0) {
                    const imageUrl = await getDownloadURL(items.items[0]);
                    setLogoURL(imageUrl);
                }
            } catch (error) {
                console.error('Error fetching first image:', error);
            }
        };

        fetchFirstImage();
    }, []);

    //fetching account email


    //fetching account email
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
                const proformaInvoiceCustomerInfo = docSnapshot.data()?.proformaInvoice;
                if (proformaInvoiceCustomerInfo) {
                    setStrings([
                        proformaInvoiceCustomerInfo.customerInfo.fullName,
                        proformaInvoiceCustomerInfo.customerInfo.address + ' ' + proformaInvoiceCustomerInfo.customerInfo.country,
                        proformaInvoiceCustomerInfo.customerInfo.telNumber,
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

    // const [slicedUserEmail, setSlicedUserEmail] = useState('');
    // useEffect(() => {
    //     const email = chatId.split('_')[2];
    //     setSlicedUserEmail(email);
    // }, [chatId]);
    // if (userEmail !== slicedUserEmail) {
    //     return <Text>You are not authorized to view this invoice.</Text>;
    // }
    const [imageURLs, setImageURLs] = useState([]);
    const [imagesGenerated, setImagesGenerated] = useState(false);

    useEffect(() => {
        const generateImages = () => {
            const newImageURLs = [];
            strings.forEach((string, index) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                switch (index) {
                    case 6:
                        canvas.width = 150;
                        break;
                    case 18:
                        canvas.width = 400;
                        break;
                    case 19:
                        canvas.width = 450;
                        break;
                    case 20:
                        canvas.width = 350;
                        break;
                    case 9:
                        canvas.width = 120;
                        break;
                    case 2:
                        canvas.width = 250;
                        break;
                    default:
                        canvas.width = 300;
                }
                canvas.height = 18;

                switch (index) {
                    case 18:
                        ctx.font = 'bold 14px Arial';
                        break;
                    default:
                        ctx.font = '14px Arial';
                }

                ctx.fillStyle = 'black';
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillText(string, 0, 15);
                newImageURLs[index] = canvas.toDataURL();
            });

            setImageURLs(newImageURLs);
            setImagesGenerated(true);
        };
        generateImages();
    }, [strings]);
    //fetching the user's information

    //fetching the image
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
    //fetching the image

    //fetch carData

    //database fetching
    const print = async () => {
        var bodyChildNodes = [...document.body.childNodes];
        document.body.innerHTML = html;
        window.print();
        document.body.innerHTML = '';
        bodyChildNodes.forEach(childNode => document.body.appendChild(childNode));
    };
    const html = `
    <style>
    @charset "utf-8";
 #
    /*================================== reset
    */
    
    html, body, div, span, object, iframe,
    h1, h2, h3, h4, h5, h6, p, address,
    abbr, code, pre, samp, blockquote, q, cite,
    img, del, ins, dfn, var, strong, em, small, b, i, sub, sup,
    dl, dt, dd, ol, ul, li,
    form, fieldset, label, legend,
    table, caption, tbody, tfoot, thead, tr, th, td,
    article, aside, details, dialog, figcaption, figure, footer, header,
    hgroup, menu, nav, section, time, mark, audio, video { margin: 0; padding: 0; border: 0; outline: 0; font-style: normal; vertical-align: baseline; background: transparent;}
    
    article, aside, details, dialog,
    figcaption, figure, footer, header, hgroup, nav, section { display: block;}
    
    blockquote, q { quotes: none;}
    
    /*================================== common
    */
    
    body {
        cursor: auto;
        color: #333;
        font: normal normal 12px/1.2 Verdana, Arial, Helvetica, Osaka, sans-serif;
        letter-spacing: 0;
        word-spacing: 0.1em;
    
    /*	word-break: break-all;*/
    }
    
    h1 { padding: 0;}
    h2,h3,h4,h5,h6 { font-weight: bold; padding: 15px 0 10px;}
    
    hr { display: none;}
    
    a img { border: none;}
    
    a			{ color: #0097ec; text-decoration: underline; vertical-align: baseline; cursor: pointer;}
    a:visited	{ color: #0a5ac8;}
    a:hover		{ color: #84d3ff; text-decoration: none;}
    a:active	{ color: #f90;}
    a:focus		{ color: #f90;}
    
    p { padding: 5px 0;}
    
    dl,ul,ol { /*height: 1%;*/ padding: 1.5em 0; margin: 0;}
    ul { list-style: none;}
    ol { list-style: decimal; padding-left: 2em;}
    dt { font-weight: bold;}
    
    strong { color: #f00000;}
    ins { text-decoration: none;}
    mark { background-color: #ff9; color: #000; font-style:italic; font-weight: bold;}
    del { text-decoration: line-through;}
    abbr[title], dfn[title] { border-bottom: 1px dotted #333; cursor:help;}
    
    embed, object, img { vertical-align: bottom;}
    embed, object { outline: none;}
    img { border: none; color: #333; background: transparent;}
    hr { display: none;}
    
    table { width: 100%; border-collapse: collapse; border-spacing: 0; margin: 10px auto;}
    th, td { vertical-align: middle; text-align: left; border: 1px solid #b3b3b3; padding: 0;}
    thead th,
    thead td { text-align: center;}
    th { font-weight: bold;}
    td { padding: 2px;}
    td ul, td dl { height: auto;}
    
    form { padding: 0; margin: 0;}
    fieldset { border: none; padding: 0; margin: 0;}
    legend { padding: 0 0 10px; margin: 0;}
    label { cursor: pointer;}
    input, select { font-family: Verdana, Arial, Helvetica, Osaka, sans-serif; vertical-align: baseline;}
    input { padding: 2px;}
    input[type="text"],input[type="password"],textarea { border: 1px solid #ccc;}
    input[type="button"] { padding: 0 2px;}
    select { border: 1px solid #ccc; padding: 1px;}
    select option { padding: 0 5px;}
    textarea {font: normal normal 12px/1.2 Verdana, Arial, Helvetica, Osaka, sans-serif;}
    
    /*---------------------------------- cleaarfix
    */
    
    .section:after,
    #header:after,
    #footer:after,
    #container:after,
    .clearfix:after { content: "."; display: block; height: 0; clear: both; visibility: hidden;}
    
    .section,
    #header,
    #footer,
    #container,
    .clearfix { display: inline-block;}
    /* for IE7 */
    
    /* Holly Hack Targets IE Win only \*/
    * html .section,
    * html #header,
    * html #footer,
    * html #container,
    * html .clearfix, { height: 1%;}
    .section,
    #header,
    #footer,
    #container,
    .clearfix { display: block;}
    /* End Holly Hack */
    
    
    body { min-width: 1044px;}
    
    #header,
    #container,
    #footer {
        position: relative;
        text-align: left;
        margin: 0 auto;
    }
    
    #header_wrap { background: #f2f2f2 url(../img/common/header_bg.png) repeat-x; border-bottom: 1px solid #e2e2e2;}
    #header { height: 78px; padding: 0 10px;}
    
    #container { padding: 10px 10px 40px;}
    #contents_wrap { position: relative; width: 100%; margin-left: -210px;}
    #contents { padding-left: 210px;}
    #navi { position: relative; width: 200px; z-index: 1;}
    
    #footer_wrap { background: #f2f2f2; border-top: 1px solid #e2e2e2; clear: both;}
    #footer { padding: 10px 10px 20px;}
    
    /*---------------------------------- header
    */
    
    #header h1 { min-height: 16px; height: auto !important; height: 16px; float: left; color: #fff; font-size: 10px; font-weight: normal; padding-top: 2px;}
    
    .header_nav { float: right;}
    .header_nav p { min-height: 16px; height: auto !important; height: 16px; float: left; color: #fff; font-size: 10px; padding: 2px 0 0;}
    .header_nav p a { color: #fff;}
    
    .title { float: left; clear: left; padding: 0 10px 0 0;}
    
    .header_time { height: 1%; float: left; padding: 15px 0 0;}
    .header_time dt {
        background: url(../img/common/icon_time.png) no-repeat 0 6px;
        font-size: 14px;
        font-weight: bold;
        padding: 0 0 2px 14px;
    }
    
    .header_sp { position: absolute; top: 24px; right: 10px; padding: 0;}
    .header_sp li { float: left; padding-left: 1px;}
    .header_sp li img { border: 1px solid #b3b3b3;}
    .header_sp li a {
        display: block;
        width: 64px;
        height: 16px;
        background: #fff;
        color: #333;
        text-align: center;
        text-decoration: none;
        line-height: 16px;
        border: 1px solid #ccc;
    }
    .header_sp li a:hover { opacity: 0.6;}
    
    .header_btn { float: right; clear: right; padding: 32px 0 0;}
    .header_btn li { float: left; padding-left: 5px;}
    .header_btn li a {
        display: block;
        width: 9em;
        color: #fff;
        font-weight: bold;
        text-align: center;
        text-decoration: none;
        border-radius: 4px;
        -ms-border-radius: 4px;
        -moz-border-radius: 4px;
        -webkit-border-radius: 4px;
        padding: 2px;
    }
    .header_btn .contact a { background: #8cc63f; border: 1px solid #72b42c;}
    .header_btn .contact a:hover { background: #b2db7b; border-color: #9ccf61;}
    
    .breadcrumb_list { background: #b3b3b3; border-top: 1px solid #fff;}
    .breadcrumb_list p { font-size: 10px; line-height: 100%; padding: 6px 10px; margin: 0 auto;}
    .breadcrumb_list a { font-weight: bold;}
    
    /*---------------------------------- contents
    */
    
    #contents h2 { font-size: 16px; padding: 10px 0 5px;}
    
    #contents .h_txt {
        color: #0097ec;
        font-size: 14px;
        border-bottom: 1px solid #0097ec;
        padding: 20px 0 8px;
        margin: 0 0 10px;
    }
    #contents .h_txt span {
        color: #fff;
        background: #0097ec;
        padding: 2px 10px;
    }
    
    #contents .memo_title {
        font-weight: bold;
    }
    
    .fs_10 { font-size: 10px;}
    .fs_20 { font-size: 20px;}
    .fw_b { font-weight:bold;}
    
    .dot_style0,
    .dot_style1,
    .dot_style2,
    .arw_style0 { padding: 10px 0;}
    table .dot_style0,
    table .dot_style1,
    table .dot_style2,
    table .arw_style0 { padding: 0;}
    .arw_style0 li { background: url(../img/arw_next0.png) no-repeat 0 9px; padding: 5px 0 5px 12px;}
    .dot_style0 li,
    .dot_style1 li,
    .dot_style2 li { padding: 5px 0 5px 12px;}
    .dot_style0 li { color: #ff7dad; background: url(../img/icon_dot0.png) no-repeat 5px 11px;}
    .dot_style1 li { color: #f00000; background: url(../img/icon_dot1.png) no-repeat 5px 11px;}
    .dot_style2 li { background: url(../img/icon_dot2.png) no-repeat 5px 11px;}
    
    a.btn_style0, input.btn_style0, button.btn_style0,
    a.btn_style1, input.btn_style1, button.btn_style1,
    a.btn_style2, input.btn_style2, button.btn_style2,
    a.btn_style3, input.btn_style3, button.btn_style3,
    a.btn_style4, input.btn_style4, button.btn_style4,
    a.btn_style5, input.btn_style5, button.btn_style5 {
        display: block;
        color: #fff;
        font-weight: bold;
        text-align: center;
        text-decoration: none;
        border-radius: 15px;
        -ms-border-radius: 15px;
        -moz-border-radius: 15px;
        -webkit-border-radius: 15px;
        padding: 3px;
        cursor: pointer;
    }
    a.btn_style3, input.btn_style3, button.btn_style3 { color: #666;}
    
    a.btn_style0, input.btn_style0, button.btn_style0 { background: #0097ec; border: 1px solid #007ee5;}
    a.btn_style1, input.btn_style1, button.btn_style1 { background: #f00; border: 1px solid #e10000;}
    a.btn_style2, input.btn_style2, button.btn_style2 { background: #faa000; border: 1px solid #f88800;}
    a.btn_style3, input.btn_style3, button.btn_style3 { background: #ccc; border: 1px solid #b3b3b3;}
    a.btn_style4, input.btn_style4, button.btn_style4 { background: #ff7dad; border: 1px solid #ff6397;}
    a.btn_style5, input.btn_style5, button.btn_style5 { background: #8cc63f; border: 1px solid #72b42c;}
    
    a.btn_style0:hover, input.btn_style0:hover, button.btn_style0:hover { background: #84d3ff; border-color: #6ac4ff;}
    a.btn_style1:hover, input.btn_style1:hover, button.btn_style1:hover { background: #fa7878; border-color: #f73030;}
    a.btn_style2:hover, input.btn_style2:hover, button.btn_style2:hover { background: #fcc563; border-color: #fbb34b;}
    a.btn_style3:hover, input.btn_style3:hover, button.btn_style3:hover { background: #e6e6e6; border-color: #d8d8d8;}
    a.btn_style4:hover, input.btn_style4:hover, button.btn_style4:hover { background: #ffb3cf; border-color: #ff9dbf;}
    a.btn_style5:hover, input.btn_style5:hover, button.btn_style5:hover { background: #b2db7b; border-color: #9ccf61;}
    
    .title_area { width: 814px;}
    
    .btn_back,
    .btn_set { position: relative; margin-left: 12px;}
    .btn_back a,
    .btn_set a {
        display: inline-block;
        font-weight: bold;
        text-align: center;
        text-decoration: none;
        padding: 5px 10px;
        border-radius: 0 4px 4px 0;
        -ms-border-radius: 0 4px 4px 0;
        -moz-border-radius: 0 4px 4px 0;
        -webkit-border-radius: 0 4px 4px 0;
    }
    .btn_back a:before,
    .btn_set a:before {
        content: " ";
        position: absolute;
        top: 50%;
        right: 100%;
        width: 0;
        height: 0;
        border: 1em solid transparent;
        margin: -1em  0 0;
    }
    
    .btn_back { float: right;}
    .btn_back a { min-width: 6em; color: #666; background: #ccc;}
    .btn_back a:before { border-right-color: #ccc;}
    .btn_back a:hover { background: #e6e6e6;}
    .btn_back a:hover:before { border-right-color: #e6e6e6;}
    
    .btn_set a { color: #fff; background: #f88800;}
    .btn_set a:before { border-right-color: #f88800;}
    .btn_set a:hover { background: #fbb34b;}
    .btn_set a:hover:before { border-right-color: #fbb34b;}
    
    .form_btn,
    .form_btn2 { width: 794px; background: #f2f2f2; padding: 10px; margin: 10px 0 0;}
    .form_btn input { width: 500px; padding: 8px; margin: 0 auto;}
    .form_btn .buttonArea,
    .form_btn2 .buttonArea {
        text-align: center;
    }
    .form_btn .buttonArea input { display: inline; width: 150px;}
    
    .confirm_button {
        padding: 0;
    }
    .confirm_button li {
        display: inline-block;
        display: -moz-inline-box;
        /display: inline;
        /margin-right: 3px;
        /zoom: 1;
    }
    .confirm_button li input { display: block; width: 200px; padding: 8px; margin: 0 auto;}
    
    .edit_stock .confirm_button,
    .batch_processing .confirm_button { width: 630px; padding: 0; margin: 0 auto; overflow: hidden;}
    .edit_stock .confirm_button li,
    .batch_processing .confirm_button li { float: left; padding: 0 5px;}
    .edit_stock .confirm_button li button,
    .batch_processing .confirm_button li button { width: 200px; min-height: 50px; padding: 8px;}
    
    #contents textarea {
        box-sizing: border-box;
        -ms-box-sizing: border-box;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
    }
    
    thead th { background: #0097ec; color: #fff; padding: 2px;}
    
    form abbr[title] { border: none;}
    form abbr img { vertical-align: text-top; padding: 0 2px;}
    
    .fixed_box { width: 814px;}
    .form_line_txt { padding: 0 0 10px;}
    .form_line_txt input[type="reset"],
    .form_line_txt input[type="submit"],
    .form_line_txt input[type="button"] { display: inline; margin-left: 4px; padding-right: 10px; padding-left: 10px;}
    
    .section h2 {
        background: #0097ec url(../img/common/icon_search.png) no-repeat 10px 50%;
        color: #fff;
        font-size: 12px;
        padding: 5px 5px 5px 30px;
        margin: 10px 0 0;
    }
    .section h3 {
        background: #0097ec;
        color: #fff;
        font-size: 12px;
        padding: 5px;
        margin: 10px 0 0;
    }
    .section_inner { padding: 10px; border: 1px solid #b2b2b2;}
    
    .attention_box {
        min-height: 56px;
        height: auto !important;
        height: 56px;
        background: #ffff54 url(../img/icon_attention_l.png) no-repeat 15px 15px;
        color: #f00000;
        border: 3px solid #f00000;
        border-radius: 8px;
        -ms-border-radius: 8px;
        -moz-border-radius: 8px;
        -webkit-border-radius: 8px;
        padding: 10px 10px 10px 84px;
        margin: 5px 0 10px;
    }
    .attention_box li { background: url(../img/icon_dot1.png) no-repeat 4px 9px; padding: 2px 0 2px 12px;}
    
    .succeed_box,
    .error_box {
        background: #e5f6ff;
        border: 3px solid #0097ec;
        border-radius: 8px;
        -ms-border-radius: 8px;
        -moz-border-radius: 8px;
        -webkit-border-radius: 8px;
        padding: 10px;
        margin: 0 0 10px;
    }
    .error_box { background: #ffff54; color: #f00000; border-color: #f00000;}
    .succeed_box p,
    .error_box p { padding: 3px 0;}
    .error_box p a { font-weight: bold;}
    
    .error_text { color: #f00000; background: url(../img/icon_attention_s.png) no-repeat 0 50%; padding-left: 20px;}
    table .error_text { margin-left: 15px;}
    
    .required { color: #f00000;}
    .required:before { content: "*"; padding-right: 2px; color: #f00000;}
    
    .required_area { background-color: #ffdcdc;}
    
    .hr { display: block; border: none; border-top: 1px dashed #999;}
    
    /*---------------------------------- navi
    */
    
    .status_box {
        border: 5px solid #b3b3b3;
        padding: 10px;
        margin: 0 0 20px;
        border-radius: 8px;
        -ms-border-radius: 8px;
        -moz-border-radius: 8px;
        -webkit-border-radius: 8px;
    }
    .status_box p { color: #faa000; font-size: 14px; font-weight: bold; padding: 0 0 6px;}
    .status_box h2 { font-size: 16px; padding: 0;}
    .status_box ul { padding: 0 0 4px;}
    .status_box li { font-size: 10px; padding: 2px 0;}
    .status_box li span { float: left;}
    .status_box li span.icon_num {
        background: #f00000;
        float: right;
        color: #fff;
        font-weight: bold;
        text-align: center;
        border-radius: 4px;
        -ms-border-radius: 4px;
        -moz-border-radius: 4px;
        -webkit-border-radius: 4px;
        padding: 3px 6px;
        margin: -3px 0 0 3px;
    }
    .status_box dl { padding: 0;}
    .status_box dt { color: #498000; padding: 5px 0 0;}
    
    .tab_list {
        border-bottom: 5px solid #666;
        padding: 0;
        margin: 0 0 10px;
        text-align: center;
    }
    .tab_list li {
        display: inline-block;
        width: 38%;
        background: #e6e6e6;
        color: #888;
        font-weight: bold;
        text-align: center;
        border: 1px solid #666;
        border-bottom: 5px solid #666;
        border-radius: 4px 4px 0 0;
        -moz-border-radius: 4px 4px 0 0;
        -webkit-border-radius: 4px 4px 0 0;
        padding: 5px;
        margin-bottom: -5px;
        cursor: pointer;
    }
    .tab_list li.tab_check {
        color: #333;
        background: #fff;
        border-bottom: none;
        padding-bottom: 10px;
    }
    
    .navi_box h3 { padding: 0;}
    .navi_box h3 a {
        display: block;
        min-height: 12px;
        background: #333 url(../img/common/nav_minus.png) no-repeat 3px 50%;
        color: #fff;
        font-size: 12px;
        text-decoration: none;
        line-height: 100%;
        padding: 3px 3px 3px 20px;
    }
    .navi_box h3 img { padding-right: 4px;}
    .navi_box ul { padding: 0 0 10px;}
    .navi_box li a {
        display: block;
        border: 1px solid #b3b3b3;
        border-top: none;
        padding: 6px;
    }
    .navi_box li a:hover { background: #e5f6ff; color: #0097ec; text-decoration: none;}
    
    .navi_contact { padding: 0 0 10px;}
    .navi_contact a { padding: 15px 0;}
    
    /*---------------------------------- container_bnr
    */
    
    .container_bnr { padding: 10px 0 0; clear: both; margin-right: -5px;}
    .container_bnr li { float: left; padding: 0 5px 5px 0;}
    .container_bnr li a:hover { opacity: 0.6;}
    
    /*---------------------------------- footer
    */
    
    .f_contents { float: left;}
    .f_contents dl { padding: 0;}
    .f_contents dt { font-size: 12px; padding-bottom: 5px;}
    
    dl.f_special { padding-bottom: 10px;}
    .f_special dd { float: left; padding-right: 10px;}
    .f_special dd a:hover { opacity: 0.6;}
    
    .f_navi dl { width: 180px; float: left; padding-right: 20px;}
    .corporate_navi { background: #fff; float: right; padding: 10px; border-radius:4px;}
    
    .f_navi dt,
    .corporate_navi dt { margin-bottom: 5px;}
    .f_navi dt { border-bottom: 1px solid #333;}
    .f_navi dd,
    .corporate_navi dd { padding: 0 0 8px; float: left;}
    .f_navi dd a,
    .corporate_navi dd a { padding-left: 15px;}
    .f_navi dd a { background: url(../img/arw4.png) no-repeat 0 5px; color: #333; padding-left: 15px;}
    .corporate_navi dd a { background: url(../img/arw3.png) no-repeat 0 5px;}
    .f_navi dd a:hover,
    .corporate_navi dd a:hover { background-image: url(../img/arw2.png); text-decoration: none;}
    .corporate_navi dd a:hover { color: #0097ec;}
    
    .corporate_navi dt { margin-bottom: 8px;}
    .corporate_navi dd { float: left; padding-right: 15px;}
    
    .copyright { background: #4d4d4d; color: #fff; font-size: 10px; text-align: center;}
    
    /*==================================================================== utility
    */
    
    .clr, .clear { clear: both;}
    
    .aC { text-align: center;}
    .aL { text-align: left;}
    .aR { text-align: right;}
    
    .fL { float: left;}
    .fR { float: right;}
    .imgL { float: left; padding-right: 10px;}
    .imgR { float: right; padding-left: 10px;}
    .imgL img,
    .imgR img { margin-bottom: 5px;}
    
    .footer_pagetop {
        position: fixed;
        right: 20px;
        bottom: -31px;
        padding: 0;
        z-index: 999;
    }
    .footer_pagetop a {
        display: block;
        width: 110px;
        height: 30px;
        background: #333 url(../img/arw5.png) no-repeat 18px 50%;
        float: right;
        color: #fff;
        text-align: center;
        text-decoration: none;
        line-height: 30px;
        border: 1px solid #fff;
        border-bottom: none;
        border-radius: 8px 8px 0 0;
        -ms-border-radius: 8px 8px 0 0;
        -moz-border-radius: 8px 8px 0 0;
        -webkit-border-radius: 8px 8px 0 0;
        padding-left: 10px;
    }
    .footer_pagetop a:hover { background-color: #0097ec;}
    
    /*---------------------------------- popup_box
    */
    
    .popup_box {
        position: fixed;
        top: 50%;
        left: 50%;
        width: 300px;
        height: 100px;
        margin: -50px 0 0 -150px;
        z-index: 2;
        display: none;
    }
    #popup_contact {
        position: fixed;
        top: 50%;
        left: 50%;
        width: 600px;
        height: 480px;
        margin: -275px 0 0 -300px;
        z-index: 2;
        display: none;
    }
    .popup_inner {
        box-sizing: border-box;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        position: relative;
        width: 100%;
        height: 100%;
        background: #fff;
        text-align: center;
        border: 5px solid #0097ec;
        border-radius: 10px;
        -ms-border-radius: 10px;
        -moz-border-radius: 10px;
        -webkit-border-radius: 10px;
        overflow: hidden;
        padding: 0;
    }
    .popup_container {
        height: 70px;
        text-align: center;
        padding: 20px;
        overflow: auto;
    }
    #popup_contact .popup_container {
        height: 450px;
        text-align: left;
        padding: 20px;
        overflow: auto;
    }
    .popup_box input {
        display: inline-block;
    }
    #popup_contact .negotiation_comment ul {text-align: center;}
    #popup_contact .negotiation_comment ul li {width: 192px; margin: 0 auto 5px auto;}
    #popup_contact .negotiation_comment ul li input {width: 192px;}
    #popup_contact .negotiation_comment .pink {color: #ff69b4}
    #popup_contact_comp h2 { font-size: 15px;}
    
    .model_bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1;
        display: none;
    }
    .popup_form_area {
        text-align: center;
    }
 
 #container.login { width: 1004px; padding-bottom: 15px;}
 .login .status_box dl { padding: 0 0 10px;}
 .login .status_box dt { color: #333; padding-bottom: 4px;}
 .login .status_box dd { padding-bottom: 4px;}
 .login .status_box dd input[type="text"] { width: 164px;}
 .login .status_box .login_btn input { width: 140px; margin: 0 auto;}
 
 .login .main_box { float: left;}
 .login .main_box img {}.login .main_box a:hover { opacity: 0.6;}
 
 .login_special { width: 152px; float: right; padding-top: 0;}
 .login_special dt { font-size: 14px;}
 .login_special dd { padding-top: 5px;}
 .login_special dd a:hover { opacity: 0.6;}
 
 #footer_wrap.login_footer { background: #4d4d4d; overflow: hidden;}
 .login_footer .corporate_navi {
     float: left;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     margin: 0;
 }
 .login_footer .corporate_navi dt { margin-bottom: 0;}
 .login_footer .copyright {
     position: absolute;
     bottom: 5px;
     right: 10px;
     background: none;
 }
 
 .auth #header,
 .auth #footer { width: 1004px;}
 
 /*================================== home
 */
 
 .top #contents h2 { color: #0097ec;}
 
 .top .summary_box { background: #e5f6ff; padding: 10px 10px 5px; margin: 0 0 10px;}
 
 .top .sb_sec0,
 .top .sb_sec1,
 .top .sb_sec2 { width: 290px; float: left;}
 .top .sb_sec0,
 .top .sb_sec2 { width: 232px; height: auto !important; min-height: 75px; height: 75px;}
 
 .top .sb_sec0,
 .top .sb_sec1 dl,
 .top .sb_sec2 {
     background: #fff;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     padding: 10px;
 }
 .top .sb_sec2 { background: #ffc;}
 
 .top .sb_sec0 h3,
 .top .sb_sec2 h3 { text-align: center; padding: 0 0 5px;}
 .top .sb_sec0 h3 { color: #faa000; font-size: 18px; padding-top: 10px;}
 .top .sb_sec2 h3 { color: #008000;}
 .top .sb_sec0 p,
 .top .sb_sec2 p { text-align: center; padding: 0 0 5px;}
 .top .sb_sec0 p strong,
 .top .sb_sec2 p strong { font-size: 24px; padding-right: 4px;}
 .top .sb_update { color: #666; font-size: 10px;}
 
 .top .sb_sec1 dl { height: 1%; padding: 15px 10px; margin: 0 10px 5px; overflow: hidden;}
 .top .sb_sec1 dt { float: left; clear: left;}
 .top .sb_sec1 dd { float: right; clear: right;}
 .top .sb_sec1 dd strong { padding-right: 4px;}
 
 
 .top .news_box {
     border: 1px solid #0097ec;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     padding: 10px 20px 20px;
     margin: 0 0 10px;
 }
 .top .news_box dt {
     width: 12.5em;
     background: url(../img/arw4.png) no-repeat 0 50%;
     float: left;
     clear: left;
     padding: 10px 0 10px 15px;
 }
 .top .news_box dd {
     border-bottom: 1px dotted #999;
     padding: 10px 0 10px 13em;
 }
 
 /*================================== add 20140703
 */
 
 .top #contents h2 { padding-bottom: 10px;}
 
 .top #contents .t-dashboard { color: #333;}
 .top .dashboard h3,
 .top .dashboard dl { padding: 0;}
 .top .dashboard .present_rate,
 .top .dashboard .today_offer {
     position: relative;
     height: 12em;
     float: left;
     font-family: 'Pontano Sans', sans-serif;
     border: 2px solid #ccc;
     border-radius: 5px; -ms-border-radius: 5px; -moz-border-radius: 5px; -webkit-border-radius: 5px;
     padding: 10px 15px;
     margin: 40px 60px 60px;
 }
 .top .dashboard .today_offer { width: 420px; margin-right: 0;}
 .top .dashboard .present_rate { width: 180px; float: right; background: #fffde9; margin-left: 0;}
 
 .top .dashboard .present_rate:before,
 .top .dashboard .today_offer:before { position: absolute; top: -5px; left: 10px; width: 20px; height: 40px; content: "";}
 .top .dashboard .today_offer:before { background: url(../img/contents/ribbon0.png) no-repeat;}
 .top .dashboard .present_rate:before { background: url(../img/contents/ribbon1.png) no-repeat;}
 
 .top .dashboard .present_rate h3,
 .top .dashboard .today_offer h3 { font-size: 140%; letter-spacing: 0.05em; padding-left: 25px;}
 .top .dashboard .present_rate h3 { color: #498000;}
 .top .dashboard .today_offer h3{ color: #fa8e00;}
 
 .top .dashboard .today_offer p { color: #f00000; text-align: center; font-size: 800%; padding: 2px 0 0;}
 .top .dashboard .today_offer div { width: 240px; height: 100%; float: left; border-right: 1px dashed #999; padding-right: 20px;}
 .top .dashboard .today_offer dl { position: relative; height: 50%; font-size: 120%; padding-left: 275px;}
 .top .dashboard .today_offer dt { padding-top: 5px;}
 .top .dashboard .today_offer dd { position: absolute; right: 0; bottom: 0; font-size: 240%; text-align: right;}
 
 .top .dashboard .present_rate ul { text-align: center; padding: 18px 0 0;}
 .top .dashboard .present_rate li { font-size: 230%; line-height: 95%;}
 .top .dashboard .present_rate li:first-child { color: #f00000; font-size: 460%;}
 .top .dashboard .present_rate p { text-align: center; letter-spacing: 0.05em; padding: 10px 0 0;}
 
 .top .summary {
     position: relative;
     border: 2px solid #ccc;
     border-top: 6px solid #0097ec;
     border-radius: 5px; -ms-border-radius: 5px; -moz-border-radius: 5px; -webkit-border-radius: 5px;
     padding: 10px;
 }
 .top #contents .summary h2 {
     background: url(../img/contents/icon_summay.png) no-repeat;
     padding: 0 0 10px 30px;
 }
 .top .summary dl { position: relative; padding: 0; overflow: hidden; z-index:10;}
 .top .summary dt,
 .top .summary dd { display: inline-block;}
 .top .summary dt { padding-right: 5px;}
 
 .top .summary .date_box { position: relative; left: 16%;}
 .top .summary .date_box select { margin: 0 5px;}
 
 /*================================== search module
 */
 
 .search_box {
     background: #e6e6e6;
     padding: 10px;
     margin: 5px 0 10px;
 }
 .search_box span { display: block; font-weight: bold;}
 
 .search_box .search_line1 { padding: 4px;}
 .search_box .search_line1 span { float: left; padding: 4px 10px 0 0;}
 .search_box .search_line1 input[type="text"] { width: 55%;}
 
 .search_box .search_line2 > div { width: 512px; float: left; padding: 4px 4px 0;}
 .search_box .search_line3 > div { width: 256px; float: left; padding: 4px 4px 0;}
 .search_box .search_line2 span,
 .search_box .search_line3 span { padding-bottom: 2px;}
 .search_box .search_line2 select,
 .search_box .search_line2 input[type="text"],
 .search_box .search_line3 select,
 .search_box .search_line3 input[type="text"] {
     box-sizing: border-box;
     -ms-box-sizing: border-box;
     -moz-box-sizing: border-box;
     -webkit-box-sizing: border-box;
     width: 100%;
 }
 .search_box select.w_auto,
 .search_box input[type="text"].w_auto { width: auto;}
 .search_box select.w_half,
 .search_box input[type="text"].w_half { width: 40%;}
 
 .search_box .search_check { padding: 5px 5px 0;}
 .search_box .search_line3 .search_check { width: auto; padding-right: 10px;}
 
 .search_box .emphasis_form { background-color:#FFFFCC !important;}
 
 .search_box .option_text { display: inline; float: right; color: #0097ec; text-align: right; text-decoration: underline; padding-right: 14px; cursor: pointer;}
 .search_box .option_text.close { background: url(../img/arw7.png) no-repeat 100% 50%;}
 .search_box .option_text.open { background: url(../img/arw6.png) no-repeat 100% 50%;}
 .search_box .option_text:hover { text-decoration: none;}
 
 .search_box .input_btn { clear: both;}
 .search_box .input_btn input { width: 160px; margin: 10px auto 0;}
 
 .search_box .input_btn2 { clear: both;}
 .search_box .input_btn2 .buttonArea { text-align: center; padding: 5px 0 0;}
 .search_box .input_btn2 .buttonArea ul { padding: 0; }
 .search_box .input_btn2 .buttonArea ul li {
     display: inline-block;
     display: -moz-inline-box;
     /display: inline;
     /margin-right: 3px;
     /zoom: 1;
 }
 .search_box .input_btn2 .buttonArea ul li input { display: block; width: 160px; margin: 10px auto 0; }
 
 .message_no_data { color: #f20000; text-align: center; border: 1px dotted #f20000; padding: 20px 10px; margin-top: 10px; margin-bottom: 10px;}
 .message_no_data li { padding: 2px 0;}
 
 .pager_box { padding: 4px 0px;}
 .pager_box strong { padding-right: 4px;}
 
 .total_text { float: left;}
 .pager_select,
 .pager_text { float: right; padding: 0 0 0 10px;}
 .pager_text { padding: 2px 0 0;}
 .pager_text a {
     display: inline-block;
     border: 1px solid #007ee5;
     color: #0097ec;
     text-decoration: none;
     padding: 2px 6px;
     margin: 0 1px;
 }
 .pager_text a:hover { color: #fff; background: #84d3ff; border-color: #6ac4ff;}
 .pager_text a.here { background: #0097ec; color: #fff;}
 .pager_text a.here:hover { background: #84d3ff;}
 
 .pager_text .prev,
 .pager_text .next { color: #0097ec; text-decoration: underline; border: none; padding: 0;}
 .pager_text .prev { background: url(../img/arw_prev0.png) no-repeat 0 4px; padding: 0 0 0 12px;}
 .pager_text .next { background: url(../img/arw_next0.png) no-repeat 100% 4px; padding: 0 12px 0 0;}
 .pager_text .prev:hover,
 .pager_text .next:hover { color: #84d3ff; text-decoration: none;}
 .pager_text .prev:hover { background: url(../img/arw_prev1.png) no-repeat 0 4px;}
 .pager_text .next:hover { background: url(../img/arw_next1.png) no-repeat 100% 4px;}
 .more_options {display:none;}
 
 .tab_car_list {
     border-bottom: 5px solid #666;
     padding: 0;
     margin: 0;
 }
 .tab_car_list li {
     display: inline-block;
     width: 160px;
     background: #e6e6e6;
     color: #888;
     font-weight: bold;
     text-align: center;
     border: 1px solid #666;
     border-bottom: 5px solid #666;
     border-radius: 4px 4px 0 0;
     -moz-border-radius: 4px 4px 0 0;
     -webkit-border-radius: 4px 4px 0 0;
     padding: 5px;
     margin-bottom: -5px;
     cursor: pointer;
 }
 .tab_car_list li.tab_check {
     color: #333;
     background: #fff;
     border-bottom: none;
     padding-bottom: 10px;
 }
 
 .sort_box { background: #e6e6e6; padding: 5px;}
 .sort_box p { float: left; padding: 0 10px 0 0;}
 .sort_box .sort_sp { padding-top: 3px;}
 .sort_box p a {
     display: block;
     background: #0097ec url(../img/arw0.png) no-repeat 10px 50%;
     border: 1px solid #007ee5;
     color: #fff;
     font-weight: bold;
     text-decoration: none;
     line-height: 100%;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     padding: 5px 16px 5px 24px;
 }
 .sort_box .sort_foot a { background-image: url(../img/arw5.png);}
 .sort_box p a:hover { background-color: #84d3ff; border-color: #6ac4ff;}
 .sort_box ul { float: right; padding: 2px 0 0;}
 .sort_box li { float: left; padding-left: 10px;}
 
 .sort_box p .multiple_sold,
 .sort_box p .multiple_fob {
     background: #f00 url(../img/arw0.png) no-repeat 10px 50%;
     border: 1px solid #e10000;
 }
 .sort_box p .multiple_sold:hover,
 .sort_box p .multiple_fob:hover {
     background: #fa7878 url(../img/arw0.png) no-repeat 10px 50%;
     border: 1px solid #f73030;
 }
 .sort_box p .foot_multiple_sold,
 .sort_box p .foot_multiple_fob {
     background: #f00 url(../img/arw5.png) no-repeat 10px 50%;
     border: 1px solid #e10000;
 }
 .sort_box p .foot_multiple_sold:hover,
 .sort_box p .foot_multiple_fob:hover {
     background: #fa7878 url(../img/arw5.png) no-repeat 10px 50%;
     border: 1px solid #f73030;
 }
 
 .result_cars { border: 1px solid #b3b3b3; margin: 5px 0 10px;}
 .result_cars .car_reserved { width: 80px; background: #e5f6ff; color: #f00000; text-align: center;}
 .result_cars .car_unsold { width: 80px; background: #e5f6ff; color: #000000; text-align: center;}
 .result_cars .unread { background: #e5f6ff; }
 .result_cars td { vertical-align: top; border: 1px dotted #b3b3b3; padding: 5px 10px; border-bottom: solid 1px #b3b3b3;}
 .result_cars .car_check { width: 30px; text-align: center; vertical-align: middle; border-style: solid; padding: 0;}
 .result_cars .car_info { width: 180px;}
 .result_cars .car_info ul { padding: 10px 0 0;}
 
 .result_cars .car_sold { width: 80px; text-align: center; vertical-align: middle; border-right-style: solid;}
 .result_cars .solid { border-bottom:1px solid #b3b3b3;}
 .result_cars .customer_name { padding: 5px 0 0;}
 .result_cars .customer_name.read a { background: url(../img/icon_mail0.png) no-repeat 0 50%; padding: 2px 0 2px 20px;}
 .result_cars .customer_name.unread a { background: url(../img/icon_mail1.png) no-repeat 0 50%; padding: 2px 0 2px 20px;}
 .result_cars .customer_time { font-size: 10px;}
 
 .label_pi a { background: url(../img/icon/icon_pi.gif) no-repeat 0 50%; padding: 2px 0 2px 20px;}
 .label_iv a { background: url(../img/icon/icon_iv.gif) no-repeat 0 50%; padding: 2px 0 2px 20px;}
 
 .result_cars .car_id { font-size: 10px; padding-right: 20px;}
 .result_cars .car_sp { float: left; padding: 4px 0 0;}
 .result_cars .car_sp li { display: inline; color: #ccc; font-weight: bold; padding: 0 2px;}
 .result_cars .car_sp .check { color: #498000;}
 .result_cars .car_edit { padding: 0; float: right;}
 .result_cars .car_edit a { width: 10em;}
 
 .result_cars .tcv_info { float: left; padding: 4px 0 0 20px;}
 
 .result_cars .car_history0 {
     padding: 10px 0px;
     background: #bfdffc;
     text-align: center;
 /*	color:#ff0000;*/
     font-weight: bold;
 }
 .result_cars .car_history1 {
     padding: 10px 0px;
     background: #fcbdbd;
     text-align: center;
 /*	color: #ffff00;*/
     font-weight: bold;
 }
 .result_cars .car_history2 {
     padding: 10px 0px;
     background: #fec052;
     text-align: center;
     font-weight: bold;
 }
 .result_cars .car_history0 div,
 .result_cars .car_history1 div,
 .result_cars .car_history2 div {
     padding-top: 3px;
     font-size: 80%;
 }
 .result_cars .car_history0 a { color: #ff0000;}
 
 .result_cars .car_item { border: none;}
 .result_cars .car_item .car_photo { float: left;}
 .result_cars .car_item dl { padding: 5px 0 0 90px;}
 .result_cars .car_item .car_l { padding-left: 150px;}
 .result_cars .car_item dt { font-size: 14px; padding: 0 0 5px;}
 .result_cars .car_item dd { font-size: 10px; padding: 0 0 5px;}
 .result_cars .car_item .fob { font-size: 12px;}
 .result_cars .car_item .fob.price_bg { background: #ffc; padding: 3px 10px 5px;}
 .result_cars .car_price0 .fob span,
 .result_cars .car_item .fob span { color: #f00000;}
 .result_cars .car_price0 .fob strong,
 .result_cars .car_item .fob strong { font-size: 20px; font-weight: normal;}
 .result_cars .car_item .fR a { width: 10em;}
 
 .result_cars .car_item .fob_box { padding-left: 90px;}
 .result_cars .car_item .fob_box dl {
     display: inline-block;
     border: 4px solid #ff9dbf;
     border-radius: 8px;
     -moz-border-radius: 8px;
     -webkit-border-radius: 8px;
     padding: 4px;
     margin: 0;
 }
 .result_cars .car_item .fob_box dt { color: #498000; padding: 5px 10px 0;}
 .result_cars .car_item .fob_box dd { padding: 5px 10px;}
 .result_cars .car_item .fob_box strong { font-size: 20px;}
 .result_cars .car_item .fob_box em { font-size: 14px; font-weight: bold;}
 .result_cars .car_item .fob_box .fob span { color: #333;}
 .result_cars .car_item .fob_box .total_price { background: #ffc; display: inline-block;}
 .result_cars .car_item .fob_box .total_price span { color: #f00000;}
 
 .result_cars .car_price0,
 .result_cars .car_btn0 { border: none;}
 .result_cars .car_price0 { width: 190px; text-align: right;}
 .result_cars .car_btn0 { width: 130px; vertical-align: bottom; text-align: right;}
 
 .result_cars .car_status { width: 40%; border-style: dotted;}
 .result_cars .car_status ul { padding: 5px 0 0;}
 .result_cars .car_status li {
     display: inline-block;
     width: 40px;
     background: url(../img/arw_flow_off.png) no-repeat 100% 12px;
     font-size: 9px;
     font-weight: bold;
     text-align: center;
     vertical-align: top;
     padding-right: 22px;
     margin-bottom: 5px;
 }
 .result_cars .car_status .last_child { background: none; padding-right: 0; margin-right: 0;}
 .result_cars .car_status li img { width: 40px; border: 1px solid #b3b3b3;}
 .result_cars .car_status dl { padding: 5px 0 0;}
 .result_cars .car_status dt { text-align: center;}
 .result_cars .car_status dt span { background: url(../img/arw_next0.png) no-repeat 0 3px; font-weight: normal; padding: 0 0 4px 10px;}
 .result_cars .car_status dd { color: #498000; font-size: 10px;}
 
 .result_cars .car_status .check { background: url(../img/arw_flow_on.png) no-repeat 100% 12px; color: #0097EC;}
 .result_cars .car_status .last_child.check { background: none;}
 .result_cars .car_status .on img { background: #e5f6ff; border: 1px solid #84d3ff;}
 
 .result_cars .status_sold {font-weight: bold; color: #f00000}
 .result_cars .unstatus_sold {font-weight: bold;}
 
 .result_cars .car_memo .btn_style1,
 .result_cars .car_memo .btn_style2 { display: inline; padding-left: 10px; padding-right: 10px;}
 .result_cars .car_memo p { font-size: 10px; padding-right: 100px;}
 .result_cars .car_memo .fR { padding: 5px 0;}
 .result_cars .form_memo { display: none;}
 
 .result_cars .result_btn { width: 200px; padding: 0;}
 .result_cars .result_btn ul { padding: 5px 10px;}
 .result_cars .result_btn li { padding: 3px 0;}
 
 .result_cars .transfer {background: #e6e6e6; font-weight: bold; font-size: 110%;}
 
 .car_info li { padding: 0 0 5px;}
 .car_price0 .ask {color :#f00000; font-weight: bold; font-size: 20px;}
 .car_price0 .fob {
     display: block;
     background: #ffc;
     padding: 5px;
     margin: 3px 0 6px;
 }
 .car_list .input_btn {text-align: center;}
 .car_list .input_btn input {display: inline-block;}
 
 /*---------------------------------- add 20140501
 */
 
 .result_cars .car_item .car_item_price { min-width: 260px; padding: 5px 0;}
 .result_cars .car_item_list { padding: 0; margin-bottom: -1px; overflow: hidden;}
 .result_cars .car_item_list li {
     box-sizing: border-box;
     -moz-box-sizing: border-box;
     -webkit-box-sizing: border-box;
     width: 33%;
     background: rgba(0, 0, 0, 0.1);
     float: left;
     color: #999;
     font-size: 120%;
     font-weight: bold;
     text-align: center;
     border: 1px solid #fff;
     padding: 3px;
     cursor: pointer;
 }
 .result_cars .car_item_list li:first-child { width: 34%;}
 .result_cars .car_item_list li:hover { color: #333; background: rgba(0, 0, 0, 0.2);}
 .result_cars .car_item_list .item_check,
 .result_cars .car_item_list .item_check:hover { color: #fa8e00; background: #fffbc7; border-bottom-color: transparent;}
 .result_cars .car_item_box { background: #fffbc7; padding: 2px 8px 3px; overflow: hidden; border: 1px solid #fff;}
 .result_cars .car_item_box .car_item_ttl { border-bottom: 1px dotted #666; padding-bottom: 4px; margin-bottom: 4px; overflow: hidden;}
 .result_cars .car_item_box .car_item_ttl div:first-child { color: #498000; font-size: 140%; font-weight: bold; padding-bottom: 2px;}
 .result_cars .car_item_box .car_item_ttl div:first-child span { color: #333; font-size: 70%; font-weight: normal; float: right; padding-top: 4px;}
 .result_cars .car_item_box .car_item_ttl .additional { color: #009900; font-size: 110%; font-weight: bold;}
 .result_cars .car_item_box .price_box { clear: both; line-height: 0.8;}
 .result_cars .car_item_box .pb_ttl { display: block; float: left; clear: left; font-size: 120%; font-weight: bold; padding: 6px 0 4px;}
 .result_cars .car_item_box .pb_price { display: block; float: right; clear: right; font-size: 120%;}
 .result_cars .car_item_box .pb_price strong span { font-size: 160%; font-weight: normal;}
 .result_cars .car_item_box .pb_price.gray,
 .result_cars .car_item_box .pb_price.gray strong { color: #777;}
 
 
 /*================================== negotiation_detail
 */
 
 .negotiation_detail td { padding: 5px 10px;}
 .negotiation_detail .car_sender { width: 200px;}
 .negotiation_detail .car_sender p { font-weight: bold;}
 .negotiation_detail .car_sender ul { padding: 5px 0 10px;}
 .negotiation_detail .car_sender li { padding: 1px 0;}
 .negotiation_detail .car_sender .sub_title { font-weight: bold;}
 .negotiation_detail .car_sender strong { color: #498000;}
 
 .negotiation_detail .car_item .fob_box,
 .negotiation_detail .car_item dl { padding-left: 150px;}
 
 .negotiation_detail .step_box { border: 5px solid #84d3ff; padding: 12px;}
 .negotiation_detail .step_icon { padding: 0 0 10px;}
 .negotiation_detail .step_icon li {
     display: inline-block;
     width: 70px;
     background: url(../img/arw_flow_off.png) no-repeat 100% 25px;
     font-size: 9px;
     font-weight: bold;
     text-align: center;
     vertical-align: top;
     padding-right: 22px;
     margin-right: 4px;
 }
 .negotiation_detail .step_icon .last_child { background: none; padding-right: 0; margin-right: 0;}
 .negotiation_detail .step_icon li span {
     display: block;
     width: 68px;
     border: 1px solid #fff;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     padding: 10px 0;
     margin: 0 auto 4px;
 }
 .negotiation_detail .step_icon .check { background: url(../img/arw_flow_on.png) no-repeat 100% 25px;}
 .negotiation_detail .step_icon .last_child.check { background: none;}
 .negotiation_detail .step_icon .on { color: #0097EC;}
 .negotiation_detail .step_icon .on span { background: #e5f6ff; border: 1px solid #84d3ff;}
 
 .negotiation_detail .step_note { background: #e5f6ff; padding: 10px 20px 15px;}
 .negotiation_detail .step_note dl { border-top: 1px dotted #84d3ff; padding: 10px 0; margin-top: 10px;}
 .negotiation_detail .step_note dt { color: #498000; padding-bottom: 4px;}
 .negotiation_detail .step_note dd { display: inline; padding-right: 24px;}
 .negotiation_detail .step_note ul { padding: 5px 0;}
 .negotiation_detail .step_note li.fL { padding-right: 10px;}
 .negotiation_detail .step_note li a { display: inline; padding-left: 10px; padding-right: 10px;}
 
 #popup_contact h2 { text-align: center; padding: 10px;}
 #popup_contact .result_cars .car_item dt { font-size: 10px; padding: 0 0 5px;}
 #popup_contact .result_cars .car_item .fob { font-size: 10px;}
 #popup_contact .result_cars .car_item .fob strong { font-size: 14px; font-weight: normal;}
 #popup_contact .car_sender { width: 160px;}
 #popup_contact .car_item dl { padding-left: 100px;}
 
 .massage_box h3 { font-size: 16px; padding: 20px 0 5px;}
 
 .massage_btn { padding: 0 0 14px 200px; margin-top: -5px;}
 .recommended_item .massage_btn { padding: 0 0 14px 0px; margin-top: -5px;}
 .massage_btn li a { padding-left: 10px; padding-right: 10px;}
 
 .massage_box .reply_message_area { padding: 0 0 0 200px;}
 .recommended_item .massage_box .reply_message_area,
 .payment_confirmation .massage_box .reply_message_area { padding: 0px;}
 .massage_box form {
     position: relative;
     border: 5px solid #b3b3b3;
     border-radius: 10px;
     -ms-border-radius: 10px;
     -moz-border-radius: 10px;
     -webkit-border-radius: 10px;
     padding: 10px;
     margin: 0 0 10px;
 }
 .massage_box form:after,
 .massage_box form:before {
     bottom: 100%;
     border: solid transparent;
     content: " ";
     height: 0;
     width: 0;
     position: absolute;
     left: 54px;
     pointer-events: none;
 }
 .negotiation_massage_box .massage_box form:after {
     border-color: rgba(255, 255, 255, 0);
     border-bottom-color: #ffffff;
     border-width: 10px;
     margin-left: -10px;
 }
 .negotiation_massage_box .massage_box form:before {
     border-color: rgba(179, 179, 179, 0);
     border-bottom-color: #b3b3b3;
     border-width: 16px;
     margin-left: -16px;
 }
 
 .massage_box form h4 { color: #498000; font-size: 13px; padding: 2px 0 0;}
 .massage_box form .comment_btn_t,
 .massage_box form .comment_btn_b { text-align: right; padding: 0;}
 .massage_box form .comment_btn_t { padding-bottom: 5px;}
 .massage_box form .comment_btn_t a,
 .massage_box form .comment_btn_b a { display: inline; font-size: 10px; padding: 3px 10px;}
 .massage_box form .comment_btn_t .fL { padding-top: 5px;}
 .massage_box form .comment_btn_t .fR { background: url(../img/arw_message.png) no-repeat 0 100%; padding-left: 16px;}
 .massage_box form .comment_btn_t .fR select,
 .massage_box form .comment_btn_t .fR a { float: left; margin-left: 5px;}
 .massage_box form .comment_btn_t .fR .delete_template { padding: 4px 10px;}
 
 .massage_box textarea { width: 100%;}
 .massage_box span.required { display: block; font-size: 10px; padding-top: 4px;}
 .massage_box .form_btn { width: auto;}
 .massage_box .form_btn input { width: 10em;}
 .massage_box .reply_message_area .form_btn .fR { padding-top: 6px;}
 
 .massage_area { padding: 10px 0;}
 
 .massage_txt { position: relative; width: 100%;}
 .rm .massage_txt { float: left; margin-right: -190px;}
 .customer .massage_txt { float: right; margin-left: -190px;}
 .rm .massage_txt > div { padding-right: 190px;}
 .customer .massage_txt > div {padding-left: 190px;}
 .massage_txt p {
     border: 1px solid #b3b3b3;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     padding: 10px 15px;
 }
 .rm .massage_txt p { margin-right: 10px;}
 .customer .massage_txt p { margin-left: 10px;}
 .massage_txt p .title { font-weight: bold; }
 .massage_txt p .ip { color: #b3b3b3; font-size: 80%; padding-top:5px !important;}
 .massage_txt .new { background: #e5f6ff; border: 1px solid #b3b3b3;}
 
 .massage_area dl { position: relative; width: 185px; padding: 0; z-index: 2;}
 .massage_area dt { padding-bottom: 5px;}
 .massage_area dd { font-size: 10px;}
 .massage_area.rm dl { float: right; text-align: right;}
 .massage_area.customer dl { float: left; text-align: left;}
 
 .message_scroll { height: 500px; overflow: auto;}
 
 .negotiation_detail .btn_renegotiation { display: inline; padding-right: 20px; padding-left: 20px;}
 
 /*================================== car_list
 */
 
 .car_list .result_cars .car_item dl { padding-left: 130px;}
 .car_list .result_cars .car_item p.fob { float: left; padding: 0;}
 .car_list .result_cars .car_item .fR { margin-top: -5px;}
 
 /*================================== add_stock
 */
 
 .add_stock .required,
 .edit_stock .required,
 .edit_country .required,
 .edit_port .required,
 .edit_model .required,
 .edit_booking .required { color: #333;}
 
 .edit_country .add_port { display: inline; margin-left: 5px; padding: 2px 20px;}
 
 .edit_country .port_result_box {
     width: 300px;
     border: 3px solid #84d3ff;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     padding: 5px;
     margin-top: 5px;
 }
 .edit_country .port_result_box .port_t { display: inline-block;}
 .edit_country .port_result_box .port_t dl { padding: 0;}
 .edit_country .port_result_box .port_t dd { padding-bottom: 2px;}
 .edit_country .port_result_box .port_width { min-width: 20em; display: inline-block;}
 
 .form_table { width: 814px; margin: 0;}
 .form_table th,
 .form_table td { border: none; border-bottom: 1px dotted #b2b2b2; padding: 5px;}
 
 .form_table th { width: 124px; text-align: right; vertical-align: middle;}
 .form_table td:before { content: ":"; padding-right: 5px;}
 .edit_country .form_table td:before,
 .edit_port .form_table td:before,
 .edit_model .form_table td:before { content: none;}
 .form_table #other_displaysite {width: 130px;}
 .form_list0 { width: 814px;}
 .form_list0 dl { width: 33%; float: left; padding: 0;}
 .form_list0 dt { font-size: 16px; padding: 15px 0 5px;}
 .form_list0 dd { padding: 0 0 2px;}
 
 .form_addbox { width: 814px; position: relative;}
 .form_addbox dl { width: 45%;}
 .form_addbox dt { text-align: center; padding: 0 0 5px;}
 .form_addbox textarea { width: 100%;}
 .form_addbox p { position: absolute; top: 50%; left: 50%; display: inline; text-align: center; margin: -10px 0 0 -30px;}
 .form_addbox p input[type="button"] { width: 60px; text-align: center; margin-bottom: 2px;}
 
 .photo_box {
     width: 800px;
     height: 550px;
     border: 1px solid #b3b3b3;
     padding: 7px;
     margin: 10px 0 0;
     overflow: auto;
 }
 .photo_box li { float: left; width:100px; height:100px; text-align: center; padding: 4px;}
 .photo_box li img { display: block; border: 1px solid #b3b3b3; padding: 2px; margin-bottom: 2px; max-width: 94px; max-height: 78px; text-align:center;}
 
 .list_box0 { color: #ff7dad; font-size: 10px; padding: 10px 0;}
 .list_box0 li { background: url(../img/icon_dot0.png) no-repeat 2px 50%; padding: 2px 0 2px 10px;}
 
 .w100 textarea { width: 814px;}
 
 .selected_option { color: #0097ec; font-weight: bold;}
 .no_selected_option {color: #666;}
 
 .quick_search_box {
     width: 804px;
     background: #0097ec;
     border-radius: 18px;
     padding: 5px;
     margin: 20px 0 5px;
 }
 .quick_search_box p,
 .quick_search_box dl,
 .quick_search_box dt,
 .quick_search_box dd { display: inline; padding: 0;}
 .quick_result_box .quick_title p a,
 .quick_search_box p a {
     display: inline-block;
     background: #fff url(../img/arw3.png) no-repeat 10px 50%;
     font-weight: bold;
     text-decoration: none;
     border-radius: 12px;
     -moz-border-radius: 12px;
     -webkit-border-radius: 12px;
     padding: 4px 20px 5px 25px;
 }
 .quick_result_box .quick_title p a:hover,
 .quick_search_box p a:hover { background: #f00000 url(../img/arw1.png) no-repeat 10px 50%; color: #fff;}
 
 .quick_result_box {
     position: fixed;
     top: 50%;
     left: 50%;
     width: 802px;
     background: #fff;
     border: 5px solid #0097ec;
     border-radius: 10px;
     -ms-border-radius: 10px;
     -moz-border-radius: 10px;
     -webkit-border-radius: 10px;
     padding: 2px 2px 10px;
     margin: -10% 0 0 -405px;
     z-index: 2;
     display: none;
 }
 .quick_result_box .quick_title { background: #0097ec; padding: 5px;}
 .quick_result_box .quick_title p,
 .quick_result_box .quick_title h4 { display: inline-block; padding: 0;}
 .quick_result_box .quick_title h4 { padding-top: 5px;}
 .quick_result_box .quick_title h4,
 .quick_search_box dt { color: #fff; padding-left: 15px;}
 
 .quick_result_box .qr_pager { text-align: center; padding: 10px 0;}
 .quick_result_box .qr_pager li {
     display: inline-block;
     width: 8px;
     height: 8px;
     background: #fff;
     color: #0097ec;
     font-weight: bold;
     text-indent: -9999px;
     vertical-align: middle;
     border: 2px solid #0097ec;
     border-radius: 6px;
     -moz-border-radius: 6px;
     -webkit-border-radius: 6px;
     cursor: pointer;
     margin: 0 1px;
 }
 .quick_result_box .qr_pager li:hover { color: #f90; background: #f90; border: 2px solid #f90;}
 .quick_result_box .qr_pager .check { background: #0097ec;}
 .quick_result_box .qr_pager .prov,
 .quick_result_box .qr_pager .next {
     width: auto;
     height: auto;
     text-indent: inherit;
     text-decoration: underline;
     background: none;
     border: none;
 }
 .quick_result_box .qr_pager .prov:hover,
 .quick_result_box .qr_pager .next:hover { color: #f90; background: none; text-decoration: none; border: none;}
 .quick_result_box .qr_pager .prov { margin-right: 15px;}
 .quick_result_box .qr_pager .next { margin-left: 15px;}
 
 .quick_result_box table,
 .quick_result_box th,
 .quick_result_box td { border: none;}
 .quick_result_box table { width: 780px; margin: 0 auto 15px;}
 .quick_result_box th,
 .quick_result_box td { padding: 5px; border-bottom: 1px dotted #b3b3b3;}
 .quick_result_box th { width: 120px; text-align: right;}
 .quick_result_box th:after { content: ":"; padding-left: 5px;}
 .quick_result_box td { color: #498000; font-weight: bold;}
 
 .quick_result_box .qr_list {
     width: 758px;
     border: 1px solid #ccc;
     border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     padding: 10px;
     margin: 0 auto 10px;
 }
 .quick_result_box .qr_list li { padding: 2px 0;}
 
 .quick_result_box .aC .btn_style0 { display: inline; padding-right: 40px; padding-left: 40px;}
 
 /*================================== car_stock
 */
 
 .stock_car_photo { position: relative; padding: 0; margin: -3px;}
 .stock_car_photo li { width: 106px; float: left; text-align: center; padding: 4px;}
 .stock_car_photo li img { max-height: 75px; max-width: 100px; border: 1px solid #b3b3b3; padding: 2px;}
 
 .car_stock_detail,
 .car_stock_detail th,
 .car_stock_detail td { border: none; border-bottom: 1px dotted #b2b2b2; padding: 4px; margin: 0;}
 .car_stock_detail th { padding-right: 10px;}
 .car_stock_detail .last_child th,
 .car_stock_detail .last_child td { border-bottom: none;}
 
 
 .car_stock_detail th { width: 330px; text-align: right;}
 
 .option_check dd { color: #b2b2b2;}
 .option_check .check { color: #0097ec; font-weight: bold;}
 
 
 /*================================== contact_list
 */
 
 .result_cars .customer_add { width: 33%;}
 .result_cars .customer_add ul { padding: 3px 0 13px;}
 .result_cars .customer_add li { padding: 2px 0;}
 .result_cars .customer_add p { padding: 0;}
 .result_cars .customer_add a { display: inline; padding-left: 10px; padding-right: 10px;}
 .contact_list .input_btn input {display: inline-block;}
 .contact_list .result_cars .car_item {border-bottom: solid 1px #b3b3b3;}
 .contact_list .result_cars .car_item dl { padding-left: 80px;}
 .contact_list .result_cars .car_item dt { font-size: 12px; padding: 0 0 5px;}
 .contact_list .result_cars .car_item dd { font-size: 10px; padding: 0 0 5px;}
 
 /*================================== customer_information
 */
 .customer_information .required { color: #333;}
 .customer_info0,
 .customer_info1 {
     width: 814px;
     border-collapse: separate;
     border-spacing: 2px;
     margin: 10px 0;
 }
 .customer_info2 {
     border-collapse: separate;
     border-spacing: 2px;
     margin: 10px 0;
 }
 
 .customer_info0 .col2-1,
 .customer_info1 .col2-1 { width: 322px;}
 .customer_info0 .col3-1,
 .customer_info0 .col3-2,
 .customer_info1 .col3-1,
 .customer_info1 .col3-2 { width: 160px;}
 .customer_info0 th,
 .customer_info0 td,
 .customer_info1 th,
 .customer_info1 td,
 .customer_info2 th,
 .customer_info2 td { padding: 1px 4px 3px; border: none;}
 .customer_info0 td,
 .customer_info1 td { border-bottom: 1px dotted #b2b2b2;}
 .customer_info0 th,
 .customer_info2 th { background: #f2f2f2; padding: 6px 4px;}
 .customer_info1 th { background: #e5f6ff;}
 
 
 .offer_history .offer_history_inner {
     width: 375px;
     float: left;
     border: 1px solid #b2b2b2;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     padding: 10px;
     margin-right: 10px;
     margin-bottom: 10px;
 }
 .offer_history .last_child { margin-right: 0;}
 .offer_history p { font-size: 10px;}
 .offer_history .car_photo { float: left;}
 .offer_history div { padding: 0 0 0 90px;}
 .offer_history div .fR a { padding-left: 10px; padding-right: 10px;}
 .offer_history dl { padding: 0; clear: right;}
 .offer_history dt { padding: 0 0 5px;min-height: 2.4em;}
 .offer_history dd { font-size: 10px;}
 .offer_history .car_price { font-size: 12px;}
 .offer_history .car_price img { padding-left: 4px;}
 
 /*================================== proforma_invoice
 */
 
 .request_invoice_amendment #contents h3,
 .proforma_invoice #contents h3 { width: 814px; font-size: 14px; padding: 10px 0px 8px;}
 .confirm_invoice_change_request #contents h4,
 .request_invoice_recognition #contents h4,
 .request_invoice_amendment #contents h4,
 .proforma_invoice #contents h4 { color: #faa000; padding: 0px;}
 
 .extend_payment_due_date .result_cars,
 .confirm_invoice_change_request .result_cars,
 .request_invoice_recognition .result_cars,
 .request_invoice_amendment .result_cars,
 .proforma_invoice .result_cars { width: 814px;}
 .confirm_invoice_change_request .car_info,
 .request_invoice_recognition .car_info,
 .request_invoice_amendment .car_info,
 .proforma_invoice .car_info { width: 200px;}
 .confirm_invoice_change_request .customer_name,
 .request_invoice_recognition .customer_name,
 .request_invoice_amendment .customer_name,
 .proforma_invoice .customer_name { font-weight: bold;}
 .confirm_invoice_change_request .car_info ul,
 .request_invoice_recognition .car_info ul,
 .request_invoice_amendment .car_info ul,
 .proforma_invoice .car_info ul { font-size: 10px; padding: 10px 0 0;}
 .confirm_invoice_change_request .car_info li,
 .request_invoice_recognition .car_info li,
 .request_invoice_amendment .car_info li,
 .proforma_invoice .car_info li { padding: 0;}
 .confirm_invoice_change_request .car_info li span,
 .request_invoice_recognition .car_info li span,
 .request_invoice_amendment .car_info li span,
 .proforma_invoice .car_item li span,
 .proforma_invoice .car_info li span { font-weight: bold;}
 .proforma_invoice .car_item ul { padding: 0;}
 
 .extend_payment_due_date .car_item dl,
 .confirm_invoice_change_request .car_item dl,
 .request_invoice_recognition .car_item dl,
 .request_invoice_amendment .car_item dl,
 .proforma_invoice .car_item dl { padding-left: 130px;}
 
 .confirm_invoice_change_request table,
 .request_invoice_recognition table,
 .request_invoice_amendment #form table,
 .proforma_invoice #form table { margin-top: 5px;}
 .confirm_invoice_change_request form th,
 .confirm_invoice_change_request form td,
 .request_invoice_recognition form th,
 .request_invoice_recognition form td,
 .request_invoice_amendment #form th,
 .request_invoice_amendment #form td,
 .proforma_invoice #form th,
 .proforma_invoice #form td { padding: 2px 10px 3px; border: none;}
 .confirm_invoice_change_request form th,
 .request_invoice_recognition form th,
 .request_invoice_amendment #form th,
 .proforma_invoice #form th { width: 160px; background: #f2f2f2;}
 .confirm_invoice_change_request form td,
 .request_invoice_recognition form td,
 .request_invoice_amendment #form td,
 .proforma_invoice #form td { border-bottom: 1px dotted #b2b2b2;}
 .confirm_invoice_change_request form em,
 .request_invoice_recognition form em,
 .request_invoice_amendment #form em,
 .proforma_invoice #form em { color: #498000; font-weight: bold;}
 
 .request_invoice_amendment #form textarea,
 .proforma_invoice #form textarea { width: 608px;}
 
 .confirm_invoice_change_request .tableForm2,
 .request_invoice_recognition .tableForm2,
 .request_invoice_amendment .tableForm2,
 .proforma_invoice .tableForm2 { width: 814px;}
 .confirm_invoice_change_request .tableForm2 table,
 .request_invoice_recognition .tableForm2 table,
 .request_invoice_amendment .tableForm2 table,
 .proforma_invoice .tableForm2 table { width: 400px; border-collapse: separate; border-spacing: 2px;}
 .confirm_invoice_change_request .tableForm2 input[type="text"],
 .request_invoice_recognition .tableForm2 input[type="text"],
 .request_invoice_amendment .tableForm2 input[type="text"],
 .proforma_invoice .tableForm2 input[type="text"] { width: 188px;}
 
 .request_invoice_amendment .form_sec_2line,
 .proforma_invoice .form_sec_2line { width: 296px; padding: 0;}
 .request_invoice_amendment .form_sec_2line dt,
 .proforma_invoice .form_sec_2line dt { color: #faa000; padding: 5px 0 0;}
 .request_invoice_amendment .form_sec_2line dd,
 .proforma_invoice .form_sec_2line dd { padding: 7px 0;}
 .request_invoice_amendment .form_sec_2line dd input[type="text"],
 .proforma_invoice .form_sec_2line dd input[type="text"] { width: 290px; margin: -5px 0;}
 
 .request_invoice_amendment .form_sec_2line dd .discount,
 .proforma_invoice .form_sec_2line dd .discount { color: #f00000;}
 
 .request_invoice_amendment .totalTxt,
 .proforma_invoice .totalTxt { text-align: center; clear: both;}
 .proforma_invoice .totalTxt span { font-size: 16px;}
 
 .request_invoice_amendment .totalTxt span,
 .proforma_invoice .totalTxt span { font-size: 18px; font-weight: bold;}
 
 .request_date {width: 814px;}
 .request_date dl {text-align: right; padding: 0}
 
 .invoice_change_guide_text{font-size: 14px;font-weight:bold;color:#FF0099;}
 
 
 /*================================== request_invoice_recognition
 */
 
 .confirm_invoice_change_request .tableForm2 .fR table,
 .request_invoice_recognition .tableForm2 .fR table { width: 320px; margin-top: 29px;}
 .confirm_invoice_change_request .tableForm2,
 .request_invoice_recognition .tableForm2 { background: url(../img/arw_flow0.png) no-repeat 55% 50%;}
 .request_invoice_recognition .form_btn input { width: 220px;}
 
 /*================================== print_wrap
 */
 #print_wrap {
    max-width: 1024px; /* Limits the width to 1024 pixels */
    margin: 0 auto; /* Centers the element horizontally */
    padding: 80px; /* Resetting padding */
    /* Ensures padding and border are included in the element's total width and height */
}
 .btn_close { font-size: 20px; text-align: center; padding: 20px 0;}
 .btn_print { text-align: right; padding: 5px 0;}
 .btn_print .btn_style0 { display: inline; padding: 5px 100px;}
 
 .print_area { position: relative; padding: 80px 0 0;}
 .print_date { position: absolute; top: 20px; left: 0; width: 1024px; padding: 0;}
 .print_date .fR { font-weight: bold; padding: 44px 0 0;}
 .print_area h2 { font-size: 30px; text-align: center; padding: 20px 0 0;}
 
 .print_area2 { padding: 0 0 15px;}
 .print_area2 .fL,
 .print_area2 .fR { width: 506px; border-bottom: 1px solid #ccc;}
 .print_area2 .print_box0 { border: 1px solid #ccc; border-bottom: none; padding: 15px 15px 10px;}
 .print_area2 .print_list0 { border: 1px solid #ccc; border-bottom: none; padding: 0;}
 .print_area2 .print_list0 li { width: 209px; float: left; padding: 15px 15px 10px;}
 .print_area2 .print_list0 li:first-child { border-right: 1px solid #ccc;}
 .print_area2 .print_list0 h3,
 .print_area2 .print_box0 h3 { font-size: 16px; padding: 0 0 5px;}
 
 .print_info { border: none; margin: 20px 0;}
 .print_info th,
 .print_info td { vertical-align: top; border: none; padding: 0 20px;}
 .print_info .col2-1 { width: 40%;}
 .print_info .col2-2 { width: 60%;}
 .print_info .print_info0 { border-right: 1px dotted #b2b2b2;}
 .print_info dl { padding: 0;}
 .print_info0 dt { padding: 0 0 10px;}
 .print_info1 dt { width: 10em; float: left;}
 .print_info1 dd { padding: 0 0 5px 10.5em;}
 
 .print_attention {
     border: 4px solid #fbb0b0;
     padding: 5px 20px;
     margin: 0 0 10px;
 }
 .print_attention h3 {
     background: url(../img/icon_attention_s.png) no-repeat 0 8px;
     color: #f00;
     padding: 5px 0 0 24px;
 }
 
 .print_detail { background: #e5e6e8; padding: 20px 20px 10px;}
 .print_detail h3 { font-size: 20px; padding: 0 0 10px;}
 .print_detail h4 { font-size: 16px; padding: 10px 0 0;}
 
 .print_detail table { background: #fff; border: 1px solid #333;}
 .print_detail .fL { background: #fff; padding: 5px;}
 .print_detail .print_halfbox { width: 700px; float: right; margin: 0;}
 .print_detail th,
 .print_detail td { border: none; padding: 5px 10px;}
 .print_detail th { width: 160px; background: #f5f6f7;}
 
 .print_detail .print_spec0 { margin-bottom: 0; border-bottom: none;}
 .print_detail .print_spec1 { margin-top: 0; border-top: none;}
 
 .print_detail .print_price { border: none;}
 .print_price .col4-1 { width: 50%;}
 .print_price .col4-2 { width: 20%;}
 .print_price .col4-3 { width: 30%;}
 /*.print_price .col4-4 { width: 20%;}*/
 .print_price th,
 .print_price td { background: inherit; vertical-align: top;}
 .print_price thead th,
 .print_price tfoot td { color: #0097EC; font-weight: bold; text-align: center;}
 .print_price thead th { border-bottom: 2px solid #0097EC;}
 .print_price tfoot td { border: none; border-top: 2px solid #0097EC;}
 .print_price tfoot td.aR { text-align: right;}
 .print_price td strong { color: inherit;}
 .print_detail .print_halfbox tr, .print_detail .print_spec0 tr {
     border: none;
     border-bottom: 1px dotted #2b2b2b;
     padding: 5px 10px;
 }
 .print_note0 {
     background: #fcebeb;
     border: 4px solid #fbb0b0;
     padding: 10px 20px;
 }
 
 @media print {
     .btn_close,
     .btn_print { display: none;}
     @page {
         margin-top: 0.5cm;
         margin-bottom: 0;
         margin-left: 1cm; /* Adjust as needed */
         margin-right: 1cm; /* Adjust as needed */
       }
 }
 
 .required_fields {
     font-size: 12px;
 }
 .print_footer h3,
 .print_footer2 h3 {
     border-top: 2px solid #999;
     padding: 10px 0 5px;
     margin: 10px 0 0;
     font-style: italic;
 }
 .print_footer .fR { width: 265px;}
 .print_footer2 .fR { width: 265px; padding-left: 20px;}
 
 /*================================== view_invoice
 */
 
 .warranty_terms { color: #F00000;}
 
 .view_invoice .sales_agreement,
 .view_invoice .warranty_terms { width: 700px; float:left; padding: 10px;}
 .view_invoice .print_footer .fR img { max-width: 265px;}
 .view_invoice .print_footer .fR p,
 .view_invoice .print_footer2 .fR p {min-height: 60px;}
 .subtotal {display: inline-block;width: 100%; text-align: right;}
 .view_invoice .btn_print div { display: inline;}
 .view_invoice .btn_print .save { padding: 5px 60px;}
 
 .view_invoice .print_area { padding-top: 40px;}
 .view_invoice .print_area2 { font-size: 120%;}
 .view_invoice .print_title { padding-bottom: 10px;}
 .view_invoice .print_detail { padding: 10px 20px;font-size: 120%;}
 
 
 /*================================== order_list
 */
 
 .order_list .result_cars .car_status .btn_style2,
 .order_list .result_cars .car_status .btn_style3 {
     width: 200px;
     margin: 0 auto;
 }
 .order_list .result_cars .guide_text {color:#333;}
 .order_list .car_info .senders_info {border-top: dotted 1px #b3b3b3; margin-top: 5px;}
 .order_list .price_quotation {color: #498000; font-weight: bold; }
 
 /*================================== other_site_order_list
 */
 
 .other_site_order_list .input_btn input {display: inline-block;}
 .other_site_order_list .result_cars .car_item {border-bottom: solid 1px #b3b3b3;}
 .other_site_order_list .result_cars .car_item dl { padding-left: 80px;}
 .other_site_order_list .result_cars .car_item dt { font-size: 12px; padding: 0 0 5px;}
 .other_site_order_list .result_cars .car_item dd { font-size: 10px; padding: 0 0 5px;}
 .other_site_order_list .result_cars .car_status,
 .other_site_contact_detail .result_cars .car_status { width: 180px; border-bottom: solid 1px #b3b3b3;}
 .other_site_order_list .result_cars .car_status ul,
 .other_site_order_list .result_cars .car_status p,
 .other_site_contact_detail .result_cars .car_status ul,
 .other_site_contact_detail .result_cars .car_status p { text-align: center;}
 
 .other_site_order_list .popup_box,
 .other_site_contact_detail .popup_box {
     height: 150px;
 }
 .other_site_order_list .popup_container,
 .other_site_contact_detail .popup_container {
     height: 120px;
 }
 
 /*================================== other_site_contact_detail
 */
 
 .other_site_contact_detail .contact_datetime {
     border: 1px solid #84d3ff;
     padding: 6px 12px;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     float:left;
 }
 
 .other_site_contact_detail .step_box {
     border: 1px solid #84d3ff;
     padding: 7px 12px;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
 }
 .other_site_contact_detail .step_note { padding: 0;}
 
 /*================================== important_notification_detail
 */
 
 .important_notification_detail .message {
     border: 5px solid #84d3ff;
     padding: 12px;
     margin-top: 10px;
 }
 .important_notification_detail .message a {margin-top: 20px; }
 .important_notification_detail .datetime {float: right;}
 .important_notification_detail h3 {color: #498000;}
 
 /*================================== account_setting
 */
 
 #password_confirm {display: none;}
 #required_password {display: none;}
 
 
 #password, #confirm_password {color: #333;}
 .update_msg_box {
     height: auto !important;
     height: 56px;
     background-color: #e5f6ff;
     color: #808080;
     font-weight: bold;
     border: 3px solid #0097ec;
     border-radius: 8px;
     padding: 10px;
     margin: 5px 0 10px;
     text-align: left;
     /*display: none;*/
 }
 .account_setting .fix_info {padding: 8px 0 8px 2px;}
 .account_setting #contents .clearfix {width: 814px; }
 .account_setting #contents .clearfix .fR {padding-top: 10px;}
 
 /*================================== rate_setting
 */
 
 .rate_setting #description {text-align: center; color: #ff7dad;}
 .rate_setting caption {text-align: left; margin-bottom: 10px;color:#666666;font-weight:bold;}
 .rate_setting P.required{text-align:left;padding: 0;}
 #rate_history {margin: 20px 0 0 0; width: 814px; text-align:left;}
 #rate_history td {text-align: center;padding: 5px; width: 33%; }
 
 /*================================== as_date_maintenance
 */
 
 .as_date_maintenance h3 { color: #498000; padding-top: 10px;}
 .as_date_maintenance h3 span {
     color: #333;
     font-weight: normal;
     font-size: 80%;
     padding-left: 10px;
 }
 
 /*================================== issume_mailmagazine
 */
 
 .magazine_status,
 .coupon_status,
 .coupon_status2 {
     background: #ffffcc;
     border-radius: 8px;
     -ms-border-radius: 8px;
     -moz-border-radius: 8px;
     -webkit-border-radius: 8px;
     padding: 10px;
 }
 
 .magazine_status dl,
 .coupon_status dl,
 .coupon_status2 dl { padding: 0; margin: 0;}
 .magazine_status dt,
 .coupon_status dt,
 .coupon_status2 dt { color: #498000; font-size: 16px; padding: 0 0 5px;}
 
 .magazine_status .fL,
 .coupon_status .fL { width: 300px; float: left;}
 .coupon_status2 .fL { width: 500px; float: left;}
 .magazine_status .fL dd,
 .coupon_status .fL dd,
 .coupon_status2 .fL dd { padding: 0 0 5px;}
 
 .magazine_status .fR,
 .coupon_status .fR { width: 450px; float: right;}
 .magazine_status .fR p,
 .coupon_status .fR p {
     background: #fff;
     text-align: center;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     padding: 5px 10px;
 }
 .magazine_status .fR p strong,
 .coupon_status .fR p strong { font-size: 24px;}
 .magazine_status .fR dt,
 .coupon_status .fR dt { padding: 10px 0 5px;}
 .magazine_status .fR dt { font-size: 14px;}
 .magazine_status .fR dd textarea,
 .coupon_status .fR dd textarea {
     width: 450px;
     background: #fff;
     border: 1px solid #b3b3b3;
     padding: 5px;
 }
 
 .magazine_status .fR ul { padding: 0;}
 .magazine_status .fR li { padding: 2px 0 4px;}
 .magazine_status .fR li a {
     background: url(../img/arw3.png) no-repeat 0 5px;
     padding: 0 0 0 15px;
 }
 .magazine_form,
 .coupon_form { padding: 10px 0 0;}
 .magazine_form .magazine_t,
 .magazine_form .magazine_input,
 .coupon_form .coupon_t,
 .coupon_form .coupon_pricedown,
 .coupon_form .coupon_limit,
 .coupon_form .coupon_input { display: inline-block;}
 .magazine_form .magazine_t { min-width: 7em; font-weight: bold; padding-right: 10px;}
 .coupon_form .coupon_t { min-width: 12em; font-weight: bold; padding-right: 10px;}
 .coupon_form .multiple_lines { vertical-align: top;}
 .magazine_form .magazine_input .btn_style2,
 .coupon_form .coupon_input .btn_style2 { display: inline; margin-left: 5px; padding: 1px 4px;}
 .editer_area {
     border: 4px solid #b3b3b3;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     padding: 10px;
     margin: 5px 0;
 }
 
 .coupon_input dl { padding: 0;}
 .coupon_input dd { padding-bottom: 2px;}
 
 .coupon_form .coupon_pricedown { min-width: 10em;}
 .coupon_form .coupon_limit { min-width: 15em;}
 
 .stock_list { padding: 0 2px;}
 .stock_list { padding: 0 2px;}
 .stock_list li { float: left; width: 154px; height: 230px; padding: 0 4px 5px;}
 .recommended_item .stock_list li { padding: 5px; border: 1px solid #84d3ff;}
 .stock_list li img {
     border: 1px solid #b3b3b3;
     max-width: 148px;
     height: 111px;
     padding: 2px;
 }
 .stock_list p { text-align: center; padding: 5px 0 2px;}
 .stock_list p strong { font-size: 14px; padding-left: 2px;}
 .stock_list dl { padding: 0 5px;}
 .stock_list dt { min-height: 28px;}
 .stock_list dd { text-align: center; padding: 15px 0 10px;}
 .stock_list dd a {
     color: #666;
     font-weight: bold;
     text-decoration: none;
     background: #ccc;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     padding: 2px 20px;
 }
 .stock_list dd a:hover { background-color: #e6e6e6;}
 .form_btn input { width: auto; padding: 8px 40px;}
 
 .h_btn { margin: -40px 0 0;}
 
 .popup_select_mailtemplate,
 .popup_select_item { min-height: 360px;}
 .popup_select_mailtemplate .scroll_box,
 .popup_select_item .scroll_box {
     max-height: 320px;
     padding: 0 10px;
     margin: 10px 0 0;
     overflow: auto;
 }
 .popup_select_item table { width: 100%; margin: 10px 0 0;}
 .popup_select_item td { border: none;}
 .popup_select_item tr:nth-child(2n+1) { background: #f2f2f2;}
 
 .popup_select_mailtemplate,
 .popup_select_item { margin-top: -20%;}
 .popup_select_mailtemplate .popup_search,
 .popup_select_item .popup_search {
     background: #e5f6ff;
     border-bottom: 1px solid #0097ec;
     padding: 10px 10px 0;
     margin: 2px 0 5px;
 }
 .popup_select_mailtemplate .popup_search ul,
 .popup_select_item .popup_search ul { padding: 0 0 10px;}
 .popup_select_mailtemplate .popup_search li,
 .popup_select_item .popup_search li { display: inline-block; padding-right: 10px;}
 .popup_select_mailtemplate .popup_search p,
 .popup_select_item .popup_search p { float: right; padding: 0;}
 .popup_select_item .popup_search .car_search { width: 160px; height: 52px;}
 .popup_select_item .pager_box { padding: 10px;}
 .popup_select_item .sort_btn { float: left; padding: 0 15px 0 0;}
 .popup_select_item .sort_btn a {
     display: block;
     background: #0097ec url(../img/arw0.png) no-repeat 10px 50%;
     border: 1px solid #007ee5;
     color: #fff;
     font-weight: bold;
     text-decoration: none;
     line-height: 100%;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     padding: 5px 16px 5px 24px;
 }
 .popup_select_item .sort_btn.sort_foot a { background-image: url(../img/arw5.png);}
 .popup_select_item .sort_btn a:hover { background-color: #84d3ff; border-color: #6ac4ff;}
 .popup_select_item .col0 { width: 30px;}
 .popup_select_item .col1 { width: 90px;}
 .popup_select_item .col3 { width: 30%;}
 .popup_select_item .select_car img { max-width: 80px;}
 .popup_select_item .scroll_box { margin-top: 0;}
 .popup_select_item table { margin: 0;}
 .popup_select_item .select_txt,
 .popup_select_item .select_price { color: inherit; font-weight: normal;}
 .popup_select_item .select_txt dl { padding: 0 5px;}
 .popup_select_item .select_txt dt { font-size: 120%; padding-bottom: 5px;}
 .popup_select_item .select_price strong { font-size: 120%;}
 
 /*================================== mailmagazine_list, coupon_list
 */
 
 .magazine_stop,
 .coupon_stop { color:#888; font-weight: bold; text-align: center; background: #e6e6e6;}
 .magazine_reserve { color:#888; font-weight: bold; text-align: center;}
 .magazine_process,
 .coupon_process { color:#888; font-weight: bold; text-align: center; background: #ffc;}
 .magazine_finish,
 .coupon_finish { color:#0097ec; font-weight: bold; text-align: center;}
 .magazine_target { color:#498000; font-weight: bold;}
 
 /*================================== mailmagazine_detail, coupon_detail
 */
 
 .mailmagazine_detail .form_btn,
 .coupon_detail .form_btn { margin-bottom: 10px;}
 
 .mailmagazine_detail .magazine_result_box,
 .coupon_detail .coupon_result_box {
     border: 3px solid #84d3ff;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
     padding: 3px;
 }
 
 .mailmagazine_detail .magazine_result_box .magazine_t,
 .coupon_detail .coupon_result_box .coupon_t {
     min-width: 5em;
     font-size: 14px;
     text-align: right;
 }
 .mailmagazine_detail .magazine_result_box .magazine_t {
     min-width: inherit;
     text-align: left;
     padding-left: 10px;
 }
 
 .mailmagazine_detail .magazine_result,
 .coupon_detail .coupon_result {
     color:#498000;
 }
 .mailmagazine_detail .magazine_result_status,
 .coupon_detail .coupon_result_status {
     padding:5px 50px 5px 0px;
     color:#888;
     font-weight: bold;
 }
 .mailmagazine_detail .magazine_result_status strong { font-size: 120%;}
 
 .mailmagazine_detail .input_area,
 .coupon_detail .input_area {
     border: 1px solid #84d3ff;
     border-radius: 4px;
     padding: 3px;
 }
 .mailmagazine_detail .input_area .magazine_form { padding-top: 0;}
 
 .mailmagazine_detail .input_area .magazine_form .magazine_t,
 .coupon_detail .input_area .coupon_form .coupon_t {
     min-width: 7em;
     font-weight: bold;
     padding: 0px 0px 0px 10px;
 }
 
 /*================================== country_list
 */
 
 .country_list .col4-1 { width: 30%;}
 .country_list .col4-2 { width: 15%;}
 .country_list .col4-3 { width: 15%;}
 .country_list .col4-4 { width: 30%;}
 .country_list .col4-5 { width: 10%;}
 
 /*================================== port_list
 */
 
 .port_list .col3-1 { width: 35%;}
 .port_list .col3-2 { width: 35%;}
 .port_list .col3-3 { width: 30%;}
 
 /*================================== model_list
 */
 
 .model_list .col2-1 { width: 50%;}
 .model_list .col2-2 { width: 50%;}
 .model_list .sort_change,
 .model_list .sort_change:visited,
 .model_list .sort_change:hover,
 .model_list .sort_change:active,
 .model_list .sort_change:focus { text-decoration: underline; color: #fff;}
 
 /*================================== batch_processing
 */
 
 .batch_processing #contents_wrap { margin-left: 0px;}
 .batch_processing #contents { padding-left: 0px;}
 .batch_processing .form_btn2 { width: auto;}
 .batch_processing .result_cars td { padding: 5px;}
 .batch_processing .result_cars .car_item { border: dotted 1px #b3b3b3;}
 .batch_processing .result_cars .car_item .car_photo,
 .batch_processing .car_memo p { padding: 0px;}
 
 .batch_processing_status {
     background: #ffffcc;
     border-radius: 8px;
     -ms-border-radius: 8px;
     -moz-border-radius: 8px;
     -webkit-border-radius: 8px;
     padding: 10px;
 }
 
 .batch_processing_status dl { padding: 0; margin: 0;}
 .batch_processing_status dt { color: #498000; font-size: 16px; padding: 0 0 5px;}
 .batch_processing_status .fL { width: 300px; float: left;}
 .batch_processing_status .fL dd { padding: 0 0 5px;}
 
 .batch_processing_form { padding: 0; width: 600px;}
 
 .batch_processing_form .update_box {
     height: 2em;
     border: 1px solid #84d3ff;
     padding: 7px 12px;
     margin: 5px 0px;
     border-radius: 4px;
     -ms-border-radius: 4px;
     -moz-border-radius: 4px;
     -webkit-border-radius: 4px;
 }
 
 .batch_processing_form .batch_processing_t,
 .batch_processing_form .batch_processing_input { display: inline-block;}
 .batch_processing_form .batch_processing_t { min-width: 10em; font-weight: bold; padding-right: 10px;}
 .batch_processing_form .batch_processing_input .btn_style2 { display: inline; margin-left: 5px; padding: 1px 4px 0px;}
 
 #popup_too_many_cars { height: 140px; width: 380px;}
 #popup_too_many_cars .popup_container { height: 140px;}
 #popup_too_many_cars h2 { color: #498000;}
 #popup_too_many_cars p { padding: 10px;}
 #popup_too_many_cars input[type="button"] { width: 140px; padding: 5px; margin: 5px;}
 
 .car_area6,.car_area7{text-align:right;}
 .car_area8,btn_edit_fob{text-align:center;}
 
 .car_memo .text_memo{color:#669900;}
 .stock_memo{color:#669900;}
 
 /*================================== delicious
 */
 
 .delicious {
     text-align: center;
     background: #f2f2f2;
     color: #fff;
     padding: 5px;
     margin: 20px 0 5px;
     overflow: hidden;
 }
 .delicious li {
     display: inline-block;
     background: #8e8e8e;
     color: #fff;
 }
 .delicious li span {
     position: relative;
     display: block;
     background: url(../img/delicious_arw0.png) no-repeat 100% 50%;
     text-decoration: none;
     line-height: 20px;
     padding: 0 20px;
     margin-right: -12px;
 }
 .delicious li:first-child span { padding-left: 14px;}
 .delicious li.scope { font-weight: bold; background: #0097ec;}
 .delicious li.scope span { background: url(../img/delicious_arw1.png) no-repeat 100% 50%;}
 /*
 .delicious li.scope:last-child span,
 .delicious li:last-child span { background: none; padding-right: 26px;}
 */
 
 /*================================== market_price_data
 */
 
 .market_price_data #contents h3 {
     background: #0097ec url(../img/common/icon_search.png) no-repeat 10px 50%;
     color: #fff;
     font-size: 14px;
     padding: 4px 30px;
     margin: 10px 0;
 }
 
 .market_price_data .market_box { width: 1024px;}
 
 .market_price_data form dl { padding: 0 0 5px;}
 .market_price_data .market_form0 dt,
 .market_price_data .market_form0 dd { float: left; padding-right: 10px;}
 .market_price_data .market_form0 dt { padding-top: 2px;}
 
 .market_price_data .market_form1 dl { float: left; padding-right: 20px;}
 .market_price_data .market_form1 dt { padding: 0 0 5px;}
 .market_price_data .market_form1 select { width: 180px;}
 .market_price_data .market_form1 .select_box { float: left;}
 .market_price_data .market_form1 span { float: left; padding: 16px 10px 0;}
 .market_price_data .market_form1 span input { width: 80px; margin-top: 5px; padding: 0;}
 .market_price_data form .search_submit { padding: 10px 0 20px;}
 .market_price_data form .search_submit input { width: 160px; margin: 0 auto;}
 
 .market_detail { padding: 0 0 20px;}
 .market_detail .fL { width: 666px;}
 .market_detail .tab_market_list {
     width: 649px;
     border-bottom: 8px solid #38b1f1;
     padding: 5px 0 0;
 }
 .market_detail .tab_market_list li {
     width: 200px;
     height: 30px;
     background: url(../img/contents/market_tab.png) no-repeat;
     float: left;
     color: #fff;
     font-size: 16px;
     font-weight: bold;
     text-align: center;
     text-shadow: 0 1px 1px #666;
     -ms-text-shadow: 0 1px 1px #666;
     -moz-text-shadow: 0 1px 1px #666;
     -webkit-text-shadow: 0 1px 1px #666;
     border: none;
     padding: 10px 0 0;
     margin: 0 5px 0 0;
     cursor: pointer;
 }
 .market_detail .tab_market_list li:hover { background-position: 0 -40px;}
 .market_detail .tab_market_list .tab_market_check,
 .market_detail .tab_market_list .tab_market_check:hover {
     background-position: 0 -80px;
     text-shadow: 0 -1px 1px #0580e8;
     -ms-text-shadow: 0 -1px 1px #0580e8;
     -moz-text-shadow: 0 -1px 1px #0580e8;
     -webkit-text-shadow: 0 -1px 1px #0580e8;
 }
 
 .market_detail .fL table,
 .market_detail .fL th,
 .market_detail .fL td { border: 1px solid #ccc;}
 .market_detail .fL table { width: 649px; margin: 0;}
 .market_detail .fL col { width: 5.2%;}
 .market_detail .fL .col0 { width: 70px;}
 .market_detail .fL .col1 { width: 8%;}
 .market_detail .fL th,
 .market_detail .fL td { font-weight: normal; text-align: center; padding: 8px 2px;}
 .market_detail .fL th { background: #e6e6e6; color: #333;}
 .market_detail .fL thead th { font-size: 10px;}
 .market_detail .sub { background: #e5f6ff;}
 
 .market_detail .scroll_area { height: 378px; overflow: auto;}
 .market_detail .more10 { background: #8cc63f;}
 .market_detail .more5 { background: #a6cf72;}
 .market_detail .more3 { background: #c6e0a4;}
 .market_detail .more1 { background: #def0c7;}
 .market_detail .less1 { background: #f1fce3;}
 
 .market_detail .fR { width: 110px; border: 1px solid #ccc; margin: 45px 0 0; padding: 10px 10px 15px;}
 .market_detail .fR dt { color: #0097ec; font-size: 14px; border-bottom: 1px dotted #666; padding: 0 0 5px;}
 .market_detail .fR dd { padding: 10px 0 0;}
 
 .market_price_data .sort_box { padding-right: 10px; padding-left: 10px;}
 .market_price_data .sort_box ul { padding-top: 5px;}
 
 .market_app_list th,
 .market_app_list td { padding: 5px;}
 .market_app_list thead th { background: #808080;}
 .market_app_list td strong span { font-size: 16px;}
 
 .market_app_list .col0,
 .market_app_list .col1,
 .market_app_list .col3,
 .market_app_list .col4 { width: 8%;}
 .market_app_list .col2,
 .market_app_list .col6 { width: 12%;}
 
 .market_app_list table { border-collapse: separate; border-spacing: 1px; border: none; margin: 0;}
 .market_app_list table td { color: #999; font-size: 10px; border: none; text-align: center;}
 .market_app_list .check { color: #333; background: #84d3ff;}
 
 /*================================== tcv_order_import, original_invoice_import
 */
 
 .tcv_order_import .customer_info0 th,
 .original_invoice_import .customer_info0 th { width: 200px;}
 .tcv_order_import .customer_info0 td dl,
 .original_invoice_import .customer_info0 td dl { padding: 6px 0;}
 .tcv_order_import .customer_info0 td dt,
 .original_invoice_import .customer_info0 td dt { font-weight: normal; padding-bottom: 6px;}
 .tcv_order_import .customer_info0 td dd,
 .original_invoice_import .customer_info0 td dd { padding: 0 0 2px;}
 
 .tcv_order_import .required_tr th,
 .original_invoice_import .required_tr th { color: #333; background: #ffdcdc;}
 .tcv_order_import .required_box span,
 .original_invoice_import .required_box span {
     display: block;
     width: 30px;
     height: 14px;
     background: #ffdcdc;
     float: left;
     margin: 2px 4px 0 0;
 }
 
 .original_invoice_import .customer_width { min-width: 6em; display: inline-block;}
 .original_invoice_import .car_width { min-width: 15em; display: inline-block;}
 .original_invoice_import .del { display: inline; padding: 2px 10px; margin: 2px 5px;}
 
 /*================================== booking_list
 */
 
 .booking_list .search_line3 .search_check { width: 514px;}
 .booking_list .result_cars .car_item { border-bottom: 1px solid #b3b3b3;}
 .car_sender .h_label,
 .car_info .h_label {
     height: 22px;
     background: #ffc;
     color: #f00;
     font-weight: bold;
     text-align: center;
     line-height: 22px;
     border: 2px solid #f00;
     border-radius: 12px;
     -ms-border-radius: 12px;
     -moz-border-radius: 12px;
     -webkit-border-radius: 12px;
     padding: 0;
     margin: 5px 0 0;
 }
 .car_sender .tcv_label,
 .car_info .tcv_label {
     height: 20px;
     width: 60px;
     background:#FFFF00;
     color: #f00;
     font-weight: bold;
     text-align: center;
     line-height: 20px;
 /*	border: 2px solid #f00;*/
     border-radius: 12px;
     -ms-border-radius: 12px;
     -moz-border-radius: 12px;
     -webkit-border-radius: 12px;
     padding: 0;
     margin: 2px 0 0 0;
 }
 .tcv_info .tcv_label {
     background:#FFFF00;
     color: #f00;
     font-weight: bold;
     text-align: center;
     border-radius: 12px;
     -ms-border-radius: 12px;
     -moz-border-radius: 12px;
     -webkit-border-radius: 12px;
     padding: 2px 14px;
     margin: 2px 0 0 0;
 }
 .car_sender .h_name,
 .car_info .h_name { color: #090; font-size: 140%; font-weight: bold;}
 
 .shiping_info dl {
     background: rgba(0, 0, 0, 0.08);
     padding: 5px 10px;
     margin: 5px 0;
 }
 .shiping_info dt { padding-bottom: 4px;}
 
 .doc_dl p a { font-size: 120%; font-weight: bold;}
 .doc_dl ul { color: #999; padding: 5px 0 0;}
 .doc_dl li { padding: 3px 0;}
 
 .booking_list .result_cars .car_status { width: auto;}
 
 /*================================== edit_booking
 */
 
 .edit_booking .car_sender ul { padding-top: 10px;}
 .edit_booking .car_sender li { padding-bottom: 5px;}
 
 .edit_booking .car_item dl ul { padding: 5px 0 0;}
 .edit_booking .car_item dl li { padding: 2px 6px; overflow: hidden;}
 .edit_booking .car_item dl li span { display: block; width: 9em; float: left;}
 .edit_booking .car_item dl li span:after { content: ":"; float: right; padding-right: 4px;}
 
 .edit_booking .rcap_url {
     background: #ffc;
     border: 2px solid #0097ec;
     border-radius: 8px;
     -ms-border-radius: 8px;
     -moz-border-radius: 8px;
     -webkit-border-radius: 8px;
     padding: 8px 10px;
     margin: 0 0 10px;
 }
 .edit_booking .rcap_url span { font-weight: bold; padding-right: 10px;}
 .edit_booking .rcap_url span:after { content: ":"; padding-left: 10px;}
 
 .edit_booking .inner_link { padding: 20px 0 5px;}
 .edit_booking .inner_link li { display: inline; font-weight: bold; padding-right: 10px;}
 .edit_booking .inner_link li a { background: url(../img/arw6.png) no-repeat 0 0.4em; padding-left: 14px;}
 .edit_booking .inner_link li a:hover { color: #f90; background: url(../img/arw8.png) no-repeat 0 0.4em;}
 
 .booking_form .section_inner { position: relative;}
 .booking_form .fL,
 .booking_form .fR { width: 380px;}
 .booking_form .fR.button_in { padding-bottom: 60px;}
 
 .booking_form .form_btn { position: absolute; bottom: 10px; right: 10px; width: auto; background: none; padding: 0; margin: 0;}
 .booking_form .form_btn input { width: 140px;}
 
 .booking_form h3 { overflow: hidden;}
 .booking_form h3 a { float: right; color: #fbe323;}
 .booking_form h4 { color: #090; font-size: 120%; padding: 5px 0 0; overflow: hidden;}
 .booking_form h4 a { font-size: 85%; float: right;}
 .booking_form h4 select { float: right; margin-top: -20px;}
 
 
 .booking_form h5 {
     background: url(../img/arw2.png) no-repeat 5px 50%;
     color: #faa000;
     font-size: 100%;
     padding: 2px 0 2px 19px;
 }
 .booking_form dl { padding: 0 0 6px; overflow: hidden;}
 .booking_form dt { width: 12em; float: left; text-align: right; padding-top: 6px;}
 .booking_form dd { padding: 6px 0 6px 13em; border-bottom: 1px dotted #aaa;}
 
 .booking_form table,
 .booking_form th,
 .booking_form td { border: none;}
 .booking_form th { width: 12em; text-align: right; padding: 6px 0;}
 .booking_form td a { margin-right: 10px;}
 .booking_form td input[type="file"] { width: 160px;}
 .booking_form .del { display: inline; padding: 2px 10px; margin: 2px 5px 2px 0; /* float: right; */}
 
 .booking_form dt:after,
 .booking_form th:after { content: ":"; padding: 0 5px;}
 
 .booking_status { margin-bottom: 20px;}
 
 .booking_status .bs_th0,
 .booking_status .bs_th1,
 .booking_status .bs_th2 { width: 15%;}
 
 .booking_status th,
 .booking_status td { padding: 6px;}
 .booking_status thead th { background: #666;}
 .booking_status th { background: #f2f2f2; text-align: center;}
 .booking_status td { line-height: 1.4;}
 
 .booking_status .forwarder { background: #fbe323;}
 .booking_status .check,
 #inspection_info_form .check { color: #090; font-weight: bold;}
 .booking_status .untreated,
 #inspection_info_form .untreated { color: #f00; font-weight: bold;}
 
 #popup_h_no_update { height: auto;}
 #popup_h_no_update .popup_container { height: auto;}
 #popup_h_no_update .h_name { color: #090; font-size: 140%; font-weight: bold;}
 #popup_h_no_update .chg_txt { color: #faa000; font-size: 100%; font-weight: bold;}
 
 /*================================== tracking_number_upload
 */
 
 .tracking_number_upload .memo { background: #ddd; padding: 10px; margin: 5px 0 20px;}
 .tracking_number_upload .memo li { background: url(../img/icon_dot2.png) no-repeat 6px 50%; padding: 2px 0 2px 18px;}
 
 .agree_price_data_file_upload .form_table th,
 .buyer_data_upload .form_table th,
 .stock_data_file_upload .form_table th,
 .tracking_number_upload .form_table th,
 .aa_fit_data_file_upload .form_table th,
 .aa_fit_pdf_file_upload .form_table th { width: 140px;}
 
 .agree_price_data_file_upload .upload_list,
 .buyer_data_upload .upload_list,
 .stock_data_file_upload .upload_list,
 .tracking_number_upload .upload_list,
 .aa_fit_data_file_upload .upload_list,
 .aa_fit_pdf_file_upload .upload_list { padding: 25px 0 5px;}
 
 .agree_price_data_file_upload .upload_list p,
 .buyer_data_upload .upload_list p,
 .stock_data_file_upload .upload_list p,
 .tracking_number_upload .upload_list p,
 .aa_fit_data_file_upload .upload_list p,
 .aa_fit_pdf_file_upload .upload_list p {
     display: inline;
     background: url(../img/arw10.png) no-repeat 0 4px;
     font-weight: bold;
     padding: 0 15px 0 14px;
 }
 
 .agree_price_data_file_upload .upload_list .result,
 .buyer_data_upload .upload_list .result,
 .stock_data_file_upload .upload_list .result,
 .tracking_number_upload .upload_list .result,
 .aa_fit_data_file_upload .upload_list .result,
 .aa_fit_pdf_file_upload .upload_list .result { color: #498000;}
 
 .agree_price_data_file_upload .upload_list .error,
 .buyer_data_upload .upload_list .error,
 .stock_data_file_upload .upload_list .error,
 .tracking_number_upload .upload_list .error,
 .aa_fit_data_file_upload .upload_list .error,
 .aa_fit_pdf_file_upload .upload_list .error { color: #f00000;}
 
 .agree_price_data_file_upload .upload_box,
 .buyer_data_upload .upload_box,
 .stock_data_file_upload .upload_box,
 .tracking_number_upload .upload_box,
 .aa_fit_data_file_upload .upload_box,
 .aa_fit_pdf_file_upload .upload_box { margin: 0;}
 
 .agree_price_data_file_upload .upload_box th,
 .agree_price_data_file_upload .upload_box td,
 .buyer_data_upload .upload_box th,
 .buyer_data_upload .upload_box td,
 .stock_data_file_upload .upload_box th,
 .stock_data_file_upload .upload_box td,
 .tracking_number_upload .upload_box th,
 .tracking_number_upload .upload_box td,
 .aa_fit_data_file_upload .upload_box th,
 .aa_fit_data_file_upload .upload_box td,
 .aa_fit_pdf_file_upload .upload_box th,
 .aa_fit_pdf_file_upload .upload_box td { padding: 8px; border: none;}
 
 .agree_price_data_file_upload .upload_box th,
 .buyer_data_upload .upload_box th,
 .stock_data_file_upload .upload_box th,
 .tracking_number_upload .upload_box th,
 .aa_fit_data_file_upload .upload_box th { width: 240px; padding-right: 0;}
 
 .aa_fit_pdf_file_upload .upload_box th { width: 500px; padding-right: 0;}
 
 .agree_price_data_file_upload .upload_box th:after,
 .buyer_data_upload .upload_box th:after,
 .stock_data_file_upload .upload_box th:after,
 .tracking_number_upload .upload_box th:after,
 .aa_fit_data_file_upload .upload_box th:after,
 .aa_fit_pdf_file_upload .upload_box th:after { content: ":"; float: right; padding-left: 8px;}
 
 .agree_price_data_file_upload .upload_box .error,
 .buyer_data_upload .upload_box .error,
 .stock_data_file_upload .upload_box .error,
 .tracking_number_upload .upload_box .error,
 .aa_fit_data_file_upload .upload_box .error,
 .aa_fit_pdf_file_upload .upload_box .error { color: #f00000; font-weight: bold;}
 
 .agree_price_data_file_upload .section,
 .buyer_data_upload .section,
 .stock_data_file_upload .section,
 .tracking_number_upload .section,
 .aa_fit_data_file_upload .section,
 .aa_fit_pdf_file_upload .section { border: 1px solid #ccc; padding: 5px; margin: 0;}
 
 .agree_price_data_file_upload .section table,
 .buyer_data_upload .section table,
 .stock_data_file_upload .section table,
 .tracking_number_upload .section table,
 .aa_fit_data_file_upload .section table,
 .aa_fit_pdf_file_upload .section table { width: 100%;}
 
 .agree_price_data_file_upload .section .form_btn,
 .buyer_data_upload .section .form_btn,
 .stock_data_file_upload .section .form_btn,
 .tracking_number_upload .section .form_btn,
 .aa_fit_data_file_upload .section .form_btn,
 .aa_fit_pdf_file_upload .section .form_btn { width: auto;}
 
 /*================================== request_car_list
 */
 
 .request_car_list .result_cars .price { color: #009900;}
 .request_car_list .result_cars .price span { font-size: 20px;}
 
 /*================================== payment_confirmation
 */
 
 .payment_form { padding: 8px 0px 8px 3px;}
 .payment_form .payment_t {
     display: inline-block;
     min-width: 16em;
     font-weight: bold;
     padding-right: 10px;
 }
 .popup_edit_form { padding: 8px 0px 8px 3px;}
 .popup_edit_form .popup_edit_t {
     display: inline-block;
     min-width: 12em;
     font-weight: bold;
     text-align: left;
 }
 
 #popup_edit_payment_history,
 #popup_del_payment_history {
     height: 200px;
     width: 380px;
 }
 #popup_edit_payment_history .popup_container,
 #popup_del_payment_history .popup_container {
     height: 200px;
 }
 
 /*================================== batch_processing
 */
 
 #contents .popup_batch_processing_form h2 {
     color: #090;
     text-align: left;
     padding: 0 0 5px;
 }
 .popup_batch_processing_form table { margin: 3px 0;}
 .popup_batch_processing_form td { padding: 7px 5px;}
 .popup_batch_processing_form th { width: 80px; padding: 2px 5px;}
 .popup_batch_processing_form .grossProfitA th { background: #e2f7c9;}
 .popup_batch_processing_form .grossProfitB th { background: #f2f2f2;}
 .popup_batch_processing_form td select,
 .popup_batch_processing_form td input {
     box-sizing: border-box;
     -webkit-box-sizing: border-box;
     -moz-box-sizing: border-box;
     width: 100%;
     margin: -5px 0;
 }
 
 .popup_batch_processing_form .grossProfitB { position: relative;}
 .popup_batch_processing_form .grossProfitB .fL table { width: 318px;}
 .popup_batch_processing_form .grossProfitB .fR table { width: 310px;}
 .popup_batch_processing_form .grossProfitB .end { position: absolute; bottom: 0;}
 
 .popup_batch_processing_form .grossProfitC thead th { width: 81px;}
 .popup_batch_processing_form .grossProfitC .baseColor { background: #f88800;}
 .popup_batch_processing_form .grossProfitC .color0 { background: #ffdee0;}
 .popup_batch_processing_form .grossProfitC .color1 { background: #d0f5fa;}
 .popup_batch_processing_form .grossProfitC tbody td span { font-size: 115%; font-weight: bold;}
 
 .popup_batch_processing_form .grossProfitD thead a { color: #fff; margin-left: 10px;}
 .popup_batch_processing_form .grossProfitD thead a:hover { color: #fbe323;}
 .popup_batch_processing_form .scroll_area { height: 350px; overflow: auto; margin-bottom: 10px;}
 
 .popup_batch_processing_form .form_btn { width: auto;}
 .popup_batch_processing_form .btn_recalc { font-size: 100%; padding: 10px 0; margin: 0 50px;}
 .popup_batch_processing_form .btn_close { font-size: 100%; padding: 10px 0 0; margin: 0 50px;}
 
 .popup_batch_processing_form .blue { color: #0000ff;}
 .popup_batch_processing_form .red { color: #ff0000;}
 
 /*================================== popup_edit_fob
 */
 
 #contents .popup_edit_fob h2 {
     color: #090;
     text-align: center;
     padding: 0 0 5px;
 }
 #popup_edit_fob table { margin: 3px 0;}
 #popup_edit_fob td { padding: 7px 5px;}
 #popup_edit_fob th { width: 180px; padding: 2px 5px; background: #f2f2f2;}
 #popup_edit_fob td textarea,
 #popup_edit_fob td input {
     box-sizing: border-box;
     -webkit-box-sizing: border-box;
     -moz-box-sizing: border-box;
     width: 100%;
 }
 #popup_edit_fob td textarea {
     height: 10em;
 }
 
 #popup_edit_fob .btn_style1,
 #popup_edit_fob .btn_style3 { width: 100px; margin-top: 10px;}
 
    </style>
    <body class="view_profarma_invoice" style="border: 2px solid red;">

 
    <div id="print_wrap">
    
    <div class="print_area">
    <h2>Proforma Invoice</h2>
    <ul class="print_date clearfix">
    <li class="fL"><img src="${logoURL}" alt="Real Motor Japan"></li>
    <li class="fR">DATE : Oct/06/2023(JST)</li>
    </ul>
    
    <table class="print_info">
    <colgroup><col class="col2-1">
    <col class="col2-2">
    
    </colgroup><tbody><tr>
    <td class="print_info0"><dl>
    <dt>Buyer Information</dt>
    <dd>
    <img src="${imageURLs[0]}" alt="Generated Image" /><br>
    <img src="${imageURLs[1]}" alt="Generated Image" /><br>
    TEL1 :<img src=${imageURLs[2]} alt="Generated Image" /><br>
    TEL2 : Optional<br>FAX : 
    </dd>
    </dl></td>
    <td class="print_info1"><dl class="clearfix">
    <dt>Shipper</dt>
    <dd>Real Motor Japan(YANAGISAWA HD CO.,LTD)<br>
    26-2 Takara Tsutsumi-cho&nbsp;Toyota - city Aichi prefecture&nbsp;Japan<br>
    TEL : +81-0565-85-0602<br>
    FAX : +81-565-85-0606</dd>
    <dt>From</dt>
    <dd>KOBE/Japan</dd>
    <dt>To</dt>
    <dd>Dar es Salaam/Tanzania</dd>
    <dt>Payment Due</dt>
    <dd>Oct/10/2023(JST)</dd>
    <dt>Payment Terms</dt>
    <dd>100% before due date by T/T remittance</dd>
    </dl></td>
    </tr>
    </tbody></table>
    
    <div class="print_attention">
    <h3>Bank information will be provided ONLY after you order the item.</h3>
    <p>After confirming the details on the Porforma Invoice, please press [Order Item]button through Real motor Japan system in order to view the bank information.</p>
    </div>
    
    <div class="print_detail">
    <h3>${carData.carName} ${carData.carDescription}</h3>
    <div class="clearfix">
    <p class="fL cars_photo_check"><img src="${firstImageUrl}" alt=" " width="240"></p>
    <table class="print_halfbox">
    <tbody>
    <tr>
    <th scope="row">Year/Month</th>
    <td><img src=${imageURLs[3]} alt="Generated Image" /></td>
    </tr>
    <tr>
    <th scope="row">Odometer</th>
    <td><img src=${imageURLs[4]} alt="Generated Image" /></td>
    </tr>
    <tr>
    <th scope="row">Displacement</th>
    <td><img src=${imageURLs[16]} alt="Generated Image" /></td>
    </tr>
    <tr>
    <th>Steering</th>
    <td><img src=${imageURLs[6]} alt="Generated Image" /></td>
    </tr>
    <tr>
    <th scope="row">Fuel</th>
    <td><img src=${imageURLs[7]} alt="Generated Image" /></td>
    </tr>
    <tr>
    <th scope="row">Transmission</th>
    <td><img src=${imageURLs[8]} alt="Generated Image" /></td>
    </tr>
    <tr>
    <th scope="row">Model code</th>
    <td><img src=${imageURLs[17]} alt="Generated Image" /></td>
    </tr>
    <tr>
    <th scope="row">Location</th>
    <td>Japan</td>
    </tr>
    </tbody>
    </table>
    </div>
    <p class="aR">Reference No : <img src=${imageURLs[9]} alt="Generated Image" /></p>
    
    <h4>Specific information</h4>
    <table class="print_spec0">
    <tbody><tr>
    <th scope="row">VIN/Serial No.</th>
    <td><img src=${imageURLs[10]} alt="Generated Image" /></td>
    <th scope="row">Door</th>
    <td>5</td>
    </tr>
    <tr>
    <th scope="row">Body Style</th>
    <td><img src=${imageURLs[11]} alt="Generated Image" /></td>
    <th scope="row">Drive Type</th>
    <td><img src=${imageURLs[15]} alt="Generated Image" /></td>
    </tr>
    <tr>
    <th scope="row">Number Of Passengers</th>
    <td><img src=${imageURLs[13]} alt="Generated Image" /></td>
    <th scope="row">Interior Color</th>
    <td></td>
    </tr>
    <tr>
    <th scope="row">Exterior Color</th>
    <td><img src=${imageURLs[14]} alt="Generated Image" /></td>
    <th scope="row">Condition</th>
    <td>Used</td>
    </tr>
    </tbody></table>
    <table class="print_spec1">
    <tbody><tr>
    <th scope="row">Option</th>
    <td colspan="3">${layout}</td>
    </tr>
    </tbody></table>
    
    <table class="print_price">
    <colgroup><col class="col4-1">
    <col class="col4-2">
    <col class="col4-3">
    
    
    </colgroup><thead>
    <tr>
    <th scope="col">Item Description</th>
    <th scope="col">Quantity</th>
    <th scope="col">Amount</th>
    </tr>
    </thead>
    
    <tfoot>
    <tr>
    <td>TOTAL</td>
    <td>1unit C&amp;F Dar es Salaam</td>
    <td class="aR">US$3,155</td>
    </tr>
    </tfoot>
    
    <tbody>
    <tr>
    <td>
    USED VEHICLE<br>
    <strong><img src=${imageURLs[18]} alt="Generated Image" /></strong><br>
    <img src=${imageURLs[19]} alt="Generated Image" /><br>
    Chassis Number： <img src=${imageURLs[10]} alt="Generated Image" /><br>
    
    </td>
    <td class="aC"><br>1unit</td>
    <td class="aC">C&amp;F Dar es Salaam<br>
    <span class="subtotal">US$3,155</span>
    </td>
    </tr>
    <tr>
    <td>FOB
    <br>Freight</td>
    <td class="aC"></td>
    <td class="aR">US$1,565<br>US$1,590</td>
    </tr>
    
    </tbody>
    </table>
    </div><!-- /print_sec0 -->
    <p class="sales_agreement">・The Buyer should bear the cost of Bank Charge when remitting T/T.<br>
    ・No Warranty Service as used car<br>
    Order cancellation conditions<br>
    (1)the order cancelation penalty would be USD220 once you paid.<br>
    (2) if you purchased the vehicle with a pre-ship inspection, the amount would be Non-Refundable.<br>
    the intermediary bank information:<br>
    SUMITOMO MITSUI BANKING CORPORATION (NEW YORK BRANCH)<br>
    Swift code: SMBCUS33<br>
    address: 277 Park Avenue<br>
    City: New York, NY<br>
    Post Code: 10172<br>
    Country: USA<br>
    Payment Account</p>
    
    
    </div><!-- /print_area -->
    
    </div><!-- /print_wrap -->
    </body>
 
     `;
    const printToFile = async () => {

        // On iOS/android prints the given html. On web prints the HTML from the current page.
        const { uri } = await Print.printToFileAsync({ html });
        console.log('File has been saved to:', uri);
        await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    };

    let captureRef = null;

    // Function to capture a screenshot and save it as a PDF
    const captureScreenShot = async () => {
        if (captureRef) {
            const uri = await captureRef.capture();
            let options = {
                html: `<img src="${uri}" />`,
                fileName: 'test',
                directory: 'Documents',
            };

            let file = await RNHTMLtoPDF.convert(options);
            console.log(file.filePath);
        }
    };

    const generatePDF = async () => {
        // Select the div you want to turn into a PDF
        const div = document.querySelector('#your-div-id');

        // Convert the div to a canvas using html2canvas
        const canvas = await html2canvas(div);

        // Create a new jsPDF instance
        const pdf = new jsPDF();

        // Add the canvas as an image on a PDF page
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0);

        // Download the PDF
        pdf.save('download.pdf');
    };
    const { toPDF, targetRef } = usePDF({
        filename: 'page.pdf',
        overrides: {
            pdf: {
                compress: true
            },
            canvas: {
                useCORS: true
            }
        },
        resolution: Resolution.MEDIUM,
        canvas: {
            // default is 'image/jpeg' for better size performance
            mimeType: "image/jpeg",
        },
        page: {
            format: 'A4'
        },

    });
    const trimmedCarDescription = `${carData.carDescription}`.trim();


    let description = carData.carDescription;
    if (description) {
        description = description.replace(/★/g, '').replace(/\s+/g, ' ').trim();
    } else {
        console.log("carData.carDescription is undefined");
    }
    const carInfoString = carData.carName + ' ' + description;


    const generatePDFs = () => {
        const doc = new jsPDF();

        doc.addImage(blankPDF, 'JPEG', 0, 10, 210, 280, undefined, 'FAST');
        var img = document.createElement('img');
        img.src = firstImageUrl;
        doc.addImage(img, 'JPEG', 20, 113, 45, 35);
        doc.setFont(undefined, 'bold');
        doc.setFont('helvetica');
        doc.setFontSize(12);
        doc.text(20, 101.1, carInfoString, { maxWidth: 170, charSpace: 0.2 });
        // doc.text(, 20, 110.9, 'left');

        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        //BOX ON THE RIGHT
        doc.text(`${carData.regYear}`, 107, 114, 'right');
        doc.text(`${carData.mileage} km`, 113, 119, 'right');
        doc.text(`${carData.engineDisplacement}cc`, 109.7, 124, 'right');
        doc.text(`${carData.steering}`, 107.8, 129, 'right');
        doc.text(`${carData.fuel}`, 120.2, 133.7, 'right');
        doc.text(`${carData.transmission}`, 113.8, 138, 'right');
        doc.text(`${carData.modelCode}`, 117.6, 143, 'right');
        //BOX ON THE RIGHT

        //REFERENCE NUMBER
        doc.text(`${carData.referenceNumber}`, 197.4, 152.4, 'right');

        //SPECIFIC INFORMATION BOX
        //left side
        doc.text(`${carData.chassisNumber}`, 49.1, 164.9, 'left');
        doc.text(`${carData.bodyType}`, 49.1, 169.4, 'left');
        doc.text(`${carData.chassisNumber}`, 49.1, 164.9, 'left');
        doc.text(`${carData.bodyType}`, 49.1, 169.4, 'left');
        doc.text(`${carData.numberOfSeats}`, 49.1, 174.1, 'left');
        doc.text(`${carData.exteriorColor}`, 49.1, 179.2, 'left');
        //OPTION LAYOUT
        doc.text(layout, 37.4, 183, { maxWidth: 170, align: 'left' });
        //OPTION LAYOUT
        //right side
        doc.text(`${carData.doors}`, 139.9, 164.9, 'left');
        doc.text(`${carData.driveType}`, 139.9, 169.4, 'left');

        //buyer information
        doc.text(strings[0], 15, 55, 'left')
        let lineHeight = doc.internal.getLineHeight() / doc.internal.scaleFactor;
        let lines = doc.splitTextToSize(strings[1], 60).length;
        let blockHeight = lines * lineHeight;
        doc.text(strings[1], 15, 58, { maxWidth: 60, align: 'left' });
        doc.text('Tel Number: ' + strings[2], 15, 58 + blockHeight, 'left');

        //buyer information

        //USED VEHICLE
        doc.setFont(undefined, 'bold');
        doc.setFontSize(7);
        const carName = carData.carName + ' ' + carData.modelCode;
        const carFeatures = carData.exteriorColor + ' ' + carData.engineDisplacement + 'cc' + ' ' + carData.transmission + ' ' + carData.mileage + 'km' + ' ' + carData.fuel;
        doc.text(carName, 16.9, 203, { maxWidth: 170, align: 'left' });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7);
        doc.text(carFeatures, 16.9, 206, { maxWidth: 170, align: 'left' });
        doc.text(carData.chassisNumber, 36.9, 208.8, { maxWidth: 170, align: 'left' });

        //SPECIFIC INFORMATION BOX

        // Convert the PDF to a data URI
        doc.save('Proforma Invoice.pdf');
        // const pdfDataUri = doc.output('datauristring');

        // // Create a new window to display the PDF
        // const newWindow = window.open();
        // newWindow.document.write('<iframe width="100%" height="100%" src="' + pdfDataUri + '"></iframe>');
    };


    //UPLOAD FILES
    const uploadFile = async (file) => {
        const storageRef = ref(projectExtensionStorage, 'ProformaInvoice/' + file.name);
        await uploadBytes(storageRef, file);
    };
    const handleUploadFirebase = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });

        if (result.type === 'success') {
            const { uri, name, type } = result;
            const response = await fetch(uri);
            const blob = await response.blob();

            // Ensure file has .pdf extension
            const filename = name.endsWith('.pdf') ? name : `${name}.pdf`;

            const file = new File([blob], filename, { type: 'application/pdf' });

            try {
                await uploadFile(file);
                console.log('File uploaded successfully');
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    };
    //UPLOAD FILES
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => generatePDFs()} style={{ backgroundColor: '#7b9cff', padding: 5, justifyContent: 'center' }}>
                <Text>CLICK HERE</Text>
            </TouchableOpacity>
            {/* <View style={{ width: '100%', flex: 1, aspectRatio: 0.8 }} ref={targetRef}>
                <Image
                    source={blankPDF}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                />
                <View style={{ position: 'relative', bottom: '62%', left: '5%' }}>
                    <Image source={{ uri: firstImageUrl }} style={{ width: 400, height: 300, resizeMode: 'cover' }} />
                </View>
            </View> */}
            {/* <button onClick={generateImages}>Generate Image</button> */}
            {/* {showThis && (
                <>
                    <TouchableOpacity onPress={printImage}>
                        <Text>Print Invoice</Text>
                    </TouchableOpacity>
                    <View>
                        <img
                            src={imageURL}
                            style={{ width: '597px', height: '900px' }}
                        />
                    </View>
                </>
            )} */}


        </View>
    );
};

export default ViewInvoice;



// const [hideThis, setHideThis] = useState(false);
// const generatePDF = async (html) => {
//     const pdf = new jsPDF();

//     // Set the scale to fit the content on a single page
//     pdf.internal.scaleFactor = 2.25; // Adjust this value as needed

//     // Convert the HTML content to PDF
//     pdf.fromHTML(html, 15, 15);

//     // Save the PDF
//     pdf.save('output.pdf');
// };
// const printImages = async () => {
//     let printWindow = window.open('', '_blank');
//     printWindow.document.write(html);
//     printWindow.document.close();
//     printWindow.onload = function () {
//         element.style.border = 'none';
//         printWindow.print();
//     };
// };


// const printHTML = async () => {
//     const htmlContent = '<html><body><h1>Hello World</h1></body></html>'; // Your HTML content here

//     try {
//         const { uri } = await Print.printAsync({
//             html: htmlContent,
//         });
//         console.log('Printed document at:', uri);
//     } catch (error) {
//         console.error('Error printing:', error);
//     }
// };

// const downloadPdf = (element) => {
//     html2canvas(element).then((canvas) => {
//         const imgData = canvas.toDataURL('image/png');
//         const pdf = new jsPDF();
//         pdf.addImage(imgData, 'PNG', 0, 0);
//         pdf.save('downloaded.pdf');
//     });
// };

// const handleDownload = () => {
//     const element = document.getElementById('your-html-container-id'); // Change this to the specific element you want to convert
//     downloadPdf(element);
// };
// const createAndDownloadPDF = () => {
//     // Create a new jsPDF instance
//     const pdf = new jsPDF();

//     // Use the html() method of jsPDF instance to add the HTML content to the PDF
//     pdf.html(html, {
//         callback: function (pdf) {
//             // Save the PDF with a name
//             pdf.save('download.pdf');

//             // Convert the PDF to a data URL
//             const pdfDataUrl = pdf.output('datauristring');

//             // Create an iframe and append it to the body
//             const iframe = document.createElement('iframe');
//             iframe.style.width = '100%';
//             iframe.style.height = '100%';
//             document.body.appendChild(iframe);

//             // Set the src of the iframe to the data URL of the PDF
//             iframe.src = pdfDataUrl;
//         }
//     });
// };
// const handlePrint = () => {
//     const printWindow = window.open('', '_blank');
//     const htmlToPrint = `
//       <style type="text/css">
//         @media print {
//           @page {
//             margin: 0;
//           }
//           body {
//             border: none !important;
//           }
//         }
//       </style>
//     ` + html;
//     printWindow.document.write(htmlToPrint);
//     printWindow.document.close();
//     printWindow.print();
// };
