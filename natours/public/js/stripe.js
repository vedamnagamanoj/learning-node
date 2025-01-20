/* disable-eslint */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51QiUVwG6CWicCQF08iucxBnVBhO3r6GTDOy4QXzAPJsgGNZ79Dk4lNppZMp6haLkZBJolTHqm0eKw6O2VHdJM1sq00jPOWaX42',
);

export const bookTour = async (tourId) => {
  try {
    // 1. Get checkout session form API
    const response = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(response);

    // 2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: response.data.session.id,
      // sessionId: tourId,
    });
  } catch (err) {
    console.error(err);
    showAlert('error', err);
  }
};
