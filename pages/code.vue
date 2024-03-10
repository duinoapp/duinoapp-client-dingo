<template>
  <main-grid>
    <template #left>
      <left-window />
    </template>
    <template #top>
      <main-window />
    </template>
    <template #bottom>
      <action-window />
    </template>
  </main-grid>
  <project-init-dialog />
</template>
