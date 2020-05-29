<template>
  <div class="winds col-xl col-lg col-md">
    <div class="windGraph">
    <div class="card-heading pt-4">Wind Status</div>
    <div class="windrow pt-3 mt-1">
      <div class="col-sm-6 col-md-6 mt-1 text-center align-middle">
        <p class="card-sub-heading mt-1">Wind Direction</p>
        <p class="mt-4"><img id="direction" src="../assets/winddirection.svg" height="30" width="30"></p>
        <p class="card-value mt-1">{{ highlights.windStatus.derivedWindDirection }}</p>
      </div>
      <div class="col-sm-6 col-md-6 mt-1">
        <p class="card-sub-heading mt-1">Wind Speed</p>
        <p class="mt-1"><img  id="speed" src="../assets/windspeed.svg" height="30" width="30"></p>
        <p class="card-value mt-1">{{ highlights.windStatus.windSpeed }} km/h</p>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["highlights"],
  components: {},
  data() {
    return {};
  },
  methods: {},
  computed: {}
};
</script>