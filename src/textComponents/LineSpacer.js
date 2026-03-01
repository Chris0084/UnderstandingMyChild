import React from 'react';
import { View } from 'react-native';

const LineSpacer = ({ height = 10, width = 0 }) => {
  return <View style={{ height: height, width: width }} />;
};

export default LineSpacer;
