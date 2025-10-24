import { fn } from '@ember/helper';

import AttributeRoute from '../components/attribute-route.gjs';
import transitionToRoute from '../helpers/transition-to-route.js';

<template>
  <AttributeRoute
    @model={{this.model}}
    @onSave={{fn (transitionToRoute this "index")}}
    @onDelete={{fn (transitionToRoute this "index")}}
  />
</template>
