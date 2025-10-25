import { fn } from '@ember/helper';
import { transitionToRoute } from '../../helpers/transition-to-route.js';
import LoginIndexRoute from '../../components/login-index-route.gjs';

<template>
  <LoginIndexRoute
    @onNewPasswordRequired={{fn (transitionToRoute this "login.new-password")}}
  />
</template>
