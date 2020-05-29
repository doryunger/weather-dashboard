<template>
  <div class=" visibility col-xl col-lg col-md d-none d-lg-flex " ref="chartdiv">
  </div>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps"	
import * as am4charts from "@amcharts/amcharts4/charts";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow"
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);
let chart;
let imageSeries;
let image;
export default {
  name:'helloWorld',
  props: ["highlights"],
  components: {},
  methods: {},
  computed: {},
  watch: {
    highlights: {
      handler: function() {
        imageSeries.data[0]['name']=this.highlights.coords.name;
        imageSeries.data[0]['title']=this.highlights.coords.name;
        imageSeries.data[0]['latitude']=this.highlights.coords.lat;
        imageSeries.data[0]['longitude']=this.highlights.coords.lng;
        image=imageSeries.mapImages.values[0];
        image.longitude=this.highlights.coords.lng;
        image.latitude=this.highlights.coords.lat;
        if(document.getElementById("marker")){
            let imageDiv = document.getElementById("marker");
            imageDiv.parentNode.removeChild(imageDiv);
        }
        image.dummyData = {
        externalElement: this.createCustomMarker(image)};
        var xy = chart.geoPointToSVG( { longitude: image.longitude, latitude: image.latitude } );
        image.dummyData.externalElement.style.top = xy.y + 'px';
        image.dummyData.externalElement.style.left = xy.x + 'px';
      },
      deep: true
    }
  },
  mounted() {
     chart = am4core.create(this.$refs.chartdiv, am4maps.MapChart);
    // Set map definition
     chart.geodata = am4geodata_worldLow
    // Set projection
    chart.projection = new am4maps.projections.Miller();
    // Create map polygon series
    var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
    // Exclude Antartica
    polygonSeries.exclude = ["AQ"];
    // Make map load polygon (like country names) data from GeoJSON
    polygonSeries.useGeodata = true;
    // Configure series
    var polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}";
    polygonTemplate.fill = chart.colors.getIndex(0).lighten(0.5);
    // Create hover state and set alternative fill color
    var hs = polygonTemplate.states.create("hover");
    hs.properties.fill = chart.colors.getIndex(1);
    // Add image series
    imageSeries = chart.series.push(new am4maps.MapImageSeries());
    imageSeries.mapImages.template.propertyFields.longitude = "longitude";
    imageSeries.mapImages.template.propertyFields.latitude = "latitude";
    imageSeries.data = [ {
      "title": "Brussels",
      "latitude": 0,
      "longitude": 0
    }];
    chart.events.on( "ready", updateCustomMarkers );
    chart.events.on( "mappositionchanged", updateCustomMarkers );
    function updateCustomMarkers( event ) {
  
  // go through all of the images
  imageSeries.mapImages.each(function(image) {
    // check if it has corresponding HTML element
    if (!image.dummyData || !image.dummyData.externalElement) {
      // create onex
      image.dummyData = {
        externalElement: createCustomMarker(image)
      };
    }
    // reposition the element accoridng to coordinates
    var xy = chart.geoPointToSVG( { longitude: image.longitude, latitude: image.latitude } );
    image.dummyData.externalElement.style.top = xy.y + 'px';
    image.dummyData.externalElement.style.left = xy.x + 'px';
  });

}

// this function creates and returns a new marker element
function createCustomMarker( image ) {
  
  var chart = image.dataItem.component.chart;

  // create holder
  var holder = document.createElement( 'div' );
  holder.className = 'map-marker';
  holder.title = image.dataItem.dataContext.title;
  holder.id="marker"
  holder.style.position = 'absolute';

  // maybe add a link to it?
  if ( undefined != image.url ) {
    holder.onclick = function() {
      window.location.href = image.url;
    };
    holder.className += ' map-clickable';
  }

  // create dot
  var dot = document.createElement( 'div' );
  dot.className = 'dot';
  holder.appendChild( dot );

  var pulse = document.createElement( 'div' );
  pulse.className = 'pulse';
  holder.appendChild( pulse );

  // append the marker to the map container
  chart.svgContainer.htmlElement.appendChild( holder );

  return holder;
}},
methods:{
  createCustomMarker( image ) {
  
  var chart = image.dataItem.component.chart;

  // create holder
  var holder = document.createElement( 'div' );
  holder.className = 'map-marker';
  holder.title = image.dataItem.dataContext.title;
  holder.id="marker"
  holder.style.position = 'absolute';

  // maybe add a link to it?
  if ( undefined != image.url ) {
    holder.onclick = function() {
      window.location.href = image.url;
    };
    holder.className += ' map-clickable';
  }

  // create dot
  var dot = document.createElement( 'div' );
  dot.className = 'dot';
  holder.appendChild( dot );

  var pulse = document.createElement( 'div' );
  pulse.className = 'pulse';
  holder.appendChild( pulse );

  // append the marker to the map container
  chart.svgContainer.htmlElement.appendChild( holder );

  return holder;
  }
 }
};
</script>
