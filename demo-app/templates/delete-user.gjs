import { fn } from '@ember/helper';

import DeleteUserRoute from '../components/delete-user-route.gjs';
import transitionToRoute from '../helpers/transition-to-route.js';

<template>
  <DeleteUserRoute @onComplete={{fn (transitionToRoute this "index")}} />
</template>
