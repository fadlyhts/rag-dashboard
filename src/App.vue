<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div>
    <Toaster position="top-right" :duration="3000" rich-colors />
    <RouterView />
  </div>
</template>

