import { deprecate } from '@ember/debug';

/**
 * @private
 * CognitoStorage is used to wrap the Cognito SDK's use of local storage.
 * Rather than directly writing to localStorage, this is captured in memory and then
 * persisted in ember-simple-auth's "authenticated" data.
 * Effectively, this is a wrapper to ember-simple-auth's authenticated data designed
 * to look like window.localStorage
 * It's also based on https://github.com/aws/amazon-cognito-identity-js/blob/master/src/StorageHelper.js
 * but converted to be a true non-static object.
 */
export default class CognitoStorage {
  constructor(data = {}) {
    deprecate('The CognitoStorage object has been deprecated.', false, {
      for: 'ember-cognito',
      id: 'ember-cognito-storage',
      since: '0.12.0',
      until: '1.0.0',
    });
    this.data = data;
  }

  getData() {
    return this.data;
  }

  /**
   * @public
   * This is used to set a specific item in storage
   * @param {string} key - the key for the item
   * @param {object} value - the value
   * @returns {string} value that was set
   */
  setItem(key, value) {
    this.data[key] = value;
    return this.data[key];
  }

  /**
   * @public
   * This is used to get a specific key from storage
   * @param {string} key - the key for the item
   * This is used to clear the storage
   * @returns {string} the data item
   */
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.data, key)
      ? this.data[key]
      : undefined;
  }

  /**
   * @public
   * This is used to remove an item from storage
   * @param {string} key - the key being set
   * @returns {string} value - value that was deleted
   */
  removeItem(key) {
    let value = this.data[key];
    delete this.data[key];
    return value;
  }

  /**
   * @public
   * This is used to clear the storage
   * @returns {string} nothing
   */
  clear() {
    this.data = {};
    return this.data;
  }
}
