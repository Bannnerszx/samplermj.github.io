import React from 'react';
import { View, Text, TextInput } from 'react-native';

function NameComponent({ textFirst, setTextFirst, textLast, setTextLast }) {
  return (
    <View>
      <Text>First Name:</Text>
      <TextInput
        value={textFirst}
        onChangeText={setTextFirst}
        // Other TextInput props
      />
      <Text>Last Name:</Text>
      <TextInput
        value={textLast}
        onChangeText={setTextLast}
        // Other TextInput props
      />
    </View>
  );
}

export default React.memo(NameComponent);