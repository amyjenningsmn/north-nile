angular.module('northApp').controller('MapController', ['ResourceFactory', 'UserTrackFactory', '$scope', 'leafletData', 'leafletMarkerEvents', '$mdDialog', '$http', '$location', function(ResourceFactory, UserTrackFactory, $scope, leafletData, leafletMarkerEvents, $mdDialog, $http, $location){
  var mc = this;

  var promise = UserTrackFactory.getUserData();
  promise.then(function(response){
    mc.user = response.data;
  });

  mc.routeUser = function() {
    if (mc.user.is_admin == true) {
      $location.path('/admin');
    } else {
      $location.path('/user');
    }
  };

  // leafletData.getMap().setActiveArea('activeArea');

  mc.storedMarkers = ResourceFactory.mapResources;
  mc.newResource = {};

  // start count at a number higher than any keys present in the object - this ensures no duplicates
  mc.markerSize = Object.keys(mc.storedMarkers).length;
  mc.count = mc.markerSize + 1;
  mc.visibleMarkers = {};

  // filter visibility of markers
  mc.filterMarkers = function(type, ev){
    mc.visibleMarkers = {};

    var filter1 = angular.element(document.querySelector('#filter1'));
    var filter2 = angular.element(document.querySelector('#filter2'));
    var filter3 = angular.element(document.querySelector('#filter3'));
    var filter4 = angular.element(document.querySelector('#filter4'));

    switch(type){
      case 'Community Garden':
        filter1.toggleClass('disabledKeyButton');
        console.log('filter1:', filter1);
        break;
      case 'Culinary Arts':
        filter2.toggleClass('disabledKeyButton');
        break;
      case 'Food Hub':
        filter3.toggleClass('disabledKeyButton');
        break;
      case 'Food Distribution':
        filter4.toggleClass('disabledKeyButton');
        break;
    }

    if(type === 'all'){
      for (marker in mc.storedMarkers){
        mc.storedMarkers[marker].visibility = true;
      }
    } else if (type === 'none'){
      for (marker in mc.storedMarkers){
        mc.storedMarkers[marker].visibility = false;
      }
    } else {
      // loop through the list of markers from the database, and toggle visibility based on type
      for (marker in mc.storedMarkers){
        if(mc.storedMarkers[marker].resource_type === type){
          mc.storedMarkers[marker].visibility = !mc.storedMarkers[marker].visibility; // toggle visibility
        }
      }
    }

    // loop through storedMarkers and add visible ones to visibleMarkers
    for (marker in mc.storedMarkers){
      if(mc.storedMarkers[marker].visibility){
        mc.visibleMarkers['m' + mc.count] = mc.storedMarkers[marker];
        mc.count++;
      }
    }

    // write changes to map
    angular.extend(mc, {
      markers: mc.visibleMarkers
    });
  };

  mc.lastClicked = {};

  // open infoDrawer on marker Click
  mc.openInfoDrawer = function(event, args){
    mc.showInfoDrawer = true;
    mc.showNewResourceDrawer = false;

    // grab last marker clicked to recenter map later
    mc.lastClicked = args.model;

    // this centers the map on the marker clicked
    angular.extend(mc, {
      center:{
        lat: mc.lastClicked.lat,
        lng: mc.lastClicked.lng,
        zoom: 15
      }
    });
  };

  // close infoDrawer on map click
  mc.closeInfoDrawer = function(event, args){
    if(mc.showInfoDrawer){
      mc.showInfoDrawer = false;

      // this centers the map on the marker that initiated the click that this is 'undoing'
      angular.extend(mc, {
        center:{
          lat: mc.lastClicked.lat,
          lng: mc.lastClicked.lng,
          zoom: 15
        }
      });
    }
  };

  mc.saveResourceCoords = function(event, args){
    console.log('saving args:', args);
    mc.newResource.latitude = args.leafletEvent.latlng.lat;
    mc.newResource.longitude = args.leafletEvent.latlng.lng;
  };

  // open drawer for new resource form
  mc.addNewResource = function(){
    if(!mc.showNewResourceDrawer){
      mc.showNewResourceDrawer = true;
      if(mc.user){
        // if logged in
        mc.showNewResourceForm = true;
        mc.showNewResourceLogin = false;
        mc.showNewResourceRegister = false;
      } else {
        // if not logged in
        mc.showNewResourceLogin = true;
        mc.showNewResourceRegister = false;
        mc.showNewResourceForm = false;
      }
    } else {
      mc.newResource.account_id = mc.user.id;
      //ResourceFactory.saveNewResource(mc.newResource);
      mc.showNewResourceDrawer = false;
    }
  };

  // get markers from database
  ResourceFactory.getSavedResources(mc.filterMarkers);

  // bind event handlers
  $scope.$on('leafletDirectiveMarker.map.click', mc.openInfoDrawer);
  $scope.$on('leafletDirectiveMap.map.click', mc.closeInfoDrawer);
  $scope.$on('leafletDirectiveMap.map.contextmenu', mc.saveResourceCoords);


  // set all markers to visible on page load
  //mc.filterMarkers('all');

  // configure map defaults
  angular.extend(mc, {
        defaults: {
            scrollWheelZoom: false,
            touchZoom: true,
            dragging: true,
            tap: true,
            tapTolerance: 100 // may not be necessary after angular material skipClickHijack() fix
        },
        center: {
          lat: 44.996121,
          lng: -93.295845,
          zoom: 15
        },
        tiles: {
            url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        },
        markers: mc.visibleMarkers
  });


  // map login
  mc.loginUser = function() {
    $http.post('/login', mc.loginInfo).then(function(response){
      if (response.status == 200) {
        mc.user = response.data;
        console.log('successful login', response.data.is_admin);
        if (response.data.is_admin === true) {
          console.log('admin is true');
          mc.loginInfo = {};

          // $location.url('/map');
          // hide login form and show new resource form
          mc.showNewResourceLogin = false;
          mc.showNewResourceForm = true;
        } else {
          console.log('admin is not true');
          mc.loginInfo = {};

          // $location.url('/map');
          // hide login form and show new resource form
          mc.showNewResourceLogin = false;
          mc.showNewResourceForm = true;
        }
     }
    }, function(response){
      console.log('unsuccessful login');
      // Alert user to incorrect username/password ::::
      function showAlert() {
        alert = $mdDialog.alert({
          title: 'Attention',
          textContent: 'Incorrect username and/or password. Please enter information again.',
          ok: 'Close'
        });
        $mdDialog
          .show( alert )
          .finally(function() {
            alert = undefined;
          });
      }
      showAlert();
      mc.loginInfo = {};

    });
  };

  mc.registerShow = function(){
    mc.showNewResourceLogin = false;
    mc.showNewResourceRegister = true;
  };

  // registration form password confirmation checking
  mc.registerInfo = {};
  mc.passwordMismatch = function(){
    if(mc.registerInfo.password !== mc.registerInfo.confirm_password){
      return true;
    }
  };

  mc.passwordMismatchError = function(){
    if (mc.passwordMismatch() && mc.registerFormInputs.confirm_password.$dirty){
      return true;
    }
  };

  // :::: Register User ::::

  mc.registerUser = function() {
    $http.post('/register', mc.registerInfo).then(function(response){
      if (response.status == 200) {
        console.log('successful registration');
        mc.loginInfo = {username: mc.registerInfo.username};
        mc.registerInfo = {};
        mc.showNewResourceRegister = false;
        mc.showNewResourceLogin = true;
      }
    }, function(response){
      console.log('unsuccessful registration');
      function showAlert() {
        if(mc.registerInfo.username === undefined){
          mc.alertMessage = 'Username field cannot be blank';
        } else {
          mc.alertMessage = 'Username already exists, please choose another.';
        }

        alert = $mdDialog.alert({
          title: 'Attention',
          textContent: mc.alertMessage,
          ok: 'Close'
        });
        $mdDialog
          .show( alert )
          .finally(function() {
            alert = undefined;
          });
      }
      showAlert();
      mc.registerInfo.username = undefined;
    });
  };

  // save resource from map
  mc.saveNewResource = function(resource){
    mc.showNewResourceForm
    console.log('Saving new resource from user:', mc.user);
    resource.account_id = mc.user.id;
    ResourceFactory.saveNewResource(resource);
    mc.showNewResourceDrawer = false;
    mc.newResource = {};
  };

  mc.cancelNewResource = function(){
    mc.showNewResourceDrawer = false;
    mc.newResource = {};
  };

  console.log('Map controller loaded.');
}]);
