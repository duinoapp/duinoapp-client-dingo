<script setup lang="ts">

const compiler = useCompiler();
const uploader = useUploader();

const check = async () => {
  await compiler.compile();
};

const upload = async () => {
  await uploader.upload();
};

</script>

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
  <v-btn
    :loading="compiler.compiling"
    :disabled="uploader.uploading"
    density="compact"
    class="mr-2"
    icon
    @click="check"
  >
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
  <v-btn
    :loading="uploader.uploading"
    :disabled="compiler.compiling"
    density="compact"
    icon
    @click="upload"
  >
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
