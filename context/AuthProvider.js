import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeBaseProvider } from 'native-base';
import { collection, doc, getDoc, getFirestore, updateDoc, onSnapshot } from 'firebase/firestore';
import { projectExtensionAuth, projectExtensionFirestore } from '../Firebase/firebaseConfig';
// Import your Firebase configuration

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [name, setProfileDataAuth] = useState(null);


  //get makes
  const [makesFromOutside, setMakesFromOutside] = useState('');
  const setMakesData = (data) => {
    setMakesFromOutside(data);
  }
  const [makesAuth, setMakeAuth] = useState([]);
  useEffect(() => {
      try {
        const docRef = doc(collection(projectExtensionFirestore, 'Make'), 'Make');
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
          const makeData = snapshot.data()?.make || [];
          setMakeAuth(makeData);
        });
        return unsubscribe;
      } catch (error) {
        console.error('Error fetching data from Firebase:', error);
      }
    }, []);
//get makes

//get model
const [modelFromOutside, setModelFromOutside] = useState('');
const [modelAuth, setModelAuth] = useState([]);
const setModelData = (data) => {
  setModelFromOutside(data);
};
useEffect(() => {
  let unsubscribe;
  const fetchData = async () => {
    if(!makesFromOutside) {
      return;
    }
    try{
      const docRef = doc(collection(projectExtensionFirestore, 'Model'), makesFromOutside);
      unsubscribe = onSnapshot(docRef, (snapshot) => {
        const modelData = snapshot.data()?.model || [];
        setModelAuth(modelData);
      });
    } catch (error) {
      console.error('Error fetching data from firebase: ', error);
    }
  };
  fetchData();
  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, [makesFromOutside]);
//get model

//Year from outside
const [minYearFromOutside, setMinYearFromOutside] = useState('');
const setMinYearData = (data) => {
  setMinYearFromOutside(data);
}
const [maxYearFromOutside, setMaxYearFromOutside] = useState('');
const setMaxYearData = (data) => {
  setMaxYearFromOutside(data);
};
//year from outside

  const [productData, setProductData] = useState(() => {
    const storedData = localStorage.getItem('productData');
    return storedData ? JSON.parse(storedData) : [];
  });

  useEffect(() => {
    localStorage.setItem('productData', JSON.stringify(productData));
  }, [productData]);



  // Function to fetch the user profile
  const getUserProfile = async (textEmail) => {
    try {
      if (!textEmail) return; // Return early if userEmail is not available yet

      const db = getFirestore();
      const userDocRef = doc(db, 'accounts', textEmail);
      const userDocRefExtension = doc(projectExtensionFirestore, 'accounts', textEmail)
      const userDocSnapshot = await getDoc(userDocRefExtension);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setProfileDataAuth(userData.textFirst)
      }
    } catch (error) {
      console.log('Profile fetch error:', error);
    }

  };

  //get product
  const setProducts = (data) => {
    setProductData(data);
  };
  //


  // Check if the user is already authenticated and set the state accordingly
  useEffect(() => {
    const auth = getAuth();
    let unsubscribe;

    const handleAuthStateChanged = async (user) => {
      if (user) {
        if (user.emailVerified) {
          // Save the user session to local storage if authenticated and email is verified
          AsyncStorage.setItem('userSession', JSON.stringify(user))
            .then(() => console.log('User session stored'))
            .catch((error) => console.log('Error storing user session:', error));
        } else {
          // Clear the user session from local storage if email is not verified
          AsyncStorage.removeItem('userSession')
            .then(() => console.log('User session removed'))
            .catch((error) => console.log('Error removing user session:', error));
        }
      } else {
        // Clear the user session from local storage if not authenticated
        AsyncStorage.removeItem('userSession')
          .then(() => console.log('User session removed'))
          .catch((error) => console.log('Error removing user session:', error));
      }

      setUser(user);
      setIsLoading(false);
    };

    // Try to retrieve the user session from local storage
    AsyncStorage.getItem('userSession')
      .then((storedSession) => {
        if (storedSession) {
          setUser(JSON.parse(storedSession));
          getUserProfile(JSON.parse(storedSession).email);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.log('Error reading user session from AsyncStorage:', error);
        setIsLoading(false);
      });

    // Subscribe to Auth state changes to handle login persistence
    unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);
    unsubscribe = onAuthStateChanged(projectExtensionAuth, handleAuthStateChanged);
    return () => unsubscribe();
  }, []);

  // Function to handle user login
  const login = async (email, password) => {
    setIsError(false); // Reset the error state before attempting login

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userCredentialAuth = await signInWithEmailAndPassword(projectExtensionAuth, email, password);
      setIsLoading(false);
      console.log('Login success');
      return userCredentialAuth.user; // Return the authenticated user object
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setIsError(true);
      } else {
        console.log('Login error:', error);
      }
      return null; // Return null when login fails
    }
  };

  // Function to handle user logout
  const logout = async () => {
    try {
      const auth = getAuth();
      await signOut(projectExtensionAuth);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };


  return (

    <AuthContext.Provider
      value={{
        name,
        user,
        isLoading,
        login,
        logout,
        isError,
        setIsError,
        userEmail: user ? user.email : null,
        productData, // Include the productData in the context
        setProducts,
        makesAuth,
        makesFromOutside,
        setMakesData,
        modelFromOutside,
        setModelData,
        modelAuth,
        setMinYearData,
        setMaxYearData,
        minYearFromOutside,
        maxYearFromOutside

        // Add the userEmail to the context
      }}
    >

      {children}

    </AuthContext.Provider>

  );
};

export { AuthContext, AuthProvider };
