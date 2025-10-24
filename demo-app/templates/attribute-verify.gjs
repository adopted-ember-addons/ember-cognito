import { fn } from '@ember/helper';
import AttributeVerifyRoute from '../components/attribute-verify-route.gjs';
import transitionToRoute from '../helpers/transition-to-route.js';

<template>
  <AttributeVerifyRoute
    @name={{this.name}}
    @onComplete={{fn (transitionToRoute this "index")}}
  />
</template>
