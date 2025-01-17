/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login } from './login';
import { logout } from './logout';
import { updateSettings } from './updateSettings';

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userSettingsForm = document.querySelector('.form-user-password');

// Delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset['locations']);
  displayMap(locations);
}

loginForm?.addEventListener('submit', (evnt) => {
  evnt.preventDefault();
  // Values
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});

logoutBtn?.addEventListener('click', logout);

userDataForm?.addEventListener('submit', (evnt) => {
  evnt.preventDefault();

  const formData = new FormData();

  formData.append('name', document.getElementById('name').value);
  formData.append('email', document.getElementById('email').value);
  formData.append('photo', document.getElementById('photo').files[0]);

  console.log(formData);

  // const name = document.getElementById('name').value;
  // const email = document.getElementById('email').value;
  // updateSettings({ name, email }, 'data');
  updateSettings(formData, 'data');
});

userSettingsForm?.addEventListener('submit', async (evnt) => {
  evnt.preventDefault();
  document.querySelector('.btn--save-password').textContent = 'Updating...';
  const passwordCurrent = document.getElementById('password-current').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;
  await updateSettings(
    { passwordCurrent, password, passwordConfirm },
    'password',
  );

  document.getElementById('password-current').value = '';
  document.getElementById('password').value = '';
  document.getElementById('password-confirm').value = '';
  document.querySelector('.btn--save-password').textContent = 'Save Password';
});
