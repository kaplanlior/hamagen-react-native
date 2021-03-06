import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { GoogleTimeLine } from '../../common';
import { toggleWebview } from '../../../actions/GeneralActions';
import { Strings } from '../../../locale/LocaleData';
import { PADDING_BOTTOM, PADDING_TOP, USAGE_PRIVACY } from '../../../constants/Constants';

interface Props {
  navigation: StackNavigationProp<any>,
  strings: Strings,
  toggleWebview(isShow: boolean, usageType: string): void
}

const LocationHistory = ({ navigation, strings, toggleWebview }: Props) => {
  return (
    <View style={styles.container}>
      <GoogleTimeLine
        strings={strings}
        toggleWebview={() => toggleWebview(true, USAGE_PRIVACY)}
        onCompletion={() => navigation.pop()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: PADDING_TOP(90),
    paddingBottom: PADDING_BOTTOM(30),
    backgroundColor: '#fff'
  }
});

const mapStateToProps = (state: any) => {
  const {
    locale: { strings }
  } = state;

  return { strings };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    toggleWebview
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(LocationHistory);
