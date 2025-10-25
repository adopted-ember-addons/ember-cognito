import { fn } from '@ember/helper';

import ChangePasswordRoute from '../components/change-password-route.gjs';
import { transitionToRoute } from '../helpers/transition-to-route.js';

<template>
  <ChangePasswordRoute @onComplete={{fn (transitionToRoute this "index")}} />
</template>
