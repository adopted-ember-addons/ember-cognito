<template>
  <RegisterConfirmRoute @onComplete={{fn (transition-to-route this "login")}} />
</template>
