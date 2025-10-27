import RegisterIndexRoute from '../../components/register-index-route.gjs';
import { transitionToRoute } from '../../helpers/transition-to-route.js';
import { fn } from '@ember/helper';

<template>
  <RegisterIndexRoute
    @onComplete={{fn (transitionToRoute this "index")}}
    @onConfirmationRequired={{fn (transitionToRoute this "register.confirm")}}
  />
</template>
