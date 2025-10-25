import IndexAuth from '../components/index-auth.gjs';
import IndexUnauth from '../components/index-auth.gjs';

<template>
  <div class="container">
    <div class="jumbotron mt-3">
      <h1>ember-cognito</h1>
      <h2>Amazon Cognito and ember-simple-auth integration</h2>
    </div>
    {{#if this.session.isAuthenticated}}
      <IndexAuth @model={{this.model}} />
    {{else}}
      <IndexUnauth @model={{this.model}} />
    {{/if}}
  </div>
</template>
