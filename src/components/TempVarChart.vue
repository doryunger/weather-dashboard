<template>
  <div class="custom-card header-card card">
    <div class="card-body pt-0">
      <fusioncharts class="genericGraph"
        id="heidi"
        type="spline"
        width="100%"
        height="100%" 
        dataformat="json" 
        dataEmptyMessage="i-https://i.postimg.cc/R0QCk9vV/Rolling-0-9s-99px.gif"
        dataEmptyMessageImageScale=39
        :datasource="tempChartData" 
        ref="fc"
      >
      </fusioncharts>
    </div>
    
  </div>
</template>

<script>
export default {
  props: ["tempVar"],
  components: {},
  data() {
    return {
      tempChartData: {
        chart: {
          caption: "Hourly Temperature",
          captionFontBold: "0",
          captionFontColor: "#000000",
          captionPadding: "30",
          baseFont: "Roboto",
          chartTopMargin: "30",
          showHoverEffect: "1",
          theme: "fusion",
          showaxislines: "1",
          numberSuffix: "°C",
          anchorBgColor: "#6297d9",
          paletteColors: "#6297d9",
          drawCrossLine: "1",
          plotToolText: "$label<br><hr><b>$dataValue</b>",
          showAxisLines: "0",
          showYAxisValues: "0",
          anchorRadius: "4",
          divLineAlpha: "0",
          labelAlpha: "65",
          labelFontBold: "0",
          rotateLabels: "1",
          slantLabels: "1",
          canvasPadding: "20"
        },
        data: [],
      },
    };
  },
  methods: {
    setChartData: function() {
    //this.$refs.fc.chartObj.resizeTo(this.tempVar.dimensions.width,this.tempVar.dimensions.height);
    //console.log(this.$refs.fc.chartObj);
      //this.$refs.fc.chartObj.dispose();
      /*if (this.tempVar.dimensions.width>0 && this.tempVar.dimensions.height>0){ 
            this.tempChartData.data=[]
      }*/
      var data = [];
      for (var i = 0; i < this.tempVar.tempToday.length; i++) {
        var dataObject = {
          label: this.tempVar.tempToday[i].hour,
          value: this.tempVar.tempToday[i].temp
        };
        data.push(dataObject);
      }
      this.tempChartData.data = data;
    },
  },
  mounted: function() {
    this.setChartData();
    
  }, 
  watch: {
    tempVar: {
      handler: function() {
        this.setChartData(); 
        /*if (this.tempVar.dimensions.width>0 && this.tempVar.dimensions.height>0){ 
            this.$refs.fc.chartObj.dispose();
            this.$refs.fc.chartObj.render("fc-4");
        }  */                                
      },
      deep: true
    },
  },
};
</script>

<style>
</style>
