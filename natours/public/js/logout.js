/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      // setting to TRUE reloads from server not from browser
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Try again!');
  }
};
