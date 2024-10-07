import { Injectable } from '@angular/core';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root',
})
export class FcmService {
  /**
   * initiate push notification feature
   * @returns {void}
   */
  initPush() {
    if (Capacitor.getPlatform() !== 'web') {
      this.registerPush();
      this.getDeliveredNotifications();
    }
  }

  /**
   * Register the app to receive push notifications.
   * @returns {void}
   */
  private async registerPush() {
    try {
      // TODO: await this.addListeners();
      // Request permission to use push notifications
      // iOS will prompt user and return if they granted permission or not
      // Android will just grant without prompting
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      await PushNotifications.register();
      // reset badge count
      await PushNotifications.removeAllDeliveredNotifications();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * add listeners catches a bunch of push notifications events
   * @returns {void}
   */
  async addListeners() {
    // Executed after a successful registration, and the place where you receive back the token of the device to which you can send a push
    await PushNotifications.addListener('registration', (token: Token) => {
      //TODO: TO BE REMOVED IF NOT NEEDED OR USED FOR DEBUGGING
      console.log('My token: ' + JSON.stringify(token));
    });

    // Shouldn’t happen and indicates something went wrong!
    await PushNotifications.addListener('registrationError', (error) => {
      //TODO: TO BE REMOVED IF NOT NEEDED OR USED FOR DEBUGGING
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Triggered whenever a notification was received from your app
    await PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
        //TODO: TO BE REMOVED IF NOT NEEDED OR USED FOR DEBUGGING
        console.log('Push received: ' + JSON.stringify(notification));
      }
    );

    // Called when a user really taps on a notification when it pops up or from the notification center
    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification: ActionPerformed) => {
        //TODO: TO BE USED TO NAVIGATE TO NOTIFICATION CENTER IN THE APP
        console.log('Push action performed: ' + JSON.stringify(notification));
        // reset badge count
        await PushNotifications.removeAllDeliveredNotifications();
      }
    );
  }

  /**
   * Get a list of notifications
   * @returns {void}
   */
  async getDeliveredNotifications() {
    const notificationList =
      await PushNotifications.getDeliveredNotifications();
    //TODO: TO BE USED TO DISPLAY THESE NOTIFICATIONS LIST IN NOTIFICATION CENTER
    console.log('delivered notifications', notificationList);
  }

  /**
   * get app instance Id from firebase plugin
   * @returns {string} app ID
   */
  getAppInstanceId(): string {
    // eslint-disable-next-line prefer-const
    let appID = '';
    FirebaseAnalytics.getAppInstanceId().then((result) => {
      appID = result.appInstanceId || '';
    });
    return appID;
  }

  /**
   * send current page name to firebase
   * @param {string} pageName current page name
   * @returns {void}
   */
  async setCurrentScreen(pageName: string) {
    if (Capacitor.getPlatform() !== 'web') {
      await FirebaseAnalytics.setCurrentScreen({
        screenName: pageName,
      });
    }
  }

  /**
   * Send log event name to firebase
   * @param {string} eventName current event name
   * @param {object} params object contains all data for this event
   * @returns {void}
   */
  async setLogEvent(eventName: string, params?: object) {
    if (Capacitor.getPlatform() !== 'web') {
      await FirebaseAnalytics.logEvent({
        name: eventName,
        params: params,
      });
    }
  }

  /**
   * send user id to firebase
   * @param {string} userID user PRN
   * @returns {void}
   */
  async setUserID(userID: string) {
    if (Capacitor.getPlatform() !== 'web') {
      await FirebaseAnalytics.setUserId({
        userId: userID,
      });
    }
  }

  /**
   * set true or false to enable firebase analytics to collect data
   * @param {boolean} enabled true to enable collecting data
   */
  async setEnabled(enabled: boolean) {
    if (Capacitor.getPlatform() !== 'web') {
      await FirebaseAnalytics.setEnabled({
        enabled: enabled,
      });
    }
  }

  /**
   * return firebase analytics enable status
   * @returns {boolean} return wither is true or false
   */
  async isEnabled() {
    if (Capacitor.getPlatform() !== 'web') {
      const enabled = await FirebaseAnalytics.isEnabled();
      return enabled;
    }
    return false;
  }
}
