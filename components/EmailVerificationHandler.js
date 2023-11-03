import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity} from 'react-native';
import { getAuth, applyActionCode } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom'; // Import the useLocation and useNavigate hooks

const EmailVerificationHandler = () => {
  const [error, setError] = useState('Unauthorized access.'); // Default error message
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate(); // Get the navigate function for redirection

  const location = useLocation(); // Get the current location

  useEffect(() => {
    const auth = getAuth();
    const actionCode = getActionFromUrl(); // Extract the action code from the URL parameters
    // Check if the user is accessing the component from the specific URL
    const isAccessFromAllowedUrl = location.pathname === '/VerifyEmail';

    // Only proceed if the action code is provided and access is from the allowed URL
    if (actionCode && isAccessFromAllowedUrl) {
      applyActionCode(auth, actionCode)
        .then(() => {
          setVerified(true);
          setError('');
        })
        .catch((error) => {
          setError(error.message);
        });
    } else {
      // Redirect to an appropriate page for unauthorized access
      navigate('/'); // Redirect to the homepage or any other suitable page
    }
  }, [navigate]);

  const getActionFromUrl = () => {
    const searchParams = new URLSearchParams(location.search); // Get the URL parameters
    return searchParams.get('oobCode'); // Return the value of the 'oobCode' parameter (action code)
  };

  return (
    <View>
    <TouchableOpacity onPress={() => navigate('/')}>
      <Text>Go to home</Text>
    </TouchableOpacity>
        <Text>Your email has been verified. You can now sign in with your account.</Text>
    
    </View>
  );
};

export default EmailVerificationHandler;
