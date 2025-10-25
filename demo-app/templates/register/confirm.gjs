import { fn } from '@ember/helper';
import RegisterConfirmRoute from '../../components/register-confirm-route.gjs';
import transitionToRoute from '../helpers/transition-to-route.js';

<template>
  <RegisterConfirmRoute @onComplete={{fn (transitionToRoute this "login")}} />
</template>
