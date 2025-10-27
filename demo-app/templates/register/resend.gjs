import RegisterResendRoute from '../../components/register-resend-route.gjs';
import { transitionToRoute } from '../../helpers/transition-to-route.js';
import { fn } from '@ember/helper';

<template>
  <RegisterResendRoute
    @onComplete={{fn (transitionToRoute this "register.confirm")}}
  />
</template>
