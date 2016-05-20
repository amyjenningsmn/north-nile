var app = angular.module('northApp', ['ngRoute', 'leaflet-directive', 'ngMaterial', 'ngMessages', 'ngAnimate']);


app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
  $routeProvider
  .when('/', {
    templateUrl: '/views/home.html',
    controller: 'HomeController',
    controllerAs: 'hc'
  })
  .when('/map', {
    templateUrl: '/views/map.html',
    controller: 'MapController',
    controllerAs: 'mc'
  });

  $locationProvider.html5Mode(true);
}]);

app.controller('MapController', ['$scope', function($scope){ // $http loaded just so the syntax is there
  var mc = this;

  angular.extend(mc, {
        defaults: {
            scrollWheelZoom: false,
            touchZoom: true,
            dragging: true
        },
        center: {
          lat: 44.996121,
          lng: -93.295845,
          zoom: 15
        },
        tiles: {
            url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        },
        markers: {
            m1: {
                lat: 44.996121,
                lng: -93.295845,
                title: 'Mr. Books Bruschetta Machine'
            },
            m2:{
              lat: 44.998995,
              lng: -93.291068,
              title: 'Ms. Kitchens Oblique Reference Parlor'
            }
        }
    });

    $scope.$on('leafletDirectiveMarker.click', function(event, args){
      console.log('clicked a marker:', args);
      mc.showInfoDrawer = true;
      mc.markerTitle = args.model.title;
    });

  console.log('Map controller loaded.');
}]);

app.controller('HomeController', ['$http', function($http){ // $http loaded just so the syntax is there
  var hc = this;
  hc.loginInfo = {};
  hc.registerInfo = {};
  // ng-show functions:

  // loginShow():
  hc.loginShow = function() {
    hc.loginForm = true;
    hc.registerForm = false;
  };

// registerShow():
  hc.registerShow = function() {
    console.log('hit registerShow');
    hc.registerForm = true;
    hc.loginForm = false;
  };

// attempt to login a user, redirect based on success/failure:

hc.loginUser = function() {
  $http.post('/login', hc.loginInfo).then(function(response){
    if (response.status == 200) {
      console.log('successful login', response);

    }
  }, function(response){
    console.log('unsuccessful login');
  })
}

// register a user:
hc.registerUser = function() {
  $http.post('/register', hc.registerInfo).then(function(response){
    if (response.status == 200){
      console.log('successful registration');
    }
  }, function(response){
    console.log('unsuccessful registration');
  })
}



  console.log('Home controller loaded.');
}]);
