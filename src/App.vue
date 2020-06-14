<template>
  <div id="ancestor">
    <div class="container-fluid" id="app">
      <div class="row">
        <div id="sidebar" class="col-md-3 col-sm-4 col-xs-12 sidebar">
          <div id="search">
            <div class="geocoder"></div>
            <!--input
              id="location-input"
              type="text"
              ref="input"
              placeholder="Location?"
              @keyup.enter="organizeAllDetails"
            -->
            <!--button id="search-btn" @click="organizeAllDetails">
              <img src="./assets/search.svg" width="24" height="24">
            </button-->
          </div>
          <div id="info">
            <div class="wrapper-left">
              <div id="tempContainer" class="tempContainer">
              <div id="current-weather">
                {{ currentWeather.temp }}
                <span>°C</span>
              </div>
              </div>
              <div id="weather-desc">{{ currentWeather.summary }}</div>
              <div class="temp-max-min">
                <div class="max-desc">
                  <div id="max-detail">
                    <i>▲</i>
                    {{ currentWeather.todayHighLow.todayTempHigh }}
                    <span>°C</span>
                  </div>
                  <div id="max-summary">at {{ currentWeather.todayHighLow.todayTempHighTime }}</div>
                </div>
                <div class="min-desc">
                  <div id="min-detail">
                    <i>▼</i>
                    {{ currentWeather.todayHighLow.todayTempLow }}
                    <span>°C</span>
                  </div>
                  <div id="min-summary">at {{ currentWeather.todayHighLow.todayTempLowTime }}</div>
                </div>
              </div>
            </div>
            <div class="wrapper-right">
              <!--div class="date-time-info">
                <div id="date-desc">
                  <img src="./assets/calendar.svg" width="20" height="20">
                  {{ currentWeather.time }}
                </div>
              </div-->
              <div class="location-info">
                <div id="location-desc">
                  <img
                    src="./assets/location.svg"
                    width="10.83"
                    height="15.83"
                    style="opacity: 0.9;"
                  >
                  {{ currentWeather.full_location }}
                  <div id="location-detail" class="mt-1">
                    Lat: {{ currentWeather.formatted_lat }}
                    <br>
                    Long: {{ currentWeather.formatted_long }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <dashboard-content
          class="col-md-9 col-sm-8 col-xs-12 content"
          id="dashboard-content"
          :highlights="highlights"
          :tempVar="tempVar"
        ></dashboard-content>
      </div>
    </div>
  </div>
</template>

<script>
//import moment from 'moment-timezone';
import Content from './components/Content.vue';
import {createTour} from './tour';
var geocoder;
var coords_array={};
var icons=['clear','cloud','rain','snow','partly_sunny']
var icons_links={'cloud':'https://i.imgur.com/5SvY0sG.png','snow':'https://i.imgur.com/8YTVSu7.png','partly_sunny':'https://i.imgur.com/vrWXmeT.png',
                 'clear':'https://i.imgur.com/npVgSfJ.png','rain':'https://i.imgur.com/CjjWhIa.png'}

export default {
  name: 'app',
  props: [],
  components: {
    'dashboard-content': Content
  },
  data() {
    return {
      weatherDetails: false,
      location: '', // raw location from input
      lat: '', // raw latitude from google maps api response
      long: '', // raw longitude from google maps api response
      completeWeatherApi: '', // weather api string with lat and long
      rawWeatherData: '', // raw response from weather api
      currentWeather: {
        full_location: '', // for full address
        formatted_lat: '', // for N/S
        formatted_long: '', // for E/W
        time: '',
        temp: '',
        todayHighLow: {
          todayTempHigh: '',
          todayTempHighTime: '',
          todayTempLow: '',
          todayTempLowTime: ''
        },
        summary: '',
        possibility: ''
      },
      tempVar: {
        tempToday: [
          // gets added dynamically by this.getSetHourlyTempInfoToday()
        ],dimensions:{},
      },
      highlights: {
        uvIndex: '',
        visibility: '',
        windStatus: {
          windSpeed: '',
          windDirection: '',
          derivedWindDirection: ''
        },
        coords:{
          name:'',
          lat:'',
          lng:''
        },
        assets:{
          height:'160'
        }
      }
    };
  },
  methods: {
    // Some utility functions
    convertToTitleCase: function(str) {
      str = str.toLowerCase().split(' ');
      for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
      }
      return str.join(' ');
    },
    formatPossibility: function(str) {
      str = str.toLowerCase().split('-');
      for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
      }
      return str.join(' ');
    },
    unixToHuman: function(timezone, timestamp) {
      /* READ THIS BEFORE JUDGING & DEBUGGING
      For any location beyond the arctic circle and the
      antarctic circle, the goddamn weather api does not return certain
      keys/values in each of this.rawWeatherData.daily.data[some_array_index].
      Due to this, console throws up an error.
      The code is correct, the problem is with the API.
      May be later on I will add some padding to tackle missing values.
      */
      var moment = require('moment-timezone'); // for handling date & time;
      var decipher = new Date(timestamp * 1000);
      var human = moment(decipher)
        .tz(timezone)
        .format('llll');
      var timeArray = human.split(' ');
      var timeNumeral = timeArray[4];
      var timeSuffix = timeArray[5];
      var justTime = timeNumeral + ' ' + timeSuffix;
      var monthDateArray = human.split(',');
      var monthDate = monthDateArray[1].trim();
      //console.log('new time');
      //console.log(human);
      return {
        fullTime: human,
        onlyTime: justTime,
        onlyMonthDate: monthDate
      };
    },
    fahToCel: function(tempInFahrenheit) {
      var tempInCelcius = Math.round((5 / 9) * (tempInFahrenheit - 32));
      return tempInCelcius;
    },
    milibarToKiloPascal: function(pressureInMilibar) {
      var pressureInKPA = pressureInMilibar * 0.1;
      return Math.round(pressureInKPA);
    },
    mileToKilometer: function(miles) {
      var kilometer = miles * 1.60934;
      return Math.round(kilometer);
    },
    deriveWindDir: function(windDir) {
      var wind_directions_array = [
        { minVal: 0, maxVal: 30, direction: 'N' },
        { minVal: 31, maxVal: 45, direction: 'NNE' },
        { minVal: 46, maxVal: 75, direction: 'NE' },
        { minVal: 76, maxVal: 90, direction: 'ENE' },
        { minVal: 91, maxVal: 120, direction: 'E' },
        { minVal: 121, maxVal: 135, direction: 'ESE' },
        { minVal: 136, maxVal: 165, direction: 'SE' },
        { minVal: 166, maxVal: 180, direction: 'SSE' },
        { minVal: 181, maxVal: 210, direction: 'S' },
        { minVal: 211, maxVal: 225, direction: 'SSW' },
        { minVal: 226, maxVal: 255, direction: 'SW' },
        { minVal: 256, maxVal: 270, direction: 'WSW' },
        { minVal: 271, maxVal: 300, direction: 'W' },
        { minVal: 301, maxVal: 315, direction: 'WNW' },
        { minVal: 316, maxVal: 345, direction: 'NW' },
        { minVal: 346, maxVal: 360, direction: 'NNW' }
      ];
      var wind_direction = '';
      for (var i = 0; i < wind_directions_array.length; i++) {
        if (
          windDir >= wind_directions_array[i].minVal &&
          windDir <= wind_directions_array[i].maxVal
        ) {
          wind_direction = wind_directions_array[i].direction;
        }
      }
      return wind_direction;
    },

    // Some basic action oriented functions
    makeInputEmpty: function() {
      this.$refs.input.value = '';
    },
    makeTempVarTodayEmpty: function() {
      this.tempVar.tempToday = [];
    },
    detectEnterKeyPress: function() {
      var input = this.$refs.input;
      input.addEventListener('keyup', function(event) {
        event.preventDefault();
        var enterKeyCode = 13;
        if (event.keyCode === enterKeyCode) {
          this.setHitEnterKeyTrue();
        }
      });
    },
    locationEntered: function() {
      var input = this.$refs.input;
      if (input.value === '') {
        this.location = "New York";
      } else {
        this.location = this.convertToTitleCase(input.value);
      }
      this.makeInputEmpty();
      this.makeTempVarTodayEmpty();
    },
    
    getCoordinates: function() {
      this.location=coords_array.full_location;
      this.lat=coords_array.lat;
      this.long=coords_array.long;
      this.full_location=coords_array.full_location;
      this.makeTempVarTodayEmpty();
      
    },

    // Some basic asynchronous functions
    setFormatCoordinates: async function() {
      var coordinates = await this.getCoordinates();
      //this.lat = coordinates.lat;
      //this.long = coordinates.long;
      let arr=this.full_location.split(",");
      this.currentWeather.full_location =arr[0]+','+arr[arr.length-1];
      // Remember to beautify lat for N/S
      if (coords_array.lat > 0) {
        this.currentWeather.formatted_lat =
          (Math.round(coords_array.lat * 10000) / 10000).toString() + '°N';
      } else if (coords_array.lat < 0) {
        this.currentWeather.formatted_lat =
          (-1 * (Math.round(coords_array.lat * 10000) / 10000)).toString() +
          '°S';
      } else {
        this.currentWeather.formatted_lat = (
          Math.round(coords_array.lat * 10000) / 10000
        ).toString();
      }
      // Remember to beautify long for N/S
      if (coords_array.long > 0) {
        this.currentWeather.formatted_long =
          (Math.round(coords_array.long * 10000) / 10000).toString() + '°E';
      } else if (coords_array.long < 0) {
        this.currentWeather.formatted_long =
          (-1 * (Math.round(coords_array.long * 10000) / 10000)).toString() +
          '°W';
      } else {
        this.currentWeather.formatted_long = (
          Math.round(coords_array.long * 10000) / 10000
        ).toString();
      }
      //console.log(this.currentWeather);
    },
    fixWeatherApi: async function() {
      await this.setFormatCoordinates();
      var weatherApi =
        'https://csm.fusioncharts.com/files/assets/wb/wb-data.php?src=darksky&lat=' +
        this.lat +
        '&long=' +
        this.long;
      this.completeWeatherApi = weatherApi;
    },
    fetchWeatherData: async function() {
      await this.fixWeatherApi();
      var axios = require('axios'); // for handling weather api promise
      var weatherApiResponse = await axios.get(this.completeWeatherApi);
      if (weatherApiResponse.status === 200) {
        this.rawWeatherData = weatherApiResponse.data;
      } else {
        alert('Hmm... Seems like our weather experts are busy!');
      }
    },

    // Get and set functions; often combined, because they are short

    // For basic info - left panel/sidebar
    getTimezone: function() {
      return this.rawWeatherData.timezone;
    },
    getSetCurrentTime: function() {
      var currentTime = this.rawWeatherData.currently.time;
      //var timezone = this.getTimezone();
      var timezone =this.rawWeatherData.timezone;
      this.currentWeather.time = this.unixToHuman(
        timezone,
        currentTime
      ).fullTime;
    },
    getSetSummary: function() {
      let iconFile;
      var currentSummary = this.convertToTitleCase(
        this.rawWeatherData.currently.summary
      );
      if (currentSummary.includes(' And')) {
        currentSummary = currentSummary.replace(' And', ',');
      }
      this.currentWeather.summary = currentSummary;
      let status=0;
      let SummaryIcon=currentSummary;
      if (SummaryIcon=='sunny' ||SummaryIcon=='Sunny')
      {
        SummaryIcon='Clear'
      }
      else if(SummaryIcon=='overcast' ||SummaryIcon=='Overcast'){
        SummaryIcon='Cloud'
      }
      icons.forEach(function(icon){
        let result = SummaryIcon.search(new RegExp(icon, "i")) > -1 ? 'Matched' : 'notMatched'
        if (result=='Matched'){
          iconFile=icons_links[icon];
        } 
      })
      let parent=document.getElementById("tempContainer");

      if (parent.children.length>1){
      if (parent.children[1].id=='imgicon'){
        let node=document.getElementById("imgicon");
        parent.removeChild(node);
      }}
      let img = document.createElement("img");
      img.src=iconFile;
      img.id='imgicon'
      img.style.order='2';
      let src=document.getElementById("tempContainer");
      src.appendChild(img);
    },
    getSetPossibility: function() {
      var possible = this.formatPossibility(this.rawWeatherData.daily.icon);
      if (possible.includes(' And')) {
        possible = possible.replace(' And', ',');
      }
      this.currentWeather.possibility = possible;
    },
    getSetCurrentTemp: function() {
      var currentTemp = this.rawWeatherData.currently.temperature;
      this.currentWeather.temp = this.fahToCel(currentTemp);
    },
    getTodayDetails: function() {
      return this.rawWeatherData.daily.data[0];
    },
    getSetTodayTempHighLowWithTime: function() {
      //var timezone = this.getTimezone();
      var timezone =this.rawWeatherData.timezone;
      var todayDetails = this.getTodayDetails();
      this.currentWeather.todayHighLow.todayTempHigh = this.fahToCel(
        todayDetails.temperatureMax
      );
      this.currentWeather.todayHighLow.todayTempHighTime = this.unixToHuman(
        timezone,
        todayDetails.temperatureMaxTime
      ).onlyTime;
      this.currentWeather.todayHighLow.todayTempLow = this.fahToCel(
        todayDetails.temperatureMin
      );
      this.currentWeather.todayHighLow.todayTempLowTime = this.unixToHuman(
        timezone,
        todayDetails.temperatureMinTime
      ).onlyTime;
    },
    getHourlyInfoToday: function() {
      return this.rawWeatherData.hourly.data;
    },
    getSetHourlyTempInfoToday: function() {
      var unixTime = this.rawWeatherData.currently.time;
      //var timezone = this.getTimezone();
      var timezone =this.rawWeatherData.timezone;
      var todayMonthDate = this.unixToHuman(timezone, unixTime).onlyMonthDate;
      var hourlyData = this.getHourlyInfoToday();
      for (var i = 0; i < hourlyData.length; i++) {
        var hourlyTimeAllTypes = this.unixToHuman(timezone, hourlyData[i].time);
        var hourlyOnlyTime = hourlyTimeAllTypes.onlyTime;
        var hourlyMonthDate = hourlyTimeAllTypes.onlyMonthDate;
        if (todayMonthDate === hourlyMonthDate) {
          var hourlyObject = { hour: '', temp: '' };
          hourlyObject.hour = hourlyOnlyTime;
          hourlyObject.temp = this.fahToCel(hourlyData[i].temperature).toString();
          this.tempVar.tempToday.push(hourlyObject);
          /*
          Since we are using array.push(), we are just adding elements
          at the end of the array. Thus, the array is not getting emptied
          first when a new location is entered.
          to solve this problem, a method this.makeTempVarTodayEmpty()
          has been created, and called from this.locationEntered().
          */
        }
      }
      /*
      To cover the edge case where the local time is between 10 - 12 PM,
      and therefore there are only two elements in the array
      this.tempVar.tempToday. We need to add the points for minimum temperature
      and maximum temperature so that the chart gets generated with atleast four points.
      */
      if (this.tempVar.tempToday.length <= 2) {
        var minTempObject = {
          hour: this.currentWeather.todayHighLow.todayTempHighTime,
          temp: this.currentWeather.todayHighLow.todayTempHigh
        };
        var maxTempObject = {
          hour: this.currentWeather.todayHighLow.todayTempLowTime,
          temp: this.currentWeather.todayHighLow.todayTempLow
        };
        /*
        Typically, lowest temp are at dawn,
        highest temp is around mid day.
        Thus we can safely arrange like min, max, temp after 10 PM.
        */
        // array.unshift() adds stuff at the beginning of the array.
        // the order will be: min, max, 10 PM, 11 PM.
        this.tempVar.tempToday.unshift(maxTempObject, minTempObject);
      }
    },

    // For Today Highlights
    getSetUVIndex: function() {
      var uvIndex = this.rawWeatherData.currently.humidity;
      this.highlights.uvIndex = Math.floor(uvIndex*100);
    },
    getgeocoder:function(){
        var MapboxGeocoder = require('@mapbox/mapbox-gl-geocoder');
      	mapboxgl.accessToken = 'pk.eyJ1IjoibmFuYS1tYW1hMSIsImEiOiJjazhsaXQ0bzAwZDQ2M2ZwemJlaHhuM242In0.TWjaoBqpiGtodKbvTaZovw';
        geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        getItemValue:({place_name,center}) => { coords_array['lat']=center[1]; coords_array['long']=center[0]; coords_array['full_location']=place_name; this.organizeAllDetails(); return place_name;},
        reverseGeocode:true,
        types: 'country,region,place'
        });
        geocoder.addTo('.geocoder');
        
    },
    getSetVisibility: function() {
      var visibilityInMiles = this.rawWeatherData.currently.visibility;
      this.highlights.visibility = this.mileToKilometer(visibilityInMiles);
      this.highlights.coords.lat=this.rawWeatherData.latitude;
      this.highlights.coords.lng=this.rawWeatherData.longitude;
      this.highlights.coords.name=this.location;
  
    },
    getSetWindStatus: function() {
      var windSpeedInMiles = this.rawWeatherData.currently.windSpeed;
      this.highlights.windStatus.windSpeed = this.mileToKilometer(
        windSpeedInMiles
      );
      var absoluteWindDir = this.rawWeatherData.currently.windBearing;
      this.highlights.windStatus.windDirection = absoluteWindDir;
      this.highlights.windStatus.derivedWindDirection = this.deriveWindDir(
        absoluteWindDir
      );
    },

    // top level for info section
    organizeCurrentWeatherInfo: function() {
      // data in this.currentWeather
      /*
      Coordinates and location is covered (get & set) in:
      - this.getCoordinates()
      - this.setFormatCoordinates()
      There are lots of async-await involved there.
      So it's better to keep them there.
      */
      this.getSetCurrentTime();
      this.getSetCurrentTemp();
      this.getSetTodayTempHighLowWithTime();
      this.getSetSummary();
      this.getSetPossibility();
    },
    getLocation: async function(latlng){
      var google_geocoder = new google.maps.Geocoder();
      return new Promise(function(resolve, reject) {
        google_geocoder.geocode({'location': latlng}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            //console.log(results);
            for(var i=0; i<results.length;i++){
              if(results[i]['types'][0]=="locality" && results[i]['types'][1]=="political" ){
                coords_array.full_location=results[i].formatted_address;
                geocoder.setInput(coords_array.full_location);
                resolve(results[i].formatted_address)
                break;
              }
              }
              
              if (coords_array.full_location.length<2){
                for(var n=0; n<results.length;n++){
                  if(results[n]['types'][0]=="administrative_area_level_1" && results[n]['types'][1]=="political" ){
                    coords_array.full_location=results[n].formatted_address;
                    geocoder.setInput(coords_array.full_location);
                    resolve(results[n].formatted_address)
                    break;
                  }
              }}
              }})
            })},
    organizeTodayHighlights: function() {
      // top level for highlights
      this.getSetUVIndex();
      this.getSetVisibility();
      this.getSetWindStatus();
    },
    overlapCheck: function(event) {
        let uvindex=document.getElementsByClassName("uvindex");
        let noPadding=document.getElementsByClassName("noPadding");
        let windrow=document.getElementsByClassName("windrow");
        let winds_div=document.getElementsByClassName("winds");
        let node = document.getElementsByClassName("card-heading pt-3 pb-2");
        let humidity_chart=document.getElementById("humidityChart");
        let container=document.getElementsByClassName("custom-content-card");
        let heidi=document.getElementById("heidi");
        let header_card=document.getElementsByClassName("header-card");
        let genericGraph=document.getElementsByClassName("genericGraph");
        let geocoder=document.getElementsByClassName('geocoder')[0];
        let wrapper=document.getElementsByClassName('wrapper-left')[0];
        let wrapperRight=document.getElementsByClassName('wrapper-right')[0];
        let windBottomelement=document.getElementsByClassName("card-value mt-1")[0];
        let elementList=['winds','wrapper-left','wrapper-right']

        elementList.forEach(function(element){
          if(document.getElementsByClassName(element)[0].style.display='none'){
            document.getElementsByClassName(element)[0].style.display="";
          }
        })
   
        let domRect_uvindex = uvindex[0].getBoundingClientRect();
        let domRect_windrow = windrow[0].getBoundingClientRect();
        let overlap = !(domRect_uvindex.right < domRect_windrow.left || 
                domRect_uvindex.left > domRect_windrow.right || 
                domRect_uvindex.bottom < domRect_windrow.top || 
                domRect_uvindex.top > domRect_windrow.bottom)
        let domRect_geocoder = geocoder.getBoundingClientRect();
        let domRect_wrapper = wrapper.getBoundingClientRect();
        let sidebarOverlap = !(domRect_geocoder.right < domRect_wrapper.left || 
                domRect_geocoder.left > domRect_wrapper.right || 
                domRect_geocoder.bottom < domRect_wrapper.top || 
                domRect_geocoder.top > domRect_wrapper.bottom)
        let domRect_wrapperRight = wrapperRight.getBoundingClientRect();
        let locationOverlap = !(domRect_geocoder.right < domRect_wrapperRight.left || 
                domRect_geocoder.left > domRect_wrapperRight.right || 
                domRect_geocoder.bottom < domRect_wrapperRight.top || 
                domRect_geocoder.top > domRect_wrapperRight.bottom)
        let domRect_container=container[0].getBoundingClientRect();
        let domRect_winds=windBottomelement.getBoundingClientRect();
        let domRect_noPdding=noPadding[0].getBoundingClientRect();
        let bottomwindOverlap=!(domRect_container.bottom>domRect_winds.bottom);
        let topPaddinghumidity=!(domRect_container.top>domRect_noPdding.top);
        let topWrapperOverlap=!(domRect_geocoder.top<domRect_wrapper.top);
        let topWrapperRightOverlap=!(domRect_geocoder.top<domRect_wrapperRight.top);
        
        if (window.innerWidth>992){
        if(overlap){
            //winds_div[0].style.setProperty("display","none","important");
           
              $('.winds').css({
              'cssText': 'display: none !important;'
              });
              $('.column').css('flex-direction',"unset");
              $('.column').css('align-self','center');
            
            
            //console.log($('.winds').css('flex'));
        }
        else{
          winds_div[0].style.display="";
          $('.column').css('flex-direction','column');
          $('.column').css('align-self',"");
         
        }
        if(bottomwindOverlap){
         setTimeout(function(){
              $('.winds').css({
              'cssText': 'display: none !important;'
              });
              $('.column').css('flex-direction',"unset");
              $('.column').css('align-self','center');
            },1);
        }
        else{
          if (!overlap){
            winds_div[0].style.display="";
            $('.column').css('flex-direction','column');
            $('.column').css('align-self',"");
          }
        }
      }
      else if (window.innerWidth<992 && window.innerWidth>450){
        $('.winds').css('display','none');
      }
      if (window.devicePixelRatio==3){
        if(humidity_chart.clientWidth/container[0].clientWidth>1.2){
          humidity_chart.style.removeProperty('width');
          humidity_chart.style.right="35%";
          humidity_chart.style.width=JSON.stringify(container[0].clientWidth)+'px';
        }
      }else{
        if(humidity_chart.style.right=="35%"){
          humidity_chart.style.removeProperty('right');
          humidity_chart.style.removeProperty('width');
          humidity_chart.style.width="100%"
        }
      }

       if (window.devicePixelRatio==1){
        if(heidi.clientHeight/header_card[0].clientHeight<0.65)
        {
          genericGraph[0].style.height=JSON.stringify(header_card[0].clientHeight)+'px';
        }

      }
      if(window.devicePixelRatio>=4){
        let dashboard_content=document.getElementById("dashboard-content");
        header_card[0].style.height=JSON.stringify(dashboard_content.clientHeight-20)+'px';
        genericGraph[0].style.height=JSON.stringify(header_card[0].clientHeight)+'px';

      }
      else{
        let dashboard_content=document.getElementById("dashboard-content");
        //header_card[0].style.height='45vh';
        genericGraph[0].style.height=JSON.stringify(header_card[0].clientHeight)+'px';
      }
      if (sidebarOverlap || topWrapperOverlap){
        if(window.devicePixelRatio<4){
          wrapper.style.display='none';
        }

      }
      else{
        wrapper.style.display="";
      }
      if (locationOverlap || topWrapperRightOverlap){
        if(window.devicePixelRatio<4){
          wrapperRight.style.display='none';
        }

      }
      else{
        wrapperRight.style.display="";
      }
     /*if (topPaddinghumidity){
        setTimeout(function(){
        if($('.column').css('align-self')=='center'){
          $('.column').css('align-self',"");
          $('.column').css('flex-direction','column');
        }
        },500)
     }*/
     
      
    },
    printPosition: async function(position){
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      coords_array={
      'lat':lat,
      'long':lon,
      'full_location':''
    }
      await this.getLocation({lat:lat,lng:lon});
      await this.organizeAllDetails();
    /*;
    this.organizeAllDetails();*/
    },
    geoError:function(){
     coords_array={
      'lat':40.7127,
      'long':-74.7127,
      'full_location':'New York City, USA'
    }
    this.organizeAllDetails();
    geocoder.setInput('New York City, USA');
    
    },
    // topmost level orchestration
    organizeAllDetails: async function() {
      // top level organization
      await this.fetchWeatherData();
      this.organizeCurrentWeatherInfo();
      this.organizeTodayHighlights();
      this.getSetHourlyTempInfoToday();
      if (this.$cookies.get('site')){
      //await navigator.geolocation.getCurrentPosition(this.printPosition,this.geoError)
    }
    else{
      this.$cookies.set('site','default');
      const tour = this.$shepherd({
        useModalOverlay: true,
        classes: 'shepherd-theme-arrows'

    });
            let elemntsList={'column':$('.column').css('display'),'winds':$('.winds').css('display'),'map':$('.visibility').css('display')}
            createTour(tour,window.innerWidth,window.innerHeight,elemntsList);
    };
    },

  },
  mounted: async function() {
    this.getgeocoder();
    await navigator.geolocation.getCurrentPosition(this.printPosition,this.geoError)
    this.$nextTick(function() {
      window.addEventListener('resize', this.overlapCheck);
    })
    this.overlapCheck();
    },
  beforeDestroy() {
    window.removeEventListener('resize', this.overlapCheck);
  }
};
</script>
