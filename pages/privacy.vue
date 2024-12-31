<script setup lang="ts">
definePageMeta({
  layout: 'site',
});
</script>

<template>
  <v-container class="py-16">
    <h1 class="text-h3">Privacy Policy</h1>
    <p><strong>We don't keep user data, nadda, zip, zilch.</strong></p>

    <h2 class="text-h4">Where is my code and such stored?</h2>

    <p>On your computer, in what's referred to as localStorage in your browser.</p>

    <p>When you compile your code, your code and necessary details about your project will be sent to the compile server. The server may store this information in temporary storage which may persist for a short while.</p>

    <p>Compile servers will display their country/region, data stored on these servers will technically be subject to the jurisdiction of that country/region.</p>

    <h2 class="text-h4">Usage Metrics</h2>

    <p>We do track usage data when you compile/access the site, but this is limited to information like when the request was made, how long it took, and which country did it come from. We do not collect any kind of personal, identifiable, or trackable data. This information is required to ensure we have enough resources in the right places.</p>

    <p>These usage metrics are collected by Cloudflare and Amazon Web Service (AWS), and Google Cloud.</p>

    <h2 class="text-h4">Third-Party Compile Servers</h2>

    <p>DuinoApp runs its own official first-party compile servers and will recommend these by default. These first-party compile servers can be identified by using the duino.app domain. e.g. compile.duino.app or legacy.duino.app</p>

    <p>However, the application does allow for third-party compile servers, either listed privately or publically by awesome community members. Duino App takes no responsibility for these third-party compile servers and any data they may collect or retain. It should not be assumed that they adhere to this privacy policy.</p>

    <h2 class="text-h4">Exterior Linked Services</h2>

    <p>Services mentioned here are linked via the application but are not integral parts, nor does a user have to interact with them. We will not send any data to these services, you may choose to give information to these services at your own risk and that information will be subject to the privacy policy of those services.</p>

    <p>The developer collects donations for this application through "Buy Me A Coffee", <a href="https://www.buymeacoffee.com/mrfrase3" target="_blank">as found here</a> (Feel free to buy me one ;)) Their privacy policy can be found at <a href="https://www.buymeacoffee.com/privacy-policy" target="_blank">https://www.buymeacoffee.com/privacy-policy</a></p>

    <p>DuinoApp has a <a href="https://discord.gg/FKQp7N4" target="_blank">Discord server</a> that allows users of the application to connect through a community. Their privacy policy can be found at <a href="https://discord.com/privacy" target="_blank">https://discord.com/privacy</a></p>

    <h2 class="text-h4">Hosting/Development Services Used</h2>

    <p>For Transparency, the following hosting/development providers used by Duino App are:</p>
    <ul>
      <li>GitHub - Code storage, management, and governance.</li>
      <li>GitHub Pages - Hosting the client application.</li>
      <li>AWS - Former Compile Server Hosting.</li>
      <li>Google Cloud Run - Current Compile Server Hosting.</li>
      <li>Cloudflare - DNS services and CDN hosting and Certificate management.</li>
      <li>Buy Me A Coffee - Donations.</li>
      <li>Discord - Community Discussions.</li>
    </ul>

    <h2 class="text-h4">Updates</h2>
    <p>Advanced warning of updates to the Privacy Policy will be posted in the Discord Community.</p>

    <h3 class="text-h5">2021-10-17 - Duino.app v3.3.1</h3>
    <ul>
      <li>Switched main compile server hosting from AWS to Google Cloud. This has no impact on the level of personal data we retain, which is still zero.</li>
      <li>Add information about update notices.</li>
    </ul>
  </v-container>
</template>

<style scoped lang="scss">

.v-container {
  min-height: calc(100vh - 128px);

  h1 {
    margin-top: 16px;
  }

  h2 {
    margin-top: 32px;
  }

  h3 {
    margin-top: 16px;
  }

  ul {
    margin-top: 16px;
    padding-left: 16px;
  }

  li {
    margin-top: 8px;
  }

  p {
    margin-top: 8px;
  }
}
</style>
