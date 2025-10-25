import ForgotPasswordIndexRoute from '../../components/forgot-password-index-route.gjs';
import { fn } from '@ember/helper';
import { transitionToRoute } from '../../helpers/transition-to-route.js';

<template>
  <ForgotPasswordIndexRoute
    @onComplete={{fn (transitionToRoute this "forgot-password.confirm")}}
  />
</template>
