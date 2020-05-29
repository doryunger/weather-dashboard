<template>
  <div class="noPadding col-xl col-lg col-md col-sm col-xs">
    <div class="card-heading pt-3 pb-2"> Humidity
      <fusioncharts class="uvindex"
        :type="type"
        :width="width"
        :height="height"
        :containerbackgroundopacity="containerbackgroundopacity"
        :dataformat="dataformat"
        :datasource="datasource"
        id="humidityChart"
      ></fusioncharts>
    </div>
  </div>
</template>

<script>
export default {
  props: ["highlights"],
  components: {},
  data() {
    return {
      type: "angulargauge",
      width: "100%",
      height: this.highlights.assets.height,
      containerbackgroundopacity: 0,
      dataformat: "json",
      datasource: {
        chart: {
          lowerLimit: "0",
          upperLimit: "100",
          lowerLimitDisplay: "1",
          upperLimitDisplay: "100",
          showValue: "0",
          theme: "fusion",
          baseFont: "Roboto",
          bgAlpha: "0",
          canvasbgAlpha: "0",
          gaugeInnerRadius: "65",
          gaugeOuterRadius: "100",
          pivotRadius: "0",
          pivotFillAlpha: "0",
          valueFontSize: "2",
          valueFontColor: "#000000",
          valueFontBold: "12",
          tickValueDistance: "3",
          autoAlignTickValues: "1",
          majorTMAlpha: "20",
          chartBottomMargin: "40"
        },
        colorrange: {
          color: [
            {
              minvalue: "0",
              maxvalue: this.highlights.uvIndex.toString(),
              code: "#7DA9E0"
            },
            {
              minvalue: this.highlights.uvIndex.toString(),
              maxvalue: "15",
              code: "#D8EDFF"
            }
          ]
        },
        annotations: {
          groups: [
            {
              items: [
                {
                  id: "val-label",
                  type: "text",
                  text: this.highlights.uvIndex.toString(),
                  fontSize: "15",
                  font: "Source Sans Pro",
                  fontBold: "12",
                  fillcolor: "#212529",
                  x: "$gaugeCenterX",
                  y: "$gaugeCenterY"
                }
              ]
            }
          ]
        },
        dials: {
          dial: [
            {
              value: this.highlights.uvIndex.toString(),
              baseWidth: "0",
              radius: "0",
              borderThickness: "0",
              baseRadius: "0"
            }
          ]
        }
      }
    };
  },
  methods: {},
  computed: {},
  watch: {
    highlights: {
      handler: function() {
        this.datasource.colorrange.color[0].maxvalue = this.highlights.uvIndex.toString();
        this.datasource.colorrange.color[1].minvalue = this.highlights.uvIndex.toString();
        this.datasource.annotations.groups[0].items[0].text = this.highlights.uvIndex.toString()+'%';
      },
      deep: true
    }
  }
};
</script>
