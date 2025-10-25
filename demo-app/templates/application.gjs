import { pageTitle } from 'ember-page-title';
import { LinkTo } from '@ember/routing';
import { on } from '@ember/modifier';

<template>
  {{pageTitle "Ember Cognito Demo App"}}

  <nav class="navbar navbar-light navbar-expand bg-light">
    <LinkTo @route="index" class="navbar-brand">ember-cognito</LinkTo>

    <div class="collapse navbar-collapse">
      <form class="form-inline ml-auto" {{on "submit" @controller.saveIds}}>
        <label for="pool_id" class="sr-only">Cognito Pool ID</label>
        <input
          id="pool_id"
          class="form-control mr-sm-2"
          placeholder="Cognito Pool ID"
          aria-label="Cognito Pool ID"
          value={{@controller.poolId}}
          oninput={{@controller.setPoolId}}
        />
        <label for="client_id" class="sr-only">Cognito Client ID</label>
        <input
          id="client_id"
          class="form-control mr-sm-2"
          placeholder="Cognito Client ID"
          aria-label="Cognito Client ID"
          value={{@controller.clientId}}
          oninput={{@controller.setClientId}}
        />
        <button
          class="btn btn-outline-success my-2 my-sm-0"
          type="submit"
        >Save</button>
      </form>
      <ul class="navbar-nav ml-4">
        {{#if @controller.session.isAuthenticated}}
          <li class="nav-item"><a
              href="#"
              class="logout-link"
              {{on "click" @controller.logout}}
            >
              Logout
            </a>
          </li>
        {{else}}
          <li class="nav-item"><LinkTo
              @route="login"
              class="nav-link login-link"
            >
              Login
            </LinkTo>
          </li>
          <li class="nav-item"><LinkTo
              @route="register"
              class="nav-link register-link"
            >
              Register
            </LinkTo>
          </li>
        {{/if}}
      </ul>
    </div>
  </nav>
  {{outlet}}
</template>
