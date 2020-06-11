import 'react-native-gesture-handler'; // required to fix an unhandled event due to the asynchronous router
import { AppRegistry } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';
import App from './src/App';
import { name as appName } from './app.json';
import ResetMessaging from './src/ResetMessaging';
import { checkGeoSickPeople, checkBLESickPeople } from './src/services/Tracker';
import { syncLocationsDBOnLocationEvent } from './src/services/SampleService';
import { onError } from './src/services/ErrorService';
import { initConfig } from './src/config/config';
import log from './src/services/LogService';

BackgroundGeolocation.onLocation(
  async () => {
    await log('BGLocation onLocation');

    await syncLocationsDBOnLocationEvent();
  }, (error) => {
    onError({ error });
  }
);

BackgroundGeolocation.on('heartbeat', async () => {
  await log('BGLocation heartbeat');
});


const BackgroundFetchHeadlessTask = async (event) => {
  try {
    const { taskId } = event;
    console.log('[BackgroundFetch HeadlessTask] start: ', taskId);

    await log('CheckSickPeople Headless');

    await initConfig();
    await syncLocationsDBOnLocationEvent();
    await checkBLESickPeople();
    await checkGeoSickPeople();

    BackgroundFetch.finish(taskId);
  } catch (error) {
    onError({ error });
  }
};

const BackgroundGeolocationHeadlessTask = async (event) => {
  console.log('[BackgroundGeolocation HeadlessTask] -', event.name);

  await log('BGLocation Headless');

  await syncLocationsDBOnLocationEvent();
};

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => ResetMessaging);
BackgroundFetch.registerHeadlessTask(BackgroundFetchHeadlessTask);
BackgroundGeolocation.registerHeadlessTask(BackgroundGeolocationHeadlessTask);
