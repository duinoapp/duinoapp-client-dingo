<template>
  <v-btn density="compact" class="mr-2" icon>
    <v-icon>
      mdi-chip
    </v-icon>
    <v-tooltip
      activator="parent"
      location="top"
    >
      Select Board
    </v-tooltip>
  </v-btn>
  <v-btn density="compact" class="mr-2" icon>
    <v-icon>
      mdi-check
    </v-icon>
    <v-tooltip
      activator="parent"
      location="top"
    >
      Verify & Compile
    </v-tooltip>
  </v-btn>
  <v-btn density="compact" icon>
    <v-icon>
      mdi-arrow-right
    </v-icon>
    <v-tooltip
      activator="parent"
      location="top"
    >
      Compile &amp; Upload
    </v-tooltip>
  </v-btn>
</template>
