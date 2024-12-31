<script setup lang="ts">
definePageMeta({
  layout: 'site',
});
</script>

<template>
  <div>
    <hero-landing />
    <div class="filled-background">
      <v-container>
        <v-row class="mt-16">
          <v-col cols="12" md="6">
            <h2 class="text-h3 mb-6">Code Microcontroller Projects in Your Browser</h2>
            <p class="text-body-1">
              DuinoApp is a free, open-source web platform that lets you write, compile and upload code directly from your browser - no software installation required. Perfect for schools, libraries, and makers of all ages.
            </p>
          </v-col>
          <v-col cols="12" md="6" class="text-center">
            <!-- TODO: replace with a real image -->
            <v-img src="/neon-main.svg" max-width="400" class="mx-auto" />
          </v-col>
        </v-row>
      </v-container>
    </div>
    <v-divider />
    <div class="py-16">
      <v-container>
        <v-row class="mt-16 feature-cards" justify="center">
          <v-col cols="12" md="6" lg="4">
            <v-card elevation="2" class="pa-6 h-100">
              <div class="d-flex align-center">
                <v-icon icon="mdi-school-outline" size="64" color="primary" class="mr-4" />
                <div>
                  <h3 class="text-h5 mb-4">Perfect for Education</h3>
                  <p>Works on Chromebooks and any modern Chrome/Edge browser. No administrative rights or installations needed - just open and start coding.</p>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="4">
            <v-card elevation="2" class="pa-6 h-100">
              <div class="d-flex align-center">
                <v-icon icon="mdi-open-source-initiative" size="64" color="primary" class="mr-4" />
                <div>
                  <h3 class="text-h5 mb-4">Free & Open Source</h3>
                  <p>DuinoApp is completely free to use and open source. Join our community, contribute code, or customize it for your needs.</p>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="4">
            <v-card elevation="2" class="pa-6 h-100">
              <div class="d-flex align-center">
                <v-icon icon="mdi-shield-check-outline" size="64" color="primary" class="mr-4" />
                <div>
                  <h3 class="text-h5 mb-4">Safe & Secure</h3>
                  <p>Built with student privacy in mind. No account required, no data collection, and COPPA compliant for educational use.</p>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="4">
            <v-card elevation="2" class="pa-6 h-100">
              <div class="d-flex align-center">
                <v-icon icon="mdi-bookshelf" size="64" color="primary" class="mr-4" />
                <div>
                  <h3 class="text-h5 mb-4">Extensive Libraries</h3>
                  <p>Access thousands of Arduino libraries directly in the browser. From sensors to displays, we've got you covered with all the popular libraries.</p>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="4">
            <v-card elevation="2" class="pa-6 h-100">
              <div class="d-flex align-center">
                <v-icon icon="mdi-code-braces" size="64" color="primary" class="mr-4" />
                <div>
                  <h3 class="text-h5 mb-4">Modern Code Editor</h3>
                  <p>Feature-rich editor with syntax highlighting, auto-completion, and error checking. Makes coding easier and more enjoyable for beginners and experts alike.</p>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="4">
            <v-card elevation="2" class="pa-6 h-100">
              <div class="d-flex align-center">
                <v-icon icon="mdi-file-document-multiple-outline" size="64" color="primary" class="mr-4" />
                <div>
                  <h3 class="text-h5 mb-4">Example Projects</h3>
                  <p>Get started quickly with our collection of example projects and tutorials. From blinking LEDs to IoT applications, we've got projects for all skill levels.</p>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="4">
            <v-card elevation="2" class="pa-6 h-100">
              <div class="d-flex align-center">
                <v-icon icon="mdi-monitor-dashboard" size="64" color="primary" class="mr-4" />
                <div>
                  <h3 class="text-h5 mb-4">Serial Monitor</h3>
                  <p>Built-in serial monitor for debugging and communication with your board. View output and send commands directly from your browser. (there's also a plotter that's actually useful)</p>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="4">
            <v-card elevation="2" class="pa-6 h-100">
              <div class="d-flex align-center">
                <v-icon icon="mdi-cloud-sync-outline" size="64" color="primary" class="mr-4" />
                <div>
                  <h3 class="text-h5 mb-4">Cloud Storage</h3>
                  <p>Save your projects to the cloud and access them from anywhere. Collaborate with others and share your creations with the community.</p>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <v-divider />
    <div class="filled-background">
      <v-container>
        <v-row class="mt-16" justify="center">
          <v-col cols="12" class="text-center">
            <h2 class="text-h3 mb-6">Wide Board Support</h2>
            <p class="text-subtitle-1 mb-6">Compatible with popular Arduino and Espressif (ESP) microcontrollers</p>
          </v-col>
          <v-col cols="12" md="6" lg="4" xl="3">
            <v-card elevation="2">
              <v-card-title class="d-flex align-center my-4">
                <v-icon icon="mdi-infinity" size="48" color="primary" class="mr-4" />
                <h3 class="text-h5">Arduino Boards</h3>
              </v-card-title>
              <v-card-text>
                <ul class="board-list">
                  <li>Arduino Uno</li>
                  <li>Arduino Nano</li>
                  <li>Arduino Mega</li>
                  <li>Arduino Pro Micro</li>
                  <li>And many more...</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="4" xl="3">
            <v-card elevation="2">
              <v-card-title class="d-flex align-center my-4">
                <v-icon icon="mdi-wifi" size="48" color="primary" class="mr-4" />
                <h3 class="text-h5">Espressif (ESP) Boards</h3>
              </v-card-title>
              <v-card-text>
                <ul class="board-list">
                  <li>ESP8266</li>
                  <li>ESP32</li>
                  <li>NodeMCU</li>
                  <li>Wemos D1</li>
                  <li>And many more...</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-16 mb-16">
          <v-col cols="12" class="text-center">
            <h2 class="text-h3 mb-6">Ready to Start Building?</h2>
            <p class="text-subtitle-1 mb-6">What are you waiting for? Jump in and start coding!</p>
            <btn-primary to="/code" size="x-large" nuxt>
              Launch DuinoApp
            </btn-primary>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" class="text-center">
            <p class="text-caption text-grey-darken-1">
              All trade names, trademarks and registered trademarks mentioned on this website are property of their respective owners, and are hereby acknowledged.
              <br> 
              DuinoApp is <strong>not</strong> affiliated with, endorsed by, or sponsored by any of these trademarks owners.
            </p>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<style scoped lang="scss">
.board-list {
  padding-left: 24px;

  li {
    margin-bottom: 8px;
  }
}

.filled-background {
  background: rgb(var(--v-theme-background));
  z-index: 1;
  position: relative;
}

.feature-cards {
  .v-card {
    background: rgba(var(--v-theme-surface), 0.5);
    backdrop-filter: blur(5px);
  }
}
</style>
