<template>
  <div class="custom-content-card content-card card">
    <div class="card-body pb-0">
      <div class="row">
        <div class="column">
        <uv-index :highlights="highlights"></uv-index>
        <wind-status :highlights="highlights"></wind-status>
        </div>
        <visibility :highlights="highlights"></visibility>
      </div>
    </div>
  </div>
</template>
<script>
import UVIndex from "./UVIndex.vue";
import Visibility from "./Visibility.vue";
import WindStatus from "./WindStatus.vue";

export default {
  props: ["highlights"],
  components: {
    "uv-index": UVIndex,
    "visibility": Visibility,
    "wind-status": WindStatus,
  },
};
</script>