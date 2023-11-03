import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';

function EmailComponent({ textEmailUsage, setTextEmailUsage }) {
  const [textEmailError, setTextEmailError] = useState(false);
  const [isEmailInUse, setIsEmailInUse] = useState(false);

  const handleChangeEmail = (value) => {
    setTextEmailUsage(value);

    // Perform email validations or actions
    let isEmailError = false;
    if (!value.trim()) {
      // Handle empty email case
      isEmailError = true;
    } else {
      // Perform other email validations, e.g., check for valid format, check if in use, etc.
      // ...
    }

    setTextEmailError(isEmailError);
  };

  return (
    <View>
      <Text>Email:</Text>
      <TextInput
        value={textEmailUsage}
        onChangeText={handleChangeEmail}
        // Other TextInput props
      />
      {textEmailError && (
        <Text style={{ color: 'red' }}>
          {isEmailInUse ? 'Email already in use' : 'Please enter a valid email'}
        </Text>
      )}
    </View>
  );
}

export default React.memo(EmailComponent);